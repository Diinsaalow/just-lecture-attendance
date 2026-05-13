import 'package:dio/dio.dart';
import 'package:get/get.dart' hide Response;
import 'package:mobile/routes/routes.dart';
import '../auth/auth_storage.dart';

class ApiClient {
  static const String baseUrl =
      'http://10.1.1.32:5000/api/v1'; // Default for Android emulator

  late Dio dio;

  ApiClient() {
    dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await AuthStorage.getToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) async {
          if (e.response?.statusCode == 401) {
            await AuthStorage.clearAuthData();
            Get.offAllNamed(Routes.login);
          }
          return handler.next(e);
        },
      ),
    );

    // Add logging for debug mode
    dio.interceptors.add(LogInterceptor(requestBody: true, responseBody: true));
  }

  Future<Response> post(String path, {dynamic data}) async {
    return await dio.post(path, data: data);
  }

  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    return await dio.get(path, queryParameters: queryParameters);
  }
}
