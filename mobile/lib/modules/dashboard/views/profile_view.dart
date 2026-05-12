import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/values/app_colors.dart';
import 'package:mobile/modules/dashboard/controllers/profile_controller.dart';
import 'package:mobile/core/auth/auth_controller.dart';
import 'package:mobile/modules/dashboard/models/lecturer_profile.dart';

class ProfileView extends GetView<ProfileController> {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    final primary = AppColors.primary;
    final surface = Theme.of(context).colorScheme.surface;
    final onSurface = Theme.of(context).colorScheme.onSurface;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: primary,
        elevation: 0,
        title: const Text(
          'Profile',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 14, 16, 28),
        children: [
          _ProfileHeader(
            primary: primary,
            surface: surface,
            onSurface: onSurface,
            profile: controller.profile,
          ),
          const SizedBox(height: 20),
          _SectionTitle(text: 'Account', primary: primary),
          const SizedBox(height: 8),
          _BorderedGroup(
            primary: primary,
            surface: surface,
            children: [
              ListTile(
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 2,
                ),
                leading: Icon(
                  Icons.email_outlined,
                  color: primary.withValues(alpha: 0.80),
                ),
                title: Text(
                  'Email',
                  style: TextStyle(
                    color: onSurface.withValues(alpha: 0.60),
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                subtitle: Text(
                  controller.profile.email,
                  style: TextStyle(
                    color: onSurface,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              Divider(height: 1, color: primary.withValues(alpha: 0.10)),
              ListTile(
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 2,
                ),
                leading: Icon(
                  Icons.phone_outlined,
                  color: primary.withValues(alpha: 0.80),
                ),
                title: Text(
                  'Phone',
                  style: TextStyle(
                    color: onSurface.withValues(alpha: 0.60),
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                subtitle: Text(
                  controller.profile.phone,
                  style: TextStyle(
                    color: onSurface,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          _SectionTitle(text: 'Location', primary: primary),
          const SizedBox(height: 8),
          _BorderedGroup(
            primary: primary,
            surface: surface,
            children: [
              ListTile(
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 4,
                ),
                leading: Icon(
                  Icons.location_on_outlined,
                  color: primary.withValues(alpha: 0.80),
                ),
                title: Text(
                  'City',
                  style: TextStyle(
                    color: onSurface.withValues(alpha: 0.60),
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                subtitle: Text(
                  controller.profile.city,
                  style: TextStyle(
                    color: onSurface,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          _SectionTitle(text: 'About', primary: primary),
          const SizedBox(height: 8),
          _BorderedGroup(
            primary: primary,
            surface: surface,
            children: [
              ListTile(
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 4,
                ),
                leading: Icon(
                  Icons.info_outline,
                  color: primary.withValues(alpha: 0.80),
                ),
                title: const Text('App version'),
                subtitle: Text(
                  'JUST Lecturer Attendance 1.0.0',
                  style: TextStyle(
                    color: onSurface.withValues(alpha: 0.80),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Material(
            color: surface,
            borderRadius: BorderRadius.circular(8),
            child: InkWell(
              borderRadius: BorderRadius.circular(8),
              onTap: () => _showLogoutDialog(context),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                  vertical: 14,
                  horizontal: 14,
                ),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: const Color(0xFFC24B4B).withValues(alpha: 0.45),
                    width: 0.8,
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.logout,
                      size: 20,
                      color: const Color(0xFFC24B4B).withValues(alpha: 0.95),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Log out',
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        color: const Color(0xFFC24B4B),
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog<void>(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          title: const Text('Log out?'),
          content: const Text(
            'Are you sure you want to log out of your account?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: Text(
                'Cancel',
                style: TextStyle(
                  color: AppColors.primary.withValues(alpha: 0.9),
                ),
              ),
            ),
            FilledButton(
              style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFFC24B4B),
                foregroundColor: Colors.white,
              ),
              onPressed: () {
                Navigator.of(ctx).pop();
                Get.find<AuthController>().logout();
              },
              child: const Text('Log out'),
            ),
          ],
        );
      },
    );
  }
}

class _ProfileHeader extends StatelessWidget {
  const _ProfileHeader({
    required this.primary,
    required this.surface,
    required this.onSurface,
    required this.profile,
  });

  final Color primary;
  final Color surface;
  final Color onSurface;
  final LecturerProfile profile;

  @override
  Widget build(BuildContext context) {
    const secondary = AppColors.secondary;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: primary.withValues(alpha: 0.16), width: 0.8),
      ),
      child: Row(
        children: [
          Container(
            height: 64,
            width: 64,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: primary.withValues(alpha: 0.20),
                width: 1.2,
              ),
              color: primary.withValues(alpha: 0.10),
            ),
            alignment: Alignment.center,
            child: Text(
              profile.initials,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                color: primary,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  profile.fullName,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: onSurface,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 2),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 3,
                  ),
                  decoration: BoxDecoration(
                    color: secondary.withValues(alpha: 0.16),
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(
                      color: secondary.withValues(alpha: 0.40),
                      width: 0.7,
                    ),
                  ),
                  child: Text(
                    profile.role,
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      color: secondary,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  profile.department,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: onSurface.withValues(alpha: 0.70),
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
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.text, required this.primary});

  final String text;
  final Color primary;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: Theme.of(context).textTheme.labelLarge?.copyWith(
        color: primary,
        fontWeight: FontWeight.w800,
        letterSpacing: 0.2,
      ),
    );
  }
}

class _BorderedGroup extends StatelessWidget {
  const _BorderedGroup({
    required this.primary,
    required this.surface,
    required this.children,
  });

  final Color primary;
  final Color surface;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: primary.withValues(alpha: 0.14), width: 0.8),
      ),
      child: Column(children: children),
    );
  }
}
