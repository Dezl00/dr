import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/expense_provider.dart';
import '../models/expense.dart';

// Very basic StateNotifier for expenses to demonstrate Phase 2 functionality
final expensesFutureProvider = FutureProvider.autoDispose<List<Expense>>((ref) async {
  final repo = ref.watch(financialRepositoryProvider);
  final rawData = await repo.getExpenses();
  return rawData.map((e) => Expense.fromJson(e)).toList();
});

class ExpensesScreen extends ConsumerWidget {
  const ExpensesScreen({super.key});

  void _showAddExpenseDialog(BuildContext context, WidgetRef ref) {
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
                    backgroundColor: Colors.white,
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
                            backgroundColor: Colors.white,
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
  }
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final expensesAsync = ref.watch(expensesFutureProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        title: Text(
          'المصروفات التشغيلية',
          style: GoogleFonts.ibmPlexSansArabic(
            color: const Color(0xFF0F172A),
            fontWeight: FontWeight.w600,
            fontSize: 20,
          ),
        ),
        iconTheme: const IconThemeData(color: Color(0xFF0F172A)),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: const Color(0xFFE2E8F0), height: 1),
        ),
      ),
      body: expensesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFF2563EB))),
        error: (err, stack) => Center(
          child: Text(
            'خطأ: $err',
            style: GoogleFonts.ibmPlexSansArabic(color: Colors.red),
          ),
        ),
        data: (expenses) {
          if (expenses.isEmpty) {
            return Center(
              child: Text(
                'لا توجد مصروفات مسجلة',
                style: GoogleFonts.ibmPlexSansArabic(
                  color: const Color(0xFF64748B),
                  fontSize: 16,
                ),
              ),
            );
          }
          return RefreshIndicator(
            color: const Color(0xFF2563EB),
            onRefresh: () async => ref.refresh(expensesFutureProvider),
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(vertical: 16),
              itemCount: expenses.length,
              itemBuilder: (context, index) {
                final exp = expenses[index];
                return Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    leading: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF2F2), // Red 50
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.money_off, color: Color(0xFFDC2626)), // Red 600
                    ),
                    title: Text(
                      exp.description,
                      style: GoogleFonts.ibmPlexSansArabic(
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF1E293B),
                        fontSize: 16,
                      ),
                    ),
                    subtitle: Text(
                      '${exp.expenseDate.year}-${exp.expenseDate.month}-${exp.expenseDate.day} • ${exp.category}',
                      style: GoogleFonts.ibmPlexSansArabic(
                        color: const Color(0xFF64748B),
                        fontSize: 14,
                      ),
                    ),
                    trailing: Text(
                      '${exp.amount} ج.م',
                      style: GoogleFonts.ibmPlexSansArabic(
                        color: const Color(0xFFDC2626), // Red 600
                        fontWeight: FontWeight.w700,
                        fontSize: 16,
                      ),
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(heroTag: null, 
        backgroundColor: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        onPressed: () => _showAddExpenseDialog(context, ref),
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }
}

