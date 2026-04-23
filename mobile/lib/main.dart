import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/bindings/initial_binding.dart';
import 'package:mobile/routes/routes.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'Lecture Attendance',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
      ),
      initialBinding: InitialBinding(),
      initialRoute: Routes.home,
      getPages: Routes.pages,
    );
  }
}
