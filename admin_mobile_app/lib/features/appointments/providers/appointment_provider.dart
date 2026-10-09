import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/appointment.dart';
import '../repositories/appointment_repository.dart';
import '../../../core/offline/hive_service.dart';
import '../../../core/offline/pending_action.dart';

final appointmentRepositoryProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return AppointmentRepository(dio);
});

final selectedDateProvider = StateProvider<DateTime>((ref) {
  final now = DateTime.now();
  return DateTime(now.year, now.month, now.day);
});

class AppointmentState {
  final bool isLoading;
  final List<Appointment> appointments;
  final String? error;

  AppointmentState({
    this.isLoading = false,
    this.appointments = const [],
    this.error,
  });

  AppointmentState copyWith({
    bool? isLoading,
    List<Appointment>? appointments,
    String? error,
  }) {
    return AppointmentState(
      isLoading: isLoading ?? this.isLoading,
      appointments: appointments ?? this.appointments,
      error: error,
    );
  }
}

final appointmentStateProvider = StateNotifierProvider<AppointmentNotifier, AppointmentState>((ref) {
  return AppointmentNotifier(ref.read(appointmentRepositoryProvider));
});

class AppointmentNotifier extends StateNotifier<AppointmentState> {
  final AppointmentRepository _repository;

  AppointmentNotifier(this._repository) : super(AppointmentState()) {
    _loadFromHive();
    fetchData();
  }

  void _loadFromHive() {
    final box = HiveService.getAppointmentsBox();
    final cachedData = box.values.toList();
    if (cachedData.isNotEmpty) {
      state = state.copyWith(appointments: cachedData);
    }
  }

  Future<void> fetchData() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final result = await _repository.getAppointments();

      final box = HiveService.getAppointmentsBox();
      await box.clear();
      await box.addAll(result);

      state = state.copyWith(
        isLoading: false,
        appointments: result,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<bool> createAppointment(Map<String, dynamic> data) async {
    try {
      final newAppt = await _repository.createAppointment(data);
      
      final box = HiveService.getAppointmentsBox();
      await box.add(newAppt);

      state = state.copyWith(
        appointments: [newAppt, ...state.appointments],
      );
      return true;
    } catch (e) {
      final offlineId = 'offline_${DateTime.now().millisecondsSinceEpoch}';
      
      final offlineAppt = Appointment(
        id: offlineId,
        patientId: data['patientId']?.toString() ?? '',
        patientName: data['patientName']?.toString() ?? 'بدون اسم',
        patientPhone: data['patientPhone']?.toString() ?? 'بدون هاتف',
        date: DateTime.parse(data['date'] ?? DateTime.now().toIso8601String()),
        startTime: data['startTime']?.toString() ?? '00:00',
        endTime: data['endTime']?.toString(),
        status: 'SCHEDULED',
        notes: data['notes']?.toString(),
        serviceId: data['serviceId']?.toString(),
        serviceName: data['serviceName']?.toString(),
      );
      
      final box = HiveService.getAppointmentsBox();
      await box.add(offlineAppt);

      final pendingBox = HiveService.getPendingActionsBox();
      final pendingAction = PendingAction(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        type: 'CREATE_APPOINTMENT',
        data: data,
      );
      await pendingBox.add(pendingAction);

      state = state.copyWith(
        appointments: [offlineAppt, ...state.appointments],
      );
      return true;
    }
  }
}
