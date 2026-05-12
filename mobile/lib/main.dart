import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/bindings/initial_binding.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/core/auth/auth_storage.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  final bool hasToken = await AuthStorage.hasToken();
  final String initialRoute = hasToken ? Routes.dashboard : Routes.login;

  runApp(MyApp(initialRoute: initialRoute));
}

class MyApp extends StatelessWidget {
  final String initialRoute;
  const MyApp({super.key, required this.initialRoute});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Lecture Attendance',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      initialBinding: InitialBinding(),
      initialRoute: initialRoute,
      getPages: Routes.pages,
    );
  }
}
