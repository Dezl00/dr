import 'package:flutter/material.dart';

class MedicalHistoryTab extends StatefulWidget {
  final String patientId;

  const MedicalHistoryTab({super.key, required this.patientId});

  @override
  State<MedicalHistoryTab> createState() => _MedicalHistoryTabState();
}

class _MedicalHistoryTabState extends State<MedicalHistoryTab> {
  final _allergiesController = TextEditingController();
  final _chronicDiseasesController = TextEditingController();
  final _medicationsController = TextEditingController();
  final _bloodTypeController = TextEditingController();
  final bool _isLoading = false; // Will connect to provider later

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16.0),
      children: [
        const Text('تحديث التاريخ الطبي', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        TextField(
          controller: _allergiesController,
          maxLines: 2,
          decoration: const InputDecoration(
            labelText: 'الحساسية (Allergies)',
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _chronicDiseasesController,
          maxLines: 2,
          decoration: const InputDecoration(
            labelText: 'الأمراض المزمنة (Chronic Diseases)',
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _medicationsController,
          maxLines: 2,
          decoration: const InputDecoration(
            labelText: 'الأدوية الحالية (Medications)',
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _bloodTypeController,
          decoration: const InputDecoration(
            labelText: 'فصيلة الدم (Blood Type)',
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: _isLoading ? null : () {
            // TODO: Submit to API
          },
          child: const Padding(
            padding: EdgeInsets.all(12.0),
            child: Text('حفظ البيانات الطبية'),
          ),
        )
      ],
    );
  }
}
