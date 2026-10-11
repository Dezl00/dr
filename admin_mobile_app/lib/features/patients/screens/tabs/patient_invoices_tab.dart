import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../financials/models/invoice.dart';
import '../../../financials/providers/invoice_provider.dart';
import '../../../financials/screens/invoice_details_screen.dart';

class PatientInvoicesTab extends ConsumerStatefulWidget {
  final String patientId;

  const PatientInvoicesTab({super.key, required this.patientId});

  @override
  ConsumerState<PatientInvoicesTab> createState() => _PatientInvoicesTabState();
}

class _PatientInvoicesTabState extends ConsumerState<PatientInvoicesTab> {
  late Future<List<Invoice>> _invoices;

  @override
  void initState() {
    super.initState();
    _invoices = _loadInvoices();
  }

  Future<List<Invoice>> _loadInvoices() async {
    final result = await ref.read(financialRepositoryProvider).getInvoices(
          patientId: widget.patientId,
          limit: 100,
        );
    return result.data;
  }

  void _refresh() => setState(() => _invoices = _loadInvoices());

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Invoice>>(
      future: _invoices,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Center(child: CircularProgressIndicator());
        }

        if (snapshot.hasError) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('تعذر تحميل سجل الفواتير', textAlign: TextAlign.center),
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: _refresh,
                    icon: const Icon(Icons.refresh),
                    label: const Text('إعادة المحاولة'),
                  ),
                ],
              ),
            ),
          );
        }

        final invoices = snapshot.data ?? const <Invoice>[];
        if (invoices.isEmpty) {
          return RefreshIndicator(
            onRefresh: () async => _refresh(),
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              children: const [
                SizedBox(height: 120),
                Icon(Icons.receipt_long_outlined, size: 48, color: Color(0xFF94A3B8)),
                SizedBox(height: 12),
                Center(child: Text('لا توجد فواتير مسجلة لهذا المريض')),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () async => _refresh(),
          child: ListView.separated(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16),
            itemCount: invoices.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final invoice = invoices[index];
              return Card(
                child: ListTile(
                  onTap: () async {
                    await Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => InvoiceDetailsScreen(invoice: invoice)),
                    );
                    if (mounted) _refresh();
                  },
                  leading: const CircleAvatar(
                    backgroundColor: Color(0xFFEFF6FF),
                    child: Icon(Icons.receipt_long_outlined, color: Color(0xFF2563EB)),
                  ),
                  title: Text(invoice.invoiceNumber ?? 'فاتورة'),
                  subtitle: Text(_dateLabel(invoice.issueDate)),
                  trailing: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        invoice.total.toStringAsFixed(2),
                        textDirection: TextDirection.ltr,
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      Text(
                        _statusLabel(invoice.status),
                        style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        );
      },
    );
  }

  String _dateLabel(DateTime date) =>
      '${date.year}/${date.month.toString().padLeft(2, '0')}/${date.day.toString().padLeft(2, '0')}';

  String _statusLabel(String status) => switch (status) {
        'PAID' => 'مسددة',
        'PARTIAL' => 'مدفوعة جزئياً',
        'UNPAID' => 'غير مسددة',
        'CANCELLED' => 'ملغاة',
        _ => status,
      };
}
