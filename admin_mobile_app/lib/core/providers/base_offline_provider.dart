import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../offline/hive_service.dart';
import '../offline/pending_action.dart';

class OfflineState<T> {
  final bool isLoading;
  final bool isFetchingMore;
  final List<T> items;
  final String? error;
  final int currentPage;
  final bool hasReachedMax;
  final String searchQuery;

  OfflineState({
    this.isLoading = false,
    this.isFetchingMore = false,
    this.items = const [],
    this.error,
    this.currentPage = 1,
    this.hasReachedMax = false,
    this.searchQuery = '',
  });

  OfflineState<T> copyWith({
    bool? isLoading,
    bool? isFetchingMore,
    List<T>? items,
    String? error,
    int? currentPage,
    bool? hasReachedMax,
    String? searchQuery,
  }) {
    return OfflineState<T>(
      isLoading: isLoading ?? this.isLoading,
      isFetchingMore: isFetchingMore ?? this.isFetchingMore,
      items: items ?? this.items,
      error: error,
      currentPage: currentPage ?? this.currentPage,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      searchQuery: searchQuery ?? this.searchQuery,
    );
  }
}

abstract class BaseOfflineNotifier<T> extends StateNotifier<OfflineState<T>> {
  final Box<T> box;
  final String actionPrefix; // e.g. "PATIENT", "APPOINTMENT"

  BaseOfflineNotifier({
    required this.box,
    required this.actionPrefix,
  }) : super(OfflineState<T>()) {
    loadFromHive();
  }

  void loadFromHive() {
    final cachedItems = box.values.toList();
    if (cachedItems.isNotEmpty) {
      state = state.copyWith(items: cachedItems);
    }
  }

  // --- Abstract Methods to implement in subclasses ---
  Future<Map<String, dynamic>> fetchFromApi({required int page, required String query});
  Future<T> createApi(Map<String, dynamic> data);
  Future<T> updateApi(String id, Map<String, dynamic> data);
  
  T createOfflineModel(String id, Map<String, dynamic> data);
  T updateOfflineModel(T currentItem, Map<String, dynamic> data);
  String getId(T item);
  // ---------------------------------------------------

  Future<void> fetchData({String? query, bool isRefresh = false}) async {
    final searchQuery = query ?? state.searchQuery;
    
    state = state.copyWith(
      isLoading: !isRefresh, 
      error: null, 
      currentPage: 1, 
      hasReachedMax: false,
      searchQuery: searchQuery,
    );

    try {
      final result = await fetchFromApi(page: 1, query: searchQuery);
      final List<T> newItems = result['data'] as List<T>;
      final int totalPages = result['totalPages'] as int;

      if (searchQuery.isEmpty) {
        await box.clear();
        await box.addAll(newItems);
      }

      state = state.copyWith(
        isLoading: false,
        items: newItems,
        hasReachedMax: 1 >= totalPages,
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
      final result = await fetchFromApi(page: nextPage, query: state.searchQuery);
      final List<T> newItems = result['data'] as List<T>;
      final int totalPages = result['totalPages'] as int;

      state = state.copyWith(
        isFetchingMore: false,
        currentPage: nextPage,
        items: [...state.items, ...newItems],
        hasReachedMax: nextPage >= totalPages,
      );
    } catch (e) {
      state = state.copyWith(
        isFetchingMore: false,
        error: e.toString(),
      );
    }
  }

  Future<bool> createItem(Map<String, dynamic> data) async {
    try {
      final newItem = await createApi(data);
      await box.add(newItem);
      state = state.copyWith(items: [newItem, ...state.items]);
      return true;
    } catch (e) {
      final offlineId = 'offline_${DateTime.now().millisecondsSinceEpoch}';
      final offlineItem = createOfflineModel(offlineId, data);
      
      await box.add(offlineItem);

      final pendingBox = HiveService.getPendingActionsBox();
      final pendingAction = PendingAction(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        type: 'CREATE_$actionPrefix',
        data: data,
      );
      await pendingBox.add(pendingAction);

      state = state.copyWith(items: [offlineItem, ...state.items]);
      return true;
    }
  }

  Future<bool> updateItem(String id, Map<String, dynamic> data) async {
    try {
      final updatedItem = await updateApi(id, data);
      final key = box.keys.firstWhere((k) => getId(box.get(k)!) == id, orElse: () => null);
      if (key != null) {
        await box.put(key, updatedItem);
      } else {
        await box.add(updatedItem);
      }

      state = state.copyWith(
        items: state.items.map((i) => getId(i) == id ? updatedItem : i).toList(),
      );
      return true;
    } catch (e) {
      final key = box.keys.firstWhere((k) => getId(box.get(k)!) == id, orElse: () => null);
      final currentItem = key != null ? box.get(key) : state.items.firstWhere((i) => getId(i) == id);
      
      if (currentItem != null) {
        final offlineItem = updateOfflineModel(currentItem, data);
        if (key != null) {
          await box.put(key, offlineItem);
        } else {
          await box.add(offlineItem);
        }

        final pendingBox = HiveService.getPendingActionsBox();
        final pendingAction = PendingAction(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          type: 'UPDATE_$actionPrefix',
          data: {...data, 'id': id},
        );
        await pendingBox.add(pendingAction);

        state = state.copyWith(
          items: state.items.map((i) => getId(i) == id ? offlineItem : i).toList(),
        );
      }
      return true;
    }
  }
}
