import 'package:flutter/material.dart';
import 'package:mobile/core/values/app_colors.dart';

class ClassesSectionHeader extends StatelessWidget {
  const ClassesSectionHeader({super.key, required this.count});

  final int count;

  @override
  Widget build(BuildContext context) {
    final primary = Theme.of(context).primaryColor;
    final secondary = Theme.of(context).secondaryHeaderColor;
    final bg = secondary.withValues(alpha: 0.85);
    final fg = primary;

    return Row(
      children: [
        Text(
          'Your Classes',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            color: AppColors.darkBackground,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(width: 10),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: AppColors.secondary,
            borderRadius: BorderRadius.circular(999),
          ),
          child: Text(
            '$count',
            style: Theme.of(context).textTheme.labelLarge?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
      ],
    );
  }
}
