import 'package:flutter/material.dart';
import '../models/patient.dart';
import 'tabs/medical_history_tab.dart';
import 'tabs/prescriptions_tab.dart';
import 'tabs/dental_chart_tab.dart';

class PatientProfileScreen extends StatelessWidget {
  final Patient patient;

  const PatientProfileScreen({super.key, required this.patient});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 5,
      child: Scaffold(
        appBar: AppBar(
          title: Text(patient.fullName),
          bottom: const TabBar(
            isScrollable: true,
            tabs: [
              Tab(text: 'البيانات الأساسية', icon: Icon(Icons.person)),
              Tab(text: 'التاريخ الطبي', icon: Icon(Icons.medical_information)),
              Tab(text: 'الخريطة السنية', icon: Icon(Icons.monitor_heart)),
              Tab(text: 'الروشتات', icon: Icon(Icons.medication)),
              Tab(text: 'الحسابات', icon: Icon(Icons.receipt_long)),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildBasicInfo(context),
            MedicalHistoryTab(patientId: patient.id),
            DentalChartTab(patientId: patient.id),
            PrescriptionsTab(patientId: patient.id),
            const Center(child: Text('سجل الفواتير والدفعات (قريباً)')),
          ],
        ),
      ),
    );
  }

  Widget _buildBasicInfo(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16.0),
      children: [
        ListTile(
          leading: const Icon(Icons.phone),
          title: const Text('رقم الهاتف'),
          subtitle: Text(patient.phone),
        ),
        const Divider(),
        ListTile(
          leading: const Icon(Icons.transgender),
          title: const Text('الجنس'),
          subtitle: Text(patient.gender == 'MALE' ? 'ذكر' : (patient.gender == 'FEMALE' ? 'أنثى' : 'غير محدد')),
        ),
        const Divider(),
        ListTile(
          leading: const Icon(Icons.cake),
          title: const Text('تاريخ الميلاد'),
          subtitle: Text(patient.dateOfBirth != null 
              ? '${patient.dateOfBirth!.year}-${patient.dateOfBirth!.month}-${patient.dateOfBirth!.day}' 
              : 'غير محدد'),
        ),
        const Divider(),
        Row(
          children: [
            Expanded(
              child: Card(
                color: Theme.of(context).colorScheme.primaryContainer,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      const Text('المواعيد'),
                      const SizedBox(height: 8),
                      Text('${patient.appointmentsCount}', 
                          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
            ),
            Expanded(
              child: Card(
                color: Theme.of(context).colorScheme.errorContainer,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      const Text('فواتير متأخرة'),
                      const SizedBox(height: 8),
                      Text('${patient.unpaidInvoicesCount}', 
                          style: TextStyle(
                            fontSize: 24, 
                            fontWeight: FontWeight.bold,
                            color: Theme.of(context).colorScheme.onErrorContainer
                          )),
                    ],
                  ),
                ),
              ),
            ),
          ],
        )
      ],
    );
  }
}
