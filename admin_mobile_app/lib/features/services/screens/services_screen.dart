import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../core/api/api_endpoints.dart';

final servicesFutureProvider = FutureProvider.autoDispose<List<dynamic>>((ref) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get(ApiEndpoints.services);
  if (response.statusCode == 200 && response.data['success'] == true) {
    return response.data['data'] as List<dynamic>;
  }
  throw Exception('فشل في جلب الخدمات');
});

class ServicesScreen extends ConsumerWidget {
  const ServicesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final servicesAsync = ref.watch(servicesFutureProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('الخدمات الطبية')),
      body: servicesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('خطأ: $err')),
        data: (services) {
          if (services.isEmpty) return const Center(child: Text('لا توجد خدمات مسجلة'));
          return RefreshIndicator(
            onRefresh: () async => ref.refresh(servicesFutureProvider),
            child: ListView.builder(
              itemCount: services.length,
              itemBuilder: (context, index) {
                final service = services[index];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: ListTile(
                    leading: const CircleAvatar(child: Icon(Icons.medical_services)),
                    title: Text(service['name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text(service['description'] ?? 'لا يوجد وصف'),
                    trailing: service['price'] != null 
                        ? Text('${service['price']} ج.م', style: const TextStyle(fontWeight: FontWeight.bold))
                        : const Text('مجاناً'),
                  ),
                );
              },
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          _showAddServiceDialog(context);
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showAddServiceDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('إضافة خدمة طبية جديدة'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(decoration: const InputDecoration(labelText: 'اسم الخدمة (مثال: تنظيف وتلميع)')),
              TextField(decoration: const InputDecoration(labelText: 'السعر (ج.م)'), keyboardType: TextInputType.number),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('إلغاء')),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تمت إضافة الخدمة بنجاح')));
              },
              child: const Text('حفظ'),
            ),
          ],
        );
      },
    );
  }
}
