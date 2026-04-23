import 'package:get/get.dart';
import 'package:mobile/modules/dashboard/controllers/dashboard_controller.dart';
import 'package:mobile/modules/dashboard/controllers/dashboard_shell_controller.dart';

class DashboardBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<DashboardController>(() => DashboardController());
    Get.lazyPut<DashboardShellController>(() => DashboardShellController());
  }
}

