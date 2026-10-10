import 'package:flutter/material.dart';

class WebsiteSettingsScreen extends StatelessWidget {
  const WebsiteSettingsScreen({super.key});

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
        body: SafeArea(
          child: ListView(
            padding: const EdgeInsets.all(20.0),
            children: [
              _buildSectionTitle('المعلومات الأساسية'),
              const SizedBox(height: 16),
              _buildTextField(label: 'رابط الموقع (Domain)', initialValue: 'clinic.drs.com', isEnglish: true),
              const SizedBox(height: 16),
              _buildColorField(label: 'اللون الأساسي', hexColor: '#2563EB'),
              const SizedBox(height: 16),
              _buildLogoUpload(),
              
              const SizedBox(height: 32),
              _buildSectionTitle('روابط التواصل الاجتماعي'),
              const SizedBox(height: 16),
              _buildTextField(label: 'فيسبوك', initialValue: 'https://facebook.com/clinic', isEnglish: true),
              const SizedBox(height: 16),
              _buildTextField(label: 'إنستغرام', initialValue: 'https://instagram.com/clinic', isEnglish: true),
              const SizedBox(height: 16),
              _buildTextField(label: 'تويتر (X)', initialValue: 'https://x.com/clinic', isEnglish: true),
              
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2563EB),
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(50),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text(
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

  Widget _buildTextField({required String label, required String initialValue, bool isEnglish = false}) {
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
          initialValue: initialValue,
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

  Widget _buildColorField({required String label, required String hexColor}) {
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
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Row(
            children: [
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  color: const Color(0xFF2563EB), // Using hardcoded primary color for mockup
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
              ),
              const SizedBox(width: 12),
              Text(
                hexColor,
                textDirection: TextDirection.ltr,
                style: const TextStyle(
                  fontFamily: 'IBMPlexSansArabic',
                  fontSize: 16,
                  color: Color(0xFF0F172A),
                ),
              ),
              const Spacer(),
              const Icon(Icons.colorize, color: Color(0xFF94A3B8)),
            ],
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
