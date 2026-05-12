import 'package:get/get.dart';

import 'package:mobile/core/api/api_client.dart';
import 'package:mobile/data/models/lecture_class_model.dart';

class HomeController extends GetxController {
  final ApiClient _apiClient = Get.find<ApiClient>();

  final assignedClasses = <LectureClassModel>[].obs;
  final isLoading = false.obs;
  final hasError = false.obs;

  @override
  void onInit() {
    super.onInit();
    fetchAssignedClasses();
  }

  Future<void> fetchAssignedClasses() async {
    isLoading.value = true;
    hasError.value = false;
    try {
      final response = await _apiClient.get('/periods/classes/me');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        assignedClasses.assignAll(
          data.map((json) => LectureClassModel.fromJson(json)).toList(),
        );
      } else {
        hasError.value = true;
      }
    } catch (e) {
      hasError.value = true;
      Get.snackbar('Error', 'Failed to load assigned classes',
          snackPosition: SnackPosition.BOTTOM);
    } finally {
      isLoading.value = false;
    }
  }
}

