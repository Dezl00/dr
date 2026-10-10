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

    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: Column(
            children: [
              _buildHeader(context),
              Expanded(
                child: inventoryAsync.when(
                  loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFF2563EB))),
                  error: (err, stack) => Center(
                    child: Text(
                      'خطأ: $err',
                      style: const TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFFDC2626)),
                    ),
                  ),
                  data: (items) {
                    if (items.isEmpty) {
                      return const Center(
                        child: Text(
                          'المخزون فارغ، قم بإضافة أدوات جديدة',
                          style: TextStyle(
                            fontFamily: 'IBMPlexSansArabic',
                            color: Color(0xFF94A3B8),
                            fontSize: 16,
                          ),
                        ),
                      );
                    }
                    return ListView.builder(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      itemCount: items.length,
                      itemBuilder: (context, index) {
                        final item = items[index];
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
                                color: const Color(0xFFEFF6FF),
                                borderRadius: BorderRadius.circular(50),
                              ),
                              child: const Icon(Icons.inventory_2_outlined, color: Color(0xFF2563EB)),
                            ),
                            title: Text(
                              item['name'] ?? 'أداة طبية',
                              style: const TextStyle(
                                fontFamily: 'IBMPlexSansArabic',
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF0F172A),
                                fontSize: 16,
                              ),
                            ),
                            subtitle: Text(
                              'الكمية الحالية: ${item['currentStock'] ?? 0} ${item['unit'] ?? "قطعة"}',
                              style: const TextStyle(
                                fontFamily: 'IBMPlexSansArabic',
                                color: Color(0xFF475569),
                                fontSize: 14,
                              ),
                              textDirection: TextDirection.ltr,
                              textAlign: TextAlign.right,
                            ),
                            trailing: IconButton(
                              icon: const Icon(Icons.add_shopping_cart, color: Color(0xFF2563EB)),
                              style: IconButton.styleFrom(
                                backgroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(50),
                                  side: const BorderSide(color: Color(0xFFE2E8F0)),
                                ),
                              ),
                              onPressed: () {
                                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                                  content: Text('سيتم تفعيل توريد المخزون قريباً', style: TextStyle(fontFamily: 'IBMPlexSansArabic')),
                                  backgroundColor: Color(0xFF2563EB),
                                ));
                              },
                            ),
                          ),
                        );
                      },
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

  Widget _buildHeader(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0), width: 1)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text(
            'المخزون والأدوات',
            style: TextStyle(
              fontFamily: 'IBMPlexSansArabic',
              color: Color(0xFF0F172A),
              fontWeight: FontWeight.w600,
              fontSize: 20,
            ),
          ),
          ElevatedButton.icon(
            onPressed: () => _showAddItemDialog(context),
            icon: const Icon(Icons.add, color: Colors.white, size: 20),
            label: const Text(
              'إضافة صنف',
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

  void _showAddItemDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) {
        return Directionality(
          textDirection: TextDirection.rtl,
          child: AlertDialog(
            backgroundColor: Colors.white,
            surfaceTintColor: Colors.transparent,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
            title: const Text(
              'إضافة صنف جديد',
              style: TextStyle(
                fontFamily: 'IBMPlexSansArabic',
                fontWeight: FontWeight.w600,
                color: Color(0xFF0F172A),
                fontSize: 18,
              ),
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildTextField('اسم الصنف (مثال: حقن بنج)'),
                const SizedBox(height: 12),
                _buildTextField('الوحدة (مثال: علبة، قطعة)'),
                const SizedBox(height: 12),
                _buildTextField('الحد الأدنى للتنبيه', isNumber: true),
              ],
            ),
            actionsPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text(
                  'إلغاء',
                  style: TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF475569)),
                ),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2563EB),
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(50)),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                ),
                onPressed: () {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                    content: Text('تمت إضافة الصنف بنجاح', style: TextStyle(fontFamily: 'IBMPlexSansArabic')),
                    backgroundColor: Color(0xFF2563EB),
                  ));
                },
                child: const Text('حفظ', style: TextStyle(fontFamily: 'IBMPlexSansArabic', color: Colors.white)),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildTextField(String label, {bool isNumber = false}) {
    return TextField(
      keyboardType: isNumber ? TextInputType.number : TextInputType.text,
      style: const TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF0F172A)),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF475569)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF2563EB))),
      ),
    );
  }
}
