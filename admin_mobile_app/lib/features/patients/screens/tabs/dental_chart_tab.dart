import 'package:dio/dio.dart';
import 'package:flutter/material.dart';

import '../../../../core/api/dio_client.dart';

class DentalChartTab extends StatefulWidget {
  final String patientId;

  const DentalChartTab({super.key, required this.patientId});

  @override
  State<DentalChartTab> createState() => _DentalChartTabState();
}

class _DentalChartTabState extends State<DentalChartTab> {
  final List<int> _upperRight = const [18, 17, 16, 15, 14, 13, 12, 11];
  final List<int> _upperLeft = const [21, 22, 23, 24, 25, 26, 27, 28];
  final List<int> _lowerRight = const [48, 47, 46, 45, 44, 43, 42, 41];
  final List<int> _lowerLeft = const [31, 32, 33, 34, 35, 36, 37, 38];

  final Map<int, _DentalRecord> _records = {};
  final Set<int> _dirtyTeeth = {};
  late final Dio _dio;

  bool _isLoading = true;
  bool _isSaving = false;
  String? _loadError;

  @override
  void initState() {
    super.initState();
    _dio = DioClient().dio;
    _loadRecords();
  }

  Future<void> _loadRecords() async {
    setState(() {
      _isLoading = true;
      _loadError = null;
    });

    try {
      final response = await _dio.get('/patients/${widget.patientId}/dental-records');
      final payload = response.data;
      if (payload is! Map || payload['success'] != true) {
        throw Exception(payload is Map ? payload['error']?.toString() : null);
      }

      final freshRecords = <int, _DentalRecord>{};
      final data = payload['data'];
      if (data is List) {
        for (final item in data) {
          if (item is! Map) continue;
          final toothNumber = int.tryParse(item['toothNumber']?.toString() ?? '');
          if (toothNumber == null) continue;
          freshRecords[toothNumber] = _DentalRecord(
            condition: _normalizedCondition(item['condition']?.toString()),
            notes: item['notes']?.toString(),
          );
        }
      }

      if (mounted) {
        setState(() {
          _records
            ..clear()
            ..addAll(freshRecords);
          _dirtyTeeth.clear();
        });
      }
    } catch (error) {
      _loadError = _errorMessage(error);
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _showToothDialog(int toothNumber) async {
    final record = _records[toothNumber];
    var selectedCondition = record?.condition ?? 'SOUND';
    final notesController = TextEditingController(text: record?.notes ?? '');

    await showDialog<void>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: Text('تفاصيل السن رقم $toothNumber'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _conditionOption(
                  title: 'سليم',
                  value: 'SOUND',
                  color: Colors.green,
                  selected: selectedCondition,
                  onSelected: (value) => setDialogState(() => selectedCondition = value),
                ),
                _conditionOption(
                  title: 'تسوس',
                  value: 'DECAYED',
                  color: Colors.red,
                  selected: selectedCondition,
                  onSelected: (value) => setDialogState(() => selectedCondition = value),
                ),
                _conditionOption(
                  title: 'محشو',
                  value: 'FILLED',
                  color: Colors.blue,
                  selected: selectedCondition,
                  onSelected: (value) => setDialogState(() => selectedCondition = value),
                ),
                _conditionOption(
                  title: 'تاج',
                  value: 'CROWNED',
                  color: Colors.orange,
                  selected: selectedCondition,
                  onSelected: (value) => setDialogState(() => selectedCondition = value),
                ),
                _conditionOption(
                  title: 'مفقود أو مخلوع',
                  value: 'MISSING',
                  color: Colors.grey,
                  selected: selectedCondition,
                  onSelected: (value) => setDialogState(() => selectedCondition = value),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: notesController,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    labelText: 'ملاحظات الطبيب',
                    border: OutlineInputBorder(),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('إلغاء'),
            ),
            ElevatedButton(
              onPressed: () {
                setState(() {
                  _records[toothNumber] = _DentalRecord(
                    condition: selectedCondition,
                    notes: _nullIfBlank(notesController.text),
                  );
                  _dirtyTeeth.add(toothNumber);
                });
                Navigator.pop(dialogContext);
              },
              child: const Text('تطبيق التعديل'),
            ),
          ],
        ),
      ),
    );

