import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_endpoints.dart';
import '../../../core/providers/services_provider.dart';
import '../../../core/utils/toast_util.dart';
import '../../auth/providers/auth_provider.dart';
import 'create_service_screen.dart';

final _serviceManagementProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final response = await ref.watch(dioProvider).get('${ApiEndpoints.services}?includeInactive=true');
  final body = response.data;
  final rawItems = body is Map ? body['data'] : body;
  if (rawItems is! List) return const [];

  return rawItems
      .whereType<Map>()
      .map((item) => Map<String, dynamic>.from(item))
      .toList(growable: false);
});

enum _ServiceAction { edit, toggleActive }

class ServicesScreen extends ConsumerWidget {
  const ServicesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final services = ref.watch(_serviceManagementProvider);

    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          scrolledUnderElevation: 0,
          iconTheme: const IconThemeData(color: Colors.black),
          title: const Text(
            'الخدمات',
            style: TextStyle(
              color: Colors.black,
              fontFamily: 'IBMPlexSansArabic',
              fontWeight: FontWeight.bold,
            ),
          ),
          centerTitle: true,
          actions: [
            IconButton(
              tooltip: 'تحديث',
              onPressed: () => _refresh(ref),
              icon: const Icon(Icons.refresh_rounded),
            ),
          ],
        ),
        floatingActionButton: FloatingActionButton.extended(
          backgroundColor: const Color(0xFF2563EB),
          foregroundColor: Colors.white,
          onPressed: () => _openEditor(context, ref),
          icon: const Icon(Icons.add),
          label: const Text(
            'إضافة خدمة',
            style: TextStyle(fontFamily: 'IBMPlexSansArabic', fontWeight: FontWeight.bold),
          ),
        ),
        body: SafeArea(
          child: services.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, _) => _ErrorState(onRetry: () => _refresh(ref)),
            data: (items) => RefreshIndicator(
              onRefresh: () => _refresh(ref),
              child: items.isEmpty
                  ? ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      children: const [
                        SizedBox(height: 150),
                        Icon(Icons.medical_services_outlined, size: 64, color: Color(0xFFE2E8F0)),
                        SizedBox(height: 16),
                        Center(
                          child: Text(
                            'لا توجد خدمات مضافة حتى الآن.',
                            style: TextStyle(fontFamily: 'IBMPlexSansArabic', color: Colors.black54),
                          ),
                        ),
                      ],
                    )
                  : ListView.separated(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
                      itemCount: items.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, index) => _ServiceCard(
                        service: items[index],
                        onTap: () => _openEditor(context, ref, items[index]),
                        onAction: (action) => _handleAction(context, ref, items[index], action),
                      ),
                    ),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _refresh(WidgetRef ref) async {
    ref.invalidate(_serviceManagementProvider);
    await ref.read(_serviceManagementProvider.future);
    await ref.read(servicesProvider.notifier).fetchData();
  }

  Future<void> _openEditor(
    BuildContext context,
    WidgetRef ref, [
    Map<String, dynamic>? service,
  ]) async {
    final changed = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => CreateServiceScreen(service: service)),
    );
    if (changed == true) ref.invalidate(_serviceManagementProvider);
  }

  Future<void> _handleAction(
    BuildContext context,
    WidgetRef ref,
    Map<String, dynamic> service,
    _ServiceAction action,
  ) async {
    if (action == _ServiceAction.edit) {
      await _openEditor(context, ref, service);
      return;
    }

    final isActive = service['isActive'] != false;
    try {
      await ref.read(dioProvider).patch(
            '${ApiEndpoints.services}/${service['id']}',
            data: {'isActive': !isActive},
          );
      await ref.read(servicesProvider.notifier).fetchData();
      ref.invalidate(_serviceManagementProvider);
      if (context.mounted) {
        ToastUtil.showSuccess(
          context,
          isActive ? 'تم إيقاف الخدمة.' : 'تم تفعيل الخدمة.',
        );
      }
    } on DioException catch (error) {
      if (context.mounted) ToastUtil.showError(context, _apiError(error));
    } catch (_) {
      if (context.mounted) ToastUtil.showError(context, 'تعذر تحديث حالة الخدمة.');
    }
  }

  String _apiError(DioException error) {
    final data = error.response?.data;
    if (data is Map && data['error'] is String) return data['error'] as String;
    return 'تعذر إكمال العملية. حاول مرة أخرى.';
  }
}

