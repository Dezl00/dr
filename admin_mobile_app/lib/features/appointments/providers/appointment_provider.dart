import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/appointment.dart';
import '../repositories/appointment_repository.dart';

final appointmentRepositoryProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return AppointmentRepository(dio);
});

// A provider that holds the currently selected date in the calendar
final selectedDateProvider = StateProvider<DateTime>((ref) {
  final now = DateTime.now();
  return DateTime(now.year, now.month, now.day);
});

final appointmentsFutureProvider = FutureProvider.autoDispose<List<Appointment>>((ref) async {
  final repo = ref.watch(appointmentRepositoryProvider);
  return repo.getAppointments();
});
