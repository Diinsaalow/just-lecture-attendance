import 'package:get/get.dart';
import 'package:mobile/modules/dashboard/controllers/absence_request_controller.dart';
import 'package:mobile/modules/dashboard/controllers/attendance_history_controller.dart';
import 'package:mobile/modules/dashboard/controllers/dashboard_controller.dart';
import 'package:mobile/modules/dashboard/controllers/dashboard_shell_controller.dart';
import 'package:mobile/modules/dashboard/controllers/profile_controller.dart';
import 'package:mobile/modules/home/home_controller.dart';
import 'package:mobile/modules/sessions/controllers/today_sessions_controller.dart';
import 'package:mobile/core/services/location_service.dart';
import 'package:mobile/core/services/device_service.dart';

class DashboardBinding extends Bindings {
  @override
  void dependencies() {
    Get.put(LocationService());
    Get.put(DeviceService());
    Get.lazyPut<DashboardController>(() => DashboardController());
    Get.lazyPut<HomeController>(() => HomeController());
    Get.lazyPut<TodaySessionsController>(() => TodaySessionsController());
    Get.lazyPut<DashboardShellController>(() => DashboardShellController());
    Get.lazyPut<AttendanceHistoryController>(() => AttendanceHistoryController());
    Get.lazyPut<AbsenceRequestController>(() => AbsenceRequestController());
    Get.lazyPut<ProfileController>(() => ProfileController());
  }
}

