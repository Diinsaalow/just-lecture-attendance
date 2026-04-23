class CourseOption {
  const CourseOption({required this.code, required this.name});

  final String code;
  final String name;

  String get label => '$code — $name';
}
