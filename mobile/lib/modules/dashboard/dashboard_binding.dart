import 'package:get/get.dart';
import 'package:mobile/modules/dashboard/controllers/absence_request_controller.dart';
import 'package:mobile/modules/dashboard/controllers/attendance_history_controller.dart';
import 'package:mobile/modules/dashboard/controllers/dashboard_controller.dart';
import 'package:mobile/modules/dashboard/controllers/dashboard_shell_controller.dart';
import 'package:mobile/modules/dashboard/controllers/profile_controller.dart';

class DashboardBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<DashboardController>(() => DashboardController());
    Get.lazyPut<DashboardShellController>(() => DashboardShellController());
    Get.lazyPut<AttendanceHistoryController>(() => AttendanceHistoryController());
    Get.lazyPut<AbsenceRequestController>(() => AbsenceRequestController());
    Get.lazyPut<ProfileController>(() => ProfileController());
  }
}

