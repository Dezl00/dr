import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/expense.dart';
import '../repositories/financial_repository.dart';
import '../../../core/offline/hive_service.dart';
import '../../../core/offline/pending_action.dart';

import '../../../core/providers/base_offline_provider.dart';

// Reuse the one from invoice_provider or redefine, but Riverpod allows multiple providers
final financialRepositoryProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return FinancialRepository(dio);
});

final expenseStateProvider = StateNotifierProvider<ExpenseNotifier, OfflineState<Expense>>((ref) {
  return ExpenseNotifier(ref.read(financialRepositoryProvider));
});

class ExpenseNotifier extends BaseOfflineNotifier<Expense> {
  final FinancialRepository _repository;

  ExpenseNotifier(this._repository)
      : super(
          box: HiveService.getExpensesBox(),
          actionPrefix: 'EXPENSE',
        ) {
    fetchData();
  }

  @override
  Future<Map<String, dynamic>> fetchFromApi({required int page, required String query}) async {
    final result = await _repository.getExpenses(limit: 100);
    final mappedExpenses = result.map((e) => Expense.fromJson(e as Map<String, dynamic>)).toList();
    return {
      'data': mappedExpenses,
      'totalPages': 1,
    };
  }

  @override
  Future<Expense> createApi(Map<String, dynamic> data) async {
    final newExpenseData = await _repository.createExpense(data);
    return Expense.fromJson(newExpenseData as Map<String, dynamic>);
  }

  @override
  Future<Expense> updateApi(String id, Map<String, dynamic> data) async {
    throw UnimplementedError('Update expense not implemented in API');
  }

  @override
  Expense createOfflineModel(String id, Map<String, dynamic> data) {
    return Expense(
      id: id,
      category: data['category']?.toString() ?? 'OTHER',
      amount: double.tryParse(data['amount']?.toString() ?? '0') ?? 0.0,
      description: data['description']?.toString() ?? '',
      expenseDate: data['expenseDate'] != null ? DateTime.tryParse(data['expenseDate'].toString()) ?? DateTime.now() : DateTime.now(),
    );
  }

  @override
  Expense updateOfflineModel(Expense currentItem, Map<String, dynamic> data) {
    throw UnimplementedError('Update expense not implemented offline');
  }

  @override
  String getId(Expense item) => item.id;
}
