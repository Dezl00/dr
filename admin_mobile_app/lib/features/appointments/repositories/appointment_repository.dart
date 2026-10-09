import 'package:dio/dio.dart';
import '../../../core/api/api_endpoints.dart';
import '../models/appointment.dart';

class AppointmentRepository {
  final Dio _dio;

  AppointmentRepository(this._dio);

  Future<List<Appointment>> getAppointmentsByDate(DateTime date) async {
    try {
      final dateString = "${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}";
      
      final response = await _dio.get(
        ApiEndpoints.appointments,
        queryParameters: {'date': dateString},
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        final List<dynamic> data = response.data['data'];
        return data.map((json) => Appointment.fromJson(json)).toList();
      } else {
        throw Exception(response.data['error'] ?? 'Failed to fetch appointments');
      }
    } on DioException catch (e) {
      throw Exception(e.response?.data?['error'] ?? e.message ?? 'Network error occurred');
    }
  }

  Future<Appointment> createAppointment(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.appointments,
        data: data,
      );

      if (response.statusCode == 201 && response.data['success'] == true) {
        return Appointment.fromJson(response.data['data']);
      } else {
        throw Exception(response.data['error'] ?? 'Failed to create appointment');
      }
    } on DioException catch (e) {
      throw Exception(e.response?.data?['error'] ?? e.message ?? 'Network error occurred');
    }
  }

  Future<bool> updateAppointmentStatus(String id, String status) async {
    try {
      final response = await _dio.patch(
        '${ApiEndpoints.appointments}/$id/status',
        data: {'status': status},
      );
      return response.statusCode == 200 && response.data['success'] == true;
    } on DioException catch (e) {
      throw Exception(e.response?.data?['error'] ?? e.message ?? 'Network error occurred');
    }
  }
}

