import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/appointment.dart';
import '../repositories/appointment_repository.dart';
import '../../../core/offline/hive_service.dart';
import '../../../core/offline/pending_action.dart';

import '../../../core/providers/base_offline_provider.dart';

final appointmentRepositoryProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return AppointmentRepository(dio);
});

final selectedDateProvider = StateProvider<DateTime>((ref) {
  final now = DateTime.now();
  return DateTime(now.year, now.month, now.day);
});

final appointmentStateProvider = StateNotifierProvider<AppointmentNotifier, OfflineState<Appointment>>((ref) {
  return AppointmentNotifier(ref.read(appointmentRepositoryProvider));
});

class AppointmentNotifier extends BaseOfflineNotifier<Appointment> {
  final AppointmentRepository _repository;

  AppointmentNotifier(this._repository)
      : super(
          box: HiveService.getAppointmentsBox(),
          actionPrefix: 'APPOINTMENT',
        ) {
    fetchData();
  }

  @override
  Future<Map<String, dynamic>> fetchFromApi({required int page, required String query}) async {
    final result = await _repository.getAppointments();
    return {
      'data': result,
      'totalPages': 1,
    };
  }

  @override
  Future<Appointment> createApi(Map<String, dynamic> data) async {
    return await _repository.createAppointment(data);
  }

  @override
  Future<Appointment> updateApi(String id, Map<String, dynamic> data) async {
    // Note: If update is not yet implemented in repository, throw unhandled
    throw UnimplementedError('Update appointment not implemented in API');
  }

  @override
  Appointment createOfflineModel(String id, Map<String, dynamic> data) {
    return Appointment(
      id: id,
      patientId: data['patientId']?.toString() ?? '',
      patientName: data['patientName']?.toString() ?? 'بدون اسم',
      patientPhone: data['patientPhone']?.toString() ?? 'بدون هاتف',
      doctorId: data['doctorId']?.toString() ?? '',
      doctorName: data['doctorName']?.toString() ?? '',
      date: DateTime.parse(data['date'] ?? DateTime.now().toIso8601String()),
      startTime: data['startTime']?.toString() ?? '00:00',
      endTime: data['endTime']?.toString(),
      status: 'SCHEDULED',
      notes: data['notes']?.toString(),
      serviceId: data['serviceId']?.toString(),
      serviceName: data['serviceName']?.toString(),
    );
  }

  @override
  Appointment updateOfflineModel(Appointment currentItem, Map<String, dynamic> data) {
    throw UnimplementedError('Update appointment not implemented offline');
  }

  @override
  String getId(Appointment item) => item.id;
}
