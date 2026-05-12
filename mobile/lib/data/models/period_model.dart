class PeriodModel {
  final String id;
  final String day;
  final String fromTime;
  final String toTime;
  final String type;
  final String courseName;
  final String? hallName;
  final String? hallCode;
  final String status;

  PeriodModel({
    required this.id,
    required this.day,
    required this.fromTime,
    required this.toTime,
    required this.type,
    required this.courseName,
    this.hallName,
    this.hallCode,
    required this.status,
  });

  factory PeriodModel.fromJson(Map<String, dynamic> json) {
    return PeriodModel(
      id: json['_id'] as String,
      day: json['day'] as String,
      fromTime: json['from'] as String,
      toTime: json['to'] as String,
      type: json['type'] as String,
      courseName: (json['courseId'] as Map<String, dynamic>?)?['name'] as String? ?? 'N/A',
      hallName: (json['hallId'] as Map<String, dynamic>?)?['name'] as String?,
      hallCode: (json['hallId'] as Map<String, dynamic>?)?['code'] as String?,
      status: json['status'] as String,
    );
  }

  String get timeRange => '$fromTime - $toTime';
  String get location => hallCode != null ? '$hallName ($hallCode)' : 'N/A';
}
