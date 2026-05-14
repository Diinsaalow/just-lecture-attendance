import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/auth/auth_controller.dart';
import 'package:mobile/core/values/app_colors.dart';
import 'package:mobile/data/models/attendance_record_model.dart';
import 'package:mobile/data/models/class_session_model.dart';
import 'package:mobile/modules/sessions/controllers/today_sessions_controller.dart';
import 'package:intl/intl.dart';

class TodaySessionsView extends GetView<TodaySessionsController> {
  const TodaySessionsView({super.key});

  static String _fmtTime(DateTime? t) =>
      t == null ? '—' : DateFormat('hh:mm a').format(t.toLocal());

  @override
  Widget build(BuildContext context) {
    final authController = Get.find<AuthController>();
    final user = authController.user;

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: RefreshIndicator(
        onRefresh: () => controller.fetchTodaySessions(),
        color: AppColors.primary,
        child: Obx(() {
          if (controller.isLoading.value && controller.sessions.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          return SafeArea(
            child: CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              slivers: [
                SliverFillRemaining(
                  hasScrollBody: false,
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
                      const SizedBox(height: 24),
                      Expanded(
                        child: Center(
                          child: controller.sessions.isEmpty
                              ? _buildEmptyState()
                              : Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 20),
                                  child: _buildSessionCard(controller.getPrimarySession()!),
                                ),
                        ),
                      ),
                      Obx(() {
                        final session = controller.getPrimarySession();
                        final attendance =
                            session != null ? controller.attendanceStates[session.id] : null;
                        return _buildSummaryStats(attendance);
                      }),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ],
            ),
          );
        }),
      ),
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

  Widget _buildSessionCard(ClassSessionModel session) {
    final attendance = controller.attendanceStates[session.id];
    final checkedIn = attendance?.isCurrentlyCheckedIn == true;
    final checkedOut = attendance?.isCheckedOut == true;

    final scheduledDateStr =
        DateFormat('EEE, MMM d').format(session.scheduledDate.toLocal());
    final hallLine = session.hallInfo != null
        ? '${session.hallInfo!.name} (${session.hallInfo!.code})'
        : 'Hall not assigned';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey[200]!),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  session.courseInfo.name,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1A1C1E),
                  ),
                ),
              ),
              _buildStatusChip(attendance, checkedIn, checkedOut),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            session.classInfo.name,
            style: TextStyle(fontSize: 14, color: Colors.grey[700]),
          ),
          const SizedBox(height: 4),
          Text(
            hallLine,
            style: TextStyle(fontSize: 13, color: Colors.grey[600]),
          ),
          const SizedBox(height: 16),
          _buildDetailRow(
            Icons.schedule,
            'Session time',
            '$scheduledDateStr · ${session.fromTime} – ${session.toTime}',
          ),
          if (attendance?.scheduledStart != null && attendance?.scheduledEnd != null) ...[
            const SizedBox(height: 8),
            _buildDetailRow(
              Icons.event_note_outlined,
              'Recorded window',
              '${attendance!.scheduledStart} – ${attendance.scheduledEnd}',
            ),
          ],
          if (attendance != null && attendance.checkInAt != null) ...[
            const SizedBox(height: 8),
            _buildDetailRow(
              Icons.login,
              'Check-in time',
              _fmtTime(attendance.checkInAt),
            ),
          ],
          if (checkedOut && attendance?.checkOutAt != null) ...[
            const SizedBox(height: 8),
            _buildDetailRow(
              Icons.logout,
              'Check-out time',
              _fmtTime(attendance!.checkOutAt),
            ),
          ],
          if (checkedIn) ...[
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                controller.getRemainingTime(session),
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
            ),
          ],
          const SizedBox(height: 20),
          _buildSessionActions(session, attendance, checkedIn, checkedOut),
        ],
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: Colors.grey[500]),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey[500],
                  letterSpacing: 0.3,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF1A1C1E),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStatusChip(
    AttendanceRecordModel? attendance,
    bool checkedIn,
    bool checkedOut,
  ) {
    Color bg;
    Color fg;
    String label;
    if (checkedOut) {
      bg = Colors.blueGrey.withValues(alpha: 0.12);
      fg = Colors.blueGrey.shade800;
      label = attendance?.displayStatus ?? 'Checked Out';
    } else if (checkedIn) {
      bg = AppColors.primary.withValues(alpha: 0.12);
      fg = AppColors.primary;
      label = attendance?.displayStatus ?? 'Checked In';
    } else {
      bg = Colors.orange.withValues(alpha: 0.12);
      fg = Colors.deepOrange.shade800;
      label = 'Not checked in';
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: fg,
        ),
      ),
    );
  }

  Widget _buildSessionActions(
    ClassSessionModel session,
    AttendanceRecordModel? attendance,
    bool checkedIn,
    bool checkedOut,
  ) {
    if (checkedOut) {
      return const SizedBox.shrink();
    }

    if (checkedIn) {
      return SizedBox(
        width: double.infinity,
        child: Obx(() {
          final busy = controller.isProcessing.value;
          final canOut = session.isCheckOutOpen;
          return FilledButton.icon(
            onPressed: busy
                ? null
                : () {
                    if (!canOut) {
                      Get.snackbar(
                        'Cannot Check Out',
                        'Check-out is not open yet',
                        snackPosition: SnackPosition.BOTTOM,
                        backgroundColor: Colors.orange,
                        colorText: Colors.white,
                      );
                      return;
                    }
                    controller.checkOut(session.id);
                  },
            style: FilledButton.styleFrom(
              backgroundColor: Colors.red.shade600,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            icon: busy
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                : const Icon(Icons.logout),
            label: Text(busy ? 'Checking out…' : 'Check Out'),
          );
        }),
      );
    }

    return SizedBox(
      width: double.infinity,
      child: Obx(() {
        final busy = controller.isProcessing.value;
        final canIn = session.isCheckInOpen;
        return FilledButton.icon(
          onPressed: busy
              ? null
              : () {
                  if (!canIn) {
                    Get.snackbar(
                      'Cannot Check In',
                      'Check-in is not open yet',
                      snackPosition: SnackPosition.BOTTOM,
                      backgroundColor: Colors.orange,
                      colorText: Colors.white,
                    );
                    return;
                  }
                  controller.checkIn(session.id);
                },
          style: FilledButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
          icon: busy
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                )
              : const Icon(Icons.crop_free),
          label: Text(busy ? 'Checking in…' : 'Check In'),
        );
      }),
    );
  }

  Widget _buildSummaryStats(AttendanceRecordModel? attendance) {
    final checkInLabel = _fmtTime(attendance?.checkInAt);
    final checkOutLabel = _fmtTime(attendance?.checkOutAt);
    String totalLabel = '0h 0m';
    if (attendance?.checkInAt != null && attendance?.checkOutAt != null) {
      final d = attendance!.checkOutAt!.difference(attendance.checkInAt!);
      final h = d.inHours;
      final m = d.inMinutes.remainder(60);
      totalLabel = '${h}h ${m}m';
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _buildStatItem(Icons.arrow_forward, checkInLabel, 'CHECK IN'),
          _buildStatItem(Icons.arrow_back, checkOutLabel, 'CHECK OUT'),
          _buildStatItem(Icons.access_time, totalLabel, 'TOTAL HRS'),
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
