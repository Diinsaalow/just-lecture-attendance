import 'package:flutter/material.dart';
import 'package:mobile/modules/dashboard/models/class_session.dart';

class ClassCard extends StatelessWidget {
  const ClassCard({
    super.key,
    required this.session,
    required this.tintColor,
  });

  final ClassSession session;
  final Color tintColor;

  @override
  Widget build(BuildContext context) {
    final primary = Theme.of(context).primaryColor;
    final borderColor = primary.withValues(alpha: 0.16);
    final dividerColor = primary.withValues(alpha: 0.10);

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: borderColor, width: 0.8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.fromLTRB(14, 14, 14, 12),
            decoration: BoxDecoration(
              color: tintColor,
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(18),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      height: 36,
                      width: 36,
                      decoration: BoxDecoration(
                        color: primary.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        Icons.bookmark_outline,
                        color: primary,
                        size: 20,
                      ),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 6,
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
                        style: Theme.of(context).textTheme.labelMedium?.copyWith(
                              color: primary,
                              fontWeight: FontWeight.w700,
                            ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  session.courseName,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
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
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(
                  Icons.calendar_today_outlined,
                  size: 18,
                  color: Colors.black.withValues(alpha: 0.45),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    session.daysOfWeek,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.black.withValues(alpha: 0.8),
                          fontWeight: FontWeight.w600,
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

