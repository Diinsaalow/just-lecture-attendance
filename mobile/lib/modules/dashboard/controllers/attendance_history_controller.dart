import 'package:get/get.dart';
import 'package:mobile/modules/dashboard/models/attendance_record.dart';
import 'package:mobile/modules/dashboard/models/attendance_status.dart';

/// Set to `true` to demo the empty state UI (list + summary use safe fallbacks).
const bool kDemoEmptyAttendanceHistory = false;

class AttendanceHistoryController extends GetxController {
  final records = <AttendanceRecord>[].obs;

  /// Dummy summary figures; replace with repository aggregation later.
  int get sessionsThisWeek => kDemoEmptyAttendanceHistory ? 0 : 12;
  int get avgAttendancePercent => kDemoEmptyAttendanceHistory ? 0 : 87;

  @override
  void onInit() {
    super.onInit();
    if (kDemoEmptyAttendanceHistory) {
      records.clear();
      return;
    }
    records.assignAll(const [
      AttendanceRecord(
        courseCode: 'IT2504',
        courseName: 'Mobile App Development',
        sessionDateLabel: 'Apr 21, 2026',
        timeLabel: '08:00 – 10:00',
        presentCount: 28,
        totalCount: 32,
        status: AttendanceStatus.completed,
      ),
      AttendanceRecord(
        courseCode: 'IT2101',
        courseName: 'Data Structures & Algorithms',
        sessionDateLabel: 'Apr 21, 2026',
        timeLabel: '10:15 – 12:15',
        presentCount: 30,
        totalCount: 30,
        status: AttendanceStatus.completed,
      ),
      AttendanceRecord(
        courseCode: 'IT2203',
        courseName: 'Database Systems',
        sessionDateLabel: 'Apr 20, 2026',
        timeLabel: '09:00 – 12:00',
        presentCount: 0,
        totalCount: 28,
        status: AttendanceStatus.draft,
      ),
      AttendanceRecord(
        courseCode: 'IT2302',
        courseName: 'Computer Networks',
        sessionDateLabel: 'Apr 18, 2026',
        timeLabel: '12:00 – 14:00',
        presentCount: 25,
        totalCount: 27,
        status: AttendanceStatus.completed,
      ),
      AttendanceRecord(
        courseCode: 'IT2602',
        courseName: 'Software Engineering',
        sessionDateLabel: 'Apr 17, 2026',
        timeLabel: '10:00 – 11:00',
        presentCount: 22,
        totalCount: 24,
        status: AttendanceStatus.completed,
      ),
      AttendanceRecord(
        courseCode: 'IT2703',
        courseName: 'Web Programming',
        sessionDateLabel: 'Apr 16, 2026',
        timeLabel: '12:00 – 14:00',
        presentCount: 26,
        totalCount: 29,
        status: AttendanceStatus.completed,
      ),
    ]);
  }
}
