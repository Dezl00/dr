import 'package:flutter/foundation.dart';

class ApiEndpoints {
  // Production Server
  static const String baseUrl = 'https://www.beyoondgroup.com/api/v1';

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
  static const String inventory = '/inventory';
  
  // Settings
  static const String settings = '/settings';
  static const String profileSettings = '/settings/profile';
}
