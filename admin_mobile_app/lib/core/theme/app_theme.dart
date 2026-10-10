import 'package:flutter/material.dart';
class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFF2563EB), // Tailwind Blue-600
        primary: const Color(0xFF2563EB),
        secondary: const Color(0xFFF1F5F9), // Tailwind Slate-100
        surface: const Color(0xFFFFFFFF), // White
        error: const Color(0xFFEF4444), // Tailwind Red-500
        outline: const Color(0xFFE2E8F0), // Tailwind Slate-200
      ),
      scaffoldBackgroundColor: const Color(0xFFFFFFFF),
      splashColor: Colors.transparent,
      highlightColor: Colors.transparent,
      // Web uses IBM Plex Sans Arabic
      fontFamily: 'IBMPlexSansArabic',
      textTheme: const TextTheme(
        titleLarge: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF171717)),
        titleMedium: TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF171717)),
        bodyLarge: TextStyle(color: Color(0xFF171717)),
        bodyMedium: TextStyle(color: Color(0xFF171717)),
      ),
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: <TargetPlatform, PageTransitionsBuilder>{
          TargetPlatform.android: CupertinoPageTransitionsBuilder(),
          TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
        },
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFFFFFFFF),
        foregroundColor: Color(0xFF171717),
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          color: Color(0xFF171717),
          fontSize: 20,
          fontWeight: FontWeight.bold,
          fontFamily: 'IBMPlexSansArabic',
        ),
        iconTheme: const IconThemeData(color: Color(0xFF171717)),
      ),
      cardTheme: CardTheme(
        color: const Color(0xFFFFFFFF),
        elevation: 0,
        shadowColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12), // 0.75rem
          side: const BorderSide(color: Color(0xFFE2E8F0), width: 1), // Flat border like web
        ),
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF2563EB),
          foregroundColor: Colors.white,
          elevation: 0, // Flat design
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12), // 0.75rem
          ),
          textStyle: TextStyle(fontFamily: 'IBMPlexSansArabic', fontWeight: FontWeight.bold, fontSize: 16),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFFFFFFFF),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF2563EB), width: 2),
        ),
        labelStyle: TextStyle(fontFamily: 'IBMPlexSansArabic', color: Colors.grey.shade600),
      ),
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: const Color(0xFF2563EB),
        foregroundColor: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: const Color(0xFFFFFFFF),
        indicatorColor: const Color(0xFFEFF6FF), // Tailwind Blue-50
        elevation: 0,
        labelTextStyle: WidgetStateProperty.all(
          TextStyle(fontFamily: 'IBMPlexSansArabic', fontSize: 12, fontWeight: FontWeight.w600),
        ),
      ),
    );
  }
}

