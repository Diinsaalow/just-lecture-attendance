class UserModel {
  final String id;
  final String username;
  final String role;
  final String? facultyId;
  final List<Map<String, dynamic>> abilities;

  UserModel({
    required this.id,
    required this.username,
    required this.role,
    this.facultyId,
    required this.abilities,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      username: json['username'] as String,
      role: json['role'] as String,
      facultyId: json['facultyId'] as String?,
      abilities: List<Map<String, dynamic>>.from(json['abilities'] ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'role': role,
      'facultyId': facultyId,
      'abilities': abilities,
    };
  }
}
