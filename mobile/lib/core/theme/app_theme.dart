import 'package:flutter/material.dart';
import 'package:mobile/core/values/app_colors.dart';

class AppTheme {
  AppTheme._();

  static ThemeData get lightTheme {
    final colorScheme = const ColorScheme.light(
      primary: AppColors.primary,
      secondary: AppColors.secondary,
      surface: Colors.white,
    );

    return _buildTheme(colorScheme, Colors.black);
  }

  static ThemeData get darkTheme {
    final colorScheme = const ColorScheme.dark(
      primary: AppColors.primary,
      secondary: AppColors.secondary,
      surface: AppColors.darkBackground,
    );

    return _buildTheme(colorScheme, Colors.white);
  }

  static ThemeData _buildTheme(ColorScheme colorScheme, Color textColor) {
    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      primaryColor: colorScheme.primary,
      scaffoldBackgroundColor: colorScheme.surface,
      appBarTheme: AppBarTheme(
        backgroundColor: colorScheme.surface,
        elevation: 0,
        foregroundColor: textColor,
        surfaceTintColor: Colors.transparent,
      ),
      textTheme: TextTheme(
        bodyLarge: TextStyle(color: textColor),
        bodyMedium: TextStyle(color: textColor),
        titleLarge: TextStyle(color: textColor),
      ),
    );
  }
}

