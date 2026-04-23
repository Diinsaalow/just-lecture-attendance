import 'package:get/get.dart';
import 'package:mobile/modules/dashboard/models/class_session.dart';

class DashboardController extends GetxController {
  final sessions = <ClassSession>[].obs;

  @override
  void onInit() {
    super.onInit();

    // Seed data for UI; replace with API/service later.
    sessions.assignAll(const [
      ClassSession(
        courseName: 'Java Programming',
        courseCode: 'CA221',
        startTime: 'Thursday',
        daysOfWeek: 'Thursday',
      ),
      ClassSession(
        courseName: 'Web Development',
        courseCode: 'CA222',
        startTime: 'Monday, Wednesday',
        daysOfWeek: 'Wednesday',
      ),
      ClassSession(
        courseName: 'React Native Programming',
        courseCode: 'CA223',
        startTime: 'Monday, Wednesday',
        daysOfWeek: 'Sunday',
      ),
      ClassSession(
        courseName: 'HTML and CSS',
        courseCode: 'CA224',
        startTime: 'Monday',
        daysOfWeek: 'Monday',
      ),
    ]);
  }
}
