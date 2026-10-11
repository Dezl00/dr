import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_endpoints.dart';
import '../../auth/providers/auth_provider.dart';

class NotificationsSettingsScreen extends ConsumerStatefulWidget {
  const NotificationsSettingsScreen({super.key});

  @override
  ConsumerState<NotificationsSettingsScreen> createState() => _NotificationsSettingsScreenState();
}

class _NotificationsSettingsScreenState extends ConsumerState<NotificationsSettingsScreen> {
  bool _loading = true;
  bool _saving = false;
  bool _bookingConfirmation = true;
  bool _bookingCancellation = true;
  bool _visitCompletion = true;
  bool _appointmentReminder = true;
  int _reminderHours = 24;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final response = await ref.read(dioProvider).get(ApiEndpoints.settings);
      final data = response.data['data'] as Map?;
      if (data != null && mounted) {
        setState(() {
          _bookingConfirmation = data['notifyBookingConfirmation'] as bool? ?? true;
          _bookingCancellation = data['notifyBookingCancellation'] as bool? ?? true;
          _visitCompletion = data['notifyVisitCompletion'] as bool? ?? true;
          _appointmentReminder = data['notifyAppointmentReminder'] as bool? ?? true;
          _reminderHours = int.tryParse(data['reminderHoursBefore']?.toString() ?? '') ?? 24;
        });
      }
    } catch (_) {
      // Keep defaults when a cached/offline session is being displayed.
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      final response = await ref.read(dioProvider).put(ApiEndpoints.settings, data: {
        'notifyBookingConfirmation': _bookingConfirmation,
        'notifyBookingCancellation': _bookingCancellation,
        'notifyVisitCompletion': _visitCompletion,
        'notifyAppointmentReminder': _appointmentReminder,
        'reminderHoursBefore': _reminderHours,
      });
      if (response.data['success'] != true) throw Exception(response.data['error'] ?? 'تعذر حفظ الإعدادات');
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم حفظ إعدادات الإشعارات')));
    } catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.toString())));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('إعدادات الإشعارات'),
          actions: [TextButton(onPressed: _saving ? null : _save, child: _saving ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('حفظ'))],
        ),
        body: _loading
            ? const Center(child: CircularProgressIndicator())
            : ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  _switch('تأكيد الحجز', 'إشعار عند إنشاء أو تأكيد موعد.', _bookingConfirmation, (value) => setState(() => _bookingConfirmation = value)),
                  _switch('إلغاء الحجز', 'إشعار عند إلغاء الموعد.', _bookingCancellation, (value) => setState(() => _bookingCancellation = value)),
                  _switch('اكتمال الزيارة', 'إشعار بعد إنهاء الزيارة.', _visitCompletion, (value) => setState(() => _visitCompletion = value)),
                  _switch('تذكير الموعد', 'إرسال تذكير للمريض قبل الموعد.', _appointmentReminder, (value) => setState(() => _appointmentReminder = value)),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<int>(
                    value: _reminderHours,
                    decoration: const InputDecoration(labelText: 'ساعات التذكير قبل الموعد', border: OutlineInputBorder()),
                    items: const [1, 2, 6, 12, 24, 48, 72].map((hours) => DropdownMenuItem(value: hours, child: Text('$hours ساعة'))).toList(),
                    onChanged: _appointmentReminder ? (value) => setState(() => _reminderHours = value ?? 24) : null,
                  ),
                ],
              ),
      ),
    );
  }

  Widget _switch(String title, String subtitle, bool value, ValueChanged<bool> onChanged) {
    return Card(
      child: SwitchListTile(
        title: Text(title),
        subtitle: Text(subtitle),
        value: value,
        onChanged: onChanged,
      ),
    );
  }
}
