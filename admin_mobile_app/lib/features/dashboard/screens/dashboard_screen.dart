import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';
import '../../patients/screens/patients_screen.dart';
import '../../appointments/screens/calendar_screen.dart';
import '../../financials/screens/invoices_screen.dart';
import '../../financials/screens/expenses_screen.dart';
import '../../inventory/screens/inventory_screen.dart';
import '../../services/screens/services_screen.dart';
import '../../team/screens/team_screen.dart';
import '../../crm/screens/leads_screen.dart';
import '../../settings/screens/settings_screen.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  int _currentIndex = 0;
  
  final List<Widget> _screens = [
    const CalendarScreen(),
    const PatientsScreen(),
    const InvoicesScreen(),
    const ExpensesScreen(),
    const SettingsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            const DrawerHeader(
              decoration: BoxDecoration(color: Colors.blue),
              child: Text('القائمة الرئيسية', style: TextStyle(color: Colors.white, fontSize: 24)),
            ),
            ListTile(
              leading: const Icon(Icons.inventory),
              title: const Text('المخزون (Inventory)'),
              onTap: () {
                Navigator.pop(context); // Close drawer
                Navigator.push(context, MaterialPageRoute(builder: (context) => const InventoryScreen()));
              },
            ),
            ListTile(
              leading: const Icon(Icons.medical_services),
              title: const Text('الخدمات الطبية (Services)'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (context) => const ServicesScreen()));
              },
            ),
            ListTile(
              leading: const Icon(Icons.groups),
              title: const Text('فريق العمل (Team)'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (context) => const TeamScreen()));
              },
            ),
            ListTile(
              leading: const Icon(Icons.campaign),
              title: const Text('التسويق (CRM)'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (context) => const LeadsScreen()));
              },
            ),
          ],
        ),
      ),
      body: _screens[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.calendar_month), label: 'المواعيد'),
          NavigationDestination(icon: Icon(Icons.people), label: 'المرضى'),
          NavigationDestination(icon: Icon(Icons.receipt_long), label: 'الفواتير'),
          NavigationDestination(icon: Icon(Icons.money_off), label: 'المصروفات'),
          NavigationDestination(icon: Icon(Icons.settings), label: 'الإعدادات'),
        ],
      ),
    );
  }
}
