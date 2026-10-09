import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../core/api/api_endpoints.dart';

final leadsFutureProvider = FutureProvider.autoDispose<List<dynamic>>((ref) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get(ApiEndpoints.leads);
  if (response.statusCode == 200 && response.data['success'] == true) {
    return response.data['data'] as List<dynamic>;
  }
  throw Exception('فشل في جلب العملاء المحتملين');
});

class LeadsScreen extends ConsumerWidget {
  const LeadsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final leadsAsync = ref.watch(leadsFutureProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('التسويق (العملاء المحتملين)')),
      body: leadsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('خطأ: $err')),
        data: (leads) {
          if (leads.isEmpty) return const Center(child: Text('لا يوجد طلبات تسويقية حالياً'));
          return RefreshIndicator(
            onRefresh: () async => ref.refresh(leadsFutureProvider),
            child: ListView.builder(
              itemCount: leads.length,
              itemBuilder: (context, index) {
                final lead = leads[index];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: ListTile(
                    leading: const CircleAvatar(child: Icon(Icons.campaign)),
                    title: Text(lead['fullName'], style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('${lead['phone']}\nالمصدر: ${lead['source']}'),
                    isThreeLine: true,
                    trailing: Chip(
                      label: Text(lead['status'] == 'NEW' ? 'جديد' : 'تم التواصل'),
                      backgroundColor: lead['status'] == 'NEW' ? Colors.green.shade100 : Colors.grey.shade300,
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
