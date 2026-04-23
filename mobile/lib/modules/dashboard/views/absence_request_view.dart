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
    final primary = AppColors.primary;
    final surface = Theme.of(context).colorScheme.surface;
    final onSurface = Theme.of(context).colorScheme.onSurface;
    const secondary = AppColors.secondary;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: primary,
        elevation: 0,
        title: const Text(
          'Absence Requests',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('New request'),
        onPressed: () {
          controller.resetForm();
          _NewRequestSheet.show(context, controller);
        },
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
            child: Obx(
              () => SegmentedButton<int>(
                segments: const [
                  ButtonSegment(
                    value: 0,
                    label: Text('Pending'),
                    icon: Icon(Icons.hourglass_top_outlined, size: 16),
                  ),
                  ButtonSegment(
                    value: 1,
                    label: Text('Approved'),
                    icon: Icon(Icons.check_circle_outline, size: 16),
                  ),
                  ButtonSegment(
                    value: 2,
                    label: Text('Rejected'),
                    icon: Icon(Icons.cancel_outlined, size: 16),
                  ),
                ],
                selected: {controller.segmentIndex.value},
                onSelectionChanged: (s) {
                  if (s.isNotEmpty) controller.segmentIndex.value = s.first;
                },
                style: ButtonStyle(
                  visualDensity: VisualDensity.compact,
                  side: WidgetStateProperty.all(
                    BorderSide(color: primary.withValues(alpha: 0.25)),
                  ),
                ),
              ),
            ),
          ),
          Expanded(
            child: Obx(() {
              final list = controller.filteredRequests;
              if (list.isEmpty) {
                return _EmptyList(
                  secondary: secondary,
                  onSurface: onSurface,
                );
              }
              return ListView.separated(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 100),
                itemCount: list.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (context, i) {
                  return _RequestCard(
                    request: list[i],
                    primary: primary,
                    surface: surface,
                    onSurface: onSurface,
                  );
                },
              );
            }),
          ),
        ],
      ),
    );
  }
}

class _EmptyList extends StatelessWidget {
  const _EmptyList({
    required this.secondary,
    required this.onSurface,
  });

  final Color secondary;
  final Color onSurface;

