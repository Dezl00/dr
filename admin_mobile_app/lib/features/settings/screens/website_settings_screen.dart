import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_endpoints.dart';
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
  bool _loading = true;
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
    try {
      final dio = ref.read(dioProvider);
      final responses = await Future.wait([dio.get(ApiEndpoints.website), dio.get(ApiEndpoints.settings)]);
      final siteData = responses[0].data['data'] as Map?;
      final clinic = siteData?['clinic'] as Map?;
      final website = siteData?['website'] as Map?;
      final settings = responses[1].data['data'] as Map?;
      if (!mounted) return;
      setState(() {
        _slug.text = clinic?['slug']?.toString() ?? '';
        _published = website?['isPublished'] as bool? ?? false;
        _sections = ((website?['sections'] as List?) ?? []).map((entry) => Map<String, dynamic>.from(entry as Map)).toList();
        _facebook.text = settings?['socialFacebook']?.toString() ?? '';
        _instagram.text = settings?['socialInstagram']?.toString() ?? '';
        _twitter.text = settings?['socialTwitter']?.toString() ?? '';
        _whatsapp.text = settings?['socialWhatsapp']?.toString() ?? '';
      });
    } catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('تعذر تحميل إعدادات الموقع: $error')));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _saveSettings() async {
    setState(() => _saving = true);
    try {
      final dio = ref.read(dioProvider);
      final responses = await Future.wait([
        dio.put(ApiEndpoints.website, data: {'slug': _slug.text.trim(), 'isPublished': _published}),
        dio.put(ApiEndpoints.settings, data: {
          'socialFacebook': _facebook.text.trim(),
          'socialInstagram': _instagram.text.trim(),
          'socialTwitter': _twitter.text.trim(),
          'socialWhatsapp': _whatsapp.text.trim(),
        }),
      ]);
      if (responses.any((response) => response.data['success'] != true)) throw Exception('لم يتم حفظ جميع التغييرات');
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم حفظ إعدادات الموقع')));
    } catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.toString())));
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
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.toString())));
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
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.toString())));
    }
  }

  Future<void> _editSection(int index) async {
    final section = _sections[index];
    final title = TextEditingController(text: section['title']?.toString() ?? '');
    final content = TextEditingController(text: section['content'] == null ? '{}' : const JsonEncoder.withIndent('  ').convert(section['content']));
    final updated = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('تعديل ${_sectionLabel(section)}'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: title, decoration: const InputDecoration(labelText: 'العنوان')),
              const SizedBox(height: 12),
              TextField(controller: content, minLines: 4, maxLines: 10, decoration: const InputDecoration(labelText: 'المحتوى بصيغة JSON', border: OutlineInputBorder())),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('إلغاء')),
          FilledButton(
            onPressed: () {
              try {
                final decoded = jsonDecode(content.text);
                if (decoded is! Map) throw const FormatException();
                Navigator.pop(context, {'title': title.text.trim().isEmpty ? null : title.text.trim(), 'content': decoded});
              } catch (_) {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('اكتب المحتوى ككائن JSON صحيح')));
              }
            },
            child: const Text('حفظ'),
          ),
        ],
      ),
    );
    if (updated == null) return;
    try {
      final response = await ref.read(dioProvider).patch('${ApiEndpoints.websiteSections}/${section['id']}', data: updated);
      if (response.data['success'] != true) throw Exception(response.data['error'] ?? 'تعذر تعديل القسم');
      if (mounted) setState(() => _sections[index] = Map<String, dynamic>.from(response.data['data'] as Map));
    } catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.toString())));
    }
  }

  String _sectionLabel(Map<String, dynamic> section) => section['title']?.toString().isNotEmpty == true ? section['title'].toString() : section['type']?.toString() ?? 'قسم';

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('إعدادات الموقع الإلكتروني'),
          actions: [IconButton(onPressed: _loading ? null : _load, icon: const Icon(Icons.refresh))],
        ),
        body: _loading
            ? const Center(child: CircularProgressIndicator())
            : ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  SwitchListTile(
                    title: const Text('نشر الموقع'),
                    subtitle: const Text('إتاحة موقع العيادة للزوار.'),
                    value: _published,
                    onChanged: (value) => setState(() => _published = value),
                  ),
                  const SizedBox(height: 12),
                  TextField(controller: _slug, textDirection: TextDirection.ltr, decoration: const InputDecoration(labelText: 'النطاق الفرعي', border: OutlineInputBorder(), helperText: 'أحرف إنجليزية صغيرة وأرقام وشرطة فقط')),
                  const SizedBox(height: 20),
                  const Text('روابط التواصل', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  TextField(controller: _facebook, decoration: const InputDecoration(labelText: 'Facebook')),
                  TextField(controller: _instagram, decoration: const InputDecoration(labelText: 'Instagram')),
                  TextField(controller: _twitter, decoration: const InputDecoration(labelText: 'X / Twitter')),
                  TextField(controller: _whatsapp, decoration: const InputDecoration(labelText: 'WhatsApp')),
                  const SizedBox(height: 16),
                  FilledButton(onPressed: _saving ? null : _saveSettings, child: _saving ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('حفظ إعدادات النشر')),
                  const SizedBox(height: 28),
                  const Text('أقسام الموقع', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                  const SizedBox(height: 8),
                  if (_sections.isEmpty) const Padding(padding: EdgeInsets.all(24), child: Center(child: Text('لا توجد أقسام متاحة للموقع')))
                  else SizedBox(
                    height: _sections.length * 72.0,
                    child: ReorderableListView.builder(
                      shrinkWrap: true,
                      itemCount: _sections.length,
                      onReorder: _reorder,
                      itemBuilder: (context, index) {
                        final section = _sections[index];
                        return Card(
                          key: ValueKey(section['id']),
                          child: ListTile(
                            leading: const Icon(Icons.drag_handle),
                            title: Text(_sectionLabel(section)),
                            subtitle: Text(section['type']?.toString() ?? ''),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(onPressed: () => _editSection(index), icon: const Icon(Icons.edit_outlined)),
                                Switch(value: section['isEnabled'] as bool? ?? false, onChanged: (value) => _toggleSection(index, value)),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
