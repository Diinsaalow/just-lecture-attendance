import 'package:get/get.dart';
import 'package:mobile/core/api/api_client.dart';
import 'package:mobile/data/models/user_model.dart';

class ProfileController extends GetxController {
  final ApiClient _apiClient = Get.find<ApiClient>();

  final Rxn<UserModel> profile = Rxn<UserModel>();
  final isLoading = false.obs;
  final hasError = false.obs;

  @override
  void onInit() {
    super.onInit();
    fetchProfile();
  }

  Future<void> fetchProfile() async {
    isLoading.value = true;
    hasError.value = false;
    try {
      final response = await _apiClient.get('/auth/me');
      if (response.statusCode == 200) {
        profile.value = UserModel.fromJson(response.data);
      } else {
        hasError.value = true;
      }
    } catch (e) {
      hasError.value = true;
      Get.snackbar('Error', 'Failed to load profile: ${e.toString()}',
          snackPosition: SnackPosition.BOTTOM);
    } finally {
      isLoading.value = false;
    }
  }
}
