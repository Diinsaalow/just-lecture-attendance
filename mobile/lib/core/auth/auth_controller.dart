import 'package:get/get.dart';
import '../../data/models/user_model.dart';
import '../../routes/routes.dart';
import '../api/api_client.dart';
import 'auth_storage.dart';

class AuthController extends GetxController {
  final ApiClient _apiClient = Get.find<ApiClient>();
  
  final _isLoggedIn = false.obs;
  final _user = Rxn<UserModel>();
  final _isLoading = false.obs;

  bool get isLoggedIn => _isLoggedIn.value;
  UserModel? get user => _user.value;
  bool get isLoading => _isLoading.value;

  @override
  void onInit() {
    super.onInit();
    checkAuthState();
  }

  Future<void> checkAuthState() async {
    final token = await AuthStorage.getToken();
    final storedUser = await AuthStorage.getUser();
    
    if (token != null && storedUser != null) {
      _isLoggedIn.value = true;
      _user.value = storedUser;
    } else {
      _isLoggedIn.value = false;
      _user.value = null;
    }
  }

  Future<bool> login(String username, String passcode) async {
    _isLoading.value = true;
    try {
      final response = await _apiClient.post('/auth/login', data: {
        'username': username,
        'passcode': passcode,
      });

      if (response.statusCode == 200 || response.statusCode == 201) {
        final token = response.data['accessToken'];
        final userMap = response.data['user'];
        final user = UserModel.fromJson(userMap);

        await AuthStorage.saveToken(token);
        await AuthStorage.saveUser(user);

        _user.value = user;
        _isLoggedIn.value = true;
        
        Get.offAllNamed(Routes.dashboard);
        return true;
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'Invalid credentials or connection error',
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      _isLoading.value = false;
    }
    return false;
  }

  Future<void> logout() async {
    await AuthStorage.clearAuthData();
    _isLoggedIn.value = false;
    _user.value = null;
    Get.offAllNamed(Routes.login);
  }
}
