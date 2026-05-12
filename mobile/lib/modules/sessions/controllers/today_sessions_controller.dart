import 'dart:async';
import 'package:get/get.dart';
import 'package:mobile/core/api/api_client.dart';
import 'package:mobile/data/models/class_session_model.dart';
import 'package:mobile/data/models/attendance_record_model.dart';

class TodaySessionsController extends GetxController {
  final ApiClient _apiClient = Get.find<ApiClient>();

  final sessions = <ClassSessionModel>[].obs;
  final attendanceStates = <String, AttendanceRecordModel?>{}.obs;
  final isLoading = false.obs;
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

  Future<void> fetchAttendanceState(String sessionId) async {
    try {
      final response = await _apiClient.get('/attendance/me/session/$sessionId');
      if (response.statusCode == 200 && response.data != null) {
        attendanceStates[sessionId] = AttendanceRecordModel.fromJson(response.data);
      } else {
        attendanceStates[sessionId] = null;
      }
    } catch (e) {
      // Silently fail for individual states
      attendanceStates[sessionId] = null;
    }
  }

  Future<void> checkIn(String sessionId) async {
    try {
      // In a real app, we'd send coordinates and deviceId
      final response = await _apiClient.post('/attendance/check-in', data: {
        'sessionId': sessionId,
        'lat': 0.0, // Placeholder
        'lng': 0.0, // Placeholder
      });
      
      if (response.statusCode == 201) {
        await fetchAttendanceState(sessionId);
        Get.snackbar('Success', 'Checked in successfully',
            backgroundColor: Get.theme.colorScheme.primaryContainer);
      }
    } catch (e) {
      Get.snackbar('Error', 'Check-in failed: ${e.toString()}',
          snackPosition: SnackPosition.BOTTOM);
    }
  }

  Future<void> checkOut(String sessionId) async {
    try {
      final response = await _apiClient.post('/attendance/check-out', data: {
        'sessionId': sessionId,
        'lat': 0.0, // Placeholder
        'lng': 0.0, // Placeholder
      });
      
      if (response.statusCode == 200) {
        await fetchAttendanceState(sessionId);
        Get.snackbar('Success', 'Checked out successfully');
      }
    } catch (e) {
      Get.snackbar('Error', 'Check-out failed: ${e.toString()}',
          snackPosition: SnackPosition.BOTTOM);
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
