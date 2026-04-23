import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/values/app_colors.dart';
import 'package:mobile/modules/dashboard/controllers/dashboard_controller.dart';
import 'package:mobile/modules/home/home_view.dart';

class DashboardView extends GetView<DashboardController> {
  const DashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    final tabs = <Widget>[
      const HomeView(),
      const _AttendanceHistoryTab(),
      const _AbsenceRequestTab(),
      const _ProfileTab(),
    ];

    return Scaffold(
      body: Obx(
        () => IndexedStack(
          index: controller.index.value,
          children: tabs,
        ),
      ),
      bottomNavigationBar: Obx(
        () => _BottomPillNavBar(
          currentIndex: controller.index.value,
          onChanged: controller.changeIndex,
        ),
      ),
    );
  }
}

class _BottomPillNavBar extends StatelessWidget {
  const _BottomPillNavBar({
    required this.currentIndex,
    required this.onChanged,
  });

  final int currentIndex;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    final items = const <_NavItem>[
      _NavItem(label: 'Home', icon: Icons.home_outlined),
      _NavItem(label: 'Attendance', icon: Icons.calendar_today_outlined),
      _NavItem(label: 'Absence', icon: Icons.assignment_late_outlined),
      _NavItem(label: 'Profile', icon: Icons.person_outline),
    ];

    return SafeArea(
      top: false,
      child: Container(
        padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(
            top: BorderSide(color: Colors.black.withValues(alpha: 0.06)),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: List.generate(items.length, (i) {
            final selected = i == currentIndex;
            final item = items[i];
            return _BottomPillNavItem(
              selected: selected,
              icon: item.icon,
              label: item.label,
              onTap: () => onChanged(i),
            );
          }),
        ),
      ),
    );
  }
}

class _BottomPillNavItem extends StatelessWidget {
  const _BottomPillNavItem({
    required this.selected,
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final bool selected;
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final pillColor = AppColors.secondary;
    final inactiveColor = Colors.black.withValues(alpha: 0.55);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(999),
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          curve: Curves.easeOut,
          padding: EdgeInsets.symmetric(
            horizontal: selected ? 14 : 10,
            vertical: 10,
          ),
          decoration: BoxDecoration(
            color: selected ? pillColor : Colors.transparent,
            borderRadius: BorderRadius.circular(999),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: 24,
                color: selected ? Colors.white : inactiveColor,
              ),
              if (selected) ...[
                const SizedBox(width: 8),
                Text(
                  label,
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  const _NavItem({required this.label, required this.icon});

  final String label;
  final IconData icon;
}

class _AttendanceHistoryTab extends StatelessWidget {
  const _AttendanceHistoryTab();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Attendance History')),
    );
  }
}

class _AbsenceRequestTab extends StatelessWidget {
  const _AbsenceRequestTab();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Absence Request')),
    );
  }
}

class _ProfileTab extends StatelessWidget {
  const _ProfileTab();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Profile')),
    );
  }
}

