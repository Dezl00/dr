import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
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

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: Text('الفواتير', style: GoogleFonts.ibmPlexSansArabic(color: Colors.black)),
        elevation: 0,
        actions: [
          IconButton(icon: const Icon(Icons.refresh, color: Colors.black), onPressed: () => ref.read(invoiceStateProvider.notifier).fetchData()),
        ],
      ),
      body: _buildBody(state),
      floatingActionButton: FloatingActionButton(heroTag: null, 
        backgroundColor: const Color(0xFF2563EB),
        onPressed: () => _showAddInvoiceDialog(context, ref),
        child: const Icon(Icons.add, color: Colors.white),
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

        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              backgroundColor: Colors.white,
              surfaceTintColor: Colors.transparent,
              title: Text('إضافة فاتورة جديدة', style: GoogleFonts.ibmPlexSansArabic(fontWeight: FontWeight.bold, fontSize: 18)),
              content: Form(
                key: formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextFormField(
                      controller: patientController,
                      decoration: InputDecoration(
                        labelText: 'اسم المريض',
                        labelStyle: GoogleFonts.ibmPlexSansArabic(),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      validator: (val) => val != null && val.isEmpty ? 'مطلوب' : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: amountController,
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(
                        labelText: 'المبلغ الإجمالي',
                        labelStyle: GoogleFonts.ibmPlexSansArabic(),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
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
                  child: Text('إلغاء', style: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF64748B))),
                ),
                ElevatedButton(
                  onPressed: isLoading ? null : () async {
                    if (formKey.currentState!.validate()) {
                      setState(() => isLoading = true);
                      await Future.delayed(const Duration(seconds: 1)); // Mock API
                      if (context.mounted) {
                        ref.read(invoiceStateProvider.notifier).fetchData();
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تمت الإضافة بنجاح (محاكاة)')));
                      }
                    }
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2563EB)),
                  child: isLoading 
                    ? const SizedBox(width:20, height:20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : Text('حفظ', style: GoogleFonts.ibmPlexSansArabic(color: Colors.white)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Widget _buildBody(InvoiceState state) {
    if (state.isLoading) return const Center(child: CircularProgressIndicator());
    if (state.invoices.isEmpty) return const Center(child: Text('لا توجد فواتير'));

    return ListView.builder(
      itemCount: state.invoices.length,
      itemBuilder: (context, index) => _buildInvoiceCard(context, state.invoices[index]),
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
        statusColor = const Color(0xFF64748B);
        statusBgColor = const Color(0xFFF1F5F9);
        statusText = invoice.status;
    }

    return GestureDetector(
      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => InvoiceDetailsScreen(invoice: invoice))),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: const Color(0xFFE2E8F0)),
          borderRadius: BorderRadius.circular(12),
        ),
        child: ListTile(
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          title: Text(invoice.patientName, style: GoogleFonts.ibmPlexSansArabic(fontWeight: FontWeight.w600, color: const Color(0xFF1E293B), fontSize: 16)),
          subtitle: Text('التاريخ: \-\-', style: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF64748B), fontSize: 14)),
          trailing: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('\$', style: GoogleFonts.ibmPlexSansArabic(fontWeight: FontWeight.bold, color: const Color(0xFF1E293B), fontSize: 15)),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: statusBgColor, borderRadius: BorderRadius.circular(6)),
                child: Text(statusText, style: GoogleFonts.ibmPlexSansArabic(color: statusColor, fontSize: 12, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

