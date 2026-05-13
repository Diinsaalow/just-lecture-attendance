import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/values/app_colors.dart';
import 'package:mobile/modules/dashboard/controllers/dashboard_shell_controller.dart';
import 'package:mobile/modules/dashboard/views/absence_request_view.dart';
import 'package:mobile/modules/dashboard/views/attendance_history_view.dart';
import 'package:mobile/modules/dashboard/views/profile_view.dart';
import 'package:mobile/modules/sessions/views/today_sessions_view.dart';
import 'package:mobile/modules/home/home_view.dart';

class DashboardShellView extends GetView<DashboardShellController> {
  const DashboardShellView({super.key});

  @override
  Widget build(BuildContext context) {
    final tabs = <Widget>[
      const TodaySessionsView(),
      HomeView(),
      const AttendanceHistoryView(),
      const AbsenceRequestView(),
      const ProfileView(),
    ];

    return Scaffold(
      body: Obx(
        () => IndexedStack(index: controller.index.value, children: tabs),
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
      _NavItem(label: 'Today', icon: Icons.timer_outlined),
      _NavItem(label: 'Classes', icon: Icons.school_outlined),
      _NavItem(label: 'Attendance', icon: Icons.calendar_today_outlined),
      _NavItem(label: 'Absence', icon: Icons.assignment_late_outlined),
      _NavItem(label: 'Profile', icon: Icons.person_outline),
    ];

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
        border: Border(top: BorderSide(color: Colors.grey[200]!)),
      ),
      child: SafeArea(
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
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(30),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: EdgeInsets.symmetric(
          horizontal: selected ? 16 : 8,
          vertical: 10,
        ),
        decoration: BoxDecoration(
          color: selected ? AppColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(30),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: selected ? Colors.white : Colors.black54,
              size: 24,
            ),
            if (selected) ...[
              const SizedBox(width: 8),
              Text(
                label,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ],
          ],
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
