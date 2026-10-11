import 'package:dio/dio.dart';
import 'package:flutter/material.dart';

import '../../../../core/api/dio_client.dart';

class MedicalHistoryTab extends StatefulWidget {
  final String patientId;

  const MedicalHistoryTab({super.key, required this.patientId});

  @override
  State<MedicalHistoryTab> createState() => _MedicalHistoryTabState();
}

class _MedicalHistoryTabState extends State<MedicalHistoryTab> {
  static const _bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  final _allergiesController = TextEditingController();
  final _chronicDiseasesController = TextEditingController();
  final _medicationsController = TextEditingController();
  final _notesController = TextEditingController();
  late final Dio _dio;

  String? _bloodType;
  bool _isLoading = true;
  bool _isSaving = false;
  String? _loadError;

  @override
  void initState() {
    super.initState();
    _dio = DioClient().dio;
    _loadHistory();
  }

  @override
  void dispose() {
    _allergiesController.dispose();
    _chronicDiseasesController.dispose();
    _medicationsController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _loadHistory() async {
    setState(() {
      _isLoading = true;
      _loadError = null;
    });

    try {
      final response = await _dio.get('/patients/${widget.patientId}/medical-history');
      final payload = response.data;
      if (payload is! Map || payload['success'] != true) {
        throw Exception(payload is Map ? payload['error']?.toString() : null);
      }

      final data = payload['data'];
      if (data is Map) {
        _allergiesController.text = data['allergies']?.toString() ?? '';
        _chronicDiseasesController.text = data['chronicDiseases']?.toString() ?? '';
        _medicationsController.text = data['medications']?.toString() ?? '';
        _notesController.text = data['notes']?.toString() ?? '';
        final bloodType = data['bloodType']?.toString();
        _bloodType = _bloodTypes.contains(bloodType) ? bloodType : null;
      } else {
        _allergiesController.clear();
        _chronicDiseasesController.clear();
        _medicationsController.clear();
        _notesController.clear();
        _bloodType = null;
      }
    } catch (error) {
      _loadError = _errorMessage(error);
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _saveHistory() async {
    setState(() => _isSaving = true);

    try {
      final response = await _dio.post(
        '/patients/${widget.patientId}/medical-history',
        data: {
          'allergies': _nullIfBlank(_allergiesController.text),
          'chronicDiseases': _nullIfBlank(_chronicDiseasesController.text),
          'medications': _nullIfBlank(_medicationsController.text),
          'bloodType': _bloodType,
          'notes': _nullIfBlank(_notesController.text),
        },
      );

      final payload = response.data;
      if (payload is! Map || payload['success'] != true) {
        throw Exception(payload is Map ? payload['error']?.toString() : null);
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تم حفظ التاريخ الطبي بنجاح')),
        );
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(_errorMessage(error)), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
      }
    }
  }

  String? _nullIfBlank(String value) {
    final trimmed = value.trim();
    return trimmed.isEmpty ? null : trimmed;
  }

  String _errorMessage(Object error) {
    if (error is DioException) {
      final data = error.response?.data;
      if (data is Map && data['error'] != null) return data['error'].toString();
      return error.message ?? 'تعذر الاتصال بالخادم';
    }
    final message = error.toString().replaceFirst('Exception: ', '').trim();
    return message.isEmpty || message == 'null' ? 'تعذر تنفيذ العملية' : message;
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

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
                onPressed: _loadHistory,
                icon: const Icon(Icons.refresh),
                label: const Text('إعادة المحاولة'),
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadHistory,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'التاريخ الطبي',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          const Text(
            'تُحفظ هذه المعلومات في ملف المريض وتظهر للفريق المصرح له.',
            style: TextStyle(color: Color(0xFF64748B)),
          ),
          const SizedBox(height: 20),
          DropdownButtonFormField<String>(
            value: _bloodType,
            decoration: const InputDecoration(
              labelText: 'فصيلة الدم',
              border: OutlineInputBorder(),
            ),
            items: _bloodTypes
                .map((value) => DropdownMenuItem(value: value, child: Text(value)))
                .toList(),
            onChanged: _isSaving ? null : (value) => setState(() => _bloodType = value),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _allergiesController,
            enabled: !_isSaving,
            maxLines: 3,
            decoration: const InputDecoration(
              labelText: 'الحساسية',
              hintText: 'مثال: حساسية من البنسلين',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _chronicDiseasesController,
            enabled: !_isSaving,
            maxLines: 3,
            decoration: const InputDecoration(
              labelText: 'الأمراض المزمنة',
              hintText: 'مثال: السكري أو ضغط الدم',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _medicationsController,
            enabled: !_isSaving,
            maxLines: 3,
            decoration: const InputDecoration(
              labelText: 'الأدوية الحالية',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _notesController,
            enabled: !_isSaving,
            maxLines: 3,
            decoration: const InputDecoration(
              labelText: 'ملاحظات إضافية',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            height: 48,
            child: ElevatedButton.icon(
              onPressed: _isSaving ? null : _saveHistory,
              icon: _isSaving
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Icon(Icons.save_outlined),
              label: Text(_isSaving ? 'جارٍ الحفظ...' : 'حفظ التاريخ الطبي'),
            ),
          ),
        ],
      ),
    );
  }
}
