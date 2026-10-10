import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/widgets/error_state_widget.dart';
import '../../../core/widgets/empty_state_widget.dart';
import '../../../core/providers/base_offline_provider.dart';
import '../models/invoice.dart';
import '../providers/invoice_provider.dart';
import 'invoice_details_screen.dart';

class InvoicesScreen extends ConsumerStatefulWidget {
  const InvoicesScreen({super.key});

  @override
  ConsumerState<InvoicesScreen> createState() => _InvoicesScreenState();
}

class _InvoicesScreenState extends ConsumerState<InvoicesScreen> {
  @override
  Widget build(BuildContext context) {
    final state = ref.watch(invoiceStateProvider);

    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: Column(
            children: [
              _buildHeader(context),
              Expanded(child: _buildBody(state)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0), width: 1)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              const Text(
                'الفواتير',
                style: TextStyle(
                  fontFamily: 'IBMPlexSansArabic',
                  color: Color(0xFF0F172A),
                  fontWeight: FontWeight.w600,
                  fontSize: 20,
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                icon: const Icon(Icons.refresh, color: Color(0xFF475569)),
                onPressed: () => ref.read(invoiceStateProvider.notifier).fetchData(),
              ),
            ],
          ),
          ElevatedButton.icon(
            onPressed: () => _showAddInvoiceDialog(context, ref),
            icon: const Icon(Icons.add, color: Colors.white, size: 20),
            label: const Text(
              'إضافة فاتورة',
              style: TextStyle(
                fontFamily: 'IBMPlexSansArabic',
                color: Colors.white,
                fontWeight: FontWeight.w500,
              ),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2563EB),
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(50),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            ),
          ),
        ],
      ),
    );
  }

  void _showAddInvoiceDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) {
        final formKey = GlobalKey<FormState>();
        final patientController = TextEditingController();
        final amountController = TextEditingController();
        bool isLoading = false;

        return Directionality(
          textDirection: TextDirection.rtl,
          child: StatefulBuilder(
            builder: (context, setState) {
              return AlertDialog(
                backgroundColor: Colors.white,
                surfaceTintColor: Colors.transparent,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: const BorderSide(color: Color(0xFFE2E8F0), width: 1),
                ),
                title: const Text(
                  'إضافة فاتورة جديدة',
                  style: TextStyle(
                    fontFamily: 'IBMPlexSansArabic',
                    fontWeight: FontWeight.w600,
                    fontSize: 18,
                    color: Color(0xFF0F172A),
                  ),
                ),
                content: Form(
                  key: formKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      TextFormField(
                        controller: patientController,
                        style: const TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF0F172A)),
                        decoration: InputDecoration(
                          labelText: 'اسم المريض',
                          labelStyle: const TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF475569)),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF2563EB))),
                        ),
                        validator: (val) => val != null && val.isEmpty ? 'مطلوب' : null,
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: amountController,
                        keyboardType: TextInputType.number,
                        style: const TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF0F172A)),
                        decoration: InputDecoration(
                          labelText: 'المبلغ الإجمالي',
                          labelStyle: const TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF475569)),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF2563EB))),
                          prefixText: '\$ ',
                        ),
                        validator: (val) => val != null && val.isEmpty ? 'مطلوب' : null,
                      ),
                    ],
                  ),
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('إلغاء', style: TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF475569))),
                  ),
                  ElevatedButton(
                    onPressed: isLoading ? null : () async {
                      if (formKey.currentState!.validate()) {
                        setState(() => isLoading = true);
                        await ref.read(invoiceStateProvider.notifier).createItem({
                          'patientName': patientController.text,
                          'total': double.parse(amountController.text),
                          'subtotal': double.parse(amountController.text),
                          'status': 'DRAFT',
                        });
                        if (context.mounted) {
                          Navigator.pop(context);
                          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تمت الإضافة بنجاح', style: TextStyle(fontFamily: 'IBMPlexSansArabic'))));
                        }
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2563EB),
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(50)),
                    ),
                    child: isLoading 
                      ? const SizedBox(width:20, height:20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('حفظ', style: TextStyle(fontFamily: 'IBMPlexSansArabic', color: Colors.white)),
                  ),
                ],
              );
            },
          ),
        );
      },
    );
  }

  Widget _buildBody(OfflineState<Invoice> state) {
    if (state.isLoading && state.items.isEmpty) return const Center(child: CircularProgressIndicator(color: Color(0xFF2563EB)));
    
    if (state.error != null && state.items.isEmpty) {
      return ErrorStateWidget(
        error: state.error!,
        onRetry: () => ref.read(invoiceStateProvider.notifier).fetchData(),
      );
    }
    
    if (state.items.isEmpty) {
      return const EmptyStateWidget(
        icon: Icons.receipt_long_outlined,
        title: 'لا توجد فواتير',
        description: 'لم يتم إصدار أي فواتير بعد.',
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(vertical: 16),
      itemCount: state.items.length,
      itemBuilder: (context, index) => _buildInvoiceCard(context, state.items[index]),
    );
  }

  Widget _buildInvoiceCard(BuildContext context, Invoice invoice) {
    Color statusColor;
    Color statusBgColor;
    String statusText;
    switch (invoice.status) {
      case 'PAID': 
        statusColor = const Color(0xFF16A34A);
        statusBgColor = const Color(0xFFDCFCE7);
        statusText = 'مسدد';
        break;
      case 'PARTIAL': 
        statusColor = const Color(0xFFD97706);
        statusBgColor = const Color(0xFFFEF3C7);
        statusText = 'مسدد جزئياً';
        break;
      case 'UNPAID': 
        statusColor = const Color(0xFFDC2626);
        statusBgColor = const Color(0xFFFEF2F2);
        statusText = 'غير مسدد';
        break;
      default: 
        statusColor = const Color(0xFF475569);
        statusBgColor = const Color(0xFFF1F5F9);
        statusText = invoice.status;
    }

    return GestureDetector(
      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => InvoiceDetailsScreen(invoice: invoice))),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: const Color(0xFFE2E8F0)),
          borderRadius: BorderRadius.circular(16),
        ),
        child: ListTile(
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          title: Text(invoice.patientName, style: const TextStyle(fontFamily: 'IBMPlexSansArabic', fontWeight: FontWeight.w600, color: Color(0xFF0F172A), fontSize: 16)),
          subtitle: const Text('التاريخ: \-\-', style: TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF94A3B8), fontSize: 14)),
          trailing: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                invoice.total.toStringAsFixed(2),
                style: const TextStyle(fontFamily: 'IBMPlexSansArabic', fontWeight: FontWeight.bold, color: Color(0xFF0F172A), fontSize: 15),
                textDirection: TextDirection.ltr,
              ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: statusBgColor, borderRadius: BorderRadius.circular(50)),
                child: Text(statusText, style: TextStyle(fontFamily: 'IBMPlexSansArabic', color: statusColor, fontSize: 12, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
