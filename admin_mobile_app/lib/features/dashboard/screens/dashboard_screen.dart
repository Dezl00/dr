import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../auth/providers/auth_provider.dart';
import '../../patients/screens/patients_screen.dart';
import '../../appointments/screens/calendar_screen.dart';
import '../../financials/screens/invoices_screen.dart';
import 'home_overview_screen.dart';
import 'more_menu_screen.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../../core/services/notification_service.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const HomeOverviewScreen(), // 0: الرئيسية
    const PatientsScreen(),     // 1: المرضى
    const CalendarScreen(),     // 2: المواعيد (المنتصف)
    const InvoicesScreen(),     // 3: المالية
    const MoreMenuScreen(),     // 4: المزيد
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
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: [
              const Icon(Icons.notifications_active, color: Color(0xFF2563EB)),
              const SizedBox(width: 8),
              Text('تفعيل الإشعارات', style: GoogleFonts.ibmPlexSansArabic(fontSize: 18, fontWeight: FontWeight.bold)),
            ],
          ),
          content: Text(
            'يرجى تفعيل الإشعارات من إعدادات الهاتف حتى يصلك تنبيه فوري عند قيام أي مريض بحجز موعد جديد.',
            style: GoogleFonts.ibmPlexSansArabic(fontSize: 14),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(ctx);
              },
              child: Text('ذكرني لاحقاً', style: GoogleFonts.ibmPlexSansArabic(color: Colors.grey)),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.pop(ctx);
                await openAppSettings();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2563EB),
                foregroundColor: Colors.white,
              ),
              child: Text('الذهاب للإعدادات', style: GoogleFonts.ibmPlexSansArabic()),
            ),
          ],
        ),
      );
    }
  }

  void _selectTab(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final userState = ref.watch(authStateProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(color: const Color(0xFFE2E8F0), height: 1.0),
        ),
        title: Container(
          height: 36,
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Row(
            children: [
              const Icon(Icons.search, size: 18, color: Color(0xFF94A3B8)),
              const SizedBox(width: 8),
              Text('بحث...', style: GoogleFonts.ibmPlexSansArabic(fontSize: 14, color: const Color(0xFF94A3B8))),
            ],
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none, color: Color(0xFF64748B)),
            onPressed: () {},
          ),
          Container(
            margin: const EdgeInsets.only(left: 12, right: 8),
            decoration: const BoxDecoration(
              border: Border(right: BorderSide(color: Color(0xFFE2E8F0))),
            ),
            padding: const EdgeInsets.only(right: 8),
            child: Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: const BoxDecoration(
                    color: Color(0xFFDBEAFE),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      'M',
                      style: GoogleFonts.ibmPlexSansArabic(
                        color: const Color(0xFF1D4ED8),
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 4),
                const Icon(Icons.keyboard_arrow_down, size: 16, color: Color(0xFF94A3B8)),
              ],
            ),
          )
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: _selectTab,
        backgroundColor: Colors.white,
        elevation: 8,
        indicatorColor: const Color(0xFFDBEAFE),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home, color: Color(0xFF1D4ED8)), label: 'الرئيسية'),
          NavigationDestination(icon: Icon(Icons.people_outline), selectedIcon: Icon(Icons.people, color: Color(0xFF1D4ED8)), label: 'المرضى'),
          NavigationDestination(icon: Icon(Icons.calendar_month_outlined), selectedIcon: Icon(Icons.calendar_month, color: Color(0xFF1D4ED8)), label: 'المواعيد'),
          NavigationDestination(icon: Icon(Icons.receipt_long_outlined), selectedIcon: Icon(Icons.receipt_long, color: Color(0xFF1D4ED8)), label: 'المالية'),
          NavigationDestination(icon: Icon(Icons.menu), selectedIcon: Icon(Icons.menu_open, color: Color(0xFF1D4ED8)), label: 'المزيد'),
        ],
      ),
    );
  }
}

