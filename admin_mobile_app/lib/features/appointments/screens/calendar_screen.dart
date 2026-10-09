import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/appointment_provider.dart';
import '../models/appointment.dart';
import 'create_appointment_screen.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:dio/dio.dart';
import '../../../core/api/dio_client.dart';
import '../../../core/api/api_endpoints.dart';

final timeFilterProvider = StateProvider<String>((ref) => 'كل المواعيد');
final statusFilterProvider = StateProvider<String>((ref) => 'الكل');
final optimisticStatusProvider = StateProvider.family<String?, int>((ref, hash) => null);
class CalendarScreen extends ConsumerStatefulWidget {
  const CalendarScreen({super.key});

  @override
  ConsumerState<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends ConsumerState<CalendarScreen> {
  Widget _buildTimeFilter(String currentFilter) {
    final filters = ['كل المواعيد', 'أخر أسبوع', 'أخر شهر', 'أخر 3 شهور'];
    
    return Container(
      height: 60,
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
      ),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        itemCount: filters.length,
        itemBuilder: (context, index) {
          final filter = filters[index];
          final isSelected = currentFilter == filter;
          
          return GestureDetector(
            onTap: () {
              ref.read(timeFilterProvider.notifier).state = filter;
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.symmetric(horizontal: 4),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF2563EB) : Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: isSelected ? const Color(0xFF2563EB) : const Color(0xFFE2E8F0),
                ),
              ),
              alignment: Alignment.center,
              child: Text(
                filter,
                style: GoogleFonts.ibmPlexSansArabic(
                  fontSize: 13,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                  color: isSelected ? Colors.white : const Color(0xFF64748B),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatusFilter(String currentFilter) {
    final filters = ['الكل', 'مجدول', 'مؤكد', 'مكتمل', 'الملغي'];
    
    return Container(
      height: 60,
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
      ),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        itemCount: filters.length,
        itemBuilder: (context, index) {
          final filter = filters[index];
          final isSelected = currentFilter == filter;
          
          return GestureDetector(
            onTap: () {
              ref.read(statusFilterProvider.notifier).state = filter;
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.symmetric(horizontal: 4),
              padding: const EdgeInsets.symmetric(horizontal: 20),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF2563EB) : Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: isSelected ? const Color(0xFF2563EB) : const Color(0xFFE2E8F0),
                ),
              ),
              alignment: Alignment.center,
              child: Text(
                filter,
                style: GoogleFonts.ibmPlexSansArabic(
                  fontSize: 14,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                  color: isSelected ? Colors.white : const Color(0xFF64748B),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  void _showAppointmentDetails(BuildContext context, Appointment appt) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return AppointmentBottomSheet(appointment: appt);
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final currentTimeFilter = ref.watch(timeFilterProvider);
    final appointmentsAsync = ref.watch(appointmentsFutureProvider);
    final currentFilter = ref.watch(statusFilterProvider);

    return Scaffold(
      backgroundColor: Colors.white, // Slate-50
      appBar: AppBar(
        title: Text(
          'جدول المواعيد',
          style: GoogleFonts.ibmPlexSansArabic(
            fontWeight: FontWeight.bold,
            color: const Color(0xFF0F172A), // Slate-900
          ),
        ),
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        centerTitle: false,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(
            color: const Color(0xFFE2E8F0), // Slate-200
            height: 1,
          ),
        ),
      ),
      body: Column(
        children: [
          _buildTimeFilter(currentTimeFilter),
          _buildStatusFilter(currentFilter),
          Expanded(
            child: appointmentsAsync.when(
              loading: () => const Center(
                child: CircularProgressIndicator(color: Color(0xFF2563EB)),
              ),
              error: (err, stack) => Center(
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: const BoxDecoration(
                          color: Color(0xFFFEE2E2), // Red-100
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.error_outline, color: Color(0xFFDC2626), size: 48), // Red-600
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'حدث خطأ',
                        style: GoogleFonts.ibmPlexSansArabic(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF0F172A),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        err.toString(), 
                        textAlign: TextAlign.center,
                        style: GoogleFonts.ibmPlexSansArabic(
                          color: const Color(0xFF64748B),
                        ),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton.icon(
                        onPressed: () => ref.refresh(appointmentsFutureProvider),
                        icon: const Icon(Icons.refresh),
                        label: Text('إعادة المحاولة', style: GoogleFonts.ibmPlexSansArabic()),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      )
                    ],
                  ),
                ),
              ),
              data: (appointments) {
                final effectiveAppointments = appointments.map((appt) {
                  final overrideStatus = ref.watch(optimisticStatusProvider(appt.hashCode));
                  return {'appt': appt, 'status': overrideStatus ?? appt.status};
                }).toList();

                final filteredAppointments = effectiveAppointments.where((item) {
                  final appt = item['appt'] as Appointment;
                  final effectiveStatus = item['status'] as String;
                  
                  // Status filter
                  bool statusMatch = false;
                  if (currentFilter == 'الكل') statusMatch = true;
                  else if (currentFilter == 'مجدول' && effectiveStatus == 'SCHEDULED') statusMatch = true;
                  else if (currentFilter == 'مؤكد' && effectiveStatus == 'CONFIRMED') statusMatch = true;
                  else if (currentFilter == 'مكتمل' && effectiveStatus == 'COMPLETED') statusMatch = true;
                  else if (currentFilter == 'الملغي' && effectiveStatus == 'CANCELLED') statusMatch = true;

                  if (!statusMatch) return false;

                  // Time filter
                  if (currentTimeFilter == 'كل المواعيد') return true;

                  try {
                    final apptDate = appt.date;
                    final now = DateTime.now();
                    final diff = now.difference(apptDate).inDays;
                    
                    if (currentTimeFilter == 'أخر أسبوع') {
                      return diff <= 7 && diff >= -7; // Past 7 days and future 7 days? Or just past 7 days? Let's say within 7 days.
                    } else if (currentTimeFilter == 'أخر شهر') {
                      return diff <= 30 && diff >= -30;
                    } else if (currentTimeFilter == 'أخر 3 شهور') {
                      return diff <= 90 && diff >= -90;
                    }
                  } catch (e) {
                    return true;
                  }
                  
                  return false;
                }).map((item) => item['appt'] as Appointment).toList();

                if (filteredAppointments.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(24),
                          decoration: const BoxDecoration(
                            color: Color(0xFFF1F5F9), // Slate-100
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.event_busy,
                            size: 48,
                            color: Color(0xFF94A3B8), // Slate-400
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'لا توجد مواعيد',
                          style: GoogleFonts.ibmPlexSansArabic(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: const Color(0xFF0F172A),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          currentFilter == 'الكل'
                              ? 'لا توجد مواعيد مجدولة في هذا اليوم'
                              : 'لا توجد مواعيد بهذا التصنيف',
                          style: GoogleFonts.ibmPlexSansArabic(
                            fontSize: 14,
                            color: const Color(0xFF64748B),
                          ),
                        ),
                      ],
                    ),
                  );
                }
                
                return RefreshIndicator(
                  color: const Color(0xFF2563EB),
                  onRefresh: () async => ref.refresh(appointmentsFutureProvider),
                  child: ListView.builder(
                    padding: const EdgeInsets.only(top: 8, bottom: 80), // Space for FAB
                    itemCount: filteredAppointments.length,
                    itemBuilder: (context, index) {
                      final appt = filteredAppointments[index];
                      return GestureDetector(
                        onTap: () => _showAppointmentDetails(context, appt),
                        child: _buildAppointmentCard(context, appt),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(heroTag: null, 
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const CreateAppointmentScreen()),
          );
        },
        backgroundColor: Colors.white,
        foregroundColor: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        icon: const Icon(Icons.add),
        label: Text(
          'إضافة موعد',
          style: GoogleFonts.ibmPlexSansArabic(
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  Widget _buildAppointmentCard(BuildContext context, Appointment appt) {
    final overrideStatus = ref.watch(optimisticStatusProvider(appt.hashCode));
    final currentStatus = overrideStatus ?? appt.status;

    Color statusColor;
    Color statusBgColor;
    String statusText;
    switch (currentStatus) {
      case 'CONFIRMED': 
        statusColor = const Color(0xFF16A34A); // green-600
        statusBgColor = const Color(0xFFDCFCE7); // green-100
        statusText = 'مؤكد';
        break;
      case 'COMPLETED': 
        statusColor = const Color(0xFF2563EB); // blue-600
        statusBgColor = const Color(0xFFDBEAFE); // blue-100
        statusText = 'مكتمل';
        break;
      case 'CANCELLED': 
        statusColor = const Color(0xFFDC2626); // red-600
        statusBgColor = const Color(0xFFFEE2E2); // red-100
        statusText = 'ملغي';
        break;
      case 'NO_SHOW': 
        statusColor = const Color(0xFF475569); // slate-600
        statusBgColor = const Color(0xFFF1F5F9); // slate-100
        statusText = 'لم يحضر';
        break;
      default: // SCHEDULED
        statusColor = const Color(0xFFD97706); // amber-600
        statusBgColor = const Color(0xFFFEF3C7); // amber-100
        statusText = 'مجدول';
    }

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: const Color(0xFFE2E8F0)), // Slate-200
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Time Section
            SizedBox(
              width: 75,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    appt.startTime,
                    style: GoogleFonts.ibmPlexSansArabic(
                      fontWeight: FontWeight.bold, 
                      fontSize: 16,
                      color: const Color(0xFF0F172A),
                    ),
                  ),
                  if (appt.endTime != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      appt.endTime!,
                      style: GoogleFonts.ibmPlexSansArabic(
                        color: const Color(0xFF64748B),
                        fontSize: 13,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            
            // Vertical Divider
            Container(
              width: 1,
              height: 50,
              margin: const EdgeInsets.symmetric(horizontal: 12),
              color: const Color(0xFFE2E8F0),
            ),

            // Main Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          appt.patientName,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.ibmPlexSansArabic(
                            fontWeight: FontWeight.w600, 
                            fontSize: 16,
                            color: const Color(0xFF0F172A),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      // Status Badge
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: statusBgColor,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          statusText,
                          style: GoogleFonts.ibmPlexSansArabic(
                            color: statusColor,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  
                  // Phone
                  Row(
                    children: [
                      const Icon(Icons.phone_outlined, size: 16, color: Color(0xFF64748B)),
                      const SizedBox(width: 6),
                      Text(
                        appt.patientPhone, 
                        style: GoogleFonts.ibmPlexSansArabic(
                          color: const Color(0xFF475569),
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                  
                  // Service Tag
                  if (appt.serviceName != null) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.medical_services_outlined, size: 14, color: Color(0xFF64748B)),
                          const SizedBox(width: 6),
                          Flexible(
                            child: Text(
                              appt.serviceName!,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.ibmPlexSansArabic(
                                fontSize: 13,
                                color: const Color(0xFF334155),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ]
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class AppointmentBottomSheet extends ConsumerWidget {
  final Appointment appointment;
  const AppointmentBottomSheet({Key? key, required this.appointment}) : super(key: key);

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Icon(icon, size: 22, color: const Color(0xFF64748B)),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: GoogleFonts.ibmPlexSansArabic(
                  fontSize: 13,
                  color: const Color(0xFF64748B),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: GoogleFonts.ibmPlexSansArabic(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF0F172A),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStatusActionChip(BuildContext context, WidgetRef ref, String currentStatus, String status, String label, Color color, Color bgColor) {
    final isSelected = currentStatus == status;
    return GestureDetector(
      onTap: () {
        ref.read(optimisticStatusProvider(appointment.hashCode).notifier).state = status;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('تم تحديث الحالة بنجاح', style: GoogleFonts.ibmPlexSansArabic(color: Colors.white)),
            backgroundColor: Colors.white,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            margin: const EdgeInsets.all(16),
          ),
        );
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? bgColor : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? color.withOpacity(0.5) : const Color(0xFFE2E8F0),
          ),
        ),
        child: Text(
          label,
          style: GoogleFonts.ibmPlexSansArabic(
            color: isSelected ? color : const Color(0xFF64748B),
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            fontSize: 14,
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final overrideStatus = ref.watch(optimisticStatusProvider(appointment.hashCode));
    final currentStatus = overrideStatus ?? appointment.status;

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'تفاصيل الموعد',
                  style: GoogleFonts.ibmPlexSansArabic(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF0F172A),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                  color: const Color(0xFF64748B),
                  style: IconButton.styleFrom(
                    backgroundColor: Colors.white,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            
            _buildDetailRow(Icons.person_outline, 'المريض', appointment.patientName),
            const SizedBox(height: 16),
            _buildDetailRow(Icons.phone_outlined, 'رقم الهاتف', appointment.patientPhone),
            const SizedBox(height: 16),
            if (appointment.serviceName != null) ...[
              _buildDetailRow(Icons.medical_services_outlined, 'الخدمة', appointment.serviceName!),
              const SizedBox(height: 16),
            ],
            _buildDetailRow(Icons.access_time_outlined, 'الوقت', '${appointment.startTime} ${appointment.endTime != null ? '- ${appointment.endTime}' : ''}'),
            
            const SizedBox(height: 32),
            Text(
              'تغيير حالة الموعد',
              style: GoogleFonts.ibmPlexSansArabic(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 12,
              children: [
                _buildStatusActionChip(context, ref, currentStatus, 'SCHEDULED', 'مجدول', const Color(0xFFD97706), const Color(0xFFFEF3C7)),
                _buildStatusActionChip(context, ref, currentStatus, 'CONFIRMED', 'مؤكد', const Color(0xFF16A34A), const Color(0xFFDCFCE7)),
                _buildStatusActionChip(context, ref, currentStatus, 'COMPLETED', 'مكتمل', const Color(0xFF2563EB), const Color(0xFFDBEAFE)),
                _buildStatusActionChip(context, ref, currentStatus, 'CANCELLED', 'ملغي', const Color(0xFFDC2626), const Color(0xFFFEE2E2)),
                _buildStatusActionChip(context, ref, currentStatus, 'NO_SHOW', 'لم يحضر', const Color(0xFF475569), const Color(0xFFF1F5F9)),
              ],
            ),
            
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: StatefulBuilder(
                builder: (context, setState) {
                  bool isLoading = false;
                  return ElevatedButton.icon(
                    onPressed: isLoading ? null : () async {
                      setState(() => isLoading = true);
                      try {
                        final dio = DioClient().dio;
                        await dio.post(ApiEndpoints.baseUrl + '/appointments/' + appointment.id + '/remind');
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('تم إرسال رسالة التذكير بنجاح', style: GoogleFonts.ibmPlexSansArabic(color: Colors.white)), backgroundColor: Colors.green),
                          );
                          Navigator.pop(context);
                        }
                      } catch (e) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('فشل إرسال التذكير', style: GoogleFonts.ibmPlexSansArabic(color: Colors.white)), backgroundColor: Colors.red),
                          );
                        }
                      } finally {
                        if (context.mounted) {
                          setState(() => isLoading = false);
                        }
                      }
                    },
                    icon: isLoading ? const SizedBox(width:20, height:20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : const Icon(Icons.send_outlined, color: Colors.white),
                    label: Text(
                      isLoading ? 'جاري الإرسال...' : 'إرسال تذكير (SMS)',
                      style: GoogleFonts.ibmPlexSansArabic(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2563EB),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  );
                }
              ),
            ),
          ],
        ),
      ),
    );
  }
}




