import 'package:flutter/material.dart';

class PrescriptionsTab extends StatefulWidget {
  final String patientId;

  const PrescriptionsTab({super.key, required this.patientId});

  @override
  State<PrescriptionsTab> createState() => _PrescriptionsTabState();
}

class _PrescriptionsTabState extends State<PrescriptionsTab> {
  // Mock data for UI parity
  final List<Map<String, dynamic>> _prescriptions = [];

  void _showAddPrescriptionDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('كتابة روشتة جديدة'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  decoration: const InputDecoration(labelText: 'اسم الدواء الأول', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 8),
                TextField(
                  decoration: const InputDecoration(labelText: 'الجرعة (مثال: قرص كل 12 ساعة)', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 16),
                TextField(
                  maxLines: 3,
                  decoration: const InputDecoration(labelText: 'ملاحظات إضافية للطبيب', border: OutlineInputBorder()),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('إلغاء'),
            ),
            ElevatedButton(
              onPressed: () {
                // TODO: Save prescription to API
                Navigator.pop(context);
              },
              child: const Text('حفظ وصرف'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _showAddPrescriptionDialog,
              icon: const Icon(Icons.add),
              label: const Text('إضافة روشتة جديدة'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          ),
        ),
        const Divider(),
        Expanded(
          child: _prescriptions.isEmpty
              ? const Center(child: Text('لا توجد روشتات سابقة لهذا المريض'))
              : ListView.builder(
                  itemCount: _prescriptions.length,
                  itemBuilder: (context, index) {
                    final rx = _prescriptions[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: ListTile(
                        leading: const Icon(Icons.medication, color: Colors.blue),
                        title: Text(rx['date'] ?? 'تاريخ غير معروف'),
                        subtitle: Text(rx['doctorName'] ?? 'طبيب غير معروف'),
                        trailing: const Icon(Icons.print),
                      ),
                    );
                  },
                ),
        )
      ],
    );
  }
}
