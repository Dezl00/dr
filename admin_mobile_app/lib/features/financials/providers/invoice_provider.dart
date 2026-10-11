import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/invoice.dart';
import '../repositories/financial_repository.dart';
import '../../../core/offline/hive_service.dart';
import '../../../core/offline/pending_action.dart';

import '../../../core/providers/base_offline_provider.dart';

final financialRepositoryProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return FinancialRepository(dio);
});

final invoiceStateProvider = StateNotifierProvider<InvoiceNotifier, OfflineState<Invoice>>((ref) {
  return InvoiceNotifier(ref.read(financialRepositoryProvider));
});

class InvoiceNotifier extends BaseOfflineNotifier<Invoice> {
  final FinancialRepository _repository;

  InvoiceNotifier(this._repository)
      : super(
          box: HiveService.getInvoicesBox(),
          actionPrefix: 'INVOICE',
        ) {
    fetchData();
  }

  @override
  Future<Map<String, dynamic>> fetchFromApi({required int page, required String query}) async {
    final result = await _repository.getInvoices(limit: 100);
    return {
      'data': result.data,
      'totalPages': 1,
    };
  }

  @override
  Future<Invoice> createApi(Map<String, dynamic> data) async {
    return _repository.createInvoice(data);
  }

  @override
  Future<Invoice> updateApi(String id, Map<String, dynamic> data) async {
    return _repository.updateInvoice(id, data);
  }

  @override
  Future<bool> createItem(Map<String, dynamic> data) async {
    try {
      final invoice = await createApi(data);
      await box.add(invoice);
      state = state.copyWith(items: [invoice, ...state.items]);
      return true;
    } catch (error) {
      state = state.copyWith(error: error.toString());
      return false;
    }
  }

  @override
  Invoice createOfflineModel(String id, Map<String, dynamic> data) {
    return Invoice(
      id: id,
      patientName: data['patientName']?.toString() ?? 'بدون اسم',
      status: data['status']?.toString() ?? 'DRAFT',
      total: double.tryParse(data['total']?.toString() ?? '0') ?? 0.0,
      subtotal: double.tryParse(data['subtotal']?.toString() ?? '0') ?? 0.0,
      issueDate: DateTime.now(),
      dueDate: data['dueDate'] != null ? DateTime.tryParse(data['dueDate'].toString()) : null,
    );
  }

  @override
  Invoice updateOfflineModel(Invoice currentItem, Map<String, dynamic> data) {
    return Invoice(
      id: currentItem.id,
      invoiceNumber: currentItem.invoiceNumber,
      patientName: data['patientName']?.toString() ?? currentItem.patientName,
      status: data['status']?.toString() ?? currentItem.status,
      total: double.tryParse(data['total']?.toString() ?? '') ?? currentItem.total,
      subtotal: currentItem.subtotal,
      discount: double.tryParse(data['discount']?.toString() ?? '') ?? currentItem.discount,
      tax: double.tryParse(data['tax']?.toString() ?? '') ?? currentItem.tax,
      issueDate: currentItem.issueDate,
      dueDate: data.containsKey('dueDate') ? DateTime.tryParse(data['dueDate']?.toString() ?? '') : currentItem.dueDate,
    );
  }

  @override
  String getId(Invoice item) => item.id;
}
