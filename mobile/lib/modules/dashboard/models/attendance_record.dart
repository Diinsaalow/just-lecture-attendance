import 'package:mobile/modules/dashboard/models/attendance_status.dart';

class AttendanceRecord {
  const AttendanceRecord({
    required this.courseCode,
    required this.courseName,
    required this.sessionDateLabel,
    required this.timeLabel,
    required this.presentCount,
    required this.totalCount,
    required this.status,
  });

  final String courseCode;
  final String courseName;
  /// Human-readable date, e.g. "Apr 18, 2026"
  final String sessionDateLabel;
  final String timeLabel;
  final int presentCount;
  final int totalCount;
  final AttendanceStatus status;

  int get percent =>
      totalCount == 0 ? 0 : ((presentCount / totalCount) * 100).round();
}