    notesController.dispose();
  }

  Widget _conditionOption({
    required String title,
    required String value,
    required Color color,
    required String selected,
    required ValueChanged<String> onSelected,
  }) {
    return RadioListTile<String>(
      value: value,
      groupValue: selected,
      dense: true,
      contentPadding: EdgeInsets.zero,
      secondary: CircleAvatar(backgroundColor: color, radius: 9),
      title: Text(title),
      onChanged: (newValue) {
        if (newValue != null) onSelected(newValue);
      },
    );
  }

  Future<void> _saveChart() async {
    if (_dirtyTeeth.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('لا توجد تعديلات غير محفوظة')),
      );
      return;
    }

    setState(() => _isSaving = true);
    final savedTeeth = <int>[];

    try {
      for (final toothNumber in _dirtyTeeth.toList()) {
        final record = _records[toothNumber];
        if (record == null) continue;

        final response = await _dio.post(
          '/patients/${widget.patientId}/dental-records',
          data: {
            'toothNumber': toothNumber,
            'condition': record.condition,
            'notes': record.notes,
          },
        );
        final payload = response.data;
        if (payload is! Map || payload['success'] != true) {
          throw Exception(payload is Map ? payload['error']?.toString() : null);
        }
        savedTeeth.add(toothNumber);
      }

      if (mounted) {
        setState(() => _dirtyTeeth.removeAll(savedTeeth));
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تم حفظ خريطة الأسنان بنجاح')),
        );
      }
    } catch (error) {
      if (mounted) {
        setState(() => _dirtyTeeth.removeAll(savedTeeth));
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

  String _normalizedCondition(String? condition) {
    if (condition == 'HEALTHY') return 'SOUND';
    switch (condition) {
      case 'SOUND':
      case 'DECAYED':
      case 'FILLED':
      case 'CROWNED':
      case 'MISSING':
        return condition!;
      default:
        return 'SOUND';
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
    return message.isEmpty || message == 'null' ? 'تعذر حفظ سجل الأسنان' : message;
  }

  Color _toothColor(int toothNumber) {
    switch (_records[toothNumber]?.condition) {
      case 'DECAYED':
        return Colors.red.shade300;
      case 'MISSING':
        return Colors.grey.shade400;
      case 'SOUND':
        return Colors.green.shade300;
      case 'FILLED':
        return Colors.blue.shade300;
      case 'CROWNED':
        return Colors.orange.shade300;
      default:
        return Colors.white;
    }
  }

  Widget _buildJaw(List<int> right, List<int> left, String label) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
        ),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(children: right.map(_buildTooth).toList()),
            Container(
              width: 2,
              height: 60,
              color: const Color(0xFFE2E8F0),
              margin: const EdgeInsets.symmetric(horizontal: 4),
            ),
            Row(children: left.map(_buildTooth).toList()),
          ],
        ),
      ],
    );
  }

  Widget _buildTooth(int toothNumber) {
    final isDirty = _dirtyTeeth.contains(toothNumber);
    return Semantics(
      button: true,
      label: 'السن رقم $toothNumber',
      child: GestureDetector(
        onTap: _isSaving ? null : () => _showToothDialog(toothNumber),
        child: Container(
          width: 34,
          height: 50,
          margin: const EdgeInsets.symmetric(horizontal: 2),
          decoration: BoxDecoration(
            color: _toothColor(toothNumber),
            border: Border.all(
              color: isDirty ? const Color(0xFF2563EB) : const Color(0xFFCBD5E1),
              width: isDirty ? 3 : 2,
            ),
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(8),
              topRight: Radius.circular(8),
            ),
          ),
          child: Center(
            child: Text(
              '$toothNumber',
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
            ),
          ),
        ),
      ),
    );
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
                onPressed: _loadRecords,
                icon: const Icon(Icons.refresh),
                label: const Text('إعادة المحاولة'),
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadRecords,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Column(
                  children: [
                    _buildJaw(_upperRight, _upperLeft, 'الفك العلوي'),
                    const SizedBox(height: 32),
                    const Divider(color: Color(0xFFE2E8F0)),
                    const SizedBox(height: 32),
                    _buildJaw(_lowerRight, _lowerLeft, 'الفك السفلي'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              _dirtyTeeth.isEmpty
                  ? 'اضغط على أي سن لتسجيل حالته.'
                  : 'لديك ${_dirtyTeeth.length} تعديل غير محفوظ.',
              style: const TextStyle(color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                onPressed: _isSaving ? null : _saveChart,
                icon: _isSaving
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Icon(Icons.save_outlined),
                label: Text(_isSaving ? 'جارٍ الحفظ...' : 'حفظ التحديثات'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DentalRecord {
  final String condition;
  final String? notes;

  const _DentalRecord({required this.condition, this.notes});
}
