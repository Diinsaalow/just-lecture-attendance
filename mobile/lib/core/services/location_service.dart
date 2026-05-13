import 'package:geolocator/geolocator.dart';
import 'package:get/get.dart';

class LocationService extends GetxService {
  Future<Position?> getCurrentPosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    // Test if location services are enabled.
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      Get.snackbar(
        'Location Disabled',
        'Please enable location services in your settings.',
        snackPosition: SnackPosition.BOTTOM,
      );
      return null;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        Get.snackbar(
          'Permission Denied',
          'Location permissions are required for check-in.',
          snackPosition: SnackPosition.BOTTOM,
        );
        return null;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      Get.snackbar(
        'Permission Denied',
        'Location permissions are permanently denied. Please enable them in app settings.',
        snackPosition: SnackPosition.BOTTOM,
      );
      return null;
    }

    try {
      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to fetch location: $e',
        snackPosition: SnackPosition.BOTTOM,
      );
      return null;
    }
  }
}
