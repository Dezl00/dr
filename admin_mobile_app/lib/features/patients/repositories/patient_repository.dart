import 'package:dio/dio.dart';
import '../../../core/api/api_endpoints.dart';
import '../models/patient.dart';

class PatientRepository {
  final Dio _dio;

  PatientRepository(this._dio);

  Future<PaginatedPatients> getPatients({
    int page = 1,
    int limit = 20,
    String searchQuery = '',
  }) async {
    try {
      final response = await _dio.get(
        ApiEndpoints.patients,
        queryParameters: {
          'page': page,
          'limit': limit,
          if (searchQuery.isNotEmpty) 'search': searchQuery,
        },
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        return PaginatedPatients.fromJson(response.data);
      } else {
        throw Exception(response.data['error'] ?? 'Failed to fetch patients');
      }
    } on DioException catch (e) {
      throw Exception(e.response?.data?['error'] ?? e.message ?? 'Network error occurred');
    }
  }

  Future<Patient> createPatient(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.patients,
        data: data,
      );

      if (response.statusCode == 201 && response.data['success'] == true) {
        return Patient.fromJson(response.data['data']);
      } else {
        throw Exception(response.data['error'] ?? 'Failed to create patient');
      }
    } on DioException catch (e) {
      throw Exception(e.response?.data?['error'] ?? e.message ?? 'Network error occurred');
    }
  }

  Future<Patient> updatePatient(String id, Map<String, dynamic> data) async {
    try {
      final response = await _dio.put(
        '${ApiEndpoints.patients}/$id',
        data: data,
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        return Patient.fromJson(response.data['data']);
      } else {
        throw Exception(response.data['error'] ?? 'Failed to update patient');
      }
    } on DioException catch (e) {
      throw Exception(e.response?.data?['error'] ?? e.message ?? 'Network error occurred');
    }
  }
}

