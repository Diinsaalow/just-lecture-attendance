import 'package:get/get.dart';
import 'package:mobile/core/api/api_client.dart';
import 'package:mobile/data/models/user_model.dart';
import 'package:mobile/core/services/device_service.dart';
import 'package:flutter/services.dart';
import 'package:flutter/material.dart';

class ProfileController extends GetxController {
  final ApiClient _apiClient = Get.find<ApiClient>();
  final DeviceService _deviceService = Get.find<DeviceService>();

  final Rxn<UserModel> profile = Rxn<UserModel>();
  final isLoading = false.obs;
  final isRegistering = false.obs;
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

  Future<void> registerDevice() async {
    isRegistering.value = true;
    try {
      final deviceInfo = await _deviceService.getRegistrationData();
      final response = await _apiClient.post('/devices/register', data: deviceInfo);
      
      if (response.statusCode == 200 || response.statusCode == 201) {
        Get.snackbar(
          'Success', 
          'Device registration request submitted',
          backgroundColor: Colors.green,
          colorText: Colors.white,
        );
        await fetchProfile(); // Refresh profile to see pending state
      }
    } catch (e) {
      Get.snackbar(
        'Error', 
        'Failed to register device: ${e.toString()}',
        backgroundColor: Colors.red,
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM
      );
    } finally {
      isRegistering.value = false;
    }
  }

  void copyToClipboard(String text) {
    Clipboard.setData(ClipboardData(text: text));
    Get.snackbar(
      'Copied', 
      'Device ID copied to clipboard',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: Colors.blue,
      colorText: Colors.white,
      duration: const Duration(seconds: 2),
    );
  }
}
