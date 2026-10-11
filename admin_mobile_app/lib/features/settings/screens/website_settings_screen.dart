import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_endpoints.dart';
import '../../../core/utils/toast_util.dart';
import '../../auth/providers/auth_provider.dart';

class WebsiteSettingsScreen extends ConsumerStatefulWidget {
  const WebsiteSettingsScreen({super.key});

  @override
  ConsumerState<WebsiteSettingsScreen> createState() => _WebsiteSettingsScreenState();
}

class _WebsiteSettingsScreenState extends ConsumerState<WebsiteSettingsScreen> {
  final _slug = TextEditingController();
  final _facebook = TextEditingController();
  final _instagram = TextEditingController();
  final _twitter = TextEditingController();
  final _whatsapp = TextEditingController();
  List<Map<String, dynamic>> _sections = [];
  bool _published = false;
  bool _loading = false;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _slug.dispose();
    _facebook.dispose();
    _instagram.dispose();
    _twitter.dispose();
    _whatsapp.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    // 1. Read existing slug immediately from reactive provider or Hive so input is never blank
    final liveSlug = ref.read(clinicSlugProvider);
    if (liveSlug.isNotEmpty) {
      _slug.text = liveSlug;
    } else {
      final authClinic = ref.read(authStateProvider).clinic;
      if (authClinic?['slug'] != null && authClinic!['slug'].toString().isNotEmpty) {
        _slug.text = authClinic['slug'].toString();
      }
    }

