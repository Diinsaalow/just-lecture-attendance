import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/auth/auth_controller.dart';
import 'package:mobile/core/values/app_colors.dart';
import 'package:mobile/modules/sessions/controllers/today_sessions_controller.dart';
import 'package:mobile/data/models/class_session_model.dart';
import 'package:intl/intl.dart';

class TodaySessionsView extends GetView<TodaySessionsController> {
  const TodaySessionsView({super.key});

  @override
  Widget build(BuildContext context) {
    final authController = Get.find<AuthController>();
    final user = authController.user;

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }

        return SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(24.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Hey ${user?.firstName ?? "Instructor"}!',
                            style: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1A1C1E),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Good evening, finish your attendance',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    ),
                    Row(
                      children: [
                        _buildHeaderIcon(Icons.notifications_none),
                        const SizedBox(width: 12),
                        _buildHeaderIcon(Icons.crop_free, isSquare: true),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              // Time Section
              Obx(() => Column(
                    children: [
                      Text(
                        DateFormat('hh:mm a').format(controller.currentTime.value),
                        style: const TextStyle(
                          fontSize: 64,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF1A1C1E),
                          letterSpacing: -2,
                        ),
                      ),
                      Text(
                        DateFormat('MMMM dd, yyyy • EEEE').format(controller.currentTime.value),
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.grey[600],
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  )),
              const SizedBox(height: 40),
              // Session Status / Action
              Expanded(
                child: Center(
                  child: controller.sessions.isEmpty
                      ? _buildEmptyState()
                      : _buildMainActionArea(),
                ),
              ),
              // Summary Stats
              _buildSummaryStats(),
              const SizedBox(height: 20),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildHeaderIcon(IconData icon, {bool isSquare = false}) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(isSquare ? 12 : 30),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Icon(icon, color: Colors.black87, size: 24),
    );
  }

  Widget _buildEmptyState() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(Icons.event_available_outlined, size: 80, color: Colors.grey[300]),
        const SizedBox(height: 16),
        Text(
          'No shifts available',
          style: TextStyle(
            fontSize: 16,
            color: Colors.grey[600],
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildMainActionArea() {
    final activeSession = controller.sessions.firstWhereOrNull((s) {
      final attendance = controller.attendanceStates[s.id];
      return attendance != null && !attendance.isCheckedOut;
    }) ?? controller.sessions.first;
    
    final attendance = controller.attendanceStates[activeSession.id];
    final isCheckedIn = attendance != null && !attendance.isCheckedOut;

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Stack(
          alignment: Alignment.center,
          children: [
            // Outer Ring
            Container(
              width: 240,
              height: 240,
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.grey[100]!),
              ),
            ),
            // Middle Ring
            Container(
              width: 190,
              height: 190,
              decoration: BoxDecoration(
                color: const Color(0xFFF1F4F9),
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 4),
              ),
            ),
            // Inner Button
            GestureDetector(
              onTap: () => isCheckedIn 
                  ? controller.checkOut(activeSession.id) 
                  : controller.checkIn(activeSession.id),
              child: Container(
                width: 140,
                height: 140,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.grey[200]!),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      isCheckedIn ? Icons.logout : Icons.crop_free,
                      color: isCheckedIn ? Colors.red : AppColors.primary,
                      size: 40,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      isCheckedIn ? 'Check Out' : 'Check In',
                      style: TextStyle(
                        color: isCheckedIn ? Colors.red : AppColors.primary,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 32),
        if (isCheckedIn)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              controller.getRemainingTime(activeSession),
              style: const TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.bold,
              ),
            ),
          )
        else
          Text(
            activeSession.courseInfo.name,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
      ],
    );
  }

  Widget _buildSummaryStats() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _buildStatItem(Icons.arrow_forward, '--:--', 'CHECK IN'),
          _buildStatItem(Icons.arrow_back, '--:--', 'CHECK OUT'),
          _buildStatItem(Icons.access_time, '0h 0m', 'TOTAL HRS'),
        ],
      ),
    );
  }

  Widget _buildStatItem(IconData icon, String value, String label) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFFF1F4F9),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Icon(icon, color: Colors.black54, size: 24),
        ),
        const SizedBox(height: 12),
        Text(
          value,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Color(0xFF1A1C1E),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            color: Colors.grey[500],
            fontWeight: FontWeight.bold,
            letterSpacing: 0.5,
          ),
        ),
      ],
    );
  }
}
