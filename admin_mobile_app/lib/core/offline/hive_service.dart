import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
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
  static const String teamBoxName = 'teamBox';
  static const String servicesBoxName = 'servicesBox';
  static const String doctorsBoxName = 'doctorsBox';
  static const String leadsBoxName = 'leadsBox';
  static const String inventoryBoxName = 'inventoryBox';

  static const String settingsBoxName = 'settingsBox';

  static Future<void> init() async {
    await Hive.initFlutter();
    
    // Register adapters
    Hive.registerAdapter(PatientAdapter());
    Hive.registerAdapter(PendingActionAdapter());
    Hive.registerAdapter(AppointmentAdapter());
    Hive.registerAdapter(InvoiceAdapter());
    Hive.registerAdapter(ExpenseAdapter());

    // Setup Encryption
    const secureStorage = FlutterSecureStorage();
    String? encryptionKeyString = await secureStorage.read(key: 'hive_encryption_key');
    if (encryptionKeyString == null) {
      final key = Hive.generateSecureKey();
      await secureStorage.write(
        key: 'hive_encryption_key',
        value: base64UrlEncode(key),
      );
      encryptionKeyString = base64UrlEncode(key);
    }
    
    final encryptionKeyUint8List = base64Url.decode(encryptionKeyString);
    final cipher = HiveAesCipher(encryptionKeyUint8List);

    // Helper to safely open boxes (if old unencrypted box exists, delete it and recreate)
    Future<void> openEncryptedBox<T>(String name) async {
      try {
        await Hive.openBox<T>(name, encryptionCipher: cipher);
      } catch (e) {
        print('Error opening encrypted box $name. Deleting and reopening... Error: $e');
        await Hive.deleteBoxFromDisk(name);
        await Hive.openBox<T>(name, encryptionCipher: cipher);
      }
    }

    // Open boxes securely
    await openEncryptedBox<Patient>(patientsBoxName);
    await openEncryptedBox<PendingAction>(pendingActionsBoxName);
    await openEncryptedBox<Appointment>(appointmentsBoxName);
    await openEncryptedBox<Invoice>(invoicesBoxName);
    await openEncryptedBox<Expense>(expensesBoxName);
    await openEncryptedBox<String>(teamBoxName);
    await openEncryptedBox<String>(servicesBoxName);
    await openEncryptedBox<String>(doctorsBoxName);
    await openEncryptedBox<String>(leadsBoxName);
    await openEncryptedBox<String>(inventoryBoxName);
    await openEncryptedBox<String>(settingsBoxName);
  }
  
  static Box<Patient> getPatientsBox() => Hive.box<Patient>(patientsBoxName);
  static Box<PendingAction> getPendingActionsBox() => Hive.box<PendingAction>(pendingActionsBoxName);
  static Box<Appointment> getAppointmentsBox() => Hive.box<Appointment>(appointmentsBoxName);
  static Box<Invoice> getInvoicesBox() => Hive.box<Invoice>(invoicesBoxName);
  static Box<Expense> getExpensesBox() => Hive.box<Expense>(expensesBoxName);
  static Box<String> getTeamBox() => Hive.box<String>(teamBoxName);
  static Box<String> getServicesBox() => Hive.box<String>(servicesBoxName);
  static Box<String> getDoctorsBox() => Hive.box<String>(doctorsBoxName);
  static Box<String> getLeadsBox() => Hive.box<String>(leadsBoxName);
  static Box<String> getInventoryBox() => Hive.box<String>(inventoryBoxName);
  static Box<String> getSettingsBox() => Hive.box<String>(settingsBoxName);
}
