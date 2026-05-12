import 'package:get/get.dart';
import 'package:mobile/core/api/api_client.dart';
import 'package:mobile/data/models/lecture_class_model.dart';
import 'package:mobile/data/models/period_model.dart';

class ClassDetailsController extends GetxController {
  final ApiClient _apiClient = Get.find<ApiClient>();
  
  late LectureClassModel lectureClass;
  final weeklyPeriods = <String, List<PeriodModel>>{}.obs;
  final isLoading = false.obs;
  final hasError = false.obs;

  @override
  void onInit() {
    super.onInit();
    lectureClass = Get.arguments as LectureClassModel;
    fetchWeeklyPeriods();
  }

  Future<void> fetchWeeklyPeriods() async {
    isLoading.value = true;
    hasError.value = false;
    try {
      final response = await _apiClient.get('/periods/class/${lectureClass.id}');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        final periods = data.map((json) => PeriodModel.fromJson(json)).toList();
        
        // Group by day
        final grouped = <String, List<PeriodModel>>{};
        for (final p in periods) {
          if (!grouped.containsKey(p.day)) {
            grouped[p.day] = [];
          }
          grouped[p.day]!.add(p);
        }
        
        weeklyPeriods.value = grouped;
      } else {
        hasError.value = true;
      }
    } catch (e) {
      hasError.value = true;
      Get.snackbar('Error', 'Failed to load weekly timetable',
          snackPosition: SnackPosition.BOTTOM);
    } finally {
      isLoading.value = false;
    }
  }

  List<String> get sortedDays {
    const daysOrder = [
      'Saturday',
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
    ];
    final activeDays = weeklyPeriods.keys.toList();
    activeDays.sort((a, b) => daysOrder.indexOf(a) - daysOrder.indexOf(b));
    return activeDays;
  }
}
