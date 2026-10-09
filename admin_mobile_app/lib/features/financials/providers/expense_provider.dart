import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/expense.dart';
import '../repositories/financial_repository.dart';
import '../../../core/offline/hive_service.dart';
import '../../../core/offline/pending_action.dart';

// Reuse the one from invoice_provider or redefine, but Riverpod allows multiple providers
final financialRepositoryProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return FinancialRepository(dio);
});

class ExpenseState {
  final bool isLoading;
  final List<Expense> expenses;
  final String? error;

  ExpenseState({
    this.isLoading = false,
    this.expenses = const [],
    this.error,
  });

  ExpenseState copyWith({
    bool? isLoading,
    List<Expense>? expenses,
    String? error,
  }) {
    return ExpenseState(
      isLoading: isLoading ?? this.isLoading,
      expenses: expenses ?? this.expenses,
      error: error,
    );
  }
}

final expenseStateProvider = StateNotifierProvider<ExpenseNotifier, ExpenseState>((ref) {
  return ExpenseNotifier(ref.read(financialRepositoryProvider));
});

class ExpenseNotifier extends StateNotifier<ExpenseState> {
  final FinancialRepository _repository;

  ExpenseNotifier(this._repository) : super(ExpenseState()) {
    _loadFromHive();
    fetchData();
  }

  void _loadFromHive() {
    final box = HiveService.getExpensesBox();
    final cachedData = box.values.toList();
    if (cachedData.isNotEmpty) {
      state = state.copyWith(expenses: cachedData);
    }
  }

  Future<void> fetchData() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final result = await _repository.getExpenses(limit: 100);
      
      final mappedExpenses = result.map((e) => Expense.fromJson(e as Map<String, dynamic>)).toList();

      final box = HiveService.getExpensesBox();
      await box.clear();
      await box.addAll(mappedExpenses);

      state = state.copyWith(
        isLoading: false,
        expenses: mappedExpenses,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<bool> createExpense(Map<String, dynamic> data) async {
    try {
      final newExpenseData = await _repository.createExpense(data);
      final newExpense = Expense.fromJson(newExpenseData as Map<String, dynamic>);
      
      final box = HiveService.getExpensesBox();
      await box.add(newExpense);

      state = state.copyWith(
        expenses: [newExpense, ...state.expenses],
      );
      return true;
    } catch (e) {
      final offlineId = 'offline_${DateTime.now().millisecondsSinceEpoch}';
      
      final offlineExpense = Expense(
        id: offlineId,
        category: data['category']?.toString() ?? 'OTHER',
        amount: double.tryParse(data['amount']?.toString() ?? '0') ?? 0.0,
        description: data['description']?.toString() ?? '',
        expenseDate: data['expenseDate'] != null ? DateTime.tryParse(data['expenseDate'].toString()) ?? DateTime.now() : DateTime.now(),
      );
      
      final box = HiveService.getExpensesBox();
      await box.add(offlineExpense);

      final pendingBox = HiveService.getPendingActionsBox();
      final pendingAction = PendingAction(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        type: 'CREATE_EXPENSE',
        data: data,
      );
      await pendingBox.add(pendingAction);

      state = state.copyWith(
        expenses: [offlineExpense, ...state.expenses],
      );
      return true;
    }
  }
}
