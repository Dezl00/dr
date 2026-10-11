import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'api_endpoints.dart';

class DioClient {
  late Dio _dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  final Future<void> Function()? onUnauthorized;

  DioClient({this.onUnauthorized}) {
    _dio = Dio(BaseOptions(
      baseUrl: ApiEndpoints.baseUrl,
      connectTimeout: const Duration(seconds: 35),
      receiveTimeout: const Duration(seconds: 35),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Retrieve token from secure storage and inject it
        final token = await _storage.read(key: 'jwt_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (DioException e, handler) async {
        // Handle 401 Unauthorized globally only if the server confirms invalid/expired auth
        if (e.response?.statusCode == 401 && e.requestOptions.headers['Authorization'] != null) {
          final data = e.response?.data;
          final errorMsg = data is Map ? (data['error']?.toString() ?? '') : (data?.toString() ?? '');
          if (errorMsg.contains('token') || errorMsg.contains('inactive') || errorMsg.contains('User not found') || errorMsg.isEmpty) {
            await _storage.delete(key: 'jwt_token');
            await onUnauthorized?.call();
          }
        }
        return handler.next(e);
      },
    ));
  }

  Dio get dio => _dio;
}
