import 'dart:io';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:get/get.dart';

class DeviceService extends GetxService {
  final DeviceInfoPlugin _deviceInfo = DeviceInfoPlugin();

  Future<String> getDeviceId() async {
    final info = await getRegistrationData();
    return info['deviceId'] ?? 'unknown';
  }

  Future<Map<String, String>> getRegistrationData() async {
    try {
      if (Platform.isAndroid) {
        final androidInfo = await _deviceInfo.androidInfo;
        return {
          'deviceId': androidInfo.id,
          'deviceModel': '${androidInfo.manufacturer} ${androidInfo.model}',
          'devicePlatform': 'android',
        };
      } else if (Platform.isIOS) {
        final iosInfo = await _deviceInfo.iosInfo;
        return {
          'deviceId': iosInfo.identifierForVendor ?? 'unknown_ios',
          'deviceModel': iosInfo.name,
          'devicePlatform': 'ios',
        };
      }
      return {
        'deviceId': 'unknown',
        'deviceModel': 'unknown',
        'devicePlatform': Platform.operatingSystem,
      };
    } catch (e) {
      return {
        'deviceId': 'error',
        'deviceModel': 'error',
        'devicePlatform': Platform.operatingSystem,
      };
    }
  }
}
