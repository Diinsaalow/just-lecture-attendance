/// Mirrors `AttendanceRecord` from the API (`checkInAt` / `checkOutAt`, etc.).
class AttendanceRecordModel {
  final String id;
  final String sessionId;
  final String instructorUserId;
  final DateTime? checkInAt;
  final DateTime? checkOutAt;
  final String status;
  final String? scheduledStart;
  final String? scheduledEnd;

  AttendanceRecordModel({
    required this.id,
    required this.sessionId,
    required this.instructorUserId,
    this.checkInAt,
    this.checkOutAt,
    required this.status,
    this.scheduledStart,
    this.scheduledEnd,
  });

  /// True when the instructor has completed check-out for this session.
  bool get isCheckedOut => checkOutAt != null;

  /// True when checked in and not yet checked out (backend is source of truth).
  bool get isCurrentlyCheckedIn => checkInAt != null && checkOutAt == null;

  String get displayStatus {
    switch (status) {
      case 'CHECKED_IN':
        return 'Checked In';
      case 'PRESENT':
        return 'Present';
      case 'LATE':
        return 'Late';
      case 'EARLY_CHECKOUT':
        return 'Checked Out (early)';
      case 'MISSED_CHECKOUT':
        return 'Missed check-out';
      case 'ABSENT':
        return 'Absent';
      case 'EXCUSED':
        return 'Excused';
      case 'INVALID_ATTEMPT':
        return 'Invalid attempt';
      case 'REJECTED':
        return 'Rejected';
      default:
        return status.replaceAll('_', ' ');
    }
  }

  factory AttendanceRecordModel.fromJson(Map<String, dynamic> json) {
    final checkInRaw = json['checkInAt'] ?? json['checkInTime'];
    final checkOutRaw = json['checkOutAt'] ?? json['checkOutTime'];

    return AttendanceRecordModel(
      id: _recordId(json),
      sessionId: _asObjectIdString(json['sessionId']),
      instructorUserId: _asObjectIdString(json['instructorUserId']),
      checkInAt: _parseDateTime(checkInRaw),
      checkOutAt: _parseDateTime(checkOutRaw),
      status: json['status'] as String? ?? 'CHECKED_IN',
      scheduledStart: json['scheduledStart'] as String?,
      scheduledEnd: json['scheduledEnd'] as String?,
    );
  }

  static String _recordId(Map<String, dynamic> json) {
    if (json['_id'] != null) return _asObjectIdString(json['_id']);
    if (json['id'] != null) return json['id'].toString();
    return '';
  }

  static String _asObjectIdString(dynamic v) {
    if (v == null) return '';
    if (v is String) return v;
    if (v is Map) {
      final oid = v[r'$oid'] ?? v['_id'];
      if (oid != null) return _asObjectIdString(oid);
    }
    return v.toString();
  }

  static DateTime? _parseDateTime(dynamic v) {
    if (v == null) return null;
    if (v is String) return DateTime.tryParse(v);
    return null;
  }
}
