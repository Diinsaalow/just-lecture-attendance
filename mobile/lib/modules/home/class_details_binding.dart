import 'package:get/get.dart';
import 'package:mobile/modules/home/class_details_controller.dart';

class ClassDetailsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<ClassDetailsController>(() => ClassDetailsController());
  }
}
