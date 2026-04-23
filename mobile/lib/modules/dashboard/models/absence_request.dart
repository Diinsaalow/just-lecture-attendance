import 'package:mobile/modules/dashboard/models/absence_request_status.dart';

class AbsenceRequest {
  const AbsenceRequest({
    required this.id,
    required this.courseCode,
    required this.courseName,
    required this.startDateLabel,
    required this.endDateLabel,
    required this.reasonSnippet,
    required this.status,
  });

  final String id;
  final String courseCode;
  final String courseName;
  final String startDateLabel;
  final String endDateLabel;
  final String reasonSnippet;
  final AbsenceRequestStatus status;
}