    try {
      final dio = ref.read(dioProvider);
      final responses = await Future.wait([
        dio.get(ApiEndpoints.website),
        dio.get(ApiEndpoints.settings),
      ]);
      final siteData = responses[0].data['data'] as Map?;
      final clinic = siteData?['clinic'] as Map?;
      final website = siteData?['website'] as Map?;
      final settings = responses[1].data['data'] as Map?;

      if (!mounted) return;
      setState(() {
        final fetchedSlug = clinic?['slug']?.toString() ?? settings?['slug']?.toString() ?? '';
        if (fetchedSlug.isNotEmpty) {
          _slug.text = fetchedSlug;
          ref.read(clinicSlugProvider.notifier).setSlug(fetchedSlug);
        }
        _published = website?['isPublished'] as bool? ?? false;
        _sections = ((website?['sections'] as List?) ?? []).map((entry) => Map<String, dynamic>.from(entry as Map)).toList();
        _facebook.text = settings?['socialFacebook']?.toString() ?? '';
        _instagram.text = settings?['socialInstagram']?.toString() ?? '';
        _twitter.text = settings?['socialTwitter']?.toString() ?? '';
        _whatsapp.text = settings?['socialWhatsapp']?.toString() ?? '';
      });
    } catch (_) {
      // Retain cached values if network is slow or offline
    }
  }

  Future<void> _saveSettings() async {
    final newSlug = _slug.text.trim().toLowerCase();
    setState(() => _saving = true);
    try {
      // 1. Instantly update reactive provider and Hive so buttons update immediately
      if (newSlug.isNotEmpty) {
        ref.read(clinicSlugProvider.notifier).setSlug(newSlug);
        ref.read(authStateProvider.notifier).updateClinicSlug(newSlug);
      }

      final dio = ref.read(dioProvider);
      final responses = await Future.wait([
        dio.put(ApiEndpoints.website, data: {'slug': newSlug, 'isPublished': _published}),
        dio.put(ApiEndpoints.settings, data: {
          'slug': newSlug,
          'domain': newSlug,
          'socialFacebook': _facebook.text.trim(),
          'socialInstagram': _instagram.text.trim(),
          'socialTwitter': _twitter.text.trim(),
          'socialWhatsapp': _whatsapp.text.trim(),
        }),
        dio.put('${ApiEndpoints.settings}/clinic', data: {'slug': newSlug}),
      ]);

      if (responses.any((response) => response.data['success'] != true)) {
        throw Exception('تعذر حفظ بعض الإعدادات');
      }

      if (mounted) {
        ToastUtil.showSuccess(context, 'تم حفظ إعدادات الموقع بنجاح');
      }
    } catch (error) {
      if (mounted) {
        ToastUtil.showError(context, 'تعذر حفظ إعدادات الموقع: $error');
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _toggleSection(int index, bool enabled) async {
    final original = _sections[index];
    setState(() => _sections[index] = {...original, 'isEnabled': enabled});
    try {
      final response = await ref.read(dioProvider).patch('${ApiEndpoints.websiteSections}/${original['id']}', data: {'isEnabled': enabled});
      if (response.data['success'] != true) throw Exception(response.data['error'] ?? 'تعذر تحديث القسم');
    } catch (error) {
      if (mounted) {
        setState(() => _sections[index] = original);
        ToastUtil.showError(context, 'تعذر تحديث حالة القسم');
      }
    }
  }

  Future<void> _reorder(int oldIndex, int newIndex) async {
    if (oldIndex < newIndex) newIndex -= 1;
    setState(() {
      final section = _sections.removeAt(oldIndex);
      _sections.insert(newIndex, section);
    });
    try {
      final response = await ref.read(dioProvider).put(ApiEndpoints.websiteSections, data: {
        'sections': [for (var index = 0; index < _sections.length; index++) {'id': _sections[index]['id'], 'sortOrder': index}],
      });
      if (response.data['success'] != true) throw Exception(response.data['error'] ?? 'تعذر ترتيب الأقسام');
    } catch (error) {
      await _load();
      if (mounted) ToastUtil.showError(context, 'تعذر حفظ ترتيب الأقسام');
    }
  }

  String _getSectionTitle(Map<String, dynamic> section) {
    if (section['title'] != null && section['title'].toString().trim().isNotEmpty) {
      return section['title'].toString();
    }
    final type = section['type']?.toString().toUpperCase() ?? '';
    switch (type) {
      case 'HERO': return 'القسم الرئيسي';
      case 'ABOUT': return 'من نحن / عن العيادة';
      case 'SERVICES': return 'الخدمات الطبية';
      case 'DOCTORS': return 'فريق الأطباء';
      case 'WHY_US':
      case 'WHY_CHOOSE_US': return 'لماذا تختارنا';
      case 'TESTIMONIALS': return 'آراء المرضى';
      case 'FAQ': return 'الأسئلة الشائعة';
      case 'CONTACT': return 'معلومات التواصل';
      case 'GALLERY': return 'معرض الصور';
      case 'BOOKING': return 'الحجز السريع';
      default: return 'قسم الموقع';
    }
  }

  String _getSectionSubtitle(Map<String, dynamic> section) {
    final type = section['type']?.toString().toUpperCase() ?? '';
    switch (type) {
      case 'HERO': return 'الواجهة الرئيسية والترحيب بزر الحجز';
      case 'ABOUT': return 'نبذة تعريفية وسنوات الخبرة';
      case 'SERVICES': return 'عرض الخدمات والأسعار';
      case 'DOCTORS': return 'الأطباء والتخصصات';
      case 'WHY_US':
      case 'WHY_CHOOSE_US': return 'مميزات وأسباب اختيار العيادة';
      case 'TESTIMONIALS': return 'تجارب وتقييمات المراجعين';
      case 'FAQ': return 'إجابات الأسئلة المتكررة';
      case 'CONTACT': return 'العنوان وأرقام الهاتف وساعات العمل';
      case 'GALLERY': return 'صور العيادة والأجهزة';
      case 'BOOKING': return 'نموذج استقبال طلبات الحجز';
      default: return 'قسم من أقسام الموقع';
    }
  }

  Future<void> _editSection(int index) async {
    final section = _sections[index];
    final type = section['type']?.toString().toUpperCase() ?? '';
    final titleController = TextEditingController(text: section['title']?.toString() ?? _getSectionTitle(section));
    
    Map<String, dynamic> contentMap = {};
    if (section['content'] != null) {
      if (section['content'] is Map) {
        contentMap = Map<String, dynamic>.from(section['content'] as Map);
      } else if (section['content'] is String) {
        try {
          final decoded = jsonDecode(section['content']);
          if (decoded is Map) contentMap = Map<String, dynamic>.from(decoded);
        } catch (_) {}
      }
    }

    final field1Controller = TextEditingController(text: contentMap['subtitle']?.toString() ?? contentMap['description']?.toString() ?? contentMap['heading']?.toString() ?? '');
    final field2Controller = TextEditingController(text: contentMap['buttonText']?.toString() ?? contentMap['experience']?.toString() ?? contentMap['phone']?.toString() ?? '');

    String field1Label = 'الوصف / العنوان الفرعي';
    String field2Label = 'نص الزر / معلومة إضافية';

    if (type == 'HERO') {
      field1Label = 'العنوان الفرعي';
      field2Label = 'نص زر الحجز الرئيسي';
    } else if (type == 'ABOUT') {
      field1Label = 'نبذة عن العيادة ورؤيتها';
      field2Label = 'سنوات الخبرة أو الإنجازات';
    } else if (type == 'CONTACT') {
      field1Label = 'أيام وساعات العمل';
      field2Label = 'رقم هاتف الطوارئ / الاستفسار';
    }

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return Directionality(
          textDirection: TextDirection.rtl,
          child: Padding(
            padding: EdgeInsets.only(
              left: 20,
              right: 20,
              top: 20,
              bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'تعديل ${_getSectionTitle(section)}',
                      style: const TextStyle(
                        fontFamily: 'IBMPlexSansArabic',
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, size: 20),
                      onPressed: () => Navigator.pop(ctx),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: titleController,
                  style: const TextStyle(fontFamily: 'IBMPlexSansArabic', fontSize: 14),
                  decoration: InputDecoration(
                    labelText: 'عنوان القسم',
                    labelStyle: const TextStyle(fontFamily: 'IBMPlexSansArabic', fontSize: 13),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: field1Controller,
                  maxLines: 2,
                  style: const TextStyle(fontFamily: 'IBMPlexSansArabic', fontSize: 14),
                  decoration: InputDecoration(
                    labelText: field1Label,
                    labelStyle: const TextStyle(fontFamily: 'IBMPlexSansArabic', fontSize: 13),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: field2Controller,
                  style: const TextStyle(fontFamily: 'IBMPlexSansArabic', fontSize: 14),
                  decoration: InputDecoration(
                    labelText: field2Label,
                    labelStyle: const TextStyle(fontFamily: 'IBMPlexSansArabic', fontSize: 13),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  height: 46,
                  child: ElevatedButton(
                    onPressed: () async {
                      final updatedContent = {
                        ...contentMap,
                        if (type == 'HERO') ...{
                          'subtitle': field1Controller.text.trim(),
                          'buttonText': field2Controller.text.trim(),
                        } else if (type == 'ABOUT') ...{
                          'description': field1Controller.text.trim(),
                          'experience': field2Controller.text.trim(),
                        } else if (type == 'CONTACT') ...{
                          'hours': field1Controller.text.trim(),
                          'phone': field2Controller.text.trim(),
                        } else ...{
                          'description': field1Controller.text.trim(),
                          'extra': field2Controller.text.trim(),
                        }
                      };

                      final updatedData = {
                        'title': titleController.text.trim().isNotEmpty ? titleController.text.trim() : null,
                        'content': updatedContent,
                      };

                      Navigator.pop(ctx);

                      try {
                        final dio = ref.read(dioProvider);
                        final response = await dio.patch(
                          '${ApiEndpoints.websiteSections}/${section['id']}',
                          data: updatedData,
                        );
                        if (response.data['success'] == true) {
                          setState(() {
                            _sections[index] = {
                              ...section,
                              'title': updatedData['title'],
                              'content': updatedContent,
                            };
                          });
                          if (mounted) {
                            ToastUtil.showSuccess(context, 'تم حفظ تعديلات القسم بنجاح');
                          }
                        }
                      } catch (e) {
                        if (mounted) {
                          ToastUtil.showError(context, 'تعذر حفظ تعديلات القسم');
                        }
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2563EB),
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(50)),
                    ),
                    child: const Text(
                      'حفظ التعديلات',
                      style: TextStyle(
                        fontFamily: 'IBMPlexSansArabic',
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          title: const Text(
            'إعدادات الموقع الإلكتروني',
            style: TextStyle(
              fontFamily: 'IBMPlexSansArabic',
              fontSize: 18,
              fontWeight: FontWeight.w500,
              color: Color(0xFF0F172A),
            ),
          ),
          backgroundColor: Colors.white,
          elevation: 0,
          centerTitle: false,
          actions: [
            IconButton(
              onPressed: _loading ? null : _load,
              icon: const Icon(Icons.refresh, color: Color(0xFF475569)),
            ),
          ],
        ),
        body: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          children: [
            // Switch for Publishing Website
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: SwitchListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                title: const Text(
                  'نشر الموقع',
                  style: TextStyle(
                    fontFamily: 'IBMPlexSansArabic',
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                    color: Color(0xFF0F172A),
                  ),
                ),
                subtitle: const Text(
                  'إتاحة موقع العيادة للزوار والمراجعين',
                  style: TextStyle(
                    fontFamily: 'IBMPlexSansArabic',
                    fontSize: 13,
                    color: Color(0xFF64748B),
                  ),
                ),
                value: _published,
                activeColor: const Color(0xFF2563EB),
                onChanged: (value) => setState(() => _published = value),
              ),
            ),
            const SizedBox(height: 20),

            // Subdomain Field
            const Text(
              'النطاق الفرعي للموقع',
              style: TextStyle(
                fontFamily: 'IBMPlexSansArabic',
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Directionality(
                textDirection: TextDirection.ltr,
                child: Row(
                  children: [
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 12),
                      child: Text(
                        'https://',
                        style: TextStyle(
                          fontFamily: 'IBMPlexSansArabic',
                          color: Color(0xFF94A3B8),
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    Expanded(
                      child: TextFormField(
                        controller: _slug,
                        style: const TextStyle(
                          fontFamily: 'IBMPlexSansArabic',
                          color: Color(0xFF0F172A),
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                        decoration: const InputDecoration(
                          isDense: true,
                          border: InputBorder.none,
                          hintText: 'my-clinic',
                          hintStyle: TextStyle(
                            fontFamily: 'IBMPlexSansArabic',
                            color: Color(0xFFCBD5E1),
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                      decoration: const BoxDecoration(
                        color: Color(0xFFEFF6FF),
                        borderRadius: BorderRadius.only(
                          topRight: Radius.circular(11),
                          bottomRight: Radius.circular(11),
                        ),
                      ),
                      child: Text(
                        '.${ApiEndpoints.websiteRootDomain}',
                        style: const TextStyle(
                          fontFamily: 'IBMPlexSansArabic',
                          color: Color(0xFF2563EB),
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Social Links
            const Text(
              'روابط التواصل الاجتماعي',
              style: TextStyle(
                fontFamily: 'IBMPlexSansArabic',
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 10),
            _buildTextField(_facebook, 'رابط Facebook', Icons.facebook),
            const SizedBox(height: 10),
            _buildTextField(_instagram, 'رابط Instagram', Icons.camera_alt_outlined),
            const SizedBox(height: 10),
            _buildTextField(_twitter, 'رابط X / Twitter', Icons.tag),
            const SizedBox(height: 10),
            _buildTextField(_whatsapp, 'رقم WhatsApp', Icons.chat_outlined),
            const SizedBox(height: 20),

            // Save settings button
            SizedBox(
              width: double.infinity,
              height: 46,
              child: ElevatedButton(
                onPressed: _saving ? null : _saveSettings,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2563EB),
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(50)),
                ),
                child: _saving
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : const Text(
                        'حفظ الإعدادات',
                        style: TextStyle(
                          fontFamily: 'IBMPlexSansArabic',
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: Colors.white,
                        ),
                      ),
              ),
            ),
            const SizedBox(height: 32),

            // Website Sections Header
            const Text(
              'أقسام الموقع الإلكتروني',
              style: TextStyle(
                fontFamily: 'IBMPlexSansArabic',
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'يمكنك تفعيل أو تعطيل الأقسام وتعديل محتواها أو سحبها لتغيير ترتيب ظهورها بالموقع',
              style: TextStyle(
                fontFamily: 'IBMPlexSansArabic',
                fontSize: 12,
                color: Color(0xFF64748B),
              ),
            ),
            const SizedBox(height: 14),

            // Reorderable sections
            if (_sections.isEmpty)
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: const Center(
                  child: Text(
                    'لا توجد أقسام متاحة حالياً',
                    style: TextStyle(
                      fontFamily: 'IBMPlexSansArabic',
                      fontSize: 14,
                      color: Color(0xFF64748B),
                    ),
                  ),
                ),
              )
            else
              ReorderableListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _sections.length,
                onReorder: _reorder,
                proxyDecorator: (Widget child, int index, Animation<double> animation) {
                  return Material(
                    color: Colors.transparent,
                    elevation: 0,
                    child: child,
                  );
                },
                itemBuilder: (context, index) {
                  final section = _sections[index];
                  final isEnabled = section['isEnabled'] as bool? ?? false;
                  return Container(
                    key: ValueKey(section['id']),
                    margin: const EdgeInsets.only(bottom: 10),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: SwitchListTile(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      secondary: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.drag_handle, color: Color(0xFF94A3B8), size: 20),
                          const SizedBox(width: 4),
                          IconButton(
                            icon: const Icon(Icons.edit_outlined, color: Color(0xFF2563EB), size: 19),
                            tooltip: 'تعديل بيانات القسم',
                            onPressed: () => _editSection(index),
                          ),
                        ],
                      ),
                      title: Text(
                        _getSectionTitle(section),
                        style: const TextStyle(
                          fontFamily: 'IBMPlexSansArabic',
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                      subtitle: Text(
                        _getSectionSubtitle(section),
                        style: const TextStyle(
                          fontFamily: 'IBMPlexSansArabic',
                          fontSize: 12,
                          color: Color(0xFF64748B),
                        ),
                      ),
                      value: isEnabled,
                      activeColor: const Color(0xFF2563EB),
                      onChanged: (value) => _toggleSection(index, value),
                    ),
                  );
                },
              ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller, String label, IconData icon) {
    return TextFormField(
      controller: controller,
      style: const TextStyle(
        fontFamily: 'IBMPlexSansArabic',
        fontSize: 14,
        color: Color(0xFF0F172A),
      ),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(
          fontFamily: 'IBMPlexSansArabic',
          fontSize: 13,
          color: Color(0xFF64748B),
        ),
        prefixIcon: Icon(icon, size: 20, color: const Color(0xFF94A3B8)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF2563EB)),
        ),
      ),
    );
  }
}
