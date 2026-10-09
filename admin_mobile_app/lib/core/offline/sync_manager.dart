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

  String _getEndpoint(String type) {
    final parts = type.split('_');
    if (parts.length >= 2) {
      final entity = parts.sublist(1).join('_').toLowerCase();
      if (entity.endsWith('y')) {
        return '/${entity.substring(0, entity.length - 1)}ies';
      }
      return '/${entity}s';
    }
    return '/';
  }

  bool _replaceIdInMap(Map<String, dynamic> data, String oldId, String newId) {
    bool changed = false;
    for (final key in data.keys.toList()) {
      if (data[key] == oldId) {
        data[key] = newId;
        changed = true;
      } else if (data[key] is Map) {
        final Map<String, dynamic> subMap = Map<String, dynamic>.from(data[key]);
        if (_replaceIdInMap(subMap, oldId, newId)) {
          data[key] = subMap;
          changed = true;
        }
      } else if (data[key] is List) {
        final List list = List.from(data[key]);
        for (int i = 0; i < list.length; i++) {
          if (list[i] == oldId) {
            list[i] = newId;
            changed = true;
          } else if (list[i] is Map) {
            final Map<String, dynamic> subMap = Map<String, dynamic>.from(list[i]);
            if (_replaceIdInMap(subMap, oldId, newId)) {
              list[i] = subMap;
              changed = true;
            }
          }
        }
        if (changed) {
          data[key] = list;
        }
      }
    }
    return changed;
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

        if (action.retryCount >= 3) {
          continue; // Skip if failed 3 times
        }

        try {
          String method;
          if (action.type.startsWith('CREATE_')) {
            method = 'POST';
          } else if (action.type.startsWith('UPDATE_')) {
            method = 'PUT';
          } else if (action.type.startsWith('DELETE_')) {
            method = 'DELETE';
          } else {
            await box.delete(key);
            continue;
          }

          String endpoint = _getEndpoint(action.type);
          String url = endpoint;
          if (method == 'PUT' || method == 'DELETE') {
            final id = action.data['id'];
            if (id != null) {
              url = '$endpoint/$id';
            }
          }

          Response response;
          if (method == 'POST') {
            response = await _dio.post(url, data: action.data);
          } else if (method == 'PUT') {
            response = await _dio.put(url, data: action.data);
          } else {
            response = await _dio.delete(url, data: action.data);
          }

          // Handle Advanced ID Resolution for CREATE actions
          if (method == 'POST' && response.statusCode != null && response.statusCode! >= 200 && response.statusCode! < 300) {
            final responseData = response.data;
            if (responseData != null && responseData['data'] != null && responseData['data']['id'] != null) {
              final realServerId = responseData['data']['id'].toString();
              final offlineId = action.data['id']?.toString();
              
              if (offlineId != null && offlineId != realServerId) {
                // Scan the pending actions box and replace any occurrences of offlineId with realServerId
                final allKeys = box.keys.toList();
                for (final scanKey in allKeys) {
                  final scanAction = box.get(scanKey);
                  if (scanAction != null) {
                    bool changed = _replaceIdInMap(scanAction.data, offlineId, realServerId);
                    if (changed) {
                      await box.put(scanKey, scanAction);
                    }
                  }
                }
              }
            }
          }

          await box.delete(key);
        } catch (e) {
          debugPrint('Failed to sync action ${action.id}: $e');
          action.retryCount += 1;
          action.errorMessage = e.toString();
          await box.put(key, action);
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
