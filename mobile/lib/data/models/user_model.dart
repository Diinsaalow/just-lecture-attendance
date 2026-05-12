class UserModel {
  final String id;
  final String username;
  final String role;
  final String? firstName;
  final String? lastName;
  final String? email;
  final String? phone;
  final String? status;
  final String? facultyId;
  final String? facultyName;
  final String? registeredDeviceId;

  UserModel({
    required this.id,
    required this.username,
    required this.role,
    this.firstName,
    this.lastName,
    this.email,
    this.phone,
    this.status,
    this.facultyId,
    this.facultyName,
    this.registeredDeviceId,
  });

  String get fullName {
    if (firstName == null && lastName == null) return username;
    return '${firstName ?? ''} ${lastName ?? ''}'.trim();
  }

  String get initials {
    if (firstName != null && lastName != null) {
      return '${firstName![0]}${lastName![0]}'.toUpperCase();
    }
    return username.substring(0, min(2, username.length)).toUpperCase();
  }

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      username: json['username'] as String,
      role: json['role'] as String,
      firstName: json['firstName'] as String?,
      lastName: json['lastName'] as String?,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      status: json['status'] as String?,
      facultyId: json['facultyId'] as String?,
      facultyName: json['facultyName'] as String?,
      registeredDeviceId: json['registeredDeviceId'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'role': role,
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'phone': phone,
      'status': status,
      'facultyId': facultyId,
      'facultyName': facultyName,
      'registeredDeviceId': registeredDeviceId,
    };
  }
}

int min(int a, int b) => a < b ? a : b;
