import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/values/app_colors.dart';
import 'package:mobile/modules/dashboard/controllers/absence_request_controller.dart';
import 'package:mobile/modules/dashboard/models/absence_request.dart';
import 'package:mobile/modules/dashboard/models/absence_request_status.dart';
import 'package:mobile/modules/dashboard/models/course_option.dart';

class AbsenceRequestView extends GetView<AbsenceRequestController> {
  const AbsenceRequestView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        title: const Text(
          'Absence Requests',
          style: TextStyle(
            color: Color(0xFF1A1C1E),
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          controller.resetForm();
          _showNewRequestSheet(context);
        },
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('New Request', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      body: Column(
        children: [
          _buildSegmentedTab(),
          Expanded(
            child: Obx(() {
              final list = controller.filteredRequests;
              if (list.isEmpty) return _buildEmptyState();
              return ListView.builder(
                padding: const EdgeInsets.fromLTRB(20, 10, 20, 100),
                itemCount: list.length,
                itemBuilder: (context, i) => _buildRequestCard(list[i]),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildSegmentedTab() {
    return Container(
      margin: const EdgeInsets.all(20),
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Obx(() => Row(
            children: [
              _buildTabItem(0, 'Pending'),
              _buildTabItem(1, 'Approved'),
              _buildTabItem(2, 'Rejected'),
            ],
          )),
    );
  }

  Widget _buildTabItem(int index, String label) {
    final isSelected = controller.segmentIndex.value == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => controller.segmentIndex.value = index,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primary : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: isSelected ? Colors.white : Colors.grey[600],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildRequestCard(AbsenceRequest request) {
    final statusColor = _getStatusColor(request.status);
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        request.status.name.toUpperCase(),
                        style: TextStyle(
                          color: statusColor,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    Text(
                      '${request.startDateLabel}',
                      style: TextStyle(color: Colors.grey[500], fontSize: 12, fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  request.courseName,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1A1C1E),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  request.reasonSnippet,
                  style: TextStyle(color: Colors.grey[600], fontSize: 14, height: 1.4),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0xFFF1F4F9)),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Row(
              children: [
                Icon(Icons.date_range_outlined, size: 16, color: Colors.grey[400]),
                const SizedBox(width: 8),
                Text(
                  'Ends: ${request.endDateLabel}',
                  style: TextStyle(color: Colors.grey[500], fontSize: 13),
                ),
                const Spacer(),
                const Text(
                  'View Details',
                  style: TextStyle(color: AppColors.primary, fontSize: 13, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(AbsenceRequestStatus status) {
    switch (status) {
      case AbsenceRequestStatus.pending: return Colors.orange;
      case AbsenceRequestStatus.approved: return Colors.green;
      case AbsenceRequestStatus.rejected: return Colors.red;
    }
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.assignment_outlined, size: 80, color: Colors.grey[300]),
          const SizedBox(height: 16),
          const Text('No requests found', style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }

  void _showNewRequestSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(30))),
      builder: (context) => _NewRequestForm(controller: controller),
    );
  }
}

class _NewRequestForm extends StatelessWidget {
  final AbsenceRequestController controller;
  const _NewRequestForm({required this.controller});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 24, right: 24, top: 12,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40, height: 4,
              decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)),
            ),
          ),
          const SizedBox(height: 24),
          const Text('Submit Absence Request', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          _buildLabel('Select Course'),
          const SizedBox(height: 8),
          Obx(() => Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(color: const Color(0xFFF1F4F9), borderRadius: BorderRadius.circular(16)),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<CourseOption>(
                    isExpanded: true,
                    value: controller.selectedCourse.value,
                    items: controller.courseOptions.map((e) => DropdownMenuItem(value: e, child: Text(e.label))).toList(),
                    onChanged: (v) => controller.selectedCourse.value = v,
                  ),
                ),
              )),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(child: _buildDateInput(context, 'Start Date', controller.startDate)),
              const SizedBox(width: 16),
              Expanded(child: _buildDateInput(context, 'End Date', controller.endDate)),
            ],
          ),
          const SizedBox(height: 20),
          _buildLabel('Reason'),
          const SizedBox(height: 8),
          TextField(
            controller: controller.reasonController,
            maxLines: 3,
            decoration: InputDecoration(
              hintText: 'Enter reason for absence...',
              hintStyle: TextStyle(color: Colors.grey[400], fontSize: 14),
              filled: true,
              fillColor: const Color(0xFFF1F4F9),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
            ),
          ),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton(
              onPressed: () {
                controller.submitNewRequest();
                Get.back();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: const Text('Submit Request', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Text(text, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF1A1C1E)));
  }

  Widget _buildDateInput(BuildContext context, String label, Rx<DateTime?> dateRx) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildLabel(label),
        const SizedBox(height: 8),
        InkWell(
          onTap: () async {
            final d = await showDatePicker(context: context, initialDate: DateTime.now(), firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 365)));
            if (d != null) dateRx.value = d;
          },
          child: Obx(() => Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(color: const Color(0xFFF1F4F9), borderRadius: BorderRadius.circular(16)),
                child: Row(
                  children: [
                    Icon(Icons.calendar_today, size: 16, color: Colors.grey[400]),
                    const SizedBox(width: 8),
                    Text(
                      dateRx.value != null ? "${dateRx.value!.day}/${dateRx.value!.month}/${dateRx.value!.year}" : "Select Date",
                      style: TextStyle(color: dateRx.value != null ? Colors.black87 : Colors.grey[400], fontSize: 14),
                    ),
                  ],
                ),
              )),
        ),
      ],
    );
  }
}
