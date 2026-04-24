import 'package:get/get.dart';
import 'package:mobile/modules/dashboard/models/lecturer_profile.dart';

class ProfileController extends GetxController {
  final profile = const LecturerProfile(
    fullName: 'Eng. Mohamed Abdullahi',
    initials: 'MA',
    role: 'Lecturer',
    department: 'Faculty of Information Technology',
    email: 'amina.hassan@just.edu.so',
    phone: '+252 61 000 0000',
    city: 'Mogadishu',
    country: 'Somalia',
  );
}
