import 'package:get/get.dart';
import 'package:mobile/modules/dashboard/dashboard_binding.dart';
import 'package:mobile/modules/home/home_binding.dart';
import 'package:mobile/modules/home/home_view.dart';
import 'package:mobile/modules/dashboard/views/dashboard_shell_view.dart';

class Routes {
  Routes._();

  static const home = '/';
  static const dashboard = '/dashboard';

  static final pages = <GetPage<dynamic>>[
    GetPage(
      name: home,
      page: () => const HomeView(),
      binding: HomeBinding(),
    ),
    GetPage(
      name: dashboard,
      page: () => const DashboardShellView(),
      binding: DashboardBinding(),
    ),
  ];
}

