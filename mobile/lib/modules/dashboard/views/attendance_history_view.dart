import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/values/app_colors.dart';
import 'package:mobile/modules/dashboard/controllers/attendance_history_controller.dart';
import 'package:mobile/modules/dashboard/models/attendance_record.dart';
import 'package:mobile/modules/dashboard/models/attendance_status.dart';

class AttendanceHistoryView extends GetView<AttendanceHistoryController> {
  const AttendanceHistoryView({super.key});

  @override
  Widget build(BuildContext context) {
    final primary = AppColors.primary;
    final theme = Theme.of(context);
    final surface = theme.colorScheme.surface;
    final onSurface = theme.colorScheme.onSurface;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: primary,
        elevation: 0,
        title: const Text(
          'Attendance History',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list_outlined),
            tooltip: 'Filter',
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Filters will connect to the API later.'),
                  behavior: SnackBarBehavior.floating,
                ),
              );
            },
          ),
        ],
      ),
      body: Obx(
        () => ListView(
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 24),
          children: [
            _SummaryStrip(
              sessions: controller.sessionsThisWeek,
              avgPercent: controller.avgAttendancePercent,
            ),
            const SizedBox(height: 18),
            Text(
              'Recent sessions',
              style: theme.textTheme.titleMedium?.copyWith(
                color: primary,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 10),
            if (controller.records.isEmpty)
              _EmptyState(
                onSurface: onSurface,
                primary: primary,
                secondary: AppColors.secondary,
              )
            else
              ...controller.records.map(
                (r) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _AttendanceRecordCard(
                    record: r,
                    primary: primary,
                    surface: surface,
                    onSurface: onSurface,
                    theme: theme,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _SummaryStrip extends StatelessWidget {
  const _SummaryStrip({required this.sessions, required this.avgPercent});

  final int sessions;
  final int avgPercent;

  @override
  Widget build(BuildContext context) {
    final primary = AppColors.primary;
    final border = primary.withValues(alpha: 0.14);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: border, width: 0.8),
      ),
      child: Row(
        children: [
          Expanded(
            child: _StatBadge(
              label: 'This week',
              value: '$sessions',
              sublabel: 'sessions',
            ),
          ),
          Container(
            width: 1,
            height: 36,
            color: border,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _StatBadge(
              label: 'Avg. attendance',
              value: sessions == 0 && avgPercent == 0 ? '—' : '$avgPercent%',
              sublabel: sessions == 0 && avgPercent == 0 ? 'no data' : 'rolled up',
            ),
          ),
        ],
      ),
    );
  }
}

class _StatBadge extends StatelessWidget {
  const _StatBadge({
    required this.label,
    required this.value,
    required this.sublabel,
  });

  final String label;
  final String value;
  final String sublabel;

  @override
  Widget build(BuildContext context) {
    final primary = AppColors.primary;
    final green = AppColors.secondary;

    return Row(
      children: [
        Container(
          width: 3,
          height: 40,
          decoration: BoxDecoration(
            color: green.withValues(alpha: 0.9),
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: Theme.of(context).textTheme.labelMedium?.copyWith(
                  color: primary.withValues(alpha: 0.60),
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: primary,
                  fontWeight: FontWeight.w800,
                ),
              ),
              Text(
                sublabel,
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: green.withValues(alpha: 0.95),
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({
    required this.onSurface,
    required this.primary,
    required this.secondary,
  });

  final Color onSurface;
  final Color primary;
  final Color secondary;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: primary.withValues(alpha: 0.12)),
      ),
      child: Column(
        children: [
          Icon(
            Icons.event_busy_outlined,
            size: 48,
            color: secondary.withValues(alpha: 0.9),
          ),
          const SizedBox(height: 12),
          Text(
            'No attendance yet',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: onSurface,
              fontWeight: FontWeight.w800,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 6),
          Text(
            'Completed session records will appear here.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: onSurface.withValues(alpha: 0.70),
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _AttendanceRecordCard extends StatelessWidget {
  const _AttendanceRecordCard({
    required this.record,
    required this.primary,
    required this.surface,
    required this.onSurface,
    required this.theme,
  });

  final AttendanceRecord record;
  final Color primary;
  final Color surface;
  final Color onSurface;
  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    final borderColor = primary.withValues(alpha: 0.16);
    const radius = 8.0;
    final secondary = AppColors.secondary;

    return Container(
      decoration: BoxDecoration(
        color: surface,
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: borderColor, width: 0.8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            height: 3,
            decoration: BoxDecoration(
              color: secondary.withValues(alpha: 0.9),
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(radius),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 10),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        record.courseCode,
                        style: theme.textTheme.labelLarge?.copyWith(
                          color: primary,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        record.courseName,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.titleSmall?.copyWith(
                          color: onSurface,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
                _StatusChip(
                  status: record.status,
                  primary: primary,
                  secondary: secondary,
                ),
              ],
            ),
          ),
          Container(height: 1, color: borderColor),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.calendar_today_outlined,
                      size: 16,
                      color: primary.withValues(alpha: 0.55),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        '${record.sessionDateLabel} · ${record.timeLabel}',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: onSurface.withValues(alpha: 0.88),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: secondary.withValues(alpha: 0.14),
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(
                      color: secondary.withValues(alpha: 0.40),
                      width: 0.7,
                    ),
                  ),
                  child: Text(
                    'Present ${record.presentCount} / ${record.totalCount} · ${record.percent}%',
                    style: theme.textTheme.labelMedium?.copyWith(
                      color: secondary,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({
    required this.status,
    required this.primary,
    required this.secondary,
  });

  final AttendanceStatus status;
  final Color primary;
  final Color secondary;

  @override
  Widget build(BuildContext context) {
    final (label, bg, fg) = switch (status) {
      AttendanceStatus.completed => (
        'Completed',
        secondary.withValues(alpha: 0.20),
        secondary,
      ),
      AttendanceStatus.draft => (
        'Draft',
        primary.withValues(alpha: 0.10),
        primary.withValues(alpha: 0.90),
      ),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(
          color: (status == AttendanceStatus.completed ? secondary : primary)
              .withValues(alpha: 0.35),
          width: 0.7,
        ),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
          color: fg,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}
