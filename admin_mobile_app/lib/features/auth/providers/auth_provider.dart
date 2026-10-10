import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:dio/dio.dart';
import '../../../core/api/dio_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/services/notification_service.dart';

import 'package:flutter_native_splash/flutter_native_splash.dart';

final dioProvider = Provider((ref) => DioClient().dio);

final authStateProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(dioProvider));
});

class AuthState {
  final bool isCheckingAuth;
  final bool isLoading;
  final bool isAuthenticated;
  final String? error;
  final bool requireClinicSelection;
  final List<dynamic> availableClinics;
  final String? tempEmail;
  final String? tempPassword;
  final Map<String, dynamic>? user;
  final Map<String, dynamic>? clinic;

  AuthState({
    this.isCheckingAuth = true,
    this.isLoading = false, 
    this.isAuthenticated = false, 
    this.error,
    this.requireClinicSelection = false,
    this.availableClinics = const [],
    this.tempEmail,
    this.tempPassword,
    this.user,
    this.clinic,
  });

  AuthState copyWith({
    bool? isCheckingAuth,
    bool? isLoading, 
    bool? isAuthenticated, 
    String? error,
    bool? requireClinicSelection,
    List<dynamic>? availableClinics,
    String? tempEmail,
    String? tempPassword,
    Map<String, dynamic>? user,
    Map<String, dynamic>? clinic,
  }) {
    return AuthState(
      isCheckingAuth: isCheckingAuth ?? this.isCheckingAuth,
      isLoading: isLoading ?? this.isLoading,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      error: error,
      requireClinicSelection: requireClinicSelection ?? this.requireClinicSelection,
      availableClinics: availableClinics ?? this.availableClinics,
      tempEmail: tempEmail ?? this.tempEmail,
      tempPassword: tempPassword ?? this.tempPassword,
      user: user ?? this.user,
      clinic: clinic ?? this.clinic,
    );
  }
}


class AuthNotifier extends StateNotifier<AuthState> {
  final _dio;
  final _storage = const FlutterSecureStorage();

  AuthNotifier(this._dio) : super(AuthState()) {
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    // Artificial delay to show custom splash screen
    await Future.delayed(const Duration(milliseconds: 1500));
    final token = await _storage.read(key: 'jwt_token');
    if (token != null) {
      state = state.copyWith(isCheckingAuth: false, isAuthenticated: true);
      _registerDeviceToken();
    } else {
      state = state.copyWith(isCheckingAuth: false, isAuthenticated: false);
    }
    
    // Safely remove splash screen
    try {
      FlutterNativeSplash.remove();
    } catch (_) {}
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _dio.post(
        ApiEndpoints.login,
        data: {'email': email, 'password': password},
      );

      if (response.data['success'] == true) {
        if (response.data['token'] != null) {
          await _storage.write(key: 'jwt_token', value: response.data['token']);
          state = state.copyWith(isLoading: false, isAuthenticated: true);
          _registerDeviceToken();
        } else if (response.data['requireClinicSelection'] == true) {
          state = state.copyWith(
            isLoading: false,
            requireClinicSelection: true,
            availableClinics: response.data['clinics'] as List<dynamic>,
            tempEmail: email,
            tempPassword: password,
          );
        }
      }
    } on DioException catch (e) {
      String errMsg = 'بيانات الدخول غير صحيحة';
      if (e.response?.data != null && e.response?.data is Map && e.response?.data['error'] != null) {
        errMsg = e.response?.data['error'];
      } else {
        errMsg = e.message ?? e.toString();
      }
      state = state.copyWith(isLoading: false, error: errMsg);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> loginWithClinic(String clinicId) async {
    if (state.tempEmail == null || state.tempPassword == null) return;
    
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _dio.post(
        ApiEndpoints.login,
        data: {
          'email': state.tempEmail,
          'password': state.tempPassword,
          'clinicId': clinicId,
        },
      );

      if (response.data['success'] == true && response.data['token'] != null) {
        await _storage.write(key: 'jwt_token', value: response.data['token']);
        state = state.copyWith(
          isLoading: false, 
          isAuthenticated: true,
          requireClinicSelection: false,
          tempEmail: null,
          tempPassword: null,
        );
        _registerDeviceToken();
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'حدث خطأ أثناء اختيار العيادة');
    }
  }

  Future<void> _registerDeviceToken() async {
    try {
      // Lazy import to avoid cyclic or early init issues
      final NotificationService notificationService = NotificationService();
      final token = await notificationService.getToken();
      if (token != null) {
        await _dio.put(
          '${ApiEndpoints.baseUrl}/settings/device-token',
          data: {'fcmToken': token},
        );
      }
    } catch (e) {
      print('Failed to register device token: $e');
    }
  }


  Future<void> logout() async {
    await _storage.delete(key: 'jwt_token');
    state = state.copyWith(isAuthenticated: false);
  }
}
