import 'package:flutter/material.dart';
class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF2563EB),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.monitor_heart_outlined, color: Colors.white, size: 80),
            const SizedBox(height: 16),
            Text(
              'بيوند - إدارة العيادات',
              style: TextStyle(fontFamily: 'IBMPlexSansArabic', color: Colors.white,
                fontSize: 28,
                fontWeight: FontWeight.bold,),
            ),
          ],
        ),
      ),
    );
  }
}
