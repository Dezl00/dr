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
    throw UnimplementedError('createInvoice not implemented in API');
  }

  @override
  Future<Invoice> updateApi(String id, Map<String, dynamic> data) async {
    throw UnimplementedError('updateInvoice not implemented in API');
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
    throw UnimplementedError('Update invoice not implemented offline');
  }

  @override
  String getId(Invoice item) => item.id;
}
