import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'hive_service.dart';
import '../../features/auth/providers/auth_provider.dart';

final syncManagerProvider = Provider<SyncManager>((ref) {
  final dio = ref.watch(dioProvider);
  final manager = SyncManager(dio);
  ref.onDispose(() {
    manager.dispose();
  });
  return manager;
});

class SyncManager {
  final Dio _dio;
  late StreamSubscription<List<ConnectivityResult>> _connectivitySubscription;
  bool _isSyncing = false;

  SyncManager(this._dio) {
    _initConnectivityListener();
  }

  void _initConnectivityListener() {
    _connectivitySubscription = Connectivity().onConnectivityChanged.listen((results) {
      if (results.contains(ConnectivityResult.mobile) || results.contains(ConnectivityResult.wifi)) {
        syncPendingActions();
      }
    });
  }

  Future<void> syncPendingActions() async {
    if (_isSyncing) return;
    _isSyncing = true;

    try {
      final box = HiveService.getPendingActionsBox();
      final keys = box.keys.toList();

      for (final key in keys) {
        final action = box.get(key);
        if (action == null) continue;

        try {
          if (action.type == 'CREATE_PATIENT') {
            await _dio.post('/patients', data: action.data);
            await box.delete(key);
          }
          // Add other actions here if needed
        } catch (e) {
          debugPrint('Failed to sync action ${action.id}: $e');
        }
      }
    } finally {
      _isSyncing = false;
    }
  }

  void dispose() {
    _connectivitySubscription.cancel();
  }
}
