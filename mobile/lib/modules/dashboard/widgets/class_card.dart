import 'package:flutter/material.dart';
import 'package:mobile/core/values/app_colors.dart';
import 'package:mobile/modules/dashboard/models/class_session.dart';

class ClassCard extends StatelessWidget {
  const ClassCard({super.key, required this.session, required this.tintColor});

  final ClassSession session;
  final Color tintColor;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final primary = theme.primaryColor;
    final secondary = theme.secondaryHeaderColor;
    final borderColor = primary.withValues(alpha: 0.16);
    final dividerColor = primary.withValues(alpha: 0.10);
    const radius = 8.0;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
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
          Container(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 10),
            decoration: BoxDecoration(color: tintColor),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      height: 32,
                      width: 32,
                      decoration: BoxDecoration(
                        color: primary.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        Icons.bookmark_outline,
                        color: primary,
                        size: 18,
                      ),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 9,
                        vertical: 5,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(
                          color: primary.withValues(alpha: 0.14),
                          width: 0.7,
                        ),
                      ),
                      child: Text(
                        session.courseCode,
                        style: theme.textTheme.labelMedium?.copyWith(
                          color: primary,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  session.courseName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: Colors.black,
                    fontWeight: FontWeight.w700,
                    height: 1.15,
                  ),
                ),
              ],
            ),
          ),
          Container(height: 1, color: dividerColor),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(
                  Icons.calendar_today_outlined,
                  size: 16,
                  color: primary.withValues(alpha: 0.55),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        session.daysOfWeek,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: AppColors.darkBackground.withValues(
                            alpha: 0.82,
                          ),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 5,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.secondary.withValues(alpha: 0.18),
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(
                            color: AppColors.secondary.withValues(alpha: 0.40),
                            width: 0.7,
                          ),
                        ),
                        child: FittedBox(
                          fit: BoxFit.scaleDown,
                          // alignment: Alignment.centerLeft,
                          child: Text(
                            '${session.hours} hour${session.hours == 1 ? '' : 's'}',
                            style:
                                (theme.textTheme.labelMedium ??
                                        const TextStyle(fontSize: 12))
                                    .copyWith(
                                      fontSize: 12,
                                      color: AppColors.secondary,
                                      fontWeight: FontWeight.w800,
                                    ),
                          ),
                        ),
                      ),
                    ],
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
