import 'package:flutter/material.dart';

class AppColors {
  static const Color navy = Color(0xFF0A1628);
  static const Color navyMid = Color(0xFF112240);
  static const Color teal = Color(0xFF00C9A7);
  static const Color tealLight = Color(0xFFE0FDF6);
  static const Color white = Color(0xFFFFFFFF);
  static const Color offWhite = Color(0xFFF8FAFC);
  static const Color muted = Color(0xFF64748B);
  static const Color border = Color(0xFFE2E8F0);
  static const Color error = Color(0xFFEF4444);
}

class AppTheme {
  static ThemeData get light => ThemeData(
    primaryColor: AppColors.teal,
    scaffoldBackgroundColor: AppColors.offWhite,
    fontFamily: 'Plus Jakarta Sans',
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.white,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(
        color: AppColors.navy, 
        fontSize: 20, 
        fontWeight: FontWeight.w700
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.teal,
        foregroundColor: AppColors.navy,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        textStyle: const TextStyle(fontWeight: FontWeight.w700),
      ),
    ),
  );
}