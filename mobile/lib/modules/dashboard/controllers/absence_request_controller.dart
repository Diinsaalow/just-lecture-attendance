import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/modules/dashboard/data/dummy_courses.dart';
import 'package:mobile/modules/dashboard/models/absence_request.dart';
import 'package:mobile/modules/dashboard/models/absence_request_status.dart';
import 'package:mobile/modules/dashboard/models/course_option.dart';

class AbsenceRequestController extends GetxController {
  final requests = <AbsenceRequest>[].obs;

  /// 0 = Pending, 1 = Approved, 2 = Rejected
  final segmentIndex = 0.obs;

  final reasonController = TextEditingController();
  final selectedCourse = Rxn<CourseOption>();
  final startDate = Rxn<DateTime>();
  final endDate = Rxn<DateTime>();

  List<CourseOption> get courseOptions => kDummyCourses;

  List<AbsenceRequest> get filteredRequests {
    AbsenceRequestStatus? match;
    switch (segmentIndex.value) {
      case 0:
        match = AbsenceRequestStatus.pending;
        break;
      case 1:
        match = AbsenceRequestStatus.approved;
        break;
      case 2:
        match = AbsenceRequestStatus.rejected;
        break;
    }
    return requests.where((r) => r.status == match).toList();
  }

  @override
  void onInit() {
    super.onInit();
    requests.assignAll(const [
      AbsenceRequest(
        id: '1',
        courseCode: 'IT2504',
        courseName: 'Mobile App Development',
        startDateLabel: 'May 2, 2026',
        endDateLabel: 'May 2, 2026',
        reasonSnippet: 'Conference travel — return same day…',
        status: AbsenceRequestStatus.pending,
      ),
      AbsenceRequest(
        id: '2',
        courseCode: 'IT2203',
        courseName: 'Database Systems',
        startDateLabel: 'Apr 28, 2026',
        endDateLabel: 'Apr 30, 2026',
        reasonSnippet: 'Family obligation; coverage arranged…',
        status: AbsenceRequestStatus.approved,
      ),
      AbsenceRequest(
        id: '3',
        courseCode: 'IT2101',
        courseName: 'Data Structures & Algorithms',
        startDateLabel: 'Mar 10, 2026',
        endDateLabel: 'Mar 10, 2026',
        reasonSnippet: 'Short notice: medical appointment…',
        status: AbsenceRequestStatus.rejected,
      ),
    ]);
  }

  @override
  void onClose() {
    reasonController.dispose();
    super.onClose();
  }

  void resetForm() {
    reasonController.clear();
    selectedCourse.value = courseOptions.isNotEmpty ? courseOptions.first : null;
    final now = DateTime.now();
    startDate.value = now;
    endDate.value = now;
  }

  String formatDate(DateTime? d) {
    if (d == null) return '—';
    const months = <String>[
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return '${months[d.month - 1]} ${d.day}, ${d.year}';
  }

  void submitNewRequest() {
    final course = selectedCourse.value;
    final s = startDate.value;
    final e = endDate.value;
    final reason = reasonController.text.trim();
    if (course == null || s == null || e == null || reason.isEmpty) {
      Get.snackbar(
        'Missing details',
        'Select a course, dates, and enter a reason.',
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(12),
      );
      return;
    }
    if (e.isBefore(s)) {
      Get.snackbar(
        'Invalid range',
        'End date must be on or after the start date.',
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(12),
      );
      return;
    }

    final id = 'local-${DateTime.now().microsecondsSinceEpoch}';
    requests.insert(
      0,
      AbsenceRequest(
        id: id,
        courseCode: course.code,
        courseName: course.name,
        startDateLabel: formatDate(s),
        endDateLabel: formatDate(e),
        reasonSnippet: reason.length > 48 ? '${reason.substring(0, 45)}…' : reason,
        status: AbsenceRequestStatus.pending,
      ),
    );
    Get.back();
    Get.snackbar(
      'Request submitted',
      'Your absence request was saved locally (demo).',
      snackPosition: SnackPosition.BOTTOM,
      margin: const EdgeInsets.all(12),
    );
    segmentIndex.value = 0;
    resetForm();
  }
}
