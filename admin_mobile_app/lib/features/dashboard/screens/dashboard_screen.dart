import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';
import '../../patients/screens/patients_screen.dart';
import '../../appointments/screens/calendar_screen.dart';
import 'home_overview_screen.dart';
import 'more_menu_screen.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../../core/services/notification_service.dart';

import '../providers/dashboard_provider.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  final List<Widget> _screens = [
    const HomeOverviewScreen(), // 0: الرئيسية
    const PatientsScreen(),     // 1: المرضى
    const CalendarScreen(),     // 2: المواعيد
    const MoreMenuScreen(),     // 3: المزيد
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkNotificationPermission();
    });
  }

  Future<void> _checkNotificationPermission() async {
    final notificationService = NotificationService();
    bool isGranted = await notificationService.checkPermission();
    if (!isGranted && mounted) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          backgroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: Color(0xFFE2E8F0)),
          ),
          title: Row(
            children: [
              const Icon(Icons.notifications_active, color: Color(0xFF2563EB)),
              const SizedBox(width: 8),
              Text('تفعيل الإشعارات', style: TextStyle(fontFamily: 'IBMPlexSansArabic', fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
            ],
          ),
          content: Text(
            'يرجى تفعيل الإشعارات من إعدادات الهاتف حتى يصلك تنبيه فوري عند قيام أي مريض بحجز موعد جديد.',
            style: TextStyle(fontFamily: 'IBMPlexSansArabic', fontSize: 14, color: Color(0xFF475569)),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(ctx);
              },
              child: Text('ذكرني لاحقاً', style: TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF94A3B8))),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.pop(ctx);
                await openAppSettings();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2563EB),
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(50)),
              ),
              child: Text('الذهاب للإعدادات', style: TextStyle(fontFamily: 'IBMPlexSansArabic')),
            ),
          ],
        ),
      );
    }
  }

  void _selectTab(int index) {
    ref.read(dashboardIndexProvider.notifier).state = index;
  }

  @override
  Widget build(BuildContext context) {
    final userState = ref.watch(authStateProvider);
    final currentIndex = ref.watch(dashboardIndexProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      extendBody: true,
      body: IndexedStack(
        index: currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: SafeArea(
        child: Container(
          margin: const EdgeInsets.only(left: 20, right: 20, bottom: 20),
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(100),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(0, Icons.home_outlined, Icons.home, currentIndex),
              _buildNavItem(1, Icons.people_outline, Icons.people, currentIndex),
              _buildNavItem(2, Icons.calendar_month_outlined, Icons.calendar_month, currentIndex),
              _buildNavItem(3, Icons.grid_view, Icons.grid_view, currentIndex),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData outlineIcon, IconData solidIcon, int currentIndex) {
    final isSelected = currentIndex == index;
    return GestureDetector(
      onTap: () => _selectTab(index),
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF2563EB) : Colors.transparent,
          shape: BoxShape.circle,
        ),
        child: Icon(
          isSelected ? solidIcon : outlineIcon,
          color: isSelected ? Colors.white : const Color(0xFF94A3B8),
          size: 24,
        ),
      ),
    );
  }
}