  @override
  Widget build(BuildContext context) {
    return ListView(
      children: [
        const SizedBox(height: 32),
        Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              children: [
                Icon(
                  Icons.assignment_late_outlined,
                  size: 44,
                  color: secondary.withValues(alpha: 0.85),
                ),
                const SizedBox(height: 12),
                Text(
                  'Nothing in this tab',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: onSurface,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Create a new request with the button below.',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: onSurface.withValues(alpha: 0.70),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _RequestCard extends StatelessWidget {
  const _RequestCard({
    required this.request,
    required this.primary,
    required this.surface,
    required this.onSurface,
  });

  final AbsenceRequest request;
  final Color primary;
  final Color surface;
  final Color onSurface;

  @override
  Widget build(BuildContext context) {
    final border = primary.withValues(alpha: 0.16);
    const r = 8.0;
    const secondary = AppColors.secondary;

    return Container(
      decoration: BoxDecoration(
        color: surface,
        borderRadius: BorderRadius.circular(r),
        border: Border.all(color: border, width: 0.8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            height: 3,
            decoration: BoxDecoration(
              color: _accentForStatus(request.status).withValues(alpha: 0.85),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(r)),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 10, 12, 8),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        request.courseCode,
                        style: Theme.of(context).textTheme.labelLarge?.copyWith(
                          color: primary,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        request.courseName,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          color: onSurface,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
                _StatusPill(
                  status: request.status,
                  primary: primary,
                  secondary: secondary,
                ),
              ],
            ),
          ),
          Container(height: 1, color: border),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.date_range_outlined,
                      size: 16,
                      color: primary.withValues(alpha: 0.55),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        '${request.startDateLabel} – ${request.endDateLabel}',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: onSurface.withValues(alpha: 0.90),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  request.reasonSnippet,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: onSurface.withValues(alpha: 0.68),
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  static Color _accentForStatus(AbsenceRequestStatus s) {
    return switch (s) {
      AbsenceRequestStatus.pending => AppColors.primary,
      AbsenceRequestStatus.approved => AppColors.secondary,
      AbsenceRequestStatus.rejected => const Color(0xFFC24B4B),
    };
  }
}

class _StatusPill extends StatelessWidget {
  const _StatusPill({
    required this.status,
    required this.primary,
    required this.secondary,
  });

  final AbsenceRequestStatus status;
  final Color primary;
  final Color secondary;

  @override
  Widget build(BuildContext context) {
    final (text, border, textColor, bg) = switch (status) {
      AbsenceRequestStatus.pending => (
        'Pending',
        primary.withValues(alpha: 0.30),
        primary,
        primary.withValues(alpha: 0.10),
      ),
      AbsenceRequestStatus.approved => (
        'Approved',
        secondary.withValues(alpha: 0.45),
        secondary,
        secondary.withValues(alpha: 0.16),
      ),
      AbsenceRequestStatus.rejected => (
        'Rejected',
        const Color(0xFFC24B4B).withValues(alpha: 0.50),
        const Color(0xFFC24B4B),
        const Color(0xFFC24B4B).withValues(alpha: 0.10),
      ),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: border, width: 0.7),
      ),
      child: Text(
        text,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
          color: textColor,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}

class _NewRequestSheet {
  static Future<void> show(
    BuildContext context,
    AbsenceRequestController c,
  ) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      showDragHandle: true,
      backgroundColor: Theme.of(context).colorScheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
      ),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            left: 16,
            right: 16,
            top: 8,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 16,
          ),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'New absence request',
                  style: Theme.of(ctx).textTheme.titleLarge?.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Dummy form — no network. Fields map cleanly to a future API.',
                  style: Theme.of(ctx).textTheme.bodySmall?.copyWith(
                    color: Theme.of(ctx).colorScheme.onSurface.withValues(
                      alpha: 0.65,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Obx(
                  () => InputDecorator(
                    decoration: _fieldDecoration('Course', AppColors.primary),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<CourseOption>(
                        isExpanded: true,
                        isDense: true,
                        value: c.selectedCourse.value,
                        items: c.courseOptions
                            .map(
                              (e) => DropdownMenuItem(
                                value: e,
                                child: Text(
                                  e.label,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            )
                            .toList(),
                        onChanged: (v) => c.selectedCourse.value = v,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Obx(
                  () => Row(
                    children: [
                      Expanded(
                        child: _DateTile(
                          label: 'Start date',
                          value: c.formatDate(c.startDate.value),
                          onTap: () async {
                            final now = DateTime.now();
                            final d = await showDatePicker(
                              context: ctx,
                              initialDate: c.startDate.value ?? now,
                              firstDate: DateTime(now.year - 1),
                              lastDate: DateTime(now.year + 2),
                            );
                            if (d != null) c.startDate.value = d;
                          },
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _DateTile(
                          label: 'End date',
                          value: c.formatDate(c.endDate.value),
                          onTap: () async {
                            final now = DateTime.now();
                            final d = await showDatePicker(
                              context: ctx,
                              initialDate: c.endDate.value ?? c.startDate.value ?? now,
                              firstDate: DateTime(now.year - 1),
                              lastDate: DateTime(now.year + 2),
                            );
                            if (d != null) c.endDate.value = d;
                          },
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: c.reasonController,
                  minLines: 2,
                  maxLines: 4,
                  textInputAction: TextInputAction.done,
                  decoration: _fieldDecoration('Reason', AppColors.primary).copyWith(
                    alignLabelWithHint: true,
                    hintText: 'Explain your absence (short summary)',
                  ),
                ),
                const SizedBox(height: 8),
                InputDecorator(
                  decoration: _fieldDecoration('Attachment (optional)', AppColors.primary)
                      .copyWith(
                    enabled: false,
                    fillColor: Theme.of(ctx).colorScheme.surfaceContainerHighest
                        .withValues(alpha: 0.35),
                    filled: true,
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.attach_file,
                        size: 20,
                        color: AppColors.primary.withValues(alpha: 0.40),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Upload disabled in demo',
                        style: Theme.of(ctx).textTheme.bodySmall?.copyWith(
                          color: Theme.of(ctx)
                              .colorScheme
                              .onSurface
                              .withValues(alpha: 0.5),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 18),
                FilledButton(
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  onPressed: c.submitNewRequest,
                  child: const Text('Submit request'),
                ),
                const SizedBox(height: 8),
              ],
            ),
          ),
        );
      },
    );
  }

  static InputDecoration _fieldDecoration(String label, Color primary) {
    return InputDecoration(
      labelText: label,
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: primary.withValues(alpha: 0.30)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: primary.withValues(alpha: 0.25)),
      ),
    );
  }
}

class _DateTile extends StatelessWidget {
  const _DateTile({
    required this.label,
    required this.value,
    required this.onTap,
  });

  final String label;
  final String value;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final primary = AppColors.primary;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: primary.withValues(alpha: 0.25)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: primary.withValues(alpha: 0.75),
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: Theme.of(context).colorScheme.onSurface,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
