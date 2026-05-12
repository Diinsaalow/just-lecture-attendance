import 'package:get/get.dart';
import '../core/api/api_client.dart';
import '../core/auth/auth_controller.dart';

class InitialBinding extends Bindings {
  @override
  void dependencies() {
    Get.put(ApiClient(), permanent: true);
    Get.put(AuthController(), permanent: true);
  }
}

