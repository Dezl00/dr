import 'package:hive_flutter/hive_flutter.dart';
import '../../features/patients/models/patient.dart';
import 'pending_action.dart';

class HiveService {
  static const String patientsBoxName = 'patientsBox';
  static const String pendingActionsBoxName = 'pendingActionsBox';

  static Future<void> init() async {
    await Hive.initFlutter();
    
    // Register adapters
    Hive.registerAdapter(PatientAdapter());
    Hive.registerAdapter(PendingActionAdapter());

    // Open boxes
    await Hive.openBox<Patient>(patientsBoxName);
    await Hive.openBox<PendingAction>(pendingActionsBoxName);
  }
  
  static Box<Patient> getPatientsBox() {
    return Hive.box<Patient>(patientsBoxName);
  }

  static Box<PendingAction> getPendingActionsBox() {
    return Hive.box<PendingAction>(pendingActionsBoxName);
  }
}
