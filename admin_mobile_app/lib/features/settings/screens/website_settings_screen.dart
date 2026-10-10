import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../core/api/api_endpoints.dart';
import '../../auth/providers/auth_provider.dart';

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

  // Website sections toggles
  bool _showHero = true;
  bool _showAbout = true;
  bool _showServices = true;
  bool _showDoctors = true;
  bool _showWhyChooseUs = true;
  bool _showGallery = true;
  bool _showTestimonials = true;
  bool _showFAQ = true;
  bool _showContact = true;
  bool _showBooking = true;

  @override
  void initState() {
    super.initState();
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
      final data = {
        'domain': _domainController.text,
        'socialFacebook': _facebookController.text,
        'socialInstagram': _instagramController.text,
        'socialTwitter': _twitterController.text,
        'socialWhatsapp': _whatsappController.text,
      };
      
      await dio.put(ApiEndpoints.settings, data: data);
      
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
            icon: const Icon(Icons.arrow_back_ios, color: Color(0xFF0F172A)),
            onPressed: () => Navigator.pop(context),
          ),
          title: const Text(
            'إعدادات الموقع الإلكتروني',
            style: TextStyle(
              fontFamily: 'IBMPlexSansArabic',
              fontSize: 18,
              fontWeight: FontWeight.bold,
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
                    _buildTextField(
                      label: 'رابط الموقع (Domain)',
                      controller: _domainController,
                      isEnglish: true,
                    ),
                    const SizedBox(height: 16),
                    _buildLogoUpload(),
                    
                    const SizedBox(height: 32),
                    _buildSectionTitle('أقسام الموقع الإلكتروني'),
                    const SizedBox(height: 8),
                    const Text(
                      'قم بتفعيل أو تعطيل الأقسام التي تود عرضها في موقعك الإلكتروني.',
                      style: TextStyle(
                        fontFamily: 'IBMPlexSansArabic',
                        fontSize: 14,
                        color: Color(0xFF64748B),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Column(
                        children: [
                          _buildToggleRow('القسم الرئيسي (Hero)', _showHero, (v) => setState(() => _showHero = v)),
                          _buildDivider(),
                          _buildToggleRow('من نحن (About)', _showAbout, (v) => setState(() => _showAbout = v)),
                          _buildDivider(),
                          _buildToggleRow('الخدمات (Services)', _showServices, (v) => setState(() => _showServices = v)),
                          _buildDivider(),
                          _buildToggleRow('الأطباء (Doctors)', _showDoctors, (v) => setState(() => _showDoctors = v)),
                          _buildDivider(),
                          _buildToggleRow('لماذا نحن (Why Choose Us)', _showWhyChooseUs, (v) => setState(() => _showWhyChooseUs = v)),
                          _buildDivider(),
                          _buildToggleRow('معرض الصور (Gallery)', _showGallery, (v) => setState(() => _showGallery = v)),
                          _buildDivider(),
                          _buildToggleRow('آراء العملاء (Testimonials)', _showTestimonials, (v) => setState(() => _showTestimonials = v)),
                          _buildDivider(),
                          _buildToggleRow('الأسئلة الشائعة (FAQ)', _showFAQ, (v) => setState(() => _showFAQ = v)),
                          _buildDivider(),
                          _buildToggleRow('اتصل بنا (Contact)', _showContact, (v) => setState(() => _showContact = v)),
                          _buildDivider(),
                          _buildToggleRow('حجز موعد (Booking)', _showBooking, (v) => setState(() => _showBooking = v), isLast: true),
                        ],
                      ),
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
                      label: 'تويتر (X)',
                      controller: _twitterController,
                      isEnglish: true,
                    ),
                    const SizedBox(height: 16),
                    _buildTextField(
                      label: 'واتساب',
                      controller: _whatsappController,
                      isEnglish: true,
                    ),
                    
                    const SizedBox(height: 32),
                    ElevatedButton(
                      onPressed: _isSaving ? null : _saveSettings,
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
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                    ),
                  ],
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
        fontSize: 16,
        fontWeight: FontWeight.bold,
        color: Color(0xFF0F172A),
      ),
    );
  }

  Widget _buildToggleRow(String title, bool value, ValueChanged<bool> onChanged, {bool isLast = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontFamily: 'IBMPlexSansArabic',
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: Color(0xFF0F172A),
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeColor: const Color(0xFF2563EB),
            inactiveThumbColor: Colors.white,
            inactiveTrackColor: const Color(0xFFE2E8F0),
          ),
        ],
      ),
    );
  }

  Widget _buildDivider() {
    return const Divider(height: 1, color: Color(0xFFE2E8F0));
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
            fontSize: 14,
            fontWeight: FontWeight.w600,
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
            fontSize: 16,
            color: Color(0xFF0F172A),
          ),
          decoration: InputDecoration(
            filled: true,
            fillColor: Colors.white,
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
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
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Color(0xFF475569),
          ),
        ),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: const Color(0xFFE2E8F0),
              style: BorderStyle.solid,
            ),
          ),
          child: Column(
            children: [
              const Icon(Icons.cloud_upload_outlined, size: 48, color: Color(0xFF94A3B8)),
              const SizedBox(height: 12),
              const Text(
                'اضغط لرفع شعار جديد',
                style: TextStyle(
                  fontFamily: 'IBMPlexSansArabic',
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF0F172A),
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'PNG, JPG حتى 5MB',
                textDirection: TextDirection.ltr,
                style: TextStyle(
                  fontFamily: 'IBMPlexSansArabic',
                  fontSize: 12,
                  color: Color(0xFF64748B),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
