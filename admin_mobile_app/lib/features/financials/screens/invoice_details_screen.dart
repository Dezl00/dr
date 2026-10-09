import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/invoice.dart';

class InvoiceDetailsScreen extends StatelessWidget {
  final Invoice invoice;
  const InvoiceDetailsScreen({super.key, required this.invoice});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: Text('تفاصيل الفاتورة', style: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF1E293B), fontWeight: FontWeight.bold)),
        iconTheme: const IconThemeData(color: Colors.black),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.print_outlined),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('الطباعة من التطبيق قيد التطوير', style: GoogleFonts.ibmPlexSansArabic())));
            },
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('الفاتورة #', style: GoogleFonts.ibmPlexSansArabic(fontSize: 20, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B))),
                      _buildStatusBadge(invoice.status),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Divider(color: Color(0xFFE2E8F0)),
                  const SizedBox(height: 16),
                  _buildInfoRow(Icons.person_outline, 'المريض', invoice.patientName),
                  const SizedBox(height: 12),
                  _buildInfoRow(Icons.calendar_today_outlined, 'تاريخ الإصدار', '\-\-'),
                  if (invoice.dueDate != null) ...[
                    const SizedBox(height: 12),
                    _buildInfoRow(Icons.event_outlined, 'تاريخ الاستحقاق', '\-\-'),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 24),
            Text('المالية', style: GoogleFonts.ibmPlexSansArabic(fontSize: 18, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B))),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  _buildAmountRow('المبلغ الإجمالي', invoice.total),
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 8.0),
                    child: Divider(color: Color(0xFFE2E8F0)),
                  ),
                  _buildAmountRow('المدفوع', invoice.status == 'PAID' ? invoice.total : (invoice.status == 'PARTIAL' ? invoice.total * 0.5 : 0), color: const Color(0xFF16A34A)),
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 8.0),
                    child: Divider(color: Color(0xFFE2E8F0)),
                  ),
                  _buildAmountRow('المتبقي', invoice.status == 'PAID' ? 0 : (invoice.status == 'PARTIAL' ? invoice.total * 0.5 : invoice.total), isBold: true, color: const Color(0xFFDC2626)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    Color bgColor;
    String text;
    switch (status) {
      case 'PAID':
        color = const Color(0xFF16A34A);
        bgColor = const Color(0xFFDCFCE7);
        text = 'مسدد';
        break;
      case 'PARTIAL':
        color = const Color(0xFFD97706);
        bgColor = const Color(0xFFFEF3C7);
        text = 'مسدد جزئياً';
        break;
      case 'UNPAID':
        color = const Color(0xFFDC2626);
        bgColor = const Color(0xFFFEF2F2);
        text = 'غير مسدد';
        break;
      default:
        color = const Color(0xFF64748B);
        bgColor = const Color(0xFFF1F5F9);
        text = status;
    }
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(20)),
      child: Text(text, style: GoogleFonts.ibmPlexSansArabic(color: color, fontWeight: FontWeight.bold, fontSize: 12)),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 20, color: const Color(0xFF64748B)),
        const SizedBox(width: 8),
        Text(label + ':', style: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF64748B), fontSize: 14)),
        const SizedBox(width: 8),
        Expanded(
          child: Text(value, style: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF1E293B), fontSize: 14, fontWeight: FontWeight.w600), textAlign: TextAlign.left),
        ),
      ],
    );
  }

  Widget _buildAmountRow(String label, double amount, {bool isBold = false, Color color = const Color(0xFF1E293B)}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: GoogleFonts.ibmPlexSansArabic(fontSize: 16, fontWeight: isBold ? FontWeight.bold : FontWeight.w500, color: const Color(0xFF64748B))),
        Text('\$', style: GoogleFonts.ibmPlexSansArabic(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
      ],
    );
  }
}
