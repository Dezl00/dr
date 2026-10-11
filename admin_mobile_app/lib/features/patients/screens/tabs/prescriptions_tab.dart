import 'package:dio/dio.dart';
import 'package:flutter/material.dart';

import '../../../../core/api/dio_client.dart';

class PrescriptionsTab extends StatefulWidget {
  final String patientId;

  const PrescriptionsTab({super.key, required this.patientId});

  @override
  State<PrescriptionsTab> createState() => _PrescriptionsTabState();
}

class _PrescriptionsTabState extends State<PrescriptionsTab> {
  late final Dio _dio;
  List<_Prescription> _prescriptions = const [];
  bool _isLoading = true;
  String? _loadError;

  @override
  void initState() {
    super.initState();
    _dio = DioClient().dio;
    _loadPrescriptions();
  }

  Future<void> _loadPrescriptions() async {
    setState(() {
      _isLoading = true;
      _loadError = null;
    });

    try {
      final response = await _dio.get(
        '/prescriptions',
        queryParameters: {'patientId': widget.patientId},
      );
      final payload = response.data;
      if (payload is! Map || payload['success'] != true) {
        throw Exception(payload is Map ? payload['error']?.toString() : null);
      }

      final data = payload['data'];
      _prescriptions = data is List
          ? data.whereType<Map>().map(_Prescription.fromJson).toList()
          : const [];
    } catch (error) {
      _loadError = _errorMessage(error);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _showAddPrescriptionDialog() async {
    final created = await showDialog<bool>(
      context: context,
      builder: (context) => _PrescriptionEditorDialog(onSubmit: _createPrescription),
    );

    if (created == true && mounted) {
      await _loadPrescriptions();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تم حفظ الوصفة الطبية بنجاح')),
        );
      }
    }
  }

  Future<void> _createPrescription(List<_MedicationInput> medications, String? notes) async {
    final response = await _dio.post(
      '/prescriptions',
      data: {
        'patientId': widget.patientId,
        'medications': medications.map((item) => item.toJson()).toList(),
        'notes': notes,
      },
    );
    final payload = response.data;
    if (payload is! Map || payload['success'] != true) {
      throw Exception(payload is Map ? payload['error']?.toString() : null);
    }
  }

  void _showDetails(_Prescription prescription) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'وصفة ${_formatDate(prescription.createdAt)}',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text('د. ${prescription.doctorName}', style: const TextStyle(color: Color(0xFF64748B))),
                const SizedBox(height: 20),
                ...prescription.medications.map(
                  (medication) => Card(
                    margin: const EdgeInsets.only(bottom: 8),
                    child: ListTile(
                      leading: const Icon(Icons.medication_outlined, color: Color(0xFF2563EB)),
                      title: Text(medication.name),
                      subtitle: Text('${medication.dosage} — ${medication.frequency}'),
                    ),
                  ),
                ),
                if (prescription.notes != null && prescription.notes!.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  const Text('ملاحظات الطبيب', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text(prescription.notes!),
                ],
                const SizedBox(height: 12),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    final local = date.toLocal();
    return '${local.year}-${local.month.toString().padLeft(2, '0')}-${local.day.toString().padLeft(2, '0')}';
  }

  String _errorMessage(Object error) {
    if (error is DioException) {
      final data = error.response?.data;
      if (data is Map && data['error'] != null) return data['error'].toString();
      return error.message ?? 'تعذر الاتصال بالخادم';
    }
    final message = error.toString().replaceFirst('Exception: ', '').trim();
    return message.isEmpty || message == 'null' ? 'تعذر جلب الوصفات الطبية' : message;
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());

    if (_loadError != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(_loadError!, textAlign: TextAlign.center),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: _loadPrescriptions,
                icon: const Icon(Icons.refresh),
                label: const Text('إعادة المحاولة'),
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _showAddPrescriptionDialog,
              icon: const Icon(Icons.add),
              label: const Text('إضافة وصفة طبية'),
            ),
          ),
        ),
        const Divider(height: 1),
        Expanded(
          child: RefreshIndicator(
            onRefresh: _loadPrescriptions,
            child: _prescriptions.isEmpty
                ? ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: const [
                      SizedBox(height: 120),
                      Center(child: Text('لا توجد وصفات طبية مسجلة لهذا المريض')),
                    ],
                  )
                : ListView.builder(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    itemCount: _prescriptions.length,
                    itemBuilder: (context, index) {
                      final prescription = _prescriptions[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                        child: ListTile(
                          onTap: () => _showDetails(prescription),
                          leading: const CircleAvatar(
                            backgroundColor: Color(0xFFEFF6FF),
                            child: Icon(Icons.medication_outlined, color: Color(0xFF2563EB)),
                          ),
                          title: Text(_formatDate(prescription.createdAt)),
                          subtitle: Text('د. ${prescription.doctorName}\n${prescription.medications.length} دواء'),
                          isThreeLine: true,
                          trailing: const Icon(Icons.chevron_left),
                        ),
                      );
                    },
                  ),
          ),
        ),
      ],
    );
  }
}

class _PrescriptionEditorDialog extends StatefulWidget {
  final Future<void> Function(List<_MedicationInput> medications, String? notes) onSubmit;

  const _PrescriptionEditorDialog({required this.onSubmit});

