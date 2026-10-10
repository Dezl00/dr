import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:share_plus/share_plus.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart';

import '../../core/offline/hive_service.dart';
import '../../settings/screens/settings_screen.dart';
import '../../services/screens/services_screen.dart';
import '../../team/screens/team_screen.dart';
import '../../crm/screens/leads_screen.dart';
import '../../settings/screens/account_settings_screen.dart';
import '../../settings/screens/security_settings_screen.dart';
import '../../settings/screens/clinic_settings_screen.dart';
import '../../settings/screens/notifications_settings_screen.dart';
import '../../settings/screens/website_settings_screen.dart';
import '../../team/screens/doctors_screen.dart';
import '../../inventory/screens/inventory_screen.dart';
import '../../auth/providers/auth_provider.dart';

class MoreMenuScreen extends ConsumerWidget {
  const MoreMenuScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);
    final clinic = authState.clinic;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          children: [
            _buildClinicHeader(clinic),
            const SizedBox(height: 24),
            _buildWebsiteActions(context, clinic),
            const SizedBox(height: 32),
            const Text(
              'أقسام العيادة',
              style: TextStyle(
                fontFamily: 'IBMPlexSansArabic',
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 16),
            _buildMenuGrid(context),
            const SizedBox(height: 32),
            _buildSettingsList(context),
            const SizedBox(height: 32),
            _buildLogoutButton(context, ref),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildClinicHeader(Map<String, dynamic>? clinic) {
    final name = clinic?['name'] as String? ?? 'العيادة';
    final logoUrl = clinic?['logo'] as String?;

    return Row(
      children: [
        if (logoUrl != null && logoUrl.isNotEmpty)
          CircleAvatar(
            radius: 32,
            backgroundImage: NetworkImage(logoUrl),
            backgroundColor: const Color(0xFFEFF6FF),
          )
        else
          Container(
            width: 64,
            height: 64,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: Color(0xFFEFF6FF),
            ),
            child: const Icon(Icons.local_hospital, color: Color(0xFF2563EB), size: 32),
          ),
        const SizedBox(width: 16),
        Expanded(
          child: Text(
            name,
            style: const TextStyle(
              fontFamily: 'IBMPlexSansArabic',
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Color(0xFF0F172A),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildWebsiteActions(BuildContext context, Map<String, dynamic>? clinic) {
    String slug = '';
    
    try {
      final clinicDataStr = HiveService.getSettingsBox().get('clinic');
      if (clinicDataStr != null) {
        final Map<String, dynamic> clinicData = jsonDecode(clinicDataStr);
        slug = clinicData['slug'] as String? ?? '';
      } else {
        slug = clinic?['slug'] as String? ?? '';
      }
    } catch (e) {
      slug = clinic?['slug'] as String? ?? '';
    }

    if (slug.isEmpty) {
      return const SizedBox();
    }

    final url = 'https://$slug.beyoondgroup.com';

    return Row(
      children: [
        Expanded(
          child: ElevatedButton.icon(
            onPressed: () async {
              final uri = Uri.parse(url);
              try {
                await launchUrl(uri, mode: LaunchMode.externalApplication);
              } catch (e) {
                // Fallback
              }
            },
            icon: const Icon(Icons.open_in_new, size: 20),
            label: const Text('زيارة الموقع', style: TextStyle(fontFamily: 'IBMPlexSansArabic', fontWeight: FontWeight.w500)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2563EB),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(50)),
              elevation: 0,
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () {
              try {
                Share.share(url);
              } catch (e) {
                Clipboard.setData(ClipboardData(text: url));
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم نسخ الرابط!')));
              }
            },
            icon: const Icon(Icons.share_outlined, size: 20),
            label: const Text('مشاركة الموقع', style: TextStyle(fontFamily: 'IBMPlexSansArabic', fontWeight: FontWeight.w500)),
            style: OutlinedButton.styleFrom(
              foregroundColor: const Color(0xFF2563EB),
              side: const BorderSide(color: Color(0xFFE2E8F0)),
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(50)),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildMenuGrid(BuildContext context) {
    final items = [
      {'title': 'فريق العمل', 'icon': Icons.groups_outlined, 'screen': const TeamScreen()},
      {'title': 'الخدمات', 'icon': Icons.medical_services_outlined, 'screen': const ServicesScreen()},
      {'title': 'الأطباء', 'icon': Icons.medical_information_outlined, 'screen': const DoctorsScreen()},
      {'title': 'علاقات المرضى', 'icon': Icons.group_add_outlined, 'screen': const LeadsScreen()},
      {'title': 'المخازن', 'icon': Icons.inventory_2_outlined, 'screen': const InventoryScreen()},
      {'title': 'الموقع الإلكتروني', 'icon': Icons.language_outlined, 'screen': const WebsiteSettingsScreen()},
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        childAspectRatio: 1.0,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
      ),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        return InkWell(
          onTap: () {
            Navigator.push(context, MaterialPageRoute(builder: (_) => item['screen'] as Widget));
          },
          borderRadius: BorderRadius.circular(16),
          child: Container(
            decoration: BoxDecoration(
              color: const Color(0xFFEFF6FF), // Light blue background
              borderRadius: BorderRadius.circular(16),
              border: null, // No border
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(item['icon'] as IconData, color: const Color(0xFF2563EB), size: 28),
                const SizedBox(height: 8),
                Text(
                  item['title'] as String,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontFamily: 'IBMPlexSansArabic',
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF0F172A),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildSettingsList(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          'الإعدادات',
          style: TextStyle(
            fontFamily: 'IBMPlexSansArabic',
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Color(0xFF0F172A),
          ),
        ),
        const SizedBox(height: 16),
        _buildSettingsTile(context, 'إعدادات الحساب', Icons.person_outline, const AccountSettingsScreen()),
        const SizedBox(height: 12),
        _buildSettingsTile(context, 'الأمان والخصوصية', Icons.security_outlined, const SecuritySettingsScreen()),
        const SizedBox(height: 12),
        _buildSettingsTile(context, 'إعدادات العيادة', Icons.local_hospital_outlined, const ClinicSettingsScreen()),
        const SizedBox(height: 12),
        _buildSettingsTile(context, 'الإشعارات', Icons.notifications_outlined, const NotificationsSettingsScreen()),
      ],
    );
  }

  Widget _buildSettingsTile(BuildContext context, String title, IconData icon, Widget targetScreen) {
    return InkWell(
      onTap: () {
        Navigator.push(context, MaterialPageRoute(builder: (_) => targetScreen));
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE2E8F0), width: 1),
        ),
        child: Row(
          children: [
            Icon(icon, color: const Color(0xFF475569), size: 24),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(
                  fontFamily: 'IBMPlexSansArabic',
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFF0F172A),
                ),
              ),
            ),
            const Icon(Icons.arrow_back_ios_new, size: 16, color: Color(0xFF94A3B8)),
          ],
        ),
      ),
    );
  }

  Widget _buildLogoutButton(BuildContext context, WidgetRef ref) {
    return SizedBox(
      height: 48,
      child: TextButton(
        style: TextButton.styleFrom(
          backgroundColor: const Color(0xFFFEF2F2),
          foregroundColor: const Color(0xFFEF4444),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(50),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 20),
        ),
        onPressed: () {
          showDialog(
            context: context,
            builder: (BuildContext dialogContext) {
              return AlertDialog(
                backgroundColor: Colors.white,
                title: const Text(
                  'تسجيل الخروج',
                  style: TextStyle(
                    fontFamily: 'IBMPlexSansArabic',
                    color: Color(0xFF0F172A),
                    fontWeight: FontWeight.bold,
                  ),
                ),
                content: const Text(
                  'هل أنت متأكد من تسجيل الخروج؟',
                  style: TextStyle(
                    fontFamily: 'IBMPlexSansArabic',
                    color: Color(0xFF475569),
                  ),
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(dialogContext),
                    child: const Text(
                      'إلغاء',
                      style: TextStyle(
                        fontFamily: 'IBMPlexSansArabic',
                        color: Color(0xFF475569),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  TextButton(
                    onPressed: () async {
                      Navigator.pop(dialogContext);
                      await ref.read(authStateProvider.notifier).logout();
                      if (context.mounted) {
                        Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
                      }
                    },
                    child: const Text(
                      'تسجيل الخروج',
                      style: TextStyle(
                        fontFamily: 'IBMPlexSansArabic',
                        color: Color(0xFFEF4444),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              );
            },
          );
        },
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.logout_outlined, size: 20),
            SizedBox(width: 8),
            Text(
              'تسجيل الخروج',
              style: TextStyle(
                fontFamily: 'IBMPlexSansArabic',
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
