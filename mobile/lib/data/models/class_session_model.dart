class ClassSessionModel {
  final String id;
  final DateTime scheduledDate;
  final String fromTime;
  final String toTime;
  final String status;
  final String type;
  final NestedName classInfo;
  final NestedName courseInfo;
  final NestedHall? hallInfo;

  final bool isActive;
  final bool isCheckInOpen;
  final bool isCheckOutOpen;

  ClassSessionModel({
    required this.id,
    required this.scheduledDate,
    required this.fromTime,
    required this.toTime,
    required this.status,
    required this.type,
    required this.classInfo,
    required this.courseInfo,
    this.hallInfo,
    this.isActive = false,
    this.isCheckInOpen = false,
    this.isCheckOutOpen = false,
  });

  factory ClassSessionModel.fromJson(Map<String, dynamic> json) {
    return ClassSessionModel(
      id: json['_id'] as String,
      scheduledDate: DateTime.parse(json['scheduledDate'] as String),
      fromTime: json['fromTime'] as String,
      toTime: json['toTime'] as String,
      status: json['status'] as String,
      type: json['type'] as String,
      classInfo: NestedName.fromJson(json['classId'] as Map<String, dynamic>),
      courseInfo: NestedName.fromJson(json['courseId'] as Map<String, dynamic>),
      hallInfo: json['hallId'] != null 
          ? NestedHall.fromJson(json['hallId'] as Map<String, dynamic>)
          : null,
      isActive: json['isActive'] as bool? ?? false,
      isCheckInOpen: json['isCheckInOpen'] as bool? ?? false,
      isCheckOutOpen: json['isCheckOutOpen'] as bool? ?? false,
    );
  }
}

class NestedName {
  final String id;
  final String name;

  NestedName({required this.id, required this.name});

  factory NestedName.fromJson(Map<String, dynamic> json) {
    return NestedName(
      id: json['_id'] as String,
      name: json['name'] as String,
    );
  }
}

class NestedHall {
  final String id;
  final String name;
  final String code;

  NestedHall({required this.id, required this.name, required this.code});

  factory NestedHall.fromJson(Map<String, dynamic> json) {
    return NestedHall(
      id: json['_id'] as String,
      name: json['name'] as String,
      code: json['code'] as String,
    );
  }
}
