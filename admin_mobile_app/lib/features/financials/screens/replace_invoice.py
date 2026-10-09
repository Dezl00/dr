import re

with open(r'C:\xampp\htdocs\drs\admin_mobile_app\lib\features\financials\screens\invoices_screen.dart', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove import
content = content.replace("import 'create_invoice_screen.dart';", "")

# 2. Add the _showAddInvoiceBottomSheet method inside the state class, before build
bottom_sheet_code = """
  void _showAddInvoiceBottomSheet(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
          ),
          child: _AddInvoiceForm(),
        );
      },
    );
  }
"""

content = content.replace("  @override\n  Widget build(BuildContext context) {", bottom_sheet_code + "\n  @override\n  Widget build(BuildContext context) {")

# 3. Replace the onPressed
content = re.sub(
    r'onPressed:\s*\(\)\s*\{\s*Navigator\.push\([^}]+\}\s*\);?\s*\}',
    r'onPressed: () => _showAddInvoiceBottomSheet(context, ref)',
    content
)

# 4. Add the _AddInvoiceForm Stateful widget at the end of the file
form_code = """
class _AddInvoiceForm extends ConsumerStatefulWidget {
  @override
  ConsumerState<_AddInvoiceForm> createState() => _AddInvoiceFormState();
}

class _AddInvoiceFormState extends ConsumerState<_AddInvoiceForm> {
  final _formKey = GlobalKey<FormState>();
  String? selectedPatientId;
  String paymentMethod = 'CASH';
  final notesController = TextEditingController();
  final initialPaymentController = TextEditingController();
  List<Map<String, dynamic>> items = [{'desc': '', 'qty': 1, 'price': 0.0}];
  bool isLoading = false;

  double get total => items.fold(0.0, (sum, item) => sum + (item['qty'] * item['price']));

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.9),
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'إنشاء فاتورة جديدة',
              style: GoogleFonts.ibmPlexSansArabic(fontSize: 18, fontWeight: FontWeight.bold, color: const Color(0xFF0F172A)),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    DropdownButtonFormField<String>(
                      value: selectedPatientId,
                      dropdownColor: Colors.white,
                      style: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF1E293B)),
                      decoration: InputDecoration(
                        labelText: 'المريض',
                        labelStyle: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF64748B)),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      items: [
                        DropdownMenuItem(value: '1', child: Text('أحمد محمد', style: GoogleFonts.ibmPlexSansArabic())),
                        DropdownMenuItem(value: '2', child: Text('سارة علي', style: GoogleFonts.ibmPlexSansArabic())),
                      ], // Mock patients for now
                      onChanged: (val) => setState(() => selectedPatientId = val),
                      validator: (val) => val == null ? 'مطلوب' : null,
                    ),
                    const SizedBox(height: 16),
                    Text('البنود والخدمات', style: GoogleFonts.ibmPlexSansArabic(fontWeight: FontWeight.bold)),
                    ...items.asMap().entries.map((e) {
                      final i = e.key;
                      final item = e.value;
                      return Row(
                        children: [
                          Expanded(
                            flex: 3,
                            child: TextFormField(
                              initialValue: item['desc'],
                              style: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF1E293B)),
                              decoration: const InputDecoration(hintText: 'الوصف'),
                              onChanged: (val) => item['desc'] = val,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            flex: 1,
                            child: TextFormField(
                              initialValue: item['qty'].toString(),
                              keyboardType: TextInputType.number,
                              style: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF1E293B)),
                              decoration: const InputDecoration(hintText: 'الكمية'),
                              onChanged: (val) => setState(() => item['qty'] = int.tryParse(val) ?? 1),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            flex: 2,
                            child: TextFormField(
                              initialValue: item['price'].toString(),
                              keyboardType: TextInputType.number,
                              style: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF1E293B)),
                              decoration: const InputDecoration(hintText: 'السعر'),
                              onChanged: (val) => setState(() => item['price'] = double.tryParse(val) ?? 0.0),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.delete, color: Colors.red),
                            onPressed: () => setState(() => items.removeAt(i)),
                          )
                        ],
                      );
                    }).toList(),
                    TextButton.icon(
                      onPressed: () => setState(() => items.add({'desc': '', 'qty': 1, 'price': 0.0})),
                      icon: const Icon(Icons.add),
                      label: Text('إضافة بند', style: GoogleFonts.ibmPlexSansArabic()),
                    ),
                    const Divider(),
                    TextFormField(
                      controller: initialPaymentController,
                      keyboardType: TextInputType.number,
                      style: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF1E293B)),
                      decoration: InputDecoration(
                        labelText: 'المدفوع الآن',
                        labelStyle: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF64748B)),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      value: paymentMethod,
                      dropdownColor: Colors.white,
                      style: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF1E293B)),
                      decoration: InputDecoration(
                        labelText: 'طريقة الدفع',
                        labelStyle: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF64748B)),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      items: [
                        DropdownMenuItem(value: 'CASH', child: Text('كاش', style: GoogleFonts.ibmPlexSansArabic())),
                        DropdownMenuItem(value: 'CARD', child: Text('فيزا / ماستركارد', style: GoogleFonts.ibmPlexSansArabic())),
                        DropdownMenuItem(value: 'BANK_TRANSFER', child: Text('تحويل بنكي / محافظ', style: GoogleFonts.ibmPlexSansArabic())),
                      ],
                      onChanged: (val) => setState(() => paymentMethod = val!),
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: notesController,
                      style: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF1E293B)),
                      decoration: InputDecoration(
                        labelText: 'ملاحظات',
                        labelStyle: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF64748B)),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('الإجمالي:', style: GoogleFonts.ibmPlexSansArabic(fontSize: 16, fontWeight: FontWeight.bold)),
                  Text('${total.toStringAsFixed(2)} EGP', style: GoogleFonts.ibmPlexSansArabic(fontSize: 16, fontWeight: FontWeight.bold, color: const Color(0xFF2563EB))),
                ],
              ),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2563EB),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              onPressed: () {
                if (_formKey.currentState!.validate()) {
                  // Submit
                  Navigator.pop(context);
                }
              },
              child: Text('حفظ وإصدار الفاتورة', style: GoogleFonts.ibmPlexSansArabic(fontWeight: FontWeight.bold)),
            )
          ],
        ),
      ),
    );
  }
}
"""

with open(r'C:\xampp\htdocs\drs\admin_mobile_app\lib\features\financials\screens\invoices_screen.dart', 'w', encoding='utf-8') as f:
    f.write(content + "\n" + form_code)

print("Invoices screen modified.")
