import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../core/api/api_endpoints.dart';

final teamFutureProvider = FutureProvider.autoDispose<List<dynamic>>((ref) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get(ApiEndpoints.team);
  if (response.statusCode == 200 && response.data['success'] == true) {
    return response.data['data'] as List<dynamic>;
  }
  throw Exception('فشل في جلب فريق العمل');
});

class TeamScreen extends ConsumerWidget {
  const TeamScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final teamAsync = ref.watch(teamFutureProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('فريق العمل')),
      body: teamAsync.when(
        loading: () => const SizedBox(),
        error: (err, stack) => Center(child: Text('خطأ: $err', style: const TextStyle(fontFamily: 'IBMPlexSansArabic'))),
        data: (team) {
          if (team.isEmpty) return const Center(child: Text('لا يوجد أعضاء في الفريق'));
          return RefreshIndicator(
            onRefresh: () async => ref.refresh(teamFutureProvider),
            child: ListView.builder(
              itemCount: team.length,
              itemBuilder: (context, index) {
                final member = team[index];
                final user = member['user'];
                final role = member['role'];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                      child: Text(user['fullName']?.substring(0, 1) ?? '?'),
                    ),
                    title: Text(user['fullName'] ?? 'بدون اسم', style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text(user['email'] ?? ''),
                    trailing: Chip(label: Text(role['nameAr'] ?? role['name'])),
                  ),
                );
              },
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(heroTag: null, 
        onPressed: () {
          _showAddTeamDialog(context);
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showAddTeamDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('إضافة موظف / طبيب جديد'),
          content: const Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(decoration: InputDecoration(labelText: 'الاسم بالكامل')),
              TextField(decoration: InputDecoration(labelText: 'البريد الإلكتروني')),
              TextField(decoration: InputDecoration(labelText: 'الدور (مثال: طبيب، استقبال)')),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('إلغاء')),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم إرسال دعوة للموظف الجديد')));
              },
              child: const Text('إضافة'),
            ),
          ],
        );
      },
    );
  }
}
