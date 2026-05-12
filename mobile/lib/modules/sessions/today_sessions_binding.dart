import 'package:get/get.dart';
import 'package:mobile/modules/sessions/controllers/today_sessions_controller.dart';

class TodaySessionsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<TodaySessionsController>(() => TodaySessionsController());
  }
}
