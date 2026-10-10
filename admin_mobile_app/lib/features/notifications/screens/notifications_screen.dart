import 'package:flutter/material.dart';
class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        iconTheme: const IconThemeData(color: Color(0xFF0F172A)),
        title: Text(
          'الإشعارات',
          style: TextStyle(fontFamily: 'IBMPlexSansArabic', color: const Color(0xFF0F172A), fontWeight: FontWeight.w600),
        ),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.notifications_off_outlined, size: 64, color: Color(0xFFE2E8F0)),
            const SizedBox(height: 16),
            Text(
              'لا توجد إشعارات حالياً',
              style: TextStyle(fontFamily: 'IBMPlexSansArabic', color: const Color(0xFF64748B)),
            ),
          ],
        ),
      ),
    );
  }
}
