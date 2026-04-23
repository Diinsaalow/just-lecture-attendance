import 'package:get/get.dart';
import 'package:mobile/modules/dashboard/models/lecturer_profile.dart';

class ProfileController extends GetxController {
  final profile = const LecturerProfile(
    fullName: 'Dr. Amina Hassan',
    initials: 'AH',
    role: 'Lecturer',
    department: 'Faculty of Information Technology',
    email: 'amina.hassan@university.example.edu',
    phone: '+252 61 000 0000',
  );

  final emailReminders = false.obs;
  final weekStartsOnMonday = true.obs;
}
