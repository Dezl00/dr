import re

with open(r'C:\xampp\htdocs\drs\admin_mobile_app\lib\features\financials\screens\expenses_screen.dart', 'r', encoding='utf-8') as f:
    content = f.read()

new_method = """  void _showAddExpenseDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) {
        final formKey = GlobalKey<FormState>();
        final descController = TextEditingController();
        final amountController = TextEditingController();
        String selectedCategory = 'SALARIES';
        DateTime selectedDate = DateTime.now();
        bool isLoading = false;

        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              backgroundColor: Colors.white,
              surfaceTintColor: Colors.transparent,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: const BorderSide(color: Color(0xFFE2E8F0)),
              ),
              title: Text(
                'تسجيل مصروف جديد',
                style: GoogleFonts.ibmPlexSansArabic(
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF0F172A),
                  fontSize: 18,
                ),
              ),
              content: Form(
                key: formKey,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      DropdownButtonFormField<String>(
                        value: selectedCategory,
                        dropdownColor: Colors.white,
                        style: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF1E293B)),
                        decoration: InputDecoration(
                          labelText: 'التصنيف',
                          labelStyle: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF64748B)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(color: Color(0xFF2563EB)),
                          ),
                        ),
                        items: [
                          DropdownMenuItem(value: 'SALARIES', child: Text('رواتب وأجور', style: GoogleFonts.ibmPlexSansArabic())),
                          DropdownMenuItem(value: 'RENT', child: Text('إيجار', style: GoogleFonts.ibmPlexSansArabic())),
                          DropdownMenuItem(value: 'SUPPLIES', child: Text('مستلزمات طبية/أدوية', style: GoogleFonts.ibmPlexSansArabic())),
                          DropdownMenuItem(value: 'UTILITIES', child: Text('مرافق (كهرباء، مياه، إنترنت)', style: GoogleFonts.ibmPlexSansArabic())),
                          DropdownMenuItem(value: 'MARKETING', child: Text('تسويق وإعلانات', style: GoogleFonts.ibmPlexSansArabic())),
                          DropdownMenuItem(value: 'MAINTENANCE', child: Text('صيانة', style: GoogleFonts.ibmPlexSansArabic())),
                          DropdownMenuItem(value: 'OTHER', child: Text('أخرى', style: GoogleFonts.ibmPlexSansArabic())),
                        ],
                        onChanged: (val) => selectedCategory = val!,
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: descController,
                        style: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF1E293B)),
                        decoration: InputDecoration(
                          labelText: 'البيان/الوصف',
                          labelStyle: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF64748B)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(color: Color(0xFF2563EB)),
                          ),
                        ),
                        validator: (val) => val == null || val.isEmpty ? 'مطلوب' : null,
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: amountController,
                        keyboardType: TextInputType.number,
                        style: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF1E293B)),
                        decoration: InputDecoration(
                          labelText: 'المبلغ',
                          labelStyle: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF64748B)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(color: Color(0xFF2563EB)),
                          ),
                        ),
                        validator: (val) => val == null || val.isEmpty ? 'مطلوب' : null,
                      ),
                      const SizedBox(height: 16),
                      InkWell(
                        onTap: () async {
                          final DateTime? picked = await showDatePicker(
                            context: context,
                            initialDate: selectedDate,
                            firstDate: DateTime(2020),
                            lastDate: DateTime(2101),
                          );
                          if (picked != null && picked != selectedDate) {
                            setState(() {
                              selectedDate = picked;
                            });
                          }
                        },
                        child: InputDecorator(
                          decoration: InputDecoration(
                            labelText: 'تاريخ المصروف',
                            labelStyle: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF64748B)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                            ),
                          ),
                          child: Text(
                            "${selectedDate.year}-${selectedDate.month.toString().padLeft(2, '0')}-${selectedDate.day.toString().padLeft(2, '0')}",
                            style: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF1E293B)),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              actionsPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text('إلغاء', style: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF64748B))),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2563EB),
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  ),
                  onPressed: isLoading ? null : () async {
                    if (formKey.currentState!.validate()) {
                      setState(() => isLoading = true);
                      try {
                        await ref.read(financialRepositoryProvider).createExpense({
                          'category': selectedCategory,
                          'description': descController.text,
                          'amount': double.parse(amountController.text),
                          'expenseDate': selectedDate.toIso8601String(),
                        });
                        if (context.mounted) Navigator.pop(context);
                        ref.refresh(expensesFutureProvider);
                      } catch (e) {
                        setState(() => isLoading = false);
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                            content: Text(e.toString(), style: GoogleFonts.ibmPlexSansArabic()),
                            backgroundColor: const Color(0xFF1E293B),
                          ));
                        }
                      }
                    }
                  },
                  child: isLoading
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : Text('حفظ', style: GoogleFonts.ibmPlexSansArabic()),
                ),
              ],
            );
          }
        );
      },
    );
  }"""

old_method_pattern = re.compile(r'  void _showAddExpenseDialog\(BuildContext context, WidgetRef ref\) \{.*?(?=\n  @override\n  Widget build)', re.DOTALL)
content = old_method_pattern.sub(new_method, content)

with open(r'C:\xampp\htdocs\drs\admin_mobile_app\lib\features\financials\screens\expenses_screen.dart', 'w', encoding='utf-8') as f:
    f.write(content)

print('Replaced Add Expense dialog successfully.')
