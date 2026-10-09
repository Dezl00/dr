import 'package:hive_flutter/hive_flutter.dart';
import '../../features/patients/models/patient.dart';
import '../../features/appointments/models/appointment.dart';
import '../../features/financials/models/invoice.dart';
import '../../features/financials/models/expense.dart';
import 'pending_action.dart';

class HiveService {
  static const String patientsBoxName = 'patientsBox';
  static const String pendingActionsBoxName = 'pendingActionsBox';
  static const String appointmentsBoxName = 'appointmentsBox';
  static const String invoicesBoxName = 'invoicesBox';
  static const String expensesBoxName = 'expensesBox';

  static Future<void> init() async {
    await Hive.initFlutter();
    
    // Register adapters
    Hive.registerAdapter(PatientAdapter());
    Hive.registerAdapter(PendingActionAdapter());
    Hive.registerAdapter(AppointmentAdapter());
    Hive.registerAdapter(InvoiceAdapter());
    Hive.registerAdapter(ExpenseAdapter());

    // Open boxes
    await Hive.openBox<Patient>(patientsBoxName);
    await Hive.openBox<PendingAction>(pendingActionsBoxName);
    await Hive.openBox<Appointment>(appointmentsBoxName);
    await Hive.openBox<Invoice>(invoicesBoxName);
    await Hive.openBox<Expense>(expensesBoxName);
  }
  
  static Box<Patient> getPatientsBox() {
    return Hive.box<Patient>(patientsBoxName);
  }

  static Box<PendingAction> getPendingActionsBox() {
    return Hive.box<PendingAction>(pendingActionsBoxName);
  }

  static Box<Appointment> getAppointmentsBox() {
    return Hive.box<Appointment>(appointmentsBoxName);
  }

  static Box<Invoice> getInvoicesBox() {
    return Hive.box<Invoice>(invoicesBoxName);
  }

  static Box<Expense> getExpensesBox() {
    return Hive.box<Expense>(expensesBoxName);
  }
}