class _ServiceCard extends StatelessWidget {
  const _ServiceCard({
    required this.service,
    required this.onTap,
    required this.onAction,
  });

  final Map<String, dynamic> service;
  final VoidCallback onTap;
  final ValueChanged<_ServiceAction> onAction;

  @override
  Widget build(BuildContext context) {
    final isActive = service['isActive'] != false;
    final showOnWebsite = service['showOnWebsite'] != false;
    final price = service['price'];
    final duration = service['duration'];
    final description = service['description']?.toString().trim();

    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            border: Border.all(color: const Color(0xFFE2E8F0)),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: const Color(0xFFEFF6FF),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.medical_services_outlined, color: Color(0xFF2563EB)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      service['name']?.toString() ?? 'خدمة بلا اسم',
                      style: const TextStyle(
                        fontFamily: 'IBMPlexSansArabic',
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    if (description != null && description.isNotEmpty) ...[
                      const SizedBox(height: 3),
                      Text(
                        description,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontFamily: 'IBMPlexSansArabic',
                          color: Colors.black54,
                          fontSize: 12,
                        ),
                      ),
                    ],
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 6,
                      children: [
                        _DetailChip(
                          icon: Icons.payments_outlined,
                          label: price == null ? 'السعر غير محدد' : '$price ج.م',
                        ),
                        if (duration != null)
                          _DetailChip(icon: Icons.schedule_outlined, label: '$duration دقيقة'),
                        _StatusChip(active: isActive),
                        if (showOnWebsite) const _WebsiteChip(),
                      ],
                    ),
                  ],
                ),
              ),
              PopupMenuButton<_ServiceAction>(
                tooltip: 'خيارات الخدمة',
                onSelected: onAction,
                itemBuilder: (_) => [
                  const PopupMenuItem(
                    value: _ServiceAction.edit,
                    child: Text('تعديل', style: TextStyle(fontFamily: 'IBMPlexSansArabic')),
                  ),
                  PopupMenuItem(
                    value: _ServiceAction.toggleActive,
                    child: Text(
                      isActive ? 'إيقاف الخدمة' : 'تفعيل الخدمة',
                      style: const TextStyle(fontFamily: 'IBMPlexSansArabic'),
                    ),
                  ),
                ],
                icon: const Icon(Icons.more_vert, color: Colors.black54),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DetailChip extends StatelessWidget {
  const _DetailChip({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: Colors.black54),
          const SizedBox(width: 4),
          Text(label, style: const TextStyle(fontFamily: 'IBMPlexSansArabic', fontSize: 11)),
        ],
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.active});

  final bool active;

  @override
  Widget build(BuildContext context) {
    final color = active ? const Color(0xFF166534) : const Color(0xFF64748B);
    final background = active ? const Color(0xFFDCFCE7) : const Color(0xFFF1F5F9);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
      decoration: BoxDecoration(color: background, borderRadius: BorderRadius.circular(16)),
      child: Text(
        active ? 'نشطة' : 'موقوفة',
        style: TextStyle(fontFamily: 'IBMPlexSansArabic', color: color, fontSize: 11),
      ),
    );
  }
}

class _WebsiteChip extends StatelessWidget {
  const _WebsiteChip();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
      decoration: BoxDecoration(
        color: const Color(0xFFEFF6FF),
        borderRadius: BorderRadius.circular(16),
      ),
      child: const Text(
        'ظاهرة بالموقع',
        style: TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF1D4ED8), fontSize: 11),
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.onRetry});

  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.cloud_off_outlined, size: 48, color: Colors.black38),
            const SizedBox(height: 12),
            const Text(
              'تعذر تحميل الخدمات.',
              style: TextStyle(fontFamily: 'IBMPlexSansArabic', fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('إعادة المحاولة', style: TextStyle(fontFamily: 'IBMPlexSansArabic')),
            ),
          ],
        ),
      ),
    );
  }
}
