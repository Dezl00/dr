import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../patients/providers/patient_provider.dart';
import '../providers/invoice_provider.dart';

class CreateInvoiceScreen extends ConsumerStatefulWidget {
  const CreateInvoiceScreen({super.key});

  @override
  ConsumerState<CreateInvoiceScreen> createState() => _CreateInvoiceScreenState();
}

class _CreateInvoiceScreenState extends ConsumerState<CreateInvoiceScreen> {
  final _formKey = GlobalKey<FormState>();
  final List<Map<String, dynamic>> _items = [];
  String? _patientId;
  bool _saving = false;

  double get _total => _items.fold<double>(0, (sum, item) => sum + (item['quantity'] as int) * (item['unitPrice'] as double));

  Future<void> _addItem() async {
    final description = TextEditingController();
    final price = TextEditingController();
    final quantity = TextEditingController(text: '1');
    final item = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('إضافة بند'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: description, decoration: const InputDecoration(labelText: 'الوصف')),
            TextField(controller: price, keyboardType: const TextInputType.numberWithOptions(decimal: true), decoration: const InputDecoration(labelText: 'سعر الوحدة')),
            TextField(controller: quantity, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'الكمية')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('إلغاء')),
          FilledButton(
            onPressed: () {
              final parsedPrice = double.tryParse(price.text.trim());
              final parsedQuantity = int.tryParse(quantity.text.trim());
              if (description.text.trim().isEmpty || parsedPrice == null || parsedPrice < 0 || parsedQuantity == null || parsedQuantity < 1) return;
              Navigator.pop(context, {
                'description': description.text.trim(),
                'quantity': parsedQuantity,
                'unitPrice': parsedPrice,
              });
            },
            child: const Text('إضافة'),
          ),
        ],
      ),
    );
    if (item != null && mounted) setState(() => _items.add(item));
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate() || _patientId == null || _items.isEmpty) return;
    setState(() => _saving = true);
    final success = await ref.read(invoiceStateProvider.notifier).createItem({
      'patientId': _patientId,
      'items': _items,
    });
    if (!mounted) return;
    setState(() => _saving = false);
    if (success) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم إصدار الفاتورة بنجاح')));
    } else {
      final error = ref.read(invoiceStateProvider).error ?? 'تعذر إصدار الفاتورة';
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final patients = ref.watch(patientStateProvider);
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        appBar: AppBar(title: const Text('فاتورة جديدة')),
        body: Form(
          key: _formKey,
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: DropdownButtonFormField<String>(
                  value: _patientId,
                  isExpanded: true,
                  decoration: const InputDecoration(labelText: 'المريض', border: OutlineInputBorder()),
                  items: patients.items.map((patient) => DropdownMenuItem(value: patient.id, child: Text('${patient.fullName} — ${patient.phone}', overflow: TextOverflow.ellipsis))).toList(),
                  onChanged: (value) => setState(() => _patientId = value),
                  validator: (value) => value == null ? 'اختر المريض' : null,
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('بنود الفاتورة', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    TextButton.icon(onPressed: _addItem, icon: const Icon(Icons.add), label: const Text('إضافة بند')),
                  ],
                ),
              ),
              Expanded(
                child: _items.isEmpty
                    ? const Center(child: Text('أضف بندًا واحدًا على الأقل إلى الفاتورة'))
                    : ListView.separated(
                        itemCount: _items.length,
                        separatorBuilder: (_, __) => const Divider(height: 1),
                        itemBuilder: (context, index) {
                          final item = _items[index];
                          final lineTotal = (item['quantity'] as int) * (item['unitPrice'] as double);
                          return ListTile(
                            title: Text(item['description'] as String),
                            subtitle: Text('${item['quantity']} × ${item['unitPrice']}'),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(lineTotal.toStringAsFixed(2)),
                                IconButton(icon: const Icon(Icons.delete_outline), onPressed: () => setState(() => _items.removeAt(index))),
                              ],
                            ),
                          );
                        },
                      ),
              ),
              SafeArea(
                top: false,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Expanded(child: Text('الإجمالي: ${_total.toStringAsFixed(2)}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold))),
                      FilledButton(onPressed: _saving ? null : _save, child: _saving ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('إصدار الفاتورة')),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
