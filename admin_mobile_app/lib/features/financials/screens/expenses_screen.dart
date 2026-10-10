import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/widgets/error_state_widget.dart';
import '../../../core/widgets/empty_state_widget.dart';
import '../../../core/providers/base_offline_provider.dart';
import '../providers/expense_provider.dart';
import '../models/expense.dart';

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

        return Directionality(
          textDirection: TextDirection.rtl,
          child: StatefulBuilder(
            builder: (context, setState) {
              return AlertDialog(
                backgroundColor: Colors.white,
                surfaceTintColor: Colors.transparent,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
                title: const Text(
                  'تسجيل مصروف جديد',
                  style: TextStyle(
                    fontFamily: 'IBMPlexSansArabic',
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF0F172A),
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
                          style: const TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF0F172A)),
                          decoration: InputDecoration(
                            labelText: 'التصنيف',
                            labelStyle: const TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF475569)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF2563EB))),
                          ),
                          items: const [
                            DropdownMenuItem(value: 'SALARIES', child: Text('رواتب وأجور', style: TextStyle(fontFamily: 'IBMPlexSansArabic'))),
                            DropdownMenuItem(value: 'RENT', child: Text('إيجار', style: TextStyle(fontFamily: 'IBMPlexSansArabic'))),
                            DropdownMenuItem(value: 'SUPPLIES', child: Text('مستلزمات طبية/أدوية', style: TextStyle(fontFamily: 'IBMPlexSansArabic'))),
                            DropdownMenuItem(value: 'UTILITIES', child: Text('مرافق (كهرباء، مياه، إنترنت)', style: TextStyle(fontFamily: 'IBMPlexSansArabic'))),
                            DropdownMenuItem(value: 'MARKETING', child: Text('تسويق وإعلانات', style: TextStyle(fontFamily: 'IBMPlexSansArabic'))),
                            DropdownMenuItem(value: 'MAINTENANCE', child: Text('صيانة', style: TextStyle(fontFamily: 'IBMPlexSansArabic'))),
                            DropdownMenuItem(value: 'OTHER', child: Text('أخرى', style: TextStyle(fontFamily: 'IBMPlexSansArabic'))),
                          ],
                          onChanged: (val) => selectedCategory = val!,
                        ),
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: descController,
                          style: const TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF0F172A)),
                          decoration: InputDecoration(
                            labelText: 'البيان/الوصف',
                            labelStyle: const TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF475569)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF2563EB))),
                          ),
                          validator: (val) => val == null || val.isEmpty ? 'مطلوب' : null,
                        ),
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: amountController,
                          keyboardType: TextInputType.number,
                          style: const TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF0F172A)),
                          decoration: InputDecoration(
                            labelText: 'المبلغ',
                            labelStyle: const TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF475569)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF2563EB))),
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
                              labelStyle: const TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF475569)),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                            ),
                            child: Text(
                              "${selectedDate.year}-${selectedDate.month.toString().padLeft(2, '0')}-${selectedDate.day.toString().padLeft(2, '0')}",
                              style: const TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF0F172A)),
                              textDirection: TextDirection.ltr,
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
                    child: const Text('إلغاء', style: TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF475569))),
                  ),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2563EB),
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(50)),
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    ),
                    onPressed: isLoading ? null : () async {
                      if (formKey.currentState!.validate()) {
                        setState(() => isLoading = true);
                        try {
                          await ref.read(expenseStateProvider.notifier).createItem({
                            'category': selectedCategory,
                            'description': descController.text,
                            'amount': double.parse(amountController.text),
                            'expenseDate': selectedDate.toIso8601String(),
                          });
                          if (context.mounted) Navigator.pop(context);
                        } catch (e) {
                          setState(() => isLoading = false);
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                              content: Text(e.toString(), style: const TextStyle(fontFamily: 'IBMPlexSansArabic')),
                              backgroundColor: const Color(0xFFDC2626),
                            ));
                          }
                        }
                      }
                    },
                    child: isLoading
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Text('حفظ', style: TextStyle(fontFamily: 'IBMPlexSansArabic', color: Colors.white)),
                  ),
                ],
              );
            }
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(expenseStateProvider);

    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: Column(
            children: [
              _buildHeader(context, ref),
              Expanded(
                child: Builder(
                  builder: (context) {
                    if (state.isLoading && state.items.isEmpty) {
                      return const Center(child: CircularProgressIndicator(color: Color(0xFF2563EB)));
                    }

                    if (state.error != null && state.items.isEmpty) {
                      return ErrorStateWidget(
                        error: state.error!,
                        onRetry: () => ref.read(expenseStateProvider.notifier).fetchData(),
                      );
                    }

                    if (state.items.isEmpty) {
                      return const EmptyStateWidget(
                        icon: Icons.money_off,
                        title: 'لا توجد مصروفات',
                        description: 'لم يتم تسجيل أي مصروفات حتى الآن.',
                      );
                    }

                    final expenses = state.items;
                    return RefreshIndicator(
                      color: const Color(0xFF2563EB),
                      onRefresh: () => ref.read(expenseStateProvider.notifier).fetchData(),
                      child: ListView.builder(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        itemCount: expenses.length,
                        itemBuilder: (context, index) {
                          final exp = expenses[index];
                          return Container(
                            margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: ListTile(
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              leading: Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFEF2F2),
                                  borderRadius: BorderRadius.circular(50),
                                ),
                                child: const Icon(Icons.money_off, color: Color(0xFFDC2626)),
                              ),
                              title: Text(
                                exp.description,
                                style: const TextStyle(
                                  fontFamily: 'IBMPlexSansArabic',
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF0F172A),
                                  fontSize: 16,
                                ),
                              ),
                              subtitle: Text(
                                '${exp.expenseDate.year}-${exp.expenseDate.month}-${exp.expenseDate.day} • ${exp.category}',
                                style: const TextStyle(
                                  fontFamily: 'IBMPlexSansArabic',
                                  color: Color(0xFF475569),
                                  fontSize: 14,
                                ),
                                textDirection: TextDirection.ltr,
                                textAlign: TextAlign.right,
                              ),
                              trailing: Text(
                                '${exp.amount} ج.م',
                                style: const TextStyle(
                                  fontFamily: 'IBMPlexSansArabic',
                                  color: Color(0xFFDC2626),
                                  fontWeight: FontWeight.w700,
                                  fontSize: 16,
                                ),
                                textDirection: TextDirection.ltr,
                              ),
                            ),
                          );
                        },
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, WidgetRef ref) {
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
                'المصروفات',
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
                onPressed: () => ref.read(expenseStateProvider.notifier).fetchData(),
              ),
            ],
          ),
          ElevatedButton.icon(
            onPressed: () => _showAddExpenseDialog(context, ref),
            icon: const Icon(Icons.add, color: Colors.white, size: 20),
            label: const Text(
              'إضافة مصروف',
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
}
