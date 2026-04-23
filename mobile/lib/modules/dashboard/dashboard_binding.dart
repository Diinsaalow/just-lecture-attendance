import 'package:get/get.dart';
import 'package:mobile/modules/dashboard/controllers/dashboard_controller.dart';
import 'package:mobile/modules/home/home_binding.dart';

class DashboardBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<DashboardController>(() => DashboardController());

    // Reuse feature bindings used inside dashboard tabs.
    HomeBinding().dependencies();
  }
}

