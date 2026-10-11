import 'package:dio/dio.dart';
import '../../../core/api/api_endpoints.dart';
import '../models/invoice.dart';

class FinancialRepository {
  final Dio _dio;

  FinancialRepository(this._dio);

  Future<PaginatedInvoices> getInvoices({
    int page = 1,
    int limit = 20,
    String? status,
    String? patientId,
  }) async {
    try {
      final response = await _dio.get(
        ApiEndpoints.invoices,
        queryParameters: {
          'page': page,
          'limit': limit,
          if (status != null && status.isNotEmpty && status != 'ALL') 'status': status,
          if (patientId != null && patientId.isNotEmpty) 'patientId': patientId,
        },
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        return PaginatedInvoices.fromJson(response.data);
      } else {
        throw Exception(response.data['error'] ?? 'Failed to fetch invoices');
      }
    } on DioException catch (e) {
      throw Exception(e.response?.data?['error'] ?? e.message ?? 'Network error occurred');
    }
  }

  Future<List<dynamic>> getExpenses({int page = 1, int limit = 20}) async {
    try {
      final response = await _dio.get(
        ApiEndpoints.expenses,
        queryParameters: {'page': page, 'limit': limit},
      );
      if (response.statusCode == 200 && response.data['success'] == true) {
        return response.data['data'];
      }
      throw Exception(response.data['error'] ?? 'Failed to fetch expenses');
    } on DioException catch (e) {
      throw Exception(e.response?.data?['error'] ?? e.message ?? 'Network error occurred');
    }
  }

  Future<Invoice> createInvoice(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post(ApiEndpoints.invoices, data: data);
      if (response.statusCode == 201 && response.data['success'] == true) {
        return Invoice.fromJson(Map<String, dynamic>.from(response.data['data'] as Map));
      }
      throw Exception(response.data['error'] ?? 'Failed to create invoice');
    } on DioException catch (e) {
      throw Exception(e.response?.data?['error'] ?? e.message ?? 'Network error occurred');
    }
  }

  Future<Invoice> updateInvoice(String id, Map<String, dynamic> data) async {
    try {
      final response = await _dio.patch('${ApiEndpoints.invoices}/$id', data: data);
      if (response.statusCode == 200 && response.data['success'] == true) {
        return Invoice.fromJson(Map<String, dynamic>.from(response.data['data'] as Map));
      }
      throw Exception(response.data['error'] ?? 'Failed to update invoice');
    } on DioException catch (e) {
      throw Exception(e.response?.data?['error'] ?? e.message ?? 'Network error occurred');
    }
  }

  Future<dynamic> createExpense(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post(ApiEndpoints.expenses, data: data);
      if (response.statusCode == 201 && response.data['success'] == true) {
        return response.data['data'];
      }
      throw Exception(response.data['error'] ?? 'Failed to create expense');
    } on DioException catch (e) {
      throw Exception(e.response?.data?['error'] ?? e.message ?? 'Network error occurred');
    }
  }

  Future<dynamic> updateExpense(String id, Map<String, dynamic> data) async {
    try {
      final response = await _dio.patch('${ApiEndpoints.expenses}/$id', data: data);
      if (response.statusCode == 200 && response.data['success'] == true) return response.data['data'];
      throw Exception(response.data['error'] ?? 'Failed to update expense');
    } on DioException catch (e) {
      throw Exception(e.response?.data?['error'] ?? e.message ?? 'Network error occurred');
    }
  }

  Future<void> deleteExpense(String id) async {
    try {
      final response = await _dio.delete('${ApiEndpoints.expenses}/$id');
      if (response.statusCode != 200 || response.data['success'] != true) throw Exception(response.data['error'] ?? 'Failed to delete expense');
    } on DioException catch (e) {
      throw Exception(e.response?.data?['error'] ?? e.message ?? 'Network error occurred');
    }
  }
}

