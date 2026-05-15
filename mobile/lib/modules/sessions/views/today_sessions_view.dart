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

  // ──────────────────────────────────────────────────────────────────────────
  // Root build
  // ──────────────────────────────────────────────────────────────────────────

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
                      // ── Header ──────────────────────────────────────────
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
                                    'Good ${_greetingPeriod()}, finish your attendance',
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
                                _buildHeaderIcon(
                                  Icons.crop_free,
                                  isSquare: true,
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),

                      // ── Live Clock ──────────────────────────────────────
                      const SizedBox(height: 8),
                      Obx(
                        () => Column(
                          children: [
                            Text(
                              DateFormat('hh:mm a').format(
                                controller.currentTime.value,
                              ),
                              style: const TextStyle(
                                fontSize: 60,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF1A1C1E),
                                letterSpacing: -2,
                              ),
                            ),
                            Text(
                              DateFormat('MMMM dd, yyyy • EEEE').format(
                                controller.currentTime.value,
                              ),
                              style: TextStyle(
                                fontSize: 15,
                                color: Colors.grey[600],
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),

                      // ── Missed-checkout banner ──────────────────────────
                      Obx(() {
                        final missed = controller.getMissedCheckoutSessions();
                        if (missed.isEmpty) return const SizedBox.shrink();
                        return Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          child: Column(
                            children: missed
                                .map((s) => _buildMissedCheckoutBanner(s))
                                .toList(),
                          ),
                        );
                      }),

                      // ── Primary session card (or empty state) ──────────
                      Expanded(
                        child: Obx(() {
                          final primary = controller.getPrimarySession();
                          if (primary == null) {
                            return _buildEmptyState();
                          }
                          return Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 20,
                              vertical: 8,
                            ),
                            child: _buildSessionCard(primary),
                          );
                        }),
                      ),

                      // ── Summary stats ──────────────────────────────────
                      Obx(() {
                        final session = controller.getPrimarySession();
                        final attendance = session != null
                            ? controller.attendanceStates[session.id]
                            : null;
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

  // ──────────────────────────────────────────────────────────────────────────
  // Missed-checkout banner
  // ──────────────────────────────────────────────────────────────────────────

  Widget _buildMissedCheckoutBanner(ClassSessionModel session) {
    final canStillCheckOut = session.isCheckOutOpen;
    return GestureDetector(
      onTap: () => _showSessionDetailSheet(session),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: canStillCheckOut
              ? const Color(0xFFFFF3CD)
              : const Color(0xFFFFEBEE),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: canStillCheckOut
                ? const Color(0xFFFFCB47)
                : Colors.red.shade200,
            width: 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: canStillCheckOut
                    ? Colors.orange.shade100
                    : Colors.red.shade50,
                shape: BoxShape.circle,
              ),
              child: Icon(
                canStillCheckOut
                    ? Icons.logout_outlined
                    : Icons.warning_amber_rounded,
                color: canStillCheckOut ? Colors.orange : Colors.red,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    canStillCheckOut
                        ? 'Checkout required — ${session.courseInfo.name}'
                        : 'Missed checkout — ${session.courseInfo.name}',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: canStillCheckOut
                          ? const Color(0xFF7C4A00)
                          : Colors.red.shade800,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    canStillCheckOut
                        ? '${session.fromTime} – ${session.toTime} · Tap to check out'
                        : '${session.fromTime} – ${session.toTime} · Window closed',
                    style: TextStyle(
                      fontSize: 12,
                      color: canStillCheckOut
                          ? const Color(0xFF9A6000)
                          : Colors.red.shade400,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right_rounded,
              color: canStillCheckOut
                  ? const Color(0xFF9A6000)
                  : Colors.red.shade400,
            ),
          ],
        ),
      ),
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Session detail bottom sheet (for missed-checkout sessions)
  // ──────────────────────────────────────────────────────────────────────────

  void _showSessionDetailSheet(ClassSessionModel session) {
    final attendance = controller.attendanceStates[session.id];
    final canStillCheckOut = session.isCheckOutOpen;

    Get.bottomSheet(
      Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Drag handle
            Center(
              child: Container(
                margin: const EdgeInsets.symmetric(vertical: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ),

            // Title row
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: canStillCheckOut
                        ? Colors.orange.shade50
                        : Colors.red.shade50,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    canStillCheckOut
                        ? Icons.logout_outlined
                        : Icons.warning_amber_rounded,
                    color: canStillCheckOut ? Colors.orange : Colors.red,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        canStillCheckOut
                            ? 'Checkout Still Available'
                            : 'Session Ended',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: canStillCheckOut
                              ? Colors.orange
                              : Colors.red,
                          letterSpacing: 0.5,
                        ),
                      ),
                      Text(
                        session.courseInfo.name,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1A1C1E),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),
            const Divider(height: 1),
            const SizedBox(height: 20),

            // Session details
            _buildDetailRow(
              Icons.class_outlined,
              'Class',
              session.classInfo.name,
            ),
            const SizedBox(height: 12),
            _buildDetailRow(
              Icons.location_on_outlined,
              'Hall',
              session.hallInfo != null
                  ? '${session.hallInfo!.name} (${session.hallInfo!.code})'
                  : 'Hall not assigned',
            ),
            const SizedBox(height: 12),
            _buildDetailRow(
              Icons.schedule_outlined,
              'Scheduled time',
              '${session.fromTime} – ${session.toTime}',
            ),
            if (attendance?.checkInAt != null) ...[
              const SizedBox(height: 12),
              _buildDetailRow(
                Icons.login,
                'Checked in at',
                _fmtTime(attendance!.checkInAt),
              ),
            ],

            const SizedBox(height: 20),

            // Status/action area
            if (canStillCheckOut)
              // Grace period still open — show actionable checkout button
              Obx(() {
                final busy = controller.isProcessing.value;
                return FilledButton.icon(
                  onPressed: busy
                      ? null
                      : () {
                          Get.back(); // close sheet first
                          controller.checkOut(session.id);
                        },
                  style: FilledButton.styleFrom(
                    backgroundColor: Colors.red.shade600,
                    foregroundColor: Colors.white,
                    minimumSize: const Size(double.infinity, 52),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  icon: busy
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(Icons.logout),
                  label: Text(
                    busy ? 'Checking out…' : 'Check Out Now',
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                );
              })
            else
              // Grace period expired — informational only
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.red.shade200),
                ),
                child: Column(
                  children: [
                    Icon(
                      Icons.lock_clock_outlined,
                      color: Colors.red.shade700,
                      size: 28,
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Checkout window has closed',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: Colors.red.shade700,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Please contact administration to resolve this.',
                      style: TextStyle(fontSize: 12, color: Colors.red.shade500),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),

            const SizedBox(height: 16),

            // Close button
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () => Get.back(),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  side: BorderSide(color: Colors.grey.shade300),
                ),
                child: const Text(
                  'Close',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF1A1C1E),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
      isScrollControlled: true,
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Session card
  // ──────────────────────────────────────────────────────────────────────────

  Widget _buildSessionCard(ClassSessionModel session) {
    final attendance = controller.attendanceStates[session.id];
    final checkedIn = attendance?.isCurrentlyCheckedIn == true;
    final checkedOut = attendance?.isCheckedOut == true;
    final ended = controller.isSessionEnded(session);

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
          // ── "Active Now" banner ──────────────────────────────────────
          if (session.isActive && !checkedIn && !checkedOut)
            _buildActiveNowBanner(),

          // ── Course name + status chip ──────────────────────────────
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
              _buildStatusChip(attendance, checkedIn, checkedOut, ended),
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

          // ── Session time row ─────────────────────────────────────────
          _buildDetailRow(
            Icons.schedule,
            'Session time',
            '${session.fromTime} – ${session.toTime}',
          ),

          if (attendance?.scheduledStart != null &&
              attendance?.scheduledEnd != null) ...[
            const SizedBox(height: 8),
            _buildDetailRow(
              Icons.event_note_outlined,
              'Recorded window',
              '${attendance!.scheduledStart} – ${attendance.scheduledEnd}',
            ),
          ],

          if (attendance?.checkInAt != null) ...[
            const SizedBox(height: 8),
            _buildDetailRow(
              Icons.login,
              'Check-in time',
              _fmtTime(attendance!.checkInAt),
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

          // ── Remaining time pill (while live & checked in) ────────────
          if (checkedIn && !ended) ...[
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Obx(
                () => Text(
                  controller.getRemainingTime(session),
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
              ),
            ),
          ],

          const SizedBox(height: 20),

          // ── Action buttons ───────────────────────────────────────────
          _buildSessionActions(session, attendance, checkedIn, checkedOut),
        ],
      ),
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // "Active Now" banner
  // ──────────────────────────────────────────────────────────────────────────

  Widget _buildActiveNowBanner() {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primary,
            AppColors.primary.withValues(alpha: 0.80),
          ],
        ),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: const BoxDecoration(
              color: Color(0xFF4ADE80),
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 8),
          const Text(
            'Active Now — Check-in is open',
            style: TextStyle(
              color: Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Status chip
  // ──────────────────────────────────────────────────────────────────────────

  Widget _buildStatusChip(
    AttendanceRecordModel? attendance,
    bool checkedIn,
    bool checkedOut,
    bool ended,
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

  // ──────────────────────────────────────────────────────────────────────────
  // Action buttons
  // ──────────────────────────────────────────────────────────────────────────

  Widget _buildSessionActions(
    ClassSessionModel session,
    AttendanceRecordModel? attendance,
    bool checkedIn,
    bool checkedOut,
  ) {
    // Fully done
    if (checkedOut) return const SizedBox.shrink();

    // Checked in → show checkout button (or "expired" state)
    if (checkedIn) {
      final canOut = session.isCheckOutOpen;
      return SizedBox(
        width: double.infinity,
        child: Obx(() {
          final busy = controller.isProcessing.value;
          return FilledButton.icon(
            onPressed: busy
                ? null
                : () {
                    if (!canOut) {
                      Get.snackbar(
                        'Cannot Check Out',
                        'The checkout window for this session has closed.',
                        snackPosition: SnackPosition.BOTTOM,
                        backgroundColor: Colors.orange,
                        colorText: Colors.white,
                      );
                      return;
                    }
                    controller.checkOut(session.id);
                  },
            style: FilledButton.styleFrom(
              backgroundColor: canOut ? Colors.red.shade600 : Colors.grey[400],
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
            icon: busy
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : Icon(canOut ? Icons.logout : Icons.lock_clock_outlined),
            label: Text(
              busy
                  ? 'Checking out…'
                  : canOut
                      ? 'Check Out'
                      : 'Checkout Window Closed',
            ),
          );
        }),
      );
    }

    // Not checked in → show check-in button
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
                      'Check-in is not open yet for this session.',
                      snackPosition: SnackPosition.BOTTOM,
                      backgroundColor: Colors.orange,
                      colorText: Colors.white,
                    );
                    return;
                  }
                  controller.checkIn(session.id);
                },
          style: FilledButton.styleFrom(
            backgroundColor: canIn ? AppColors.primary : Colors.grey[400],
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
          ),
          icon: busy
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
              : const Icon(Icons.crop_free),
          label: Text(busy ? 'Checking in…' : 'Check In'),
        );
      }),
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Detail row helper
  // ──────────────────────────────────────────────────────────────────────────

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

  // ──────────────────────────────────────────────────────────────────────────
  // Empty state
  // ──────────────────────────────────────────────────────────────────────────

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.event_available_outlined, size: 80, color: Colors.grey[300]),
          const SizedBox(height: 16),
          Text(
            'No active sessions',
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey[600],
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'All sessions for today have ended.',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[400],
            ),
          ),
          const SizedBox(height: 20),
          OutlinedButton.icon(
            onPressed: () => controller.fetchTodaySessions(),
            icon: const Icon(Icons.refresh),
            label: const Text('Refresh'),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.primary,
              side: const BorderSide(color: AppColors.primary),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Summary stats
  // ──────────────────────────────────────────────────────────────────────────

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

  // ──────────────────────────────────────────────────────────────────────────
  // Header icon helper
  // ──────────────────────────────────────────────────────────────────────────

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

  // ──────────────────────────────────────────────────────────────────────────
  // Greeting helper
  // ──────────────────────────────────────────────────────────────────────────

  String _greetingPeriod() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }
}
