import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:dio/dio.dart';
import 'package:mobile/core/api/api_client.dart';
import 'package:mobile/data/models/class_session_model.dart';
import 'package:mobile/data/models/attendance_record_model.dart';
import 'package:mobile/core/services/location_service.dart';
import 'package:mobile/core/services/device_service.dart';
import 'package:mobile/core/values/app_colors.dart';

class TodaySessionsController extends GetxController {
  static String _messageFromDioResponse(dynamic data) {
    if (data == null) return 'Request failed';
    if (data is String && data.trim().isNotEmpty) return data.trim();
    if (data is Map) {
      final m = Map<String, dynamic>.from(data);
      final msg = m['message'];
      if (msg is String && msg.isNotEmpty) return msg;
      if (msg is List && msg.isNotEmpty) {
        return msg.map((e) => e.toString()).join(' ');
      }
      final err = m['error'];
      if (err is String && err.isNotEmpty) return err;
    }
    return 'Request failed';
  }

  final ApiClient _apiClient = Get.find<ApiClient>();
  final LocationService _locationService = Get.find<LocationService>();
  final DeviceService _deviceService = Get.find<DeviceService>();

  final sessions = <ClassSessionModel>[].obs;
  final attendanceStates = <String, AttendanceRecordModel?>{}.obs;
  final isLoading = false.obs;
  final isProcessing = false.obs;
  final hasError = false.obs;

  // Live clock (every second)
  final currentTime = DateTime.now().obs;
  Timer? _clockTimer;

  // Smart refresh: fires when the next session is about to start
  Timer? _smartRefreshTimer;

  // Safety-net periodic refresh (every 30 s)
  Timer? _periodicRefreshTimer;

