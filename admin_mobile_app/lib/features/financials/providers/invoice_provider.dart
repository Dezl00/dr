import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/invoice.dart';
import '../repositories/financial_repository.dart';
import '../../../core/offline/hive_service.dart';
import '../../../core/offline/pending_action.dart';

final financialRepositoryProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return FinancialRepository(dio);
});

class InvoiceState {
  final bool isLoading;
  final List<Invoice> invoices;
  final String? error;

  InvoiceState({
    this.isLoading = false,
    this.invoices = const [],
    this.error,
  });

  InvoiceState copyWith({
    bool? isLoading,
    List<Invoice>? invoices,
    String? error,
  }) {
    return InvoiceState(
      isLoading: isLoading ?? this.isLoading,
      invoices: invoices ?? this.invoices,
      error: error,
    );
  }
}

final invoiceStateProvider = StateNotifierProvider<InvoiceNotifier, InvoiceState>((ref) {
  return InvoiceNotifier(ref.read(financialRepositoryProvider));
});

class InvoiceNotifier extends StateNotifier<InvoiceState> {
  final FinancialRepository _repository;

  InvoiceNotifier(this._repository) : super(InvoiceState()) {
    _loadFromHive();
    fetchData();
  }

  void _loadFromHive() {
    final box = HiveService.getInvoicesBox();
    final cachedData = box.values.toList();
    if (cachedData.isNotEmpty) {
      state = state.copyWith(invoices: cachedData);
    }
  }

  Future<void> fetchData() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final result = await _repository.getInvoices(limit: 100);

      final box = HiveService.getInvoicesBox();
      await box.clear();
      await box.addAll(result.data);

      state = state.copyWith(
        isLoading: false,
        invoices: result.data,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<bool> createInvoice(Map<String, dynamic> data) async {
    try {
      // In a full implementation, you'd have a createInvoice in FinancialRepository.
      // We will pretend we have one or just simulate if missing.
      // final newInvoice = await _repository.createInvoice(data);
      throw Exception('Not implemented in repository yet, using offline fallback');
    } catch (e) {
      final offlineId = 'offline_${DateTime.now().millisecondsSinceEpoch}';
      
      final offlineInvoice = Invoice(
        id: offlineId,
        patientName: data['patientName']?.toString() ?? 'بدون اسم',
        status: data['status']?.toString() ?? 'DRAFT',
        total: double.tryParse(data['total']?.toString() ?? '0') ?? 0.0,
        subtotal: double.tryParse(data['subtotal']?.toString() ?? '0') ?? 0.0,
        issueDate: DateTime.now(),
        dueDate: data['dueDate'] != null ? DateTime.tryParse(data['dueDate'].toString()) : null,
      );
      
      final box = HiveService.getInvoicesBox();
      await box.add(offlineInvoice);

      final pendingBox = HiveService.getPendingActionsBox();
      final pendingAction = PendingAction(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        type: 'CREATE_INVOICE',
        data: data,
      );
      await pendingBox.add(pendingAction);

      state = state.copyWith(
        invoices: [offlineInvoice, ...state.invoices],
      );
      return true;
    }
  }
}
