import 'package:flutter/material.dart';

class ClassesSectionHeader extends StatelessWidget {
  const ClassesSectionHeader({
    super.key,
    required this.count,
  });

  final int count;

  @override
  Widget build(BuildContext context) {
    final bg = Theme.of(context).primaryColor.withValues(alpha: 0.10);
    final fg = Theme.of(context).primaryColor;

    return Row(
      children: [
        Text(
          'Your Classes',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: fg,
                fontWeight: FontWeight.w800,
              ),
        ),
        const SizedBox(width: 10),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(999),
          ),
          child: Text(
            '$count',
            style: Theme.of(context).textTheme.labelLarge?.copyWith(
                  color: fg,
                  fontWeight: FontWeight.w800,
                ),
          ),
        ),
      ],
    );
  }
}

