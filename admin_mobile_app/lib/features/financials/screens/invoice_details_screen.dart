import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:share_plus/share_plus.dart';

import '../../../core/api/api_endpoints.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/invoice.dart';

class InvoiceDetailsScreen extends ConsumerStatefulWidget {
  final Invoice invoice;
  const InvoiceDetailsScreen({super.key, required this.invoice});

  @override
  ConsumerState<InvoiceDetailsScreen> createState() => _InvoiceDetailsScreenState();
}

class _InvoiceDetailsScreenState extends ConsumerState<InvoiceDetailsScreen> {
  Map<String, dynamic>? _invoice;
  bool _loading = true;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final response = await ref.read(dioProvider).get('${ApiEndpoints.invoices}/${widget.invoice.id}');
      if (response.data['success'] != true) throw Exception(response.data['error'] ?? 'تعذر تحميل الفاتورة');
      if (mounted) setState(() => _invoice = Map<String, dynamic>.from(response.data['data'] as Map));
    } catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.toString())));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  double _number(dynamic value) => double.tryParse(value?.toString() ?? '') ?? 0;

  Future<void> _addPayment() async {
    final amount = TextEditingController();
    String method = 'CASH';
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('تسجيل دفعة'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: amount, keyboardType: const TextInputType.numberWithOptions(decimal: true), decoration: const InputDecoration(labelText: 'المبلغ', border: OutlineInputBorder())),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: method,
                decoration: const InputDecoration(labelText: 'طريقة الدفع', border: OutlineInputBorder()),
                items: const [
                  DropdownMenuItem(value: 'CASH', child: Text('نقدي')),
                  DropdownMenuItem(value: 'CARD', child: Text('بطاقة')),
                  DropdownMenuItem(value: 'BANK_TRANSFER', child: Text('تحويل بنكي')),
                  DropdownMenuItem(value: 'INSURANCE', child: Text('تأمين')),
                  DropdownMenuItem(value: 'INSTALLMENT', child: Text('تقسيط')),
                ],
                onChanged: (value) => setDialogState(() => method = value ?? 'CASH'),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('إلغاء')),
            FilledButton(
              onPressed: () async {
                final parsedAmount = double.tryParse(amount.text.trim());
                if (parsedAmount == null || parsedAmount <= 0) return;
                try {
                  final response = await ref.read(dioProvider).post('${ApiEndpoints.invoices}/${widget.invoice.id}/payments', data: {'amount': parsedAmount, 'method': method});
                  if (response.data['success'] != true) throw Exception(response.data['error'] ?? 'تعذر تسجيل الدفعة');
                  if (dialogContext.mounted) Navigator.pop(dialogContext, true);
                } catch (error) {
                  if (dialogContext.mounted) ScaffoldMessenger.of(dialogContext).showSnackBar(SnackBar(content: Text(error.toString())));
                }
              },
              child: const Text('تسجيل'),
            ),
          ],
        ),
      ),
    );
    if (confirmed == true) await _load();
  }

  Future<void> _cancelInvoice() async {
    final approved = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('إلغاء الفاتورة'),
        content: const Text('لن يمكن إضافة بنود أو دفعات جديدة بعد الإلغاء.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('رجوع')),
          FilledButton(onPressed: () => Navigator.pop(context, true), style: FilledButton.styleFrom(backgroundColor: Colors.red), child: const Text('إلغاء الفاتورة')),
        ],
      ),
    );
    if (approved != true) return;
    setState(() => _saving = true);
    try {
      final response = await ref.read(dioProvider).patch('${ApiEndpoints.invoices}/${widget.invoice.id}', data: {'status': 'CANCELLED'});
      if (response.data['success'] != true) throw Exception(response.data['error'] ?? 'تعذر إلغاء الفاتورة');
      await _load();
    } catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.toString())));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _shareInvoice() async {
    final data = _invoice;
    if (data == null) return;
    final patient = data['patient'] as Map?;
    final text = '''فاتورة ${data['invoiceNumber'] ?? widget.invoice.id}
المريض: ${patient?['fullName'] ?? widget.invoice.patientName}
الإجمالي: ${_number(data['total']).toStringAsFixed(2)}
الحالة: ${data['status']}''';
    await Share.share(text);
  }

  @override
  Widget build(BuildContext context) {
    final data = _invoice;
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('تفاصيل الفاتورة'),
          actions: [IconButton(onPressed: data == null ? null : _shareInvoice, icon: const Icon(Icons.share_outlined))],
        ),
        body: _loading
            ? const Center(child: CircularProgressIndicator())
            : data == null
                ? Center(child: FilledButton(onPressed: _load, child: const Text('إعادة المحاولة')))
                : _buildContent(data),
      ),
    );
  }

  Widget _buildContent(Map<String, dynamic> data) {
    final items = ((data['items'] as List?) ?? []).cast<dynamic>();
    final payments = ((data['payments'] as List?) ?? []).cast<dynamic>();
    final total = _number(data['total']);
    final paid = payments.fold<double>(0, (sum, entry) => sum + _number((entry as Map)['amount']));
    final remaining = (total - paid).clamp(0, double.infinity).toDouble();
    final cancelled = data['status'] == 'CANCELLED';
    final patient = data['patient'] as Map?;

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [Expanded(child: Text(data['invoiceNumber']?.toString() ?? 'فاتورة', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18))), _statusBadge(data['status']?.toString() ?? '')]),
                  const SizedBox(height: 12),
                  Text('المريض: ${patient?['fullName'] ?? widget.invoice.patientName}'),
                  if (patient?['phone'] != null) Text('الهاتف: ${patient!['phone']}'),
                  Text('تاريخ الإصدار: ${_formatDate(data['createdAt'])}'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Text('بنود الفاتورة', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
          const SizedBox(height: 8),
          ...items.map((item) {
            final map = item as Map;
            return ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(map['description']?.toString() ?? ''),
              subtitle: Text('${map['quantity']} × ${_number(map['unitPrice']).toStringAsFixed(2)}'),
              trailing: Text(_number(map['total']).toStringAsFixed(2)),
            );
          }),
          const Divider(),
          _amountRow('الإجمالي الفرعي', _number(data['subtotal'])),
          if (_number(data['discount']) > 0) _amountRow('الخصم', -_number(data['discount'])),
          if (_number(data['tax']) > 0) _amountRow('الضريبة', _number(data['tax'])),
          _amountRow('الإجمالي', total, bold: true),
          _amountRow('المدفوع', paid, color: Colors.green),
          _amountRow('المتبقي', remaining, bold: true, color: remaining > 0 ? Colors.red : Colors.green),
          const SizedBox(height: 20),
          Row(children: [const Expanded(child: Text('الدفعات', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17))), if (!cancelled && remaining > 0) TextButton.icon(onPressed: _saving ? null : _addPayment, icon: const Icon(Icons.add), label: const Text('تسجيل دفعة'))]),
          if (payments.isEmpty) const Padding(padding: EdgeInsets.symmetric(vertical: 12), child: Text('لا توجد دفعات مسجلة')),
          ...payments.map((entry) {
            final payment = entry as Map;
            return ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.payments_outlined),
              title: Text(_number(payment['amount']).toStringAsFixed(2)),
              subtitle: Text('${payment['method'] ?? ''} — ${_formatDate(payment['paymentDate'])}'),
            );
          }),
          if (!cancelled) ...[
            const SizedBox(height: 24),
            OutlinedButton.icon(onPressed: _saving ? null : _cancelInvoice, icon: const Icon(Icons.cancel_outlined), label: const Text('إلغاء الفاتورة'), style: OutlinedButton.styleFrom(foregroundColor: Colors.red)),
          ],
        ],
      ),
    );
  }

  String _formatDate(dynamic raw) {
    final date = raw == null ? null : DateTime.tryParse(raw.toString());
    return date == null ? '—' : '${date.year}/${date.month.toString().padLeft(2, '0')}/${date.day.toString().padLeft(2, '0')}';
  }

  Widget _amountRow(String label, double amount, {bool bold = false, Color? color}) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 4),
    child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text(label, style: TextStyle(fontWeight: bold ? FontWeight.bold : FontWeight.normal)), Text(amount.toStringAsFixed(2), style: TextStyle(fontWeight: bold ? FontWeight.bold : FontWeight.normal, color: color))]),
  );

  Widget _statusBadge(String status) => Chip(label: Text(status), backgroundColor: status == 'PAID' ? Colors.green.shade100 : status == 'CANCELLED' ? Colors.red.shade100 : Colors.orange.shade100);
}
