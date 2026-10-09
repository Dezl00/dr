import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:dio/dio.dart';
import '../../../core/api/dio_client.dart';
import '../../../core/api/api_endpoints.dart';

class NotificationsSettingsScreen extends StatefulWidget {
  const NotificationsSettingsScreen({super.key});

  @override
  State<NotificationsSettingsScreen> createState() => _NotificationsSettingsScreenState();
}

class _NotificationsSettingsScreenState extends State<NotificationsSettingsScreen> {
  bool _notifyBookingConfirmation = true;
  bool _notifyBookingCancellation = true;
  bool _notifyVisitCompletion = true;
  bool _notifyAppointmentReminder = true;
  bool _isLoading = false;
  bool _isFetching = true;

  @override
  void initState() {
    super.initState();
    _fetchSettings();
  }

  Future<void> _fetchSettings() async {
    try {
      final dio = DioClient().dio;
      final response = await dio.get(ApiEndpoints.settings);
      if (response.data['success']) {
        final data = response.data['data'] ?? {};
        setState(() {
          _notifyBookingConfirmation = data['notifyBookingConfirmation'] ?? true;
          _notifyBookingCancellation = data['notifyBookingCancellation'] ?? true;
          _notifyVisitCompletion = data['notifyVisitCompletion'] ?? true;
          _notifyAppointmentReminder = data['notifyAppointmentReminder'] ?? true;
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('حدث خطأ أثناء تحميل الإعدادات: $e')),
      );
    } finally {
      if (mounted) setState(() => _isFetching = false);
    }
  }

  Future<void> _save() async {
    setState(() => _isLoading = true);
    
    try {
      final dio = DioClient().dio;
      final response = await dio.put(
        ApiEndpoints.settings,
        data: {
          'notifyBookingConfirmation': _notifyBookingConfirmation,
          'notifyBookingCancellation': _notifyBookingCancellation,
          'notifyVisitCompletion': _notifyVisitCompletion,
          'notifyAppointmentReminder': _notifyAppointmentReminder,
        },
      );
      
      if (response.data['success']) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تم الحفظ بنجاح')),
        );
      } else {
        throw Exception(response.data['error'] ?? 'فشل الحفظ');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('حدث خطأ: ${e.toString()}')),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        title: Text(
          'الإشعارات',
          style: GoogleFonts.ibmPlexSansArabic(
            color: const Color(0xFF1E293B),
            fontWeight: FontWeight.bold,
          ),
        ),
        iconTheme: const IconThemeData(color: Color(0xFF1E293B)),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(color: const Color(0xFFE2E8F0), height: 1.0),
        ),
      ),
      body: _isFetching 
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                SwitchListTile(
                  title: Text('تأكيد الحجز', style: GoogleFonts.ibmPlexSansArabic()),
                  subtitle: Text('إرسال إشعار عند تأكيد الحجز', style: GoogleFonts.ibmPlexSansArabic(fontSize: 12)),
                  value: _notifyBookingConfirmation,
                  onChanged: (val) => setState(() => _notifyBookingConfirmation = val),
                ),
                SwitchListTile(
                  title: Text('إلغاء الحجز', style: GoogleFonts.ibmPlexSansArabic()),
                  subtitle: Text('إرسال إشعار عند إلغاء الحجز', style: GoogleFonts.ibmPlexSansArabic(fontSize: 12)),
                  value: _notifyBookingCancellation,
                  onChanged: (val) => setState(() => _notifyBookingCancellation = val),
                ),
                SwitchListTile(
                  title: Text('إتمام الزيارة', style: GoogleFonts.ibmPlexSansArabic()),
                  subtitle: Text('إرسال إشعار بعد إتمام الزيارة', style: GoogleFonts.ibmPlexSansArabic(fontSize: 12)),
                  value: _notifyVisitCompletion,
                  onChanged: (val) => setState(() => _notifyVisitCompletion = val),
                ),
                SwitchListTile(
                  title: Text('تذكير بالموعد', style: GoogleFonts.ibmPlexSansArabic()),
                  subtitle: Text('إرسال تذكير قبل الموعد', style: GoogleFonts.ibmPlexSansArabic(fontSize: 12)),
                  value: _notifyAppointmentReminder,
                  onChanged: (val) => setState(() => _notifyAppointmentReminder = val),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _isLoading ? null : _save,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: _isLoading 
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Text('حفظ التغييرات', style: GoogleFonts.ibmPlexSansArabic(color: Colors.white)),
                ),
              ],
            ),
    );
  }
}

