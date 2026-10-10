import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/widgets/skeleton_loader.dart';
import '../../../core/api/dio_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../auth/providers/auth_provider.dart';
import '../../search/screens/search_screen.dart';
import '../../notifications/screens/notifications_screen.dart';
import '../../appointments/screens/calendar_screen.dart';
import '../../appointments/screens/create_appointment_screen.dart';
import '../../patients/screens/patients_screen.dart';
import '../providers/dashboard_provider.dart';

final dashboardStatsProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final dio = DioClient().dio;
  final response = await dio.get('${ApiEndpoints.baseUrl}/dashboard/stats');
  return response.data['data'];
});

class HomeOverviewScreen extends ConsumerWidget {
  const HomeOverviewScreen({super.key});

  String _toEnglishNumerals(String input) {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const englishNumerals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    String result = input;
    for (int i = 0; i < arabicNumerals.length; i++) {
      result = result.replaceAll(arabicNumerals[i], englishNumerals[i]);
    }
    return result;
  }

  String _formatTime(String? timeStr) {
    if (timeStr == null || timeStr.isEmpty) return '';
    try {
      DateTime? dt = DateTime.tryParse(timeStr);
      if (dt == null) {
        final parts = timeStr.split(':');
        if (parts.length >= 2) {
          int hour = int.parse(parts[0]);
          int min = int.parse(parts[1]);
          String period = hour >= 12 ? 'PM' : 'AM';
          int h12 = hour > 12 ? hour - 12 : (hour == 0 ? 12 : hour);
          return '$h12:${min.toString().padLeft(2, '0')} $period';
        }
        return timeStr;
      }
      int hour = dt.hour;
      int min = dt.minute;
      String period = hour >= 12 ? 'PM' : 'AM';
      int h12 = hour > 12 ? hour - 12 : (hour == 0 ? 12 : hour);
      return '$h12:${min.toString().padLeft(2, '0')} $period';
    } catch (e) {
      return timeStr;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(dashboardStatsProvider);
    final userName = 'العيادة';

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: const BoxDecoration(
                          color: Color(0xFFEFF6FF),
                          shape: BoxShape.circle,
                          border: null,
                        ),
                        child: const Icon(Icons.person_outline, color: Color(0xFF2563EB)),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'صباح الخير',
                            style: TextStyle(
                              fontFamily: 'IBMPlexSansArabic',
                              color: Color(0xFF94A3B8),
                              fontSize: 14,
                            ),
                          ),
                          Text(
                            userName,
                            style: const TextStyle(
                              fontFamily: 'IBMPlexSansArabic',
                              color: Color(0xFF0F172A),
                              fontWeight: FontWeight.bold,
                              fontSize: 20,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  InkWell(
                    onTap: () {
                      Navigator.push(context, MaterialPageRoute(builder: (context) => const NotificationsScreen()));
                    },
                    borderRadius: BorderRadius.circular(50),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Stack(
                        children: [
                          const Icon(Icons.notifications_none, color: Color(0xFF0F172A), size: 24),
                          Positioned(
                            right: 0,
                            top: 0,
                            child: Container(
                              width: 8,
                              height: 8,
                              decoration: BoxDecoration(
                                color: const Color(0xFF2563EB),
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white, width: 1.5),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            
            // Search Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: InkWell(
                onTap: () {
                  Navigator.push(context, MaterialPageRoute(builder: (context) => const SearchScreen()));
                },
                borderRadius: BorderRadius.circular(50),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(50),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.search, color: Color(0xFF94A3B8), size: 20),
                      SizedBox(width: 12),
                      Text(
                        'البحث عن مريض أو موعد...',
                        style: TextStyle(
                          fontFamily: 'IBMPlexSansArabic',
                          color: Color(0xFF94A3B8),
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            
            const SizedBox(height: 24),

            Expanded(
              child: statsAsync.when(
                loading: () => ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  children: const [
                    SkeletonLoader(width: double.infinity, height: 120),
                    SizedBox(height: 24),
                    SkeletonLoader(width: double.infinity, height: 200),
                  ],
                ),
                error: (error, stack) => Center(child: Text('حدث خطأ: $error')),
                data: (data) {
                  final stats = data['stats'];
                  final todaysList = (data['todaysList'] as List<dynamic>?) ?? [];
                  
                  return RefreshIndicator(
                    onRefresh: () async {
                      ref.refresh(dashboardStatsProvider);
                    },
                    child: ListView(
                      padding: const EdgeInsets.only(bottom: 120), // Space for bottom nav
                      children: [
                        // Stats Grid (2x2)
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          child: Column(
                            children: [
                              Row(
                                children: [
                                  Expanded(child: _buildStatCard(context, ref, 'مواعيد اليوم', stats['todaysAppointments']?.toString() ?? '0', Icons.calendar_today, const Color(0xFF2563EB), true)),
                                  const SizedBox(width: 16),
                                  Expanded(child: _buildStatCard(context, ref, 'إجمالي المرضى', stats['totalPatients']?.toString() ?? '0', Icons.people_outline, const Color(0xFF10B981), false)),
                                ],
                              ),
                              const SizedBox(height: 16),
                              Row(
                                children: [
                                  Expanded(child: _buildStatCard(context, ref, 'المكتملة اليوم', stats['completedCount']?.toString() ?? '0', Icons.check_circle_outline, const Color(0xFF64748B), false)),
                                  const SizedBox(width: 16),
                                  Expanded(child: _buildStatCard(context, ref, 'المواعيد القادمة', stats['upcomingCount']?.toString() ?? '0', Icons.upcoming_outlined, const Color(0xFFF59E0B), false)),
                                ],
                              ),
                            ],
                          ),
                        ),
                        
                        const SizedBox(height: 32),

                        // Appointments Section
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'مواعيد اليوم',
                                style: TextStyle(
                                  fontFamily: 'IBMPlexSansArabic',
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF0F172A),
                                ),
                              ),
                              InkWell(
                                onTap: () {
                                  ref.read(dashboardIndexProvider.notifier).state = 2; // Switch to Calendar tab
                                },
                                child: const Text(
                                  'عرض الكل',
                                  style: TextStyle(
                                    fontFamily: 'IBMPlexSansArabic',
                                    fontSize: 14,
                                    color: Color(0xFF2563EB),
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                        
                        _buildAppointmentsList(todaysList),
                        const SizedBox(height: 16),
                        
                        // Add Appointment Pill Button
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          child: InkWell(
                            onTap: () {
                              Navigator.push(context, MaterialPageRoute(builder: (context) => const CreateAppointmentScreen()));
                            },
                            borderRadius: BorderRadius.circular(50),
                            child: Container(
                              width: double.infinity,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              decoration: BoxDecoration(
                                color: const Color(0xFF2563EB),
                                borderRadius: BorderRadius.circular(50),
                              ),
                              child: const Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.add, color: Colors.white, size: 18),
                                  SizedBox(width: 8),
                                  Text(
                                    'إضافة موعد',
                                    style: TextStyle(
                                      fontFamily: 'IBMPlexSansArabic',
                                      color: Colors.white,
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        
                        const SizedBox(height: 32),

                        // Quick Analytics
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 20),
                          child: Text(
                            'تحليلات سريعة',
                            style: TextStyle(
                              fontFamily: 'IBMPlexSansArabic',
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          child: _buildNativeRevenueChart(),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(BuildContext context, WidgetRef ref, String title, String value, IconData icon, Color indicatorColor, bool isActive) {
    return InkWell(
      onTap: () {
        if (title.contains('المرضى')) {
          ref.read(dashboardIndexProvider.notifier).state = 1; // switch to Patients
        } else {
          ref.read(dashboardIndexProvider.notifier).state = 2; // switch to Calendar
        }
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFF2563EB) : const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(16),
          border: null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: isActive ? Colors.white : indicatorColor,
                    shape: BoxShape.circle,
                  ),
                ),
                Icon(
                  icon,
                  size: 20,
                  color: isActive ? Colors.white70 : const Color(0xFF94A3B8),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _toEnglishNumerals(value),
                  style: TextStyle(
                    fontFamily: 'IBMPlexSansArabic',
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: isActive ? Colors.white : const Color(0xFF0F172A),
                  ),
                ),
                Text(
                  title,
                  style: TextStyle(
                    fontFamily: 'IBMPlexSansArabic',
                    fontSize: 11,
                    color: isActive ? Colors.white70 : const Color(0xFF64748B),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAppointmentsList(List<dynamic> list) {
    if (list.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: const Center(
            child: Text(
              'لا يوجد مواعيد اليوم',
              style: TextStyle(
                fontFamily: 'IBMPlexSansArabic', 
                color: Color(0xFF94A3B8),
                fontSize: 16,
              ),
            ),
          ),
        ),
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 20),
      itemCount: list.length > 3 ? 3 : list.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final apt = list[index];
        final isFirst = index == 0;
        return _buildAppointmentItem(apt, isFirst);
      },
    );
  }

  Widget _buildAppointmentItem(Map<String, dynamic> apt, bool isFirst) {
    final statusColor = _getStatusColor(apt['status']);
    final statusText = _getStatusText(apt['status']);
    final patientName = apt['patient'] != null ? apt['patient']['fullName'] : 'مريض غير معروف';
    final serviceName = apt['service'] != null ? apt['service']['name'] : '';

    final bgColor = isFirst ? const Color(0xFFE0F2FE) : Colors.white;
    final textColor = const Color(0xFF0F172A);
    final subTextColor = const Color(0xFF475569);
    final borderColor = isFirst ? Colors.transparent : const Color(0xFFE2E8F0);

    return Container(
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
      ),
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              border: isFirst ? null : Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: const Center(
              child: Icon(
                Icons.person_outline,
                color: Color(0xFF2563EB),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  patientName.toString(),
                  style: TextStyle(
                    fontFamily: 'IBMPlexSansArabic',
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: textColor,
                  ),
                ),
                if (serviceName.toString().isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    serviceName.toString(),
                    style: TextStyle(
                      fontFamily: 'IBMPlexSansArabic',
                      fontSize: 13,
                      color: subTextColor,
                    ),
                  ),
                ],
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                _toEnglishNumerals(_formatTime(apt['startTime']?.toString())),
                style: TextStyle(
                  fontFamily: 'IBMPlexSansArabic',
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  color: textColor,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(50),
                ),
                child: Text(
                  statusText,
                  style: TextStyle(
                    fontFamily: 'IBMPlexSansArabic',
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: statusColor,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String? status) {
    switch (status) {
      case 'SCHEDULED': return const Color(0xFF2563EB);
      case 'CONFIRMED': return const Color(0xFF10B981);
      case 'COMPLETED': return const Color(0xFF64748B);
      case 'CANCELLED': return const Color(0xFFEF4444);
      case 'NO_SHOW': return const Color(0xFFF59E0B);
      default: return const Color(0xFF64748B);
    }
  }

  String _getStatusText(String? status) {
    switch (status) {
      case 'SCHEDULED': return 'مجدول';
      case 'CONFIRMED': return 'مؤكد';
      case 'COMPLETED': return 'مكتمل';
      case 'CANCELLED': return 'ملغي';
      case 'NO_SHOW': return 'لم يحضر';
      default: return status ?? 'غير معروف';
    }
  }

  Widget _buildNativeRevenueChart() {
    final days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
    final values = [0.3, 0.6, 0.4, 0.9, 0.7, 1.0, 0.2];

    return Container(
      height: 180,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        children: [
          Expanded(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: List.generate(7, (index) {
                return Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Container(
                      width: 16,
                      height: 100 * values[index],
                      decoration: BoxDecoration(
                        color: index == 5 ? const Color(0xFF2563EB) : const Color(0xFFDBEAFE),
                        borderRadius: BorderRadius.circular(50),
                      ),
                    ),
                  ],
                );
              }),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(7, (index) {
              return Text(
                days[index],
                style: const TextStyle(
                  fontFamily: 'IBMPlexSansArabic',
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF64748B),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}
