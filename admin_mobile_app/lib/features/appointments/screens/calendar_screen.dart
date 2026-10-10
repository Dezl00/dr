import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart' hide TextDirection;
import 'package:url_launcher/url_launcher.dart';
import 'dart:async';

import '../../../core/widgets/error_state_widget.dart';
import '../../../core/widgets/empty_state_widget.dart';
import '../providers/appointment_provider.dart';
import '../models/appointment.dart';
import 'create_appointment_screen.dart';
import '../../search/screens/search_screen.dart';
import '../../../core/api/dio_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/services/notification_service.dart';

final statusFilterProvider = StateProvider<String>((ref) => 'الكل');
final optimisticStatusProvider = StateProvider.family<String?, String>((ref, id) => null);
final selectedDateProvider = StateProvider<DateTime>((ref) => DateTime.now());

class CalendarScreen extends ConsumerStatefulWidget {
  const CalendarScreen({super.key});

  @override
  ConsumerState<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends ConsumerState<CalendarScreen> {
  StreamSubscription? _notificationSub;
  late ScrollController _daysScrollController;

  @override
  void initState() {
    super.initState();
    // Assume each day item is about 64px wide. Initial scroll offset to show current day.
    final today = DateTime.now();
    _daysScrollController = ScrollController(initialScrollOffset: (today.day > 3 ? today.day - 3 : 0) * 68.0);
    Future.microtask(() => ref.read(appointmentStateProvider.notifier).fetchData());

    _notificationSub = NotificationService().onNotificationReceived.listen((notification) {
      ref.read(appointmentStateProvider.notifier).fetchData();
    });
  }

  @override
  void dispose() {
    _notificationSub?.cancel();
    _daysScrollController.dispose();
    super.dispose();
  }

  String _toEnglishNumbers(String input) {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    for (int i = 0; i < arabicNumbers.length; i++) {
      input = input.replaceAll(arabicNumbers[i], i.toString());
    }
    return input;
  }

  void _showAppointmentDetails(Appointment appointment) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return _AppointmentDetailsSheet(
          appointment: appointment,
          toEnglishNumbers: _toEnglishNumbers,
        );
      },
    );
  }

  List<Appointment> _filterAppointments(List<Appointment> items, String statusFilter, DateTime selectedDate) {
    var filtered = items;

    if (statusFilter != 'الكل') {
      String enStatus = '';
      switch (statusFilter) {
        case 'مجدول': enStatus = 'SCHEDULED'; break;
        case 'مؤكد': enStatus = 'CONFIRMED'; break;
        case 'مكتمل': enStatus = 'COMPLETED'; break;
        case 'الملغي': enStatus = 'CANCELLED'; break;
      }
      filtered = filtered.where((a) => a.status == enStatus || a.status == statusFilter).toList();
    }

    filtered = filtered.where((a) {
      return a.date.year == selectedDate.year &&
          a.date.month == selectedDate.month &&
          a.date.day == selectedDate.day;
    }).toList();

    filtered.sort((a, b) => a.startTime.compareTo(b.startTime));

    return filtered;
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(appointmentStateProvider);
    final statusFilter = ref.watch(statusFilterProvider);
    final selectedDate = ref.watch(selectedDateProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Directionality(
          textDirection: TextDirection.rtl,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(context),
              const SizedBox(height: 16),
              _buildDateSelector(selectedDate),
              const SizedBox(height: 20),
              _buildStatusTabs(statusFilter),
              const SizedBox(height: 16),
              Expanded(
                child: Builder(
                  builder: (context) {
                    if (state.isLoading && state.items.isEmpty) {
                      return const Center(child: CircularProgressIndicator(color: Color(0xFF2563EB)));
                    }
                    if (state.error != null && state.items.isEmpty) {
                      return ErrorStateWidget(
                        error: state.error!,
                        onRetry: () => ref.read(appointmentStateProvider.notifier).fetchData(),
                      );
                    }
                    
                    final filtered = _filterAppointments(state.items, statusFilter, selectedDate);
                    if (filtered.isEmpty) {
                      return const EmptyStateWidget(
                        title: 'لا توجد مواعيد',
                        description: 'لم يتم العثور على مواعيد مطابقة لبحثك',
                        icon: Icons.calendar_today_outlined,
                      );
                    }
                    return ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                      itemCount: filtered.length,
                      itemBuilder: (context, index) {
                        return _buildTimelineCard(filtered[index]);
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text(
            'المواعيد',
            style: TextStyle(
              fontFamily: 'IBMPlexSansArabic',
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: Color(0xFF0F172A),
            ),
          ),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const CreateAppointmentScreen()),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2563EB),
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(50)),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            ),
            icon: const Icon(Icons.add, color: Colors.white, size: 20),
            label: const Text(
              'حجز الميعاد',
              style: TextStyle(
                fontFamily: 'IBMPlexSansArabic',
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDateSelector(DateTime selectedDate) {
    final today = DateTime.now();
    final todayStart = DateTime(today.year, today.month, today.day);
    
    // Generate days for the selected month
    final daysInMonth = DateUtils.getDaysInMonth(selectedDate.year, selectedDate.month);
    final List<DateTime> dates = [];
    for (int i = 1; i <= daysInMonth; i++) {
      dates.add(DateTime(selectedDate.year, selectedDate.month, i));
    }

    final monthYear = _toEnglishNumbers(DateFormat('MMMM yyyy', 'ar').format(selectedDate));
    final dayFull = _toEnglishNumbers(DateFormat('EEEE - d MMMM', 'ar').format(selectedDate));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                icon: const Icon(Icons.chevron_right, color: Color(0xFF2563EB)),
                onPressed: () {
                  final newDate = DateTime(selectedDate.year, selectedDate.month + 1, 1);
                  ref.read(selectedDateProvider.notifier).state = newDate;
                  _daysScrollController.jumpTo(0);
                },
              ),
              Text(
                monthYear,
                style: const TextStyle(
                  fontFamily: 'IBMPlexSansArabic',
                  color: Color(0xFF0F172A),
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.chevron_left, color: Color(0xFF2563EB)),
                onPressed: () {
                  final newDate = DateTime(selectedDate.year, selectedDate.month - 1, 1);
                  ref.read(selectedDateProvider.notifier).state = newDate;
                  _daysScrollController.jumpTo(0);
                },
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 80,
          child: ListView.builder(
            controller: _daysScrollController,
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: dates.length,
            itemBuilder: (context, index) {
              final date = dates[index];
              final dateStart = DateTime(date.year, date.month, date.day);
              final isSelected = dateStart == DateTime(selectedDate.year, selectedDate.month, selectedDate.day);
              final isPast = dateStart.isBefore(todayStart);

              final dayName = DateFormat('E', 'ar').format(date);
              final dayNum = date.day.toString(); // already English numeral

              Color bgColor = const Color(0xFFF8FAFC);
              Color dayNameColor = const Color(0xFF94A3B8);
              Color dayNumColor = const Color(0xFF0F172A);

              if (isSelected) {
                bgColor = const Color(0xFF2563EB);
                dayNameColor = Colors.white;
                dayNumColor = Colors.white;
              } else if (isPast) {
                dayNumColor = const Color(0xFF94A3B8);
              }

              return GestureDetector(
                onTap: () {
                  ref.read(selectedDateProvider.notifier).state = date;
                },
                child: Container(
                  width: 60,
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  decoration: BoxDecoration(
                    color: bgColor,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        dayName,
                        style: TextStyle(
                          fontFamily: 'IBMPlexSansArabic',
                          color: dayNameColor,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        dayNum,
                        style: TextStyle(
                          fontFamily: 'IBMPlexSansArabic',
                          color: dayNumColor,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (isSelected) ...[
                        const SizedBox(height: 4),
                        Container(
                          width: 4,
                          height: 4,
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
          child: Row(
            children: [
              Text(
                dayFull,
                style: const TextStyle(
                  fontFamily: 'IBMPlexSansArabic',
                  color: Color(0xFF475569),
                  fontSize: 14,
                ),
              ),
              const Spacer(),
              IconButton(
                icon: const Icon(Icons.search, color: Color(0xFF475569)),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const SearchScreen()),
                  );
                },
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStatusTabs(String currentStatus) {
    final statuses = ['الكل', 'مجدول', 'مؤكد', 'مكتمل', 'الملغي'];
    return SizedBox(
      height: 40,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        scrollDirection: Axis.horizontal,
        itemCount: statuses.length,
        separatorBuilder: (context, _) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final s = statuses[index];
          final isActive = currentStatus == s;
          return GestureDetector(
            onTap: () {
              ref.read(statusFilterProvider.notifier).state = s;
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: isActive ? const Color(0xFF2563EB) : Colors.white,
                borderRadius: BorderRadius.circular(50),
                border: Border.all(
                  color: isActive ? const Color(0xFF2563EB) : const Color(0xFFE2E8F0),
                ),
              ),
              child: Text(
                s,
                style: TextStyle(
                  fontFamily: 'IBMPlexSansArabic',
                  color: isActive ? Colors.white : const Color(0xFF475569),
                  fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildTimelineCard(Appointment appointment) {
    final status = ref.watch(optimisticStatusProvider(appointment.id)) ?? appointment.status;

    return GestureDetector(
      onTap: () => _showAppointmentDetails(appointment),
      child: IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SizedBox(
              width: 80, // slightly wider to fit AM/PM nicely
              child: Column(
                children: [
                  Text(
                    _formatTime(appointment.startTime),
                    style: const TextStyle(
                      fontFamily: 'IBMPlexSansArabic',
                      color: Color(0xFF475569),
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Expanded(
                    child: Container(
                      width: 1,
                      color: const Color(0xFFE2E8F0),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: const Color(0xFFEFF6FF),
                      radius: 24,
                      child: Text(
                        appointment.patientName.isNotEmpty ? appointment.patientName[0] : '?',
                        style: const TextStyle(
                          fontFamily: 'IBMPlexSansArabic',
                          color: Color(0xFF2563EB),
                          fontWeight: FontWeight.bold,
                          fontSize: 20,
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            appointment.patientName,
                            style: const TextStyle(
                              fontFamily: 'IBMPlexSansArabic',
                              color: Color(0xFF0F172A),
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${_formatTime(appointment.startTime)} - ${_formatTime(appointment.endTime)}',
                            textDirection: TextDirection.ltr, // Keep time LTR to avoid scrambling
                            style: const TextStyle(
                              fontFamily: 'IBMPlexSansArabic',
                              color: Color(0xFF94A3B8),
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            appointment.serviceName ?? 'غير محدد',
                            style: const TextStyle(
                              fontFamily: 'IBMPlexSansArabic',
                              color: Color(0xFF475569),
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                    _buildStatusIndicator(status),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusIndicator(String status) {
    Color color;
    String text;
    switch (status) {
      case 'COMPLETED':
      case 'مكتمل':
        color = const Color(0xFF64748B);
        text = 'مكتمل';
        break;
      case 'CANCELLED':
      case 'الملغي':
        color = const Color(0xFFEF4444);
        text = 'الملغي';
        break;
      case 'CONFIRMED':
      case 'مؤكد':
        color = const Color(0xFF10B981);
        text = 'مؤكد';
        break;
      case 'SCHEDULED':
      case 'مجدول':
        color = const Color(0xFF2563EB);
        text = 'مجدول';
        break;
      case 'NO_SHOW':
      case 'لم يحضر':
        color = const Color(0xFFF59E0B);
        text = 'لم يحضر';
        break;
      default:
        color = const Color(0xFF64748B);
        text = status;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(50),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontFamily: 'IBMPlexSansArabic',
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  String _formatTime(String? time) {
    if (time == null || time.isEmpty) return '';
    try {
      final parts = time.split(':');
      if (parts.length >= 2) {
        final h = int.parse(parts[0]);
        final m = int.parse(parts[1]);
        final dt = DateTime(2000, 1, 1, h, m);
        return DateFormat('hh:mm a', 'en').format(dt);
      }
    } catch (_) {}
    return time;
  }
}

class _AppointmentDetailsSheet extends ConsumerWidget {
  final Appointment appointment;
  final String Function(String) toEnglishNumbers;

  const _AppointmentDetailsSheet({
    required this.appointment,
    required this.toEnglishNumbers,
  });

  String _formatTime(String? time) {
    if (time == null || time.isEmpty) return '';
    try {
      final parts = time.split(':');
      if (parts.length >= 2) {
        final h = int.parse(parts[0]);
        final m = int.parse(parts[1]);
        final dt = DateTime(2000, 1, 1, h, m);
        return DateFormat('hh:mm a', 'en').format(dt);
      }
    } catch (_) {}
    return time;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final status = ref.watch(optimisticStatusProvider(appointment.id)) ?? appointment.status;

    return Directionality(
      textDirection: TextDirection.rtl,
      child: Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0xFFE2E8F0),
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: const BoxDecoration(
                    color: Color(0xFFEFF6FF),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.person_outline,
                    color: Color(0xFF2563EB),
                    size: 32,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        appointment.patientName,
                        style: const TextStyle(
                          fontFamily: 'IBMPlexSansArabic',
                          color: Color(0xFF0F172A),
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        toEnglishNumbers(appointment.patientPhone),
                        style: const TextStyle(
                          fontFamily: 'IBMPlexSansArabic',
                          color: Color(0xFF475569),
                          fontSize: 16,
                        ),
                        textDirection: TextDirection.ltr,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            _buildDetailRow(Icons.calendar_today_outlined, 'التاريخ', toEnglishNumbers(DateFormat('yyyy-MM-dd', 'en').format(appointment.date))),
            const SizedBox(height: 12),
            _buildDetailRow(Icons.access_time_outlined, 'الوقت', '${_formatTime(appointment.startTime)} - ${_formatTime(appointment.endTime)}', isLtr: true),
            const SizedBox(height: 12),
            _buildDetailRow(Icons.medical_services_outlined, 'الخدمة', appointment.serviceName ?? 'غير محدد'),
            if (appointment.notes != null && appointment.notes!.isNotEmpty) ...[
              const SizedBox(height: 12),
              _buildDetailRow(Icons.notes_outlined, 'ملاحظات', appointment.notes!),
            ],
            const SizedBox(height: 24),
            const Text(
              'تغيير الحالة',
              style: TextStyle(
                fontFamily: 'IBMPlexSansArabic',
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: ['مجدول', 'مؤكد', 'مكتمل', 'الملغي'].map((s) {
                String enStatus = '';
                switch (s) {
                  case 'مجدول': enStatus = 'SCHEDULED'; break;
                  case 'مؤكد': enStatus = 'CONFIRMED'; break;
                  case 'مكتمل': enStatus = 'COMPLETED'; break;
                  case 'الملغي': enStatus = 'CANCELLED'; break;
                }
                final isSelected = status == enStatus || status == s;
                return GestureDetector(
                  onTap: () => _updateStatus(context, ref, enStatus),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFF2563EB) : Colors.white,
                      borderRadius: BorderRadius.circular(50),
                      border: Border.all(
                        color: isSelected ? const Color(0xFF2563EB) : const Color(0xFFE2E8F0),
                      ),
                    ),
                    child: Text(
                      s,
                      style: TextStyle(
                        fontFamily: 'IBMPlexSansArabic',
                        color: isSelected ? Colors.white : const Color(0xFF475569),
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                onPressed: () => _openWhatsApp(appointment.patientPhone),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF25D366),
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(50)),
                ),
                icon: const Icon(Icons.chat_outlined, color: Colors.white),
                label: const Text(
                  'تذكير عبر واتساب',
                  style: TextStyle(
                    fontFamily: 'IBMPlexSansArabic',
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value, {bool isLtr = false}) {
    return Row(
      children: [
        Icon(icon, color: const Color(0xFF94A3B8), size: 20),
        const SizedBox(width: 12),
        Text(
          '$label: ',
          style: const TextStyle(
            fontFamily: 'IBMPlexSansArabic',
            color: Color(0xFF475569),
            fontSize: 14,
          ),
        ),
        Expanded(
          child: Text(
            value,
            textDirection: isLtr ? TextDirection.ltr : null,
            textAlign: isLtr ? TextAlign.right : null,
            style: const TextStyle(
              fontFamily: 'IBMPlexSansArabic',
              color: Color(0xFF0F172A),
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }

  Future<void> _updateStatus(BuildContext context, WidgetRef ref, String newStatus) async {
    ref.read(optimisticStatusProvider(appointment.id).notifier).state = newStatus;
    try {
      final dio = DioClient().dio;
      await dio.patch('${ApiEndpoints.appointments}/${appointment.id}/status', data: {'status': newStatus});
      ref.read(appointmentStateProvider.notifier).fetchData();
      
      // WhatsApp message logic
      if (context.mounted) {
        String msg = '';
        switch(newStatus) {
          case 'CONFIRMED':
            msg = 'مرحباً ${appointment.patientName}، تم تأكيد موعدك بنجاح.';
            break;
          case 'CANCELLED':
            msg = 'مرحباً ${appointment.patientName}، تم إلغاء موعدك.';
            break;
          case 'SCHEDULED':
            msg = 'مرحباً ${appointment.patientName}، موعدك الآن مجدول.';
            break;
        }
        if (msg.isNotEmpty) {
          final url = Uri.parse('https://wa.me/${appointment.patientPhone}?text=${Uri.encodeComponent(msg)}');
          if (await canLaunchUrl(url)) {
            await launchUrl(url, mode: LaunchMode.externalApplication);
          }
        }
      }
    } catch (e) {
      ref.read(optimisticStatusProvider(appointment.id).notifier).state = appointment.status;
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('فشل في تحديث الحالة', style: TextStyle(fontFamily: 'IBMPlexSansArabic'))),
        );
      }
    }
  }

  Future<void> _openWhatsApp(String phone) async {
    final url = Uri.parse('https://wa.me/$phone');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }
}
