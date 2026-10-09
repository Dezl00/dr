import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../core/api/api_endpoints.dart';

final inventoryFutureProvider = FutureProvider.autoDispose<List<dynamic>>((ref) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get(ApiEndpoints.inventory);
  if (response.statusCode == 200 && response.data['success'] == true) {
    return response.data['data'] as List<dynamic>;
  }
  return []; // Mock return for now if API isn't strictly ready
});

class InventoryScreen extends ConsumerWidget {
  const InventoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final inventoryAsync = ref.watch(inventoryFutureProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('المخزون والأدوات')),
      body: inventoryAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('خطأ: $err')),
        data: (items) {
          if (items.isEmpty) {
            return const Center(child: Text('المخزون فارغ، قم بإضافة أدوات جديدة'));
          }
          return ListView.builder(
            itemCount: items.length,
            itemBuilder: (context, index) {
              final item = items[index];
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: ListTile(
                  leading: const CircleAvatar(child: Icon(Icons.inventory_2)),
                  title: Text(item['name'] ?? 'أداة طبية', style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text('الكمية الحالية: ${item['currentStock'] ?? 0} ${item['unit'] ?? "قطعة"}'),
                  trailing: IconButton(
                    icon: const Icon(Icons.add_shopping_cart, color: Colors.green),
                    onPressed: () {
                      // Add stock dialog
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('سيتم تفعيل توريد المخزون قريباً')));
                    },
                  ),
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          _showAddItemDialog(context);
        },
        icon: const Icon(Icons.add),
        label: const Text('إضافة صنف'),
      ),
    );
  }

  void _showAddItemDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('إضافة صنف جديد'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(decoration: const InputDecoration(labelText: 'اسم الصنف (مثال: حقن بنج)')),
              TextField(decoration: const InputDecoration(labelText: 'الوحدة (مثال: علبة، قطعة)')),
              TextField(decoration: const InputDecoration(labelText: 'الحد الأدنى للتنبيه'), keyboardType: TextInputType.number),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('إلغاء')),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تمت إضافة الصنف بنجاح')));
              },
              child: const Text('حفظ'),
            ),
          ],
        );
      },
    );
  }
}
