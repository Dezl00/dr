import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/patient.dart';
import '../repositories/patient_repository.dart';
import '../../../core/offline/hive_service.dart';
import '../../../core/offline/pending_action.dart';

final patientRepositoryProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return PatientRepository(dio);
});

final patientStateProvider = StateNotifierProvider<PatientNotifier, PatientState>((ref) {
  return PatientNotifier(ref.read(patientRepositoryProvider));
});

class PatientState {
  final bool isLoading;
  final bool isFetchingMore;
  final List<Patient> patients;
  final String? error;
  final int currentPage;
  final bool hasReachedMax;
  final String searchQuery;

  PatientState({
    this.isLoading = false,
    this.isFetchingMore = false,
    this.patients = const [],
    this.error,
    this.currentPage = 1,
    this.hasReachedMax = false,
    this.searchQuery = '',
  });

  PatientState copyWith({
    bool? isLoading,
    bool? isFetchingMore,
    List<Patient>? patients,
    String? error,
    int? currentPage,
    bool? hasReachedMax,
    String? searchQuery,
  }) {
    return PatientState(
      isLoading: isLoading ?? this.isLoading,
      isFetchingMore: isFetchingMore ?? this.isFetchingMore,
      patients: patients ?? this.patients,
      error: error,
      currentPage: currentPage ?? this.currentPage,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      searchQuery: searchQuery ?? this.searchQuery,
    );
  }
}

class PatientNotifier extends StateNotifier<PatientState> {
  final PatientRepository _repository;
  static const int _limit = 20;

  PatientNotifier(this._repository) : super(PatientState()) {
    _loadFromHive();
    fetchInitialPatients();
  }

  void _loadFromHive() {
    final box = HiveService.getPatientsBox();
    final cachedPatients = box.values.toList();
    if (cachedPatients.isNotEmpty) {
      state = state.copyWith(
        patients: cachedPatients,
      );
    }
  }

  Future<void> fetchInitialPatients({String? query}) async {
    final searchQuery = query ?? state.searchQuery;
    
    state = state.copyWith(
      isLoading: true, 
      error: null, 
      currentPage: 1, 
      hasReachedMax: false,
      searchQuery: searchQuery,
      // We don't clear patients here immediately to keep showing cached data
    );

    try {
      final result = await _repository.getPatients(
        page: 1,
        limit: _limit,
        searchQuery: searchQuery,
      );

      // Update Hive Cache (only for first page without query)
      if (searchQuery.isEmpty) {
        final box = HiveService.getPatientsBox();
        await box.clear();
        await box.addAll(result.data);
      }

      state = state.copyWith(
        isLoading: false,
        patients: result.data,
        hasReachedMax: result.page >= result.totalPages,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> fetchNextPage() async {
    if (state.hasReachedMax || state.isFetchingMore || state.isLoading) return;

    state = state.copyWith(isFetchingMore: true, error: null);

    try {
      final nextPage = state.currentPage + 1;
      final result = await _repository.getPatients(
        page: nextPage,
        limit: _limit,
        searchQuery: state.searchQuery,
      );

      state = state.copyWith(
        isFetchingMore: false,
        currentPage: nextPage,
        patients: [...state.patients, ...result.data],
        hasReachedMax: result.page >= result.totalPages,
      );
    } catch (e) {
      state = state.copyWith(
        isFetchingMore: false,
        error: e.toString(),
      );
    }
  }

  Future<bool> createPatient(Map<String, dynamic> data) async {
    try {
      final newPatient = await _repository.createPatient(data);
      
      final box = HiveService.getPatientsBox();
      await box.add(newPatient);

      state = state.copyWith(
        patients: [newPatient, ...state.patients],
      );
      return true;
    } catch (e) {
      // Offline fallback: Optimistic update
      final offlineId = 'offline_${DateTime.now().millisecondsSinceEpoch}';
      final offlinePatient = Patient(
        id: offlineId,
        fullName: data['fullName']?.toString() ?? 'بدون اسم',
        phone: data['phone']?.toString() ?? 'بدون هاتف',
        gender: data['gender']?.toString(),
        dateOfBirth: data['dateOfBirth'] != null ? DateTime.tryParse(data['dateOfBirth'].toString()) : null,
      );
      
      final patientsBox = HiveService.getPatientsBox();
      await patientsBox.add(offlinePatient);

      final pendingBox = HiveService.getPendingActionsBox();
      final pendingAction = PendingAction(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        type: 'CREATE_PATIENT',
        data: data,
      );
      await pendingBox.add(pendingAction);

      state = state.copyWith(
        patients: [offlinePatient, ...state.patients],
      );
      return true;
    }
  }
}
