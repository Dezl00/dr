
class ApiEndpoints {
  // Production Server
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://www.beyoondgroup.com/api/v1',
  );
  static const String websiteRootDomain = String.fromEnvironment(
    'WEBSITE_ROOT_DOMAIN',
    defaultValue: 'beyoondgroup.com',
  );

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
  static const String website = '/website';
  static const String websiteSections = '/website/sections';
  
  // Settings
  static const String settings = '/settings';
  static const String profileSettings = '/settings/profile';
  
  // Doctors
  static const String doctors = '/doctors';
  
  // Deletion
  static const String deleteAccount = '/auth/delete-account';
}
