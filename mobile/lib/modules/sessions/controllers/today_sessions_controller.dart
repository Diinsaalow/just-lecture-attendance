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
  
  // For live tracking
  final currentTime = DateTime.now().obs;
  Timer? _timer;

  @override
  void onInit() {
    super.onInit();
    fetchTodaySessions();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      currentTime.value = DateTime.now();
    });
  }

  @override
  void onClose() {
    _timer?.cancel();
    super.onClose();
  }

  Future<void> fetchTodaySessions() async {
    isLoading.value = true;
    hasError.value = false;
    try {
      final response = await _apiClient.get('/class-sessions/me/today');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        final fetchedSessions = data.map((json) => ClassSessionModel.fromJson(json)).toList();
        sessions.assignAll(fetchedSessions);
        
        // Fetch attendance state for each session
        for (final session in fetchedSessions) {
          await fetchAttendanceState(session.id);
        }
      } else {
        hasError.value = true;
      }
    } catch (e) {
      hasError.value = true;
      Get.snackbar('Error', 'Failed to load today\'s sessions',
          snackPosition: SnackPosition.BOTTOM);
    } finally {
      isLoading.value = false;
    }
  }

  void _setAttendanceState(String sessionId, AttendanceRecordModel? state) {
    attendanceStates[sessionId] = state;
    attendanceStates.refresh();
  }

  /// Session to highlight: checked-in (not out) first, then active window, else first.
  ClassSessionModel? getPrimarySession() {
    if (sessions.isEmpty) return null;
    final checkedIn = sessions.firstWhereOrNull((s) {
      final a = attendanceStates[s.id];
      return a != null && a.isCurrentlyCheckedIn;
    });
    if (checkedIn != null) return checkedIn;
    return sessions.firstWhereOrNull((s) => s.isActive) ?? sessions.first;
  }

  Future<void> fetchAttendanceState(String sessionId) async {
    try {
      final response = await _apiClient.get('/attendance/me/session/$sessionId');
      if (response.statusCode != 200) {
        return;
      }

      final body = response.data;
      final isEmptyBody = body == null ||
          (body is String && body.trim().isEmpty);

      // Some stacks return 200 with an empty body instead of JSON `null`; do not wipe a known checked-in row.
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
          'Success',
          'Checked in successfully',
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
      Get.snackbar('Error', message,
          backgroundColor: Colors.red,
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM);
      // Re-sync from backend so the UI matches the real attendance state
      // (e.g. if 409 means we are actually already checked in).
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
          'Success',
          'Checked out successfully',
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
      Get.snackbar('Error', message,
          backgroundColor: Colors.red,
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM);
      // Re-sync from backend so the UI matches reality (e.g. if backend says
      // "must check in", the local optimistic state is wrong — refresh it).
      await fetchAttendanceState(sessionId);
    } finally {
      isProcessing.value = false;
      debugPrint('--- [CHECK-OUT] ENDED ---');
    }
  }

  String getRemainingTime(ClassSessionModel session) {
    // Parse the end time (format HH:mm)
    final now = DateTime.now();
    final parts = session.toTime.split(':');
    final endTime = DateTime(
      now.year,
      now.month,
      now.day,
      int.parse(parts[0]),
      int.parse(parts[1]),
    );

    final diff = endTime.difference(currentTime.value);
    if (diff.isNegative) {
      return 'Session time ended';
    }

    final hours = diff.inHours;
    final minutes = diff.inMinutes % 60;
    
    if (hours > 0) {
      return '$hours h $minutes m remaining';
    } else {
      return '$minutes minutes remaining';
    }
  }
}
