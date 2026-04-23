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
        courseName: 'Data Structures & Algorithms',
        courseCode: 'IT2101',
        startTime: '08:00',
        daysOfWeek: 'Mon, Wed',
        hours: 2,
      ),
      ClassSession(
        courseName: 'Database Systems',
        courseCode: 'IT2203',
        startTime: '10:00',
        daysOfWeek: 'Tue',
        hours: 3,
      ),
      ClassSession(
        courseName: 'Computer Networks',
        courseCode: 'IT2302',
        startTime: '12:00',
        daysOfWeek: 'Thu',
        hours: 2,
      ),
      ClassSession(
        courseName: 'Operating Systems',
        courseCode: 'IT2401',
        startTime: '14:00',
        daysOfWeek: 'Sun',
        hours: 2,
      ),
      ClassSession(
        courseName: 'Mobile App Development',
        courseCode: 'IT2504',
        startTime: '08:00',
        daysOfWeek: 'Tue',
        hours: 2,
      ),
      ClassSession(
        courseName: 'Software Engineering',
        courseCode: 'IT2602',
        startTime: '10:00',
        daysOfWeek: 'Mon',
        hours: 1,
      ),
      ClassSession(
        courseName: 'Web Programming',
        courseCode: 'IT2703',
        startTime: '12:00',
        daysOfWeek: 'Wed',
        hours: 2,
      ),
      ClassSession(
        courseName: 'Cybersecurity Fundamentals',
        courseCode: 'IT2801',
        startTime: '14:00',
        daysOfWeek: 'Thu',
        hours: 2,
      ),
    ]);
  }
}
