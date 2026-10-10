import 'package:flutter/material.dart';
import 'account_settings_screen.dart';
import 'security_settings_screen.dart';
import 'clinic_settings_screen.dart';
import 'notifications_settings_screen.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Padding(
                padding: EdgeInsets.all(20.0),
                child: Text(
                  'الإعدادات',
                  style: TextStyle(
                    fontFamily: 'IBMPlexSansArabic',
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF0F172A),
                  ),
                ),
              ),
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 20.0),
                  children: [
                    _buildSettingsTile(
                      context: context,
                      title: 'إعدادات الحساب',
                      icon: Icons.person_outline,
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AccountSettingsScreen())),
                    ),
                    const SizedBox(height: 16),
                    _buildSettingsTile(
                      context: context,
                      title: 'إعدادات العيادة',
                      icon: Icons.local_hospital_outlined,
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ClinicSettingsScreen())),
                    ),
                    const SizedBox(height: 16),
                    _buildSettingsTile(
                      context: context,
                      title: 'الأمان والخصوصية',
                      icon: Icons.security_outlined,
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SecuritySettingsScreen())),
                    ),
                    const SizedBox(height: 16),
                    _buildSettingsTile(
                      context: context,
                      title: 'الإشعارات',
                      icon: Icons.notifications_none_outlined,
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsSettingsScreen())),
                    ),
                    const SizedBox(height: 16),
                    _buildSettingsTile(
                      context: context,
                      title: 'تسجيل الخروج',
                      icon: Icons.logout_outlined,
                      isDestructive: true,
                      onTap: () {
                        // Logout logic
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSettingsTile({
    required BuildContext context,
    required String title,
    required IconData icon,
    required VoidCallback onTap,
    bool isDestructive = false,
  }) {
    final color = isDestructive ? Colors.red : const Color(0xFF0F172A);
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontFamily: 'IBMPlexSansArabic',
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: color,
                ),
              ),
            ),
            Icon(
              Icons.arrow_forward_ios,
              color: isDestructive ? Colors.red.withOpacity(0.5) : const Color(0xFF94A3B8),
              size: 16,
            ),
          ],
        ),
      ),
    );
  }
}
