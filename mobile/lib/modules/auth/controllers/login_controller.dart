import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../core/auth/auth_controller.dart';

class LoginController extends GetxController {
  final AuthController _authController = Get.find<AuthController>();

  final usernameController = TextEditingController();
  final passcodeController = TextEditingController();
  
  final formKey = GlobalKey<FormState>();
  final obscureText = true.obs;

  bool get isLoading => _authController.isLoading;

  void toggleObscureText() {
    obscureText.value = !obscureText.value;
  }

  Future<void> login() async {
    if (formKey.currentState!.validate()) {
      final success = await _authController.login(
        usernameController.text.trim(),
        passcodeController.text.trim(),
      );
      
      if (!success) {
        // Error is handled by AuthController (snackbar)
      }
    }
  }

  @override
  void onClose() {
    usernameController.dispose();
    passcodeController.dispose();
    super.onClose();
  }
}
