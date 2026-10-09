import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('إعدادات العيادة')),
      body: ListView(
        children: [
          const ListTile(
            title: Text('إعدادات العيادة الأساسية', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.teal)),
          ),
          ListTile(
            leading: const Icon(Icons.local_hospital),
            title: const Text('معلومات العيادة'),
            subtitle: const Text('الاسم، الشعار، العنوان'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.access_time),
            title: const Text('أوقات العمل'),
            subtitle: const Text('أيام العمل وساعات الحجز'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {},
          ),
          const Divider(),
          const ListTile(
            title: Text('النظام والتنبيهات', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.teal)),
          ),
          SwitchListTile(
            secondary: const Icon(Icons.notifications_active),
            title: const Text('إشعارات الواتس آب للمرضى'),
            value: true,
            onChanged: (val) {},
          ),
          SwitchListTile(
            secondary: const Icon(Icons.dark_mode),
            title: const Text('الوضع الليلي'),
            value: false,
            onChanged: (val) {},
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text('تسجيل الخروج', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
            onTap: () {
              ref.read(authStateProvider.notifier).logout();
            },
          ),
        ],
      ),
    );
  }
}
