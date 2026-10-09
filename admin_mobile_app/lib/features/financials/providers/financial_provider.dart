import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/invoice.dart';
import '../repositories/financial_repository.dart';

final financialRepositoryProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return FinancialRepository(dio);
});

final invoiceStateProvider = StateNotifierProvider<InvoiceNotifier, InvoiceState>((ref) {
  return InvoiceNotifier(ref.read(financialRepositoryProvider));
});

class InvoiceState {
  final bool isLoading;
  final bool isFetchingMore;
  final List<Invoice> invoices;
  final String? error;
  final int currentPage;
  final bool hasReachedMax;
  final String statusFilter;

  InvoiceState({
    this.isLoading = false,
    this.isFetchingMore = false,
    this.invoices = const [],
    this.error,
    this.currentPage = 1,
    this.hasReachedMax = false,
    this.statusFilter = 'ALL',
  });

  InvoiceState copyWith({
    bool? isLoading,
    bool? isFetchingMore,
    List<Invoice>? invoices,
    String? error,
    int? currentPage,
    bool? hasReachedMax,
    String? statusFilter,
  }) {
    return InvoiceState(
      isLoading: isLoading ?? this.isLoading,
      isFetchingMore: isFetchingMore ?? this.isFetchingMore,
      invoices: invoices ?? this.invoices,
      error: error,
      currentPage: currentPage ?? this.currentPage,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      statusFilter: statusFilter ?? this.statusFilter,
    );
  }
}

class InvoiceNotifier extends StateNotifier<InvoiceState> {
  final FinancialRepository _repository;
  static const int _limit = 20;

  InvoiceNotifier(this._repository) : super(InvoiceState()) {
    fetchInitialInvoices();
  }

  Future<void> fetchInitialInvoices({String? status}) async {
    final filter = status ?? state.statusFilter;
    
    state = state.copyWith(
      isLoading: true, 
      error: null, 
      currentPage: 1, 
      hasReachedMax: false,
      statusFilter: filter,
      invoices: [],
    );

    try {
      final result = await _repository.getInvoices(
        page: 1,
        limit: _limit,
        status: filter,
      );

      // Simple logic since backend didn't return totalPages directly in the API we wrote initially for invoices
      // We assume reached max if data length is less than limit
      final reachedMax = result.data.length < _limit;

      state = state.copyWith(
        isLoading: false,
        invoices: result.data,
        hasReachedMax: reachedMax,
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
      final result = await _repository.getInvoices(
        page: nextPage,
        limit: _limit,
        status: state.statusFilter,
      );

      final reachedMax = result.data.length < _limit;

      state = state.copyWith(
        isFetchingMore: false,
        currentPage: nextPage,
        invoices: [...state.invoices, ...result.data],
        hasReachedMax: reachedMax,
      );
    } catch (e) {
      state = state.copyWith(
        isFetchingMore: false,
        error: e.toString(),
      );
    }
  }
}
