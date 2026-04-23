import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/modules/dashboard/controllers/dashboard_controller.dart';
import 'package:mobile/modules/dashboard/widgets/class_card.dart';
import 'package:mobile/modules/dashboard/widgets/classes_section_header.dart';
import 'package:mobile/modules/dashboard/widgets/date_header_card.dart';

class DashboardView extends GetView<DashboardController> {
  const DashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    final primary = Theme.of(context).primaryColor;
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Lecturer Dashboard',
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.w800),
        ),
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      backgroundColor: Colors.white,
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 10, 16, 24),
        children: [
          const Text(
            'Welcome back!',
            style: TextStyle(
              color: Colors.black54,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 14),
          const DateHeaderCard(
            title: 'Wednesday,\nApril 22',
            subtitle: '2026',
            trailingChipText: 'Today',
          ),
          const SizedBox(height: 22),
          Obx(() => ClassesSectionHeader(count: controller.sessions.length)),
          const SizedBox(height: 14),
          Obx(
            () => GridView.builder(
              physics: const NeverScrollableScrollPhysics(),
              shrinkWrap: true,
              itemCount: controller.sessions.length,
              itemBuilder: (context, i) {
                final session = controller.sessions[i];
                final tint = primary.withValues(alpha: 0.06);

                return ClassCard(session: session, tintColor: tint);
              },
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.98,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
