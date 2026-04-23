import 'package:get/get.dart';
import 'package:mobile/modules/home/home_binding.dart';
import 'package:mobile/modules/home/home_view.dart';

class Routes {
  Routes._();

  static const home = '/';

  static final pages = <GetPage<dynamic>>[
    GetPage(
      name: home,
      page: () => const HomeView(),
      binding: HomeBinding(),
    ),
  ];
}

