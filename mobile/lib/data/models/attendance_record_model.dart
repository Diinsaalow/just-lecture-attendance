class AttendanceRecordModel {
  final String id;
  final String sessionId;
  final String instructorId;
  final DateTime checkInTime;
  final DateTime? checkOutTime;
  final String status;
  final String? deviceId;

  AttendanceRecordModel({
    required this.id,
    required this.sessionId,
    required this.instructorId,
    required this.checkInTime,
    this.checkOutTime,
    required this.status,
    this.deviceId,
  });

  factory AttendanceRecordModel.fromJson(Map<String, dynamic> json) {
    return AttendanceRecordModel(
      id: json['_id'] as String,
      sessionId: json['sessionId'] as String,
      instructorId: json['instructorUserId'] as String,
      checkInTime: DateTime.parse(json['checkInTime'] as String),
      checkOutTime: json['checkOutTime'] != null 
          ? DateTime.parse(json['checkOutTime'] as String) 
          : null,
      status: json['status'] as String,
      deviceId: json['deviceId'] as String?,
    );
  }

  bool get isCheckedOut => checkOutTime != null;
}
