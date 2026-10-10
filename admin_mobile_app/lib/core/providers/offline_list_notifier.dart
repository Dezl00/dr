import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:dio/dio.dart';

class OfflineListNotifier extends StateNotifier<List<dynamic>> {
  final Box<String> box;
  final String endpoint;
  final Dio dio;

  OfflineListNotifier({
    required this.box,
    required this.endpoint,
    required this.dio,
  }) : super([]) {
    _init();
  }

  void _init() {
    final cachedData = box.get('data');
    if (cachedData != null) {
      try {
        state = jsonDecode(cachedData) as List<dynamic>;
      } catch (e) {
        print('Error decoding cached data for $endpoint: $e');
      }
    }
    // Automatically fetch fresh data from API when provider is first watched
    fetchData();
  }

  Future<void> fetchData() async {
    try {
      final response = await dio.get(endpoint);
      if (response.statusCode == 200) {
        final data = response.data;
        List<dynamic> listData = [];
        if (data is List) {
          listData = data;
        } else if (data is Map && data.containsKey('data')) {
          listData = data['data'] as List<dynamic>;
        }
        
        final jsonString = jsonEncode(listData);
        await box.put('data', jsonString);
        state = listData;
      }
    } catch (e) {
      print('Error fetching data for $endpoint: $e');
    }
  }
}
