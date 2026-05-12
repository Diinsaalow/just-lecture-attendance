class LectureClassModel {
  final String id;
  final String name;
  final String departmentName;
  final String mode;
  final String shift;
  final int size;
  final String batchId;

  LectureClassModel({
    required this.id,
    required this.name,
    required this.departmentName,
    required this.mode,
    required this.shift,
    required this.size,
    required this.batchId,
  });

  factory LectureClassModel.fromJson(Map<String, dynamic> json) {
    return LectureClassModel(
      id: json['id'] as String,
      name: json['name'] as String,
      departmentName: (json['departmentId'] as Map<String, dynamic>?)?['name'] as String? ?? 'N/A',
      mode: json['mode'] as String? ?? 'N/A',
      shift: json['shift'] as String? ?? 'N/A',
      size: json['size'] as int? ?? 0,
      batchId: json['batchId'] as String? ?? 'N/A',
    );
  }
}
