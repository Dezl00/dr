import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/patient.dart';
import '../repositories/patient_repository.dart';
import '../../../core/offline/hive_service.dart';
import '../../../core/offline/pending_action.dart';

import '../../../core/providers/base_offline_provider.dart';

final patientRepositoryProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return PatientRepository(dio);
});

final patientStateProvider = StateNotifierProvider<PatientNotifier, OfflineState<Patient>>((ref) {
  return PatientNotifier(ref.read(patientRepositoryProvider));
});

class PatientNotifier extends BaseOfflineNotifier<Patient> {
  final PatientRepository _repository;
  static const int _limit = 20;

  PatientNotifier(this._repository)
      : super(
          box: HiveService.getPatientsBox(),
          actionPrefix: 'PATIENT',
        ) {
    fetchData(); // Changed from fetchInitialPatients
  }

  @override
  Future<Map<String, dynamic>> fetchFromApi({required int page, required String query}) async {
    final result = await _repository.getPatients(page: page, limit: _limit, searchQuery: query);
    return {
      'data': result.data,
      'totalPages': result.totalPages,
    };
  }

  @override
  Future<Patient> createApi(Map<String, dynamic> data) async {
    return await _repository.createPatient(data);
  }

  @override
  Future<Patient> updateApi(String id, Map<String, dynamic> data) async {
    return await _repository.updatePatient(id, data);
  }

  @override
  Patient createOfflineModel(String id, Map<String, dynamic> data) {
    return Patient(
      id: id,
      fullName: data['fullName']?.toString() ?? 'بدون اسم',
      phone: data['phone']?.toString() ?? 'بدون هاتف',
      gender: data['gender']?.toString(),
      dateOfBirth: data['dateOfBirth'] != null ? DateTime.tryParse(data['dateOfBirth'].toString()) : null,
    );
  }

  @override
  Patient updateOfflineModel(Patient currentItem, Map<String, dynamic> data) {
    return Patient(
      id: currentItem.id,
      fullName: data['fullName']?.toString() ?? currentItem.fullName,
      phone: data['phone']?.toString() ?? currentItem.phone,
      gender: data['gender']?.toString() ?? currentItem.gender,
      dateOfBirth: data['dateOfBirth'] != null ? DateTime.tryParse(data['dateOfBirth'].toString()) : currentItem.dateOfBirth,
      appointmentsCount: currentItem.appointmentsCount,
      unpaidInvoicesCount: currentItem.unpaidInvoicesCount,
    );
  }

  @override
  String getId(Patient item) => item.id;
}