  @override
  State<_PrescriptionEditorDialog> createState() => _PrescriptionEditorDialogState();
}

class _PrescriptionEditorDialogState extends State<_PrescriptionEditorDialog> {
  final _notesController = TextEditingController();
  final List<_MedicationDraft> _medications = [_MedicationDraft()];
  bool _isSaving = false;
  String? _error;

  @override
  void dispose() {
    _notesController.dispose();
    for (final medication in _medications) {
      medication.dispose();
    }
    super.dispose();
  }

  Future<void> _submit() async {
    final inputs = _medications.map((medication) => medication.toInput()).toList();
    if (inputs.any((item) => item.name.isEmpty || item.dosage.isEmpty || item.frequency.isEmpty)) {
      setState(() => _error = 'أدخل اسم الدواء والجرعة والتكرار لكل دواء.');
      return;
    }

    setState(() {
      _isSaving = true;
      _error = null;
    });

    try {
      final notes = _notesController.text.trim();
      await widget.onSubmit(inputs, notes.isEmpty ? null : notes);
      if (mounted) Navigator.pop(context, true);
    } catch (error) {
      if (mounted) {
        setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('كتابة وصفة جديدة'),
      content: SizedBox(
        width: double.maxFinite,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (_error != null) ...[
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(10),
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF2F2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(_error!, style: const TextStyle(color: Color(0xFFB91C1C))),
                ),
              ],
              ..._medications.asMap().entries.map((entry) => _medicationFields(entry.key, entry.value)),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton.icon(
                  onPressed: _isSaving
                      ? null
                      : () => setState(() => _medications.add(_MedicationDraft())),
                  icon: const Icon(Icons.add),
                  label: const Text('إضافة دواء'),
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _notesController,
                enabled: !_isSaving,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'تعليمات أو ملاحظات للطبيب',
                  border: OutlineInputBorder(),
                ),
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: _isSaving ? null : () => Navigator.pop(context),
          child: const Text('إلغاء'),
        ),
        ElevatedButton(
          onPressed: _isSaving ? null : _submit,
          child: _isSaving
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                )
              : const Text('حفظ الوصفة'),
        ),
      ],
    );
  }

  Widget _medicationFields(int index, _MedicationDraft medication) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFFE2E8F0)),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(child: Text('الدواء ${index + 1}', style: const TextStyle(fontWeight: FontWeight.bold))),
              if (_medications.length > 1)
                IconButton(
                  tooltip: 'حذف الدواء',
                  onPressed: _isSaving
                      ? null
                      : () => setState(() {
                            final removed = _medications.removeAt(index);
                            removed.dispose();
                          }),
                  icon: const Icon(Icons.delete_outline, color: Colors.red),
                ),
            ],
          ),
          const SizedBox(height: 8),
          TextField(
            controller: medication.nameController,
            enabled: !_isSaving,
            decoration: const InputDecoration(labelText: 'اسم الدواء', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: medication.dosageController,
            enabled: !_isSaving,
            decoration: const InputDecoration(labelText: 'الجرعة', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: medication.frequencyController,
            enabled: !_isSaving,
            decoration: const InputDecoration(labelText: 'التكرار أو المدة', border: OutlineInputBorder()),
          ),
        ],
      ),
    );
  }
}

class _Prescription {
  final String id;
  final DateTime createdAt;
  final String doctorName;
  final List<_MedicationInput> medications;
  final String? notes;

  const _Prescription({
    required this.id,
    required this.createdAt,
    required this.doctorName,
    required this.medications,
    this.notes,
  });

  factory _Prescription.fromJson(Map<dynamic, dynamic> json) {
    final doctor = json['doctor'];
    final legacyDoctorUser = doctor is Map ? doctor['user'] : null;
    final medicationData = json['medications'];
    return _Prescription(
      id: json['id']?.toString() ?? '',
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ?? DateTime.now(),
      doctorName: doctor is Map && doctor['fullName'] != null
          ? doctor['fullName'].toString()
          : legacyDoctorUser is Map && legacyDoctorUser['fullName'] != null
              ? legacyDoctorUser['fullName'].toString()
              : 'طبيب غير محدد',
      medications: medicationData is List
          ? medicationData.whereType<Map>().map(_MedicationInput.fromJson).toList()
          : const [],
      notes: json['notes']?.toString(),
    );
  }
}

class _MedicationInput {
  final String name;
  final String dosage;
  final String frequency;

  const _MedicationInput({required this.name, required this.dosage, required this.frequency});

  factory _MedicationInput.fromJson(Map<dynamic, dynamic> json) => _MedicationInput(
        name: json['name']?.toString() ?? 'دواء غير محدد',
        dosage: json['dosage']?.toString() ?? '-',
        frequency: json['frequency']?.toString() ?? '-',
      );

  Map<String, String> toJson() => {
        'name': name,
        'dosage': dosage,
        'frequency': frequency,
      };
}

class _MedicationDraft {
  final nameController = TextEditingController();
  final dosageController = TextEditingController();
  final frequencyController = TextEditingController();

  _MedicationInput toInput() => _MedicationInput(
        name: nameController.text.trim(),
        dosage: dosageController.text.trim(),
        frequency: frequencyController.text.trim(),
      );

  void dispose() {
    nameController.dispose();
    dosageController.dispose();
    frequencyController.dispose();
  }
}
