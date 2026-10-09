import 'package:flutter/foundation.dart';

class ApiEndpoints {
  // Local Server for testing
  static const String baseUrl = 'http://localhost:3000/api/v1';

  // Auth
  static const String login = '/auth/login';
  
  // Dashboard
  static const String stats = '/dashboard/stats';
  
  // Patients
  static const String patients = '/patients';
  
  // Appointments
  static const String appointments = '/appointments';
  
  // Invoices
  static const String invoices = '/invoices';
  
  // Expenses
  static const String expenses = '/financials/expenses';
  
  // Phase 3 Endpoints
  static const String team = '/team';
  static const String services = '/services';
  static const String leads = '/crm/leads';
  static const String inventory = '/inventory/items';
}
