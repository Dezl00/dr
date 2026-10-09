import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/widgets/skeleton_loader.dart';

import 'package:google_fonts/google_fonts.dart';
import 'package:dio/dio.dart';
import '../../../core/api/dio_client.dart';
import '../../../core/api/api_endpoints.dart';

final dashboardStatsProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final dio = DioClient().dio;
  final response = await dio.get(ApiEndpoints.baseUrl + '/dashboard/stats');
  return response.data['data'];
});

class HomeOverviewScreen extends ConsumerWidget {
  const HomeOverviewScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(dashboardStatsProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      body: statsAsync.when(
        loading: () => Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    SkeletonLoader(width: 150, height: 100),
                    SkeletonLoader(width: 150, height: 100),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    SkeletonLoader(width: 150, height: 100),
                    SkeletonLoader(width: 150, height: 100),
                  ],
                ),
                const SizedBox(height: 24),
                SkeletonLoader(width: double.infinity, height: 200),
                const SizedBox(height: 16),
                SkeletonLoader(width: double.infinity, height: 80),
              ],
            ),
          ),
        error: (error, stack) => Center(child: Text('حدث خطأ: $error')),
        data: (data) {
          final stats = data['stats'];
          final todaysList = data['todaysList'] as List<dynamic>;
          final upcomingList = data['upcomingList'] as List<dynamic>;

          return RefreshIndicator(
            onRefresh: () async {
              ref.refresh(dashboardStatsProvider);
            },
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _buildStatsGrid(stats),
                const SizedBox(height: 24),
                
                // Native Container Bar Chart
                _buildSectionTitle('تحليلات الإيرادات (أسبوعي)', null),
                const SizedBox(height: 12),
                _buildNativeRevenueChart(),
                const SizedBox(height: 24),

                _buildSectionTitle('مواعيد اليوم', todaysList.length.toString()),
                const SizedBox(height: 12),
                _buildAppointmentsList(todaysList, isToday: true),
                const SizedBox(height: 24),
                _buildSectionTitle('المواعيد القادمة', null),
                const SizedBox(height: 12),
                _buildAppointmentsList(upcomingList, isToday: false),
                const SizedBox(height: 32),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildNativeRevenueChart() {
    final days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
    final values = [0.2, 0.5, 0.3, 0.8, 0.6, 1.0, 0.4];

    return Container(
      height: 220,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        children: [
          Expanded(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: List.generate(7, (index) {
                return Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Container(
                      width: 24,
                      height: 140 * values[index],
                      decoration: const BoxDecoration(
                        color: Color(0xFF2563EB),
                        borderRadius: BorderRadius.vertical(top: Radius.circular(4)),
                      ),
                    ),
                  ],
                );
              }),
            ),
          ),
          const SizedBox(height: 12),
          const Divider(height: 1, color: Color(0xFFE2E8F0)),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: List.generate(7, (index) {
              return Text(
                days[index],
                style: GoogleFonts.ibmPlexSansArabic(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF64748B),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsGrid(Map<String, dynamic> stats) {
    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      childAspectRatio: 1.5,
      children: [
        _buildStatCard('مواعيد اليوم', stats['todaysAppointments'].toString(), Icons.calendar_today, const Color(0xFF2563EB)),
        _buildStatCard('إجمالي المرضى', stats['totalPatients'].toString(), Icons.people, const Color(0xFF10B981)),
        _buildStatCard('المكتملة اليوم', stats['completedCount'].toString(), Icons.check_circle, const Color(0xFF64748B)),
        _buildStatCard('المواعيد القادمة', stats['upcomingCount'].toString(), Icons.upcoming, const Color(0xFFF59E0B)),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: GoogleFonts.ibmPlexSansArabic(
                  fontSize: 12,
                  color: const Color(0xFF64748B),
                  fontWeight: FontWeight.w500,
                ),
              ),
              Icon(icon, size: 16, color: color),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: GoogleFonts.ibmPlexSansArabic(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF0F172A),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title, String? badgeCount) {
    return Row(
      children: [
        Text(
          title,
          style: GoogleFonts.ibmPlexSansArabic(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: const Color(0xFF0F172A),
          ),
        ),
        if (badgeCount != null) ...[
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: const Color(0xFFEFF6FF),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              badgeCount,
              style: GoogleFonts.ibmPlexSansArabic(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF2563EB),
              ),
            ),
          ),
        ]
      ],
    );
  }

  Widget _buildAppointmentsList(List<dynamic> list, {required bool isToday}) {
    if (list.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Center(
          child: Text(
            'لا توجد مواعيد',
            style: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF94A3B8)),
          ),
        ),
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: list.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, index) {
        final apt = list[index];
        return _buildAppointmentItem(apt);
      },
    );
  }

  Widget _buildAppointmentItem(Map<String, dynamic> apt) {
    final statusColor = _getStatusColor(apt['status']);
    final statusText = _getStatusText(apt['status']);

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Text(
              apt['startTime'],
              style: GoogleFonts.ibmPlexSansArabic(
                fontWeight: FontWeight.w600,
                color: const Color(0xFF0F172A),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  apt['patient'] != null ? apt['patient']['fullName'] : 'مريض غير معروف',
                  style: GoogleFonts.ibmPlexSansArabic(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                    color: const Color(0xFF0F172A),
                  ),
                ),
                if (apt['service'] != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    apt['service']['name'],
                    style: GoogleFonts.ibmPlexSansArabic(
                      fontSize: 12,
                      color: const Color(0xFF64748B),
                    ),
                  ),
                ],
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              statusText,
              style: GoogleFonts.ibmPlexSansArabic(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: statusColor,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'SCHEDULED': return const Color(0xFF2563EB); // Blue
      case 'CONFIRMED': return const Color(0xFF10B981); // Emerald
      case 'COMPLETED': return const Color(0xFF64748B); // Slate
      case 'CANCELLED': return const Color(0xFFEF4444); // Red
      case 'NO_SHOW': return const Color(0xFFF59E0B); // Amber
      default: return const Color(0xFF64748B);
    }
  }

  String _getStatusText(String status) {
    switch (status) {
      case 'SCHEDULED': return 'مجدول';
      case 'CONFIRMED': return 'مؤكد';
      case 'COMPLETED': return 'مكتمل';
      case 'CANCELLED': return 'ملغي';
      case 'NO_SHOW': return 'لم يحضر';
      default: return status;
    }
  }
}
