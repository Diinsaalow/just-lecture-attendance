import 'dart:io';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:get/get.dart';

class DeviceService extends GetxService {
  final DeviceInfoPlugin _deviceInfo = DeviceInfoPlugin();

  Future<String> getDeviceId() async {
    try {
      if (Platform.isAndroid) {
        final androidInfo = await _deviceInfo.androidInfo;
        // androidId is the most consistent for a specific device
        return androidInfo.id; 
      } else if (Platform.isIOS) {
        final iosInfo = await _deviceInfo.iosInfo;
        return iosInfo.identifierForVendor ?? 'unknown_ios_device';
      }
      return 'unknown_platform';
    } catch (e) {
      return 'error_fetching_device_id';
    }
  }
}
