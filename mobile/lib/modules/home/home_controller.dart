import 'package:get/get.dart';

import 'package:mobile/core/api/api_client.dart';
import 'package:mobile/data/models/class_session_model.dart';

class HomeController extends GetxController {
  final ApiClient _apiClient = Get.find<ApiClient>();

  final sessions = <ClassSessionModel>[].obs;
  final isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    fetchTodaySessions();
  }

  Future<void> fetchTodaySessions() async {
    isLoading.value = true;
    try {
      final response = await _apiClient.get('/class-sessions/me/today');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        sessions.assignAll(data.map((json) => ClassSessionModel.fromJson(json)).toList());
      }
    } catch (e) {
      Get.snackbar('Error', 'Failed to load sessions: ${e.toString()}',
          snackPosition: SnackPosition.BOTTOM);
    } finally {
      isLoading.value = false;
    }
  }
}