  @override
  void onInit() {
    super.onInit();
    fetchTodaySessions();
    _clockTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      currentTime.value = DateTime.now();
    });
    _periodicRefreshTimer =
        Timer.periodic(const Duration(seconds: 30), (_) => fetchTodaySessions());
  }

  @override
  void onClose() {
    _clockTimer?.cancel();
    _smartRefreshTimer?.cancel();
    _periodicRefreshTimer?.cancel();
    super.onClose();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Session-state helpers — pure local-clock comparisons
  // The backend `isActive` / `isCheckInOpen` / `isCheckOutOpen` flags are only
  // used as gate-keepers for CHECK-IN / CHECK-OUT buttons (via the model).
  // They are deliberately NOT used to decide which session card is shown,
  // because the backend keeps `isActive: true` for the entire checkout grace
  // period, which causes old sessions to linger as the primary card.
  // ──────────────────────────────────────────────────────────────────────────

  /// Parse a "HH:mm" string into a [DateTime] for today in local time.
  /// Returns null on bad input.
  DateTime? _parseLocalTime(String hhmm) {
    final parts = hhmm.split(':');
    if (parts.length < 2) return null;
    final h = int.tryParse(parts[0]);
    final m = int.tryParse(parts[1]);
    if (h == null || m == null) return null;
    final now = DateTime.now();
    return DateTime(now.year, now.month, now.day, h, m);
  }

  /// True when the current local clock is strictly between the session's
  /// scheduled start and end times.
  ///
  /// This is the ONLY criterion used to select the primary session card.
  /// No backend flags, no grace periods.
  bool isCurrentSession(ClassSessionModel session) {
    final from = _parseLocalTime(session.fromTime);
    final to = _parseLocalTime(session.toTime);
    if (from == null || to == null) return false;
    final now = DateTime.now();
    return now.isAfter(from) && now.isBefore(to);
  }

  /// True when the session's toTime is already in the past (now > toTime).
  bool isSessionEnded(ClassSessionModel session) {
    final to = _parseLocalTime(session.toTime);
    if (to == null) return false;
    return DateTime.now().isAfter(to);
  }

  /// True when the session's fromTime is still in the future (now < fromTime).
  bool isSessionUpcoming(ClassSessionModel session) {
    final from = _parseLocalTime(session.fromTime);
    if (from == null) return false;
    return DateTime.now().isBefore(from);
  }

  /// The instructor has fully completed this session (checked in + checked out).
  /// These sessions are NEVER shown as the primary card.
  bool _isDone(ClassSessionModel s) =>
      attendanceStates[s.id]?.isCheckedOut == true;

  /// Sessions where the instructor is still checked in (no checkOutAt) AND
  /// the session's scheduled end time has already passed.
  ///
  /// These appear as amber warning banners above the primary card.
  /// The checkout button is available in the detail sheet if
  /// `session.isCheckOutOpen == true` (backend grace period still open).
  List<ClassSessionModel> getMissedCheckoutSessions() {
    return sessions.where((s) {
      final a = attendanceStates[s.id];
      return (a?.isCurrentlyCheckedIn == true) && isSessionEnded(s);
    }).toList();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Primary session selection
  // ──────────────────────────────────────────────────────────────────────────

  /// The session to display as the primary card.
  ///
  /// P1 — A session whose scheduled time window covers RIGHT NOW
  ///        (fromTime ≤ now ≤ toTime) that the instructor hasn't finished.
  ///        Sub-P1a: not yet checked in (show Check-In button).
  ///        Sub-P1b: checked in, not yet checked out (show Check-Out button).
  ///
  /// P2 — The next upcoming session (fromTime is still in the future).
  ///
  /// null — Nothing relevant; show empty state.
  ///
  /// Sessions where the instructor has already checked OUT are never returned
  /// here. Sessions where the scheduled time has ENDED but checkout is pending
  /// appear in [getMissedCheckoutSessions] as warning banners instead.
  ClassSessionModel? getPrimarySession() {
    if (sessions.isEmpty) return null;

    // P1a — current time is inside this session's window, not checked in yet
    final p1a = sessions.firstWhereOrNull((s) {
      if (_isDone(s) || !isCurrentSession(s)) return false;
      final a = attendanceStates[s.id];
      return a == null || !a.isCurrentlyCheckedIn;
    });
    if (p1a != null) return p1a;

    // P1b — current time is inside this session's window, already checked in
    final p1b = sessions.firstWhereOrNull((s) {
      if (_isDone(s) || !isCurrentSession(s)) return false;
      return attendanceStates[s.id]?.isCurrentlyCheckedIn == true;
    });
    if (p1b != null) return p1b;

    // P2 — upcoming session (fromTime > now, not done)
    final p2 = sessions.firstWhereOrNull(
      (s) => !_isDone(s) && isSessionUpcoming(s),
    );
    if (p2 != null) return p2;

    return null;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Smart refresh: schedule a one-shot timer that fires when the next
  // not-yet-started session is about to begin (within the check-in window).
  // This ensures the card switches at the right moment even if the instructor
  // is not touching the screen.
  // ──────────────────────────────────────────────────────────────────────────

  void _scheduleSmartRefresh() {
    _smartRefreshTimer?.cancel();
    _smartRefreshTimer = null;

    final now = DateTime.now();

    // Find the nearest session that hasn't started yet (isActive == false, not ended)
    DateTime? nextStart;
    for (final s in sessions) {
      if (s.isActive || isSessionEnded(s)) continue; // already running or over

      // Parse "HH:mm" fromTime relative to today
      final parts = s.fromTime.split(':');
      if (parts.length < 2) continue;
      final candidate = DateTime(
        now.year,
        now.month,
        now.day,
        int.tryParse(parts[0]) ?? 0,
        int.tryParse(parts[1]) ?? 0,
      );

      if (candidate.isAfter(now)) {
        if (nextStart == null || candidate.isBefore(nextStart)) {
          nextStart = candidate;
        }
      }
    }

    if (nextStart == null) return;

    // Fire the refresh 5 seconds before the session window opens
    final delay = nextStart.difference(now) - const Duration(seconds: 5);
    if (delay.inSeconds < 1) {
      // Already within 5 s — just refresh now
      fetchTodaySessions();
      return;
    }

    debugPrint(
      '[SmartRefresh] Scheduled in ${delay.inSeconds}s (at $nextStart)',
    );
    _smartRefreshTimer = Timer(delay, () {
      debugPrint('[SmartRefresh] Firing — fetching sessions');
      fetchTodaySessions();
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Data fetching
  // ──────────────────────────────────────────────────────────────────────────

  Future<void> fetchTodaySessions() async {
    isLoading.value = true;
    hasError.value = false;
    try {
      final response = await _apiClient.get('/class-sessions/me/today');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        final fetchedSessions =
            data.map((json) => ClassSessionModel.fromJson(json)).toList();
        sessions.assignAll(fetchedSessions);

        // Fetch attendance state for each session (in parallel for speed)
        await Future.wait(
          fetchedSessions.map((s) => fetchAttendanceState(s.id)),
        );

        // Now that we know the full session state, schedule the next smart refresh
        _scheduleSmartRefresh();
      } else {
        hasError.value = true;
      }
    } catch (e) {
      hasError.value = true;
      Get.snackbar(
        'Error',
        'Failed to load today\'s sessions',
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isLoading.value = false;
    }
  }

  void _setAttendanceState(String sessionId, AttendanceRecordModel? state) {
    attendanceStates[sessionId] = state;
    attendanceStates.refresh();
  }

  Future<void> fetchAttendanceState(String sessionId) async {
    try {
      final response =
          await _apiClient.get('/attendance/me/session/$sessionId');
      if (response.statusCode != 200) return;

      final body = response.data;
      final isEmptyBody =
          body == null || (body is String && body.trim().isEmpty);

      if (isEmptyBody) {
        final existing = attendanceStates[sessionId];
        if (existing != null && existing.isCurrentlyCheckedIn) {
          debugPrint(
            '[attendance/me/session] empty body for $sessionId; keeping checked-in state',
          );
          return;
        }
        _setAttendanceState(sessionId, null);
        return;
      }

      if (body is Map) {
        try {
          final map = Map<String, dynamic>.from(body);
          _setAttendanceState(
            sessionId,
            AttendanceRecordModel.fromJson(map),
          );
        } catch (e, st) {
          debugPrint('[attendance/me/session] parse $sessionId: $e\n$st');
        }
        return;
      }

      debugPrint(
        '[attendance/me/session] unexpected body type ${body.runtimeType} for $sessionId',
      );
    } catch (e, st) {
      debugPrint('[attendance/me/session] $sessionId: $e\n$st');
      _setAttendanceState(sessionId, null);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Check-in / check-out
  // ──────────────────────────────────────────────────────────────────────────

  Future<void> checkIn(String sessionId) async {
    isProcessing.value = true;
    try {
      debugPrint('--- [CHECK-IN] STARTING ---');
      final position = await _locationService.getCurrentPosition();
      if (position == null) {
        debugPrint('[CHECK-IN] Error: Location fetching failed.');
        Get.snackbar(
          'Location required',
          'Could not read your location for check-in.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.red,
          colorText: Colors.white,
        );
        return;
      }

      final deviceId = await _deviceService.getDeviceId();
      debugPrint('[CHECK-IN] Session ID: $sessionId');
      debugPrint('[CHECK-IN] Device ID: $deviceId');
      debugPrint('[CHECK-IN] Latitude: ${position.latitude}');
      debugPrint('[CHECK-IN] Longitude: ${position.longitude}');

      final response = await _apiClient.post('/attendance/check-in', data: {
        'sessionId': sessionId,
        'method': 'BIOMETRIC',
        'deviceId': deviceId,
        'latitude': position.latitude,
        'longitude': position.longitude,
      });

      debugPrint('[CHECK-IN] Success: ${response.statusCode}');
      debugPrint('[CHECK-IN] Response Data: ${response.data}');

      if (response.statusCode == 201) {
        final data = response.data;
        if (data is Map) {
          try {
            _setAttendanceState(
              sessionId,
              AttendanceRecordModel.fromJson(Map<String, dynamic>.from(data)),
            );
          } catch (e, st) {
            debugPrint('[CHECK-IN] parse response: $e\n$st');
          }
        }
        // Refresh state from backend (source of truth) for all sessions.
        await fetchTodaySessions();
        Get.snackbar(
          'Checked In',
          'You have successfully checked in',
          backgroundColor: AppColors.primary,
          colorText: Colors.white,
          snackPosition: SnackPosition.TOP,
        );
      }
    } catch (e) {
      debugPrint('--- [CHECK-IN] ERROR ---');
      debugPrint('[CHECK-IN] Error: $e');
      if (e is DioException) {
        debugPrint('[CHECK-IN] Response Code: ${e.response?.statusCode}');
        debugPrint('[CHECK-IN] Response Data: ${e.response?.data}');
      }

      String message = 'Check-in failed';
      if (e is DioException && e.response?.data != null) {
        message = _messageFromDioResponse(e.response!.data);
      }
      Get.snackbar(
        'Error',
        message,
        backgroundColor: Colors.red,
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
      await fetchAttendanceState(sessionId);
    } finally {
      isProcessing.value = false;
      debugPrint('--- [CHECK-IN] ENDED ---');
    }
  }

  Future<void> checkOut(String sessionId) async {
    isProcessing.value = true;
    try {
      debugPrint('--- [CHECK-OUT] STARTING ---');
      final position = await _locationService.getCurrentPosition();
      if (position == null) {
        debugPrint('[CHECK-OUT] Error: Location fetching failed.');
        Get.snackbar(
          'Location required',
          'Could not read your location for check-out.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.red,
          colorText: Colors.white,
        );
        return;
      }

      final deviceId = await _deviceService.getDeviceId();
      debugPrint('[CHECK-OUT] Session ID: $sessionId');
      debugPrint('[CHECK-OUT] Device ID: $deviceId');
      debugPrint('[CHECK-OUT] Latitude: ${position.latitude}');
      debugPrint('[CHECK-OUT] Longitude: ${position.longitude}');

      final response = await _apiClient.post('/attendance/check-out', data: {
        'sessionId': sessionId,
        'method': 'BIOMETRIC',
        'deviceId': deviceId,
        'latitude': position.latitude,
        'longitude': position.longitude,
      });

      debugPrint('[CHECK-OUT] Success: ${response.statusCode}');
      debugPrint('[CHECK-OUT] Response Data: ${response.data}');

      if (response.statusCode == 200) {
        final data = response.data;
        if (data is Map) {
          try {
            _setAttendanceState(
              sessionId,
              AttendanceRecordModel.fromJson(Map<String, dynamic>.from(data)),
            );
          } catch (e, st) {
            debugPrint('[CHECK-OUT] parse response: $e\n$st');
          }
        }
        await fetchTodaySessions();
        Get.snackbar(
          'Checked Out',
          'You have successfully checked out',
          backgroundColor: AppColors.primary,
          colorText: Colors.white,
          snackPosition: SnackPosition.TOP,
        );
      }
    } catch (e) {
      debugPrint('--- [CHECK-OUT] ERROR ---');
      debugPrint('[CHECK-OUT] Error: $e');
      if (e is DioException) {
        debugPrint('[CHECK-OUT] Response Code: ${e.response?.statusCode}');
        debugPrint('[CHECK-OUT] Response Data: ${e.response?.data}');
      }

      String message = 'Check-out failed';
      if (e is DioException && e.response?.data != null) {
        message = _messageFromDioResponse(e.response!.data);
      }
      Get.snackbar(
        'Error',
        message,
        backgroundColor: Colors.red,
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
      await fetchAttendanceState(sessionId);
    } finally {
      isProcessing.value = false;
      debugPrint('--- [CHECK-OUT] ENDED ---');
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // UI helpers
  // ──────────────────────────────────────────────────────────────────────────

  String getRemainingTime(ClassSessionModel session) {
    final now = DateTime.now();
    final parts = session.toTime.split(':');
    if (parts.length < 2) return '—';
    final endTime = DateTime(
      now.year,
      now.month,
      now.day,
      int.tryParse(parts[0]) ?? 0,
      int.tryParse(parts[1]) ?? 0,
    );

    final diff = endTime.difference(currentTime.value);
    if (diff.isNegative) return 'Session time ended';

    final hours = diff.inHours;
    final minutes = diff.inMinutes % 60;

    if (hours > 0) return '$hours h $minutes m remaining';
    return '$minutes minutes remaining';
  }
}
