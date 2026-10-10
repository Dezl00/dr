import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../core/api/api_endpoints.dart';
import '../../auth/providers/auth_provider.dart';

class WebsiteSection {
  final String id;
  final String title;
  bool isEnabled;

  WebsiteSection({required this.id, required this.title, required this.isEnabled});
}

class WebsiteSettingsScreen extends ConsumerStatefulWidget {
  const WebsiteSettingsScreen({super.key});

  @override
  ConsumerState<WebsiteSettingsScreen> createState() => _WebsiteSettingsScreenState();
}

class _WebsiteSettingsScreenState extends ConsumerState<WebsiteSettingsScreen> {
  bool _isLoading = false;
  bool _isSaving = false;

  final TextEditingController _domainController = TextEditingController();
  final TextEditingController _facebookController = TextEditingController();
  final TextEditingController _instagramController = TextEditingController();
  final TextEditingController _twitterController = TextEditingController();
  final TextEditingController _whatsappController = TextEditingController();

  late List<WebsiteSection> _sections;

  @override
  void initState() {
    super.initState();
    _sections = [
      WebsiteSection(id: 'hero', title: 'القسم الرئيسي', isEnabled: true),
      WebsiteSection(id: 'about', title: 'من نحن', isEnabled: true),
      WebsiteSection(id: 'services', title: 'الخدمات', isEnabled: true),
      WebsiteSection(id: 'doctors', title: 'الأطباء', isEnabled: true),
      WebsiteSection(id: 'why_choose_us', title: 'لماذا نحن', isEnabled: true),
      WebsiteSection(id: 'gallery', title: 'معرض الصور', isEnabled: true),
      WebsiteSection(id: 'testimonials', title: 'آراء العملاء', isEnabled: true),
      WebsiteSection(id: 'faq', title: 'الأسئلة الشائعة', isEnabled: true),
      WebsiteSection(id: 'contact', title: 'اتصل بنا', isEnabled: true),
      WebsiteSection(id: 'booking', title: 'حجز موعد', isEnabled: true),
    ];
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initFromState();
      _fetchSettings();
    });
  }

  @override
  void dispose() {
    _domainController.dispose();
    _facebookController.dispose();
    _instagramController.dispose();
    _twitterController.dispose();
    _whatsappController.dispose();
    super.dispose();
  }

  void _initFromState() {
    final authState = ref.read(authStateProvider);
    final clinic = authState.clinic;
    if (clinic != null && clinic['settings'] != null) {
      final settings = clinic['settings'];
      _domainController.text = settings['domain'] ?? '';
      _facebookController.text = settings['socialFacebook'] ?? '';
      _instagramController.text = settings['socialInstagram'] ?? '';
      _twitterController.text = settings['socialTwitter'] ?? '';
      _whatsappController.text = settings['socialWhatsapp'] ?? '';
    }
  }

  Future<void> _fetchSettings() async {
    setState(() {
      _isLoading = true;
    });
    try {
      final dio = ref.read(dioProvider);
      final response = await dio.get(ApiEndpoints.settings);
      if (response.statusCode == 200) {
        final data = response.data;
        final settings = data['data'] ?? data['settings'] ?? data;
        if (settings != null) {
          setState(() {
            _domainController.text = settings['domain'] ?? _domainController.text;
            _facebookController.text = settings['socialFacebook'] ?? _facebookController.text;
            _instagramController.text = settings['socialInstagram'] ?? _instagramController.text;
            _twitterController.text = settings['socialTwitter'] ?? _twitterController.text;
            _whatsappController.text = settings['socialWhatsapp'] ?? _whatsappController.text;
          });
        }
      }
    } catch (e) {
      // Keep existing data on error
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _saveSettings() async {
    setState(() {
      _isSaving = true;
    });
    try {
      final dio = ref.read(dioProvider);
      final settingsData = {
        'socialFacebook': _facebookController.text,
        'socialInstagram': _instagramController.text,
        'socialTwitter': _twitterController.text,
        'socialWhatsapp': _whatsappController.text,
      };
      
      await dio.put(ApiEndpoints.settings, data: settingsData);
      await dio.put('${ApiEndpoints.settings}/clinic', data: { 'slug': _domainController.text });
      
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'تم حفظ التغييرات بنجاح',
              style: TextStyle(fontFamily: 'IBMPlexSansArabic'),
            ),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'حدث خطأ أثناء الحفظ',
              style: TextStyle(fontFamily: 'IBMPlexSansArabic'),
            ),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSaving = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          scrolledUnderElevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios, color: Color(0xFF0F172A), size: 20),
            onPressed: () => Navigator.pop(context),
          ),
          title: const Text(
            'إعدادات الموقع الإلكتروني',
            style: TextStyle(
              fontFamily: 'IBMPlexSansArabic',
              fontSize: 16,
              fontWeight: FontWeight.w500,
              color: Color(0xFF0F172A),
            ),
          ),
          centerTitle: true,
        ),
        body: _isLoading
            ? const Center(child: CircularProgressIndicator(color: Color(0xFF2563EB)))
            : SafeArea(
                child: ListView(
                  padding: const EdgeInsets.all(20.0),
                  children: [
                    _buildSectionTitle('المعلومات الأساسية'),
                    const SizedBox(height: 16),
                    _buildSubdomainField(),
                    const SizedBox(height: 16),
                    _buildLogoUpload(),
                    
                    const SizedBox(height: 32),
                    _buildSectionTitle('أقسام الموقع الإلكتروني'),
                    const SizedBox(height: 8),
                    const Text(
                      'قم بسحب وإفلات الأقسام لترتيبها، أو تفعيلها وتعطيلها.',
                      style: TextStyle(
                        fontFamily: 'IBMPlexSansArabic',
                        fontSize: 15,
                        color: Color(0xFF64748B),
                      ),
                    ),
                    const SizedBox(height: 16),
                    ReorderableListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _sections.length,
                      proxyDecorator: (Widget child, int index, Animation<double> animation) {
                        return Opacity(
                          opacity: 0.7,
                          child: child,
                        );
                      },
                      onReorder: (oldIndex, newIndex) {
                        setState(() {
                          if (oldIndex < newIndex) {
                            newIndex -= 1;
                          }
                          final item = _sections.removeAt(oldIndex);
                          _sections.insert(newIndex, item);
                        });
                      },
                      itemBuilder: (context, index) {
                        final section = _sections[index];
                        return Container(
                          key: ValueKey(section.id),
                          margin: const EdgeInsets.only(bottom: 12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: _buildToggleRow(
                            title: section.title,
                            value: section.isEnabled,
                            onChanged: (v) {
                              setState(() {
                                section.isEnabled = v;
                              });
                            },
                            onEdit: () => _showEditSectionModal(section),
                          ),
                        );
                      },
                    ),
                    
                    const SizedBox(height: 32),
                    _buildSectionTitle('روابط التواصل الاجتماعي'),
                    const SizedBox(height: 16),
                    _buildTextField(
                      label: 'فيسبوك',
                      controller: _facebookController,
                      isEnglish: true,
                    ),
                    const SizedBox(height: 16),
                    _buildTextField(
                      label: 'إنستغرام',
                      controller: _instagramController,
                      isEnglish: true,
                    ),
                    const SizedBox(height: 16),
                    _buildTextField(
                      label: 'تويتر',
                      controller: _twitterController,
                      isEnglish: true,
                    ),
                    const SizedBox(height: 16),
                    _buildTextField(
                      label: 'واتساب',
                      controller: _whatsappController,
                      isEnglish: true,
                    ),
                  ],
                ),
              ),
        bottomNavigationBar: Container(
          padding: const EdgeInsets.all(20),
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(
              top: BorderSide(color: Color(0xFFE2E8F0)),
            ),
          ),
          child: SafeArea(
            child: ElevatedButton(
              onPressed: _isSaving || _isLoading ? null : _saveSettings,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2563EB),
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(50),
                ),
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: _isSaving
                  ? const SizedBox(
                      height: 24,
                      width: 24,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                    )
                  : const Text(
                      'حفظ التغييرات',
                      style: TextStyle(
                        fontFamily: 'IBMPlexSansArabic',
                        fontSize: 15,
                        fontWeight: FontWeight.w500,
                        color: Colors.white,
                      ),
                    ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontFamily: 'IBMPlexSansArabic',
        fontSize: 15,
        fontWeight: FontWeight.w500,
        color: Color(0xFF0F172A),
      ),
    );
  }

  Widget _buildSubdomainField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'رابط الموقع',
          style: TextStyle(
            fontFamily: 'IBMPlexSansArabic',
            fontSize: 15,
            fontWeight: FontWeight.w500,
            color: Color(0xFF475569),
          ),
        ),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Row(
            textDirection: TextDirection.ltr,
            children: [
              Expanded(
                child: TextFormField(
                  controller: _domainController,
                  textDirection: TextDirection.ltr,
                  keyboardType: TextInputType.text,
                  style: const TextStyle(
                    fontFamily: 'IBMPlexSansArabic',
                    fontSize: 15,
                    color: Color(0xFF0F172A),
                  ),
                  decoration: const InputDecoration(
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: const BoxDecoration(
                  color: Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.horizontal(right: Radius.circular(12)),
                  border: Border(left: BorderSide(color: Color(0xFFE2E8F0))),
                ),
                child: const Text(
                  '.beyoondgroup.com',
                  textDirection: TextDirection.ltr,
                  style: TextStyle(
                    fontFamily: 'IBMPlexSansArabic',
                    fontSize: 15,
                    color: Color(0xFF64748B),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildToggleRow({
    required String title,
    required bool value,
    required ValueChanged<bool> onChanged,
    required VoidCallback onEdit,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              const Icon(Icons.drag_indicator, color: Color(0xFF94A3B8), size: 20),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  fontFamily: 'IBMPlexSansArabic',
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFF0F172A),
                ),
              ),
            ],
          ),
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.edit_outlined, color: Color(0xFF2563EB), size: 20),
                onPressed: onEdit,
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
              const SizedBox(width: 12),
              CupertinoSwitch(
                value: value,
                onChanged: onChanged,
                activeColor: const Color(0xFF2563EB),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    bool isEnglish = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontFamily: 'IBMPlexSansArabic',
            fontSize: 15,
            fontWeight: FontWeight.w500,
            color: Color(0xFF475569),
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          textDirection: isEnglish ? TextDirection.ltr : TextDirection.rtl,
          keyboardType: TextInputType.text,
          style: const TextStyle(
            fontFamily: 'IBMPlexSansArabic',
            fontSize: 15,
            color: Color(0xFF0F172A),
          ),
          decoration: InputDecoration(
            filled: true,
            fillColor: Colors.white,
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
        ),
      ],
    );
  }

  Widget _buildLogoUpload() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'شعار العيادة',
          style: TextStyle(
            fontFamily: 'IBMPlexSansArabic',
            fontSize: 15,
            fontWeight: FontWeight.w500,
            color: Color(0xFF475569),
          ),
        ),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: const Color(0xFFE2E8F0),
              style: BorderStyle.solid,
            ),
          ),
          child: Column(
            children: [
              const Icon(Icons.cloud_upload_outlined, size: 36, color: Color(0xFF94A3B8)),
              const SizedBox(height: 8),
              const Text(
                'اضغط لرفع شعار جديد',
                style: TextStyle(
                  fontFamily: 'IBMPlexSansArabic',
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFF0F172A),
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'PNG, JPG حتى 5MB',
                textDirection: TextDirection.ltr,
                style: TextStyle(
                  fontFamily: 'IBMPlexSansArabic',
                  fontSize: 10,
                  color: Color(0xFF64748B),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _showEditSectionModal(WebsiteSection section) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
          ),
          child: Directionality(
            textDirection: TextDirection.rtl,
            child: Container(
              padding: const EdgeInsets.all(20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'تعديل ${section.title}',
                        style: const TextStyle(
                          fontFamily: 'IBMPlexSansArabic',
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Color(0xFF64748B), size: 20),
                        onPressed: () => Navigator.pop(context),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  if (section.id == 'hero') ...[
                    _buildModalTextField('العنوان الرئيسي'),
                    const SizedBox(height: 12),
                    _buildModalTextField('النص الفرعي'),
                    const SizedBox(height: 12),
                    _buildModalTextField('نص الزر'),
                  ] else if (section.id == 'about') ...[
                    _buildModalTextField('النص'),
                    const SizedBox(height: 12),
                    _buildModalTextField('رابط الصورة'),
                  ] else ...[
                    _buildModalTextField('محتوى القسم'),
                  ],
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2563EB),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        'حفظ',
                        style: TextStyle(
                          fontFamily: 'IBMPlexSansArabic',
                          fontSize: 15,
                          fontWeight: FontWeight.w500,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildModalTextField(String label) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontFamily: 'IBMPlexSansArabic',
            fontSize: 15,
            fontWeight: FontWeight.w500,
            color: Color(0xFF475569),
          ),
        ),
        const SizedBox(height: 6),
        TextFormField(
          style: const TextStyle(
            fontFamily: 'IBMPlexSansArabic',
            fontSize: 13,
            color: Color(0xFF0F172A),
          ),
          decoration: InputDecoration(
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFF2563EB)),
            ),
          ),
        ),
      ],
    );
  }
}
