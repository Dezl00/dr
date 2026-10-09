import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/financial_provider.dart';
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
        bool isLoading = false;

        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: const Text('تسجيل مصروف جديد'),
              content: Form(
                key: formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    DropdownButtonFormField<String>(
                      value: selectedCategory,
                      decoration: const InputDecoration(labelText: 'التصنيف', border: OutlineInputBorder()),
                      items: const [
                        DropdownMenuItem(value: 'SALARIES', child: Text('رواتب')),
                        DropdownMenuItem(value: 'RENT', child: Text('إيجار')),
                        DropdownMenuItem(value: 'SUPPLIES', child: Text('مستلزمات')),
                        DropdownMenuItem(value: 'MARKETING', child: Text('تسويق')),
                        DropdownMenuItem(value: 'OTHER', child: Text('أخرى')),
                      ],
                      onChanged: (val) => selectedCategory = val!,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: descController,
                      decoration: const InputDecoration(labelText: 'البيان/الوصف', border: OutlineInputBorder()),
                      validator: (val) => val == null || val.isEmpty ? 'مطلوب' : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: amountController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'المبلغ', border: OutlineInputBorder()),
                      validator: (val) => val == null || val.isEmpty ? 'مطلوب' : null,
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(onPressed: () => Navigator.pop(context), child: const Text('إلغاء')),
                ElevatedButton(
                  onPressed: isLoading ? null : () async {
                    if (formKey.currentState!.validate()) {
                      setState(() => isLoading = true);
                      try {
                        await ref.read(financialRepositoryProvider).createExpense({
                          'category': selectedCategory,
                          'description': descController.text,
                          'amount': double.parse(amountController.text),
                          'expenseDate': DateTime.now().toIso8601String(),
                        });
                        Navigator.pop(context);
                        ref.refresh(expensesFutureProvider);
                      } catch (e) {
                        setState(() => isLoading = false);
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
                      }
                    }
                  },
                  child: isLoading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator()) : const Text('حفظ'),
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
      appBar: AppBar(title: const Text('المصروفات التشغيلية')),
      body: expensesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('خطأ: $err')),
        data: (expenses) {
          if (expenses.isEmpty) {
            return const Center(child: Text('لا توجد مصروفات مسجلة'));
          }
          return RefreshIndicator(
            onRefresh: () async => ref.refresh(expensesFutureProvider),
            child: ListView.builder(
              itemCount: expenses.length,
              itemBuilder: (context, index) {
                final exp = expenses[index];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: ListTile(
                    leading: const CircleAvatar(child: Icon(Icons.money_off, color: Colors.red)),
                    title: Text(exp.description, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('${exp.expenseDate.year}-${exp.expenseDate.month}-${exp.expenseDate.day} • ${exp.category}'),
                    trailing: Text('${exp.amount} ج.م', style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 16)),
                  ),
                );
              },
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddExpenseDialog(context, ref),
        child: const Icon(Icons.add),
      ),
    );
  }
}
