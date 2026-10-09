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
  }) async {
    try {
      final response = await _dio.get(
        ApiEndpoints.invoices,
        queryParameters: {
          'page': page,
          'limit': limit,
          if (status != null && status.isNotEmpty && status != 'ALL') 'status': status,
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
}

