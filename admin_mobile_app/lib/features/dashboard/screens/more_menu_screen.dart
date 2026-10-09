import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../settings/screens/settings_screen.dart';
import '../../services/screens/services_screen.dart';
import '../../team/screens/team_screen.dart';
import '../../crm/screens/leads_screen.dart';
import '../../inventory/screens/inventory_screen.dart';
import '../../auth/providers/auth_provider.dart';

class MoreMenuScreen extends ConsumerWidget {
  const MoreMenuScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          'أقسام العيادة',
          style: GoogleFonts.ibmPlexSansArabic(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: const Color(0xFF0F172A),
          ),
        ),
        const SizedBox(height: 16),
        _buildMenuGrid(context),
        const SizedBox(height: 32),

        _buildSettingsList(context),
        const SizedBox(height: 32),
        // Logout Button
        SizedBox(
          height: 48,
          child: TextButton(
            style: TextButton.styleFrom(
              backgroundColor: const Color(0xFFFEE2E2), // Light red background
              foregroundColor: const Color(0xFFEF4444), // Red text/icon
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: BorderSide.none,
              ),
            ),
            onPressed: () {
              ref.read(authStateProvider.notifier).logout();
            },
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.logout, size: 20),
                const SizedBox(width: 8),
                Text(
                  'تسجيل الخروج',
                  style: GoogleFonts.ibmPlexSansArabic(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildMenuGrid(BuildContext context) {
    final items = [
      {'title': 'المخازن', 'icon': Icons.inventory_2_outlined, 'screen': const InventoryScreen()},
      {'title': 'الخدمات', 'icon': Icons.medical_services_outlined, 'screen': const ServicesScreen()},
      {'title': 'الأطباء', 'icon': Icons.medical_information_outlined, 'screen': const Scaffold(body: Center(child: Text('الأطباء')))},
      {'title': 'فريق العمل', 'icon': Icons.groups_outlined, 'screen': const TeamScreen()},
      {'title': 'علاقات المرضى', 'icon': Icons.group_add_outlined, 'screen': const LeadsScreen()},
      {'title': 'الموقع الإلكتروني', 'icon': Icons.language_outlined, 'screen': const Scaffold(body: Center(child: Text('الموقع الإلكتروني')))},
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 1.5,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        return InkWell(
          onTap: () {
            Navigator.push(context, MaterialPageRoute(builder: (_) => item['screen'] as Widget));
          },
          borderRadius: BorderRadius.circular(12),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(item['icon'] as IconData, color: const Color(0xFF2563EB), size: 28),
                const SizedBox(height: 8),
                Text(
                  item['title'] as String,
                  style: GoogleFonts.ibmPlexSansArabic(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF334155),
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
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        children: [
          _buildSettingsTile(context, 'جميع الإعدادات', Icons.settings),
        ],
      ),
    );
  }

  Widget _buildSettingsTile(BuildContext context, String title, IconData icon) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, color: const Color(0xFF475569), size: 20),
      ),
      title: Text(
        title,
        style: GoogleFonts.ibmPlexSansArabic(
          fontSize: 15,
          fontWeight: FontWeight.w500,
          color: const Color(0xFF0F172A),
        ),
      ),
      trailing: const Icon(Icons.arrow_forward_ios, size: 16, color: Color(0xFF94A3B8)),
      onTap: () {
        Navigator.push(context, MaterialPageRoute(builder: (_) => const SettingsScreen()));
      },
    );
  }
}



