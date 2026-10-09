import 'package:flutter/material.dart';
import 'otp_verification_screen.dart';

import 'package:google_fonts/google_fonts.dart';
import 'package:dio/dio.dart';
import '../../../core/api/dio_client.dart';
import '../../../core/api/api_endpoints.dart';

class RegisterClinicScreen extends StatefulWidget {
  const RegisterClinicScreen({super.key});

  @override
  State<RegisterClinicScreen> createState() => _RegisterClinicScreenState();
}

class _RegisterClinicScreenState extends State<RegisterClinicScreen> {
  bool _isLoading = false;
  final _clinicName = TextEditingController();
  final _adminName = TextEditingController();
  final _phone = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _slug = TextEditingController();

  bool _obscurePassword = true;

  @override
  void initState() {
    super.initState();
    _clinicName.addListener(() {
      _slug.text = _transliterate(_clinicName.text);
    });
  }

  String _transliterate(String text) {
    const map = {
      'ا': 'a', 'أ': 'a', 'إ': 'e', 'آ': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th',
      'ج': 'j', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'th', 'ر': 'r', 'ز': 'z',
      'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'dh', 'ع': 'a',
      'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
      'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a', 'ة': 'a', 'ئ': 'e', 'ؤ': 'o',
      ' ': '-'
    };
    String result = '';
    for(int i=0; i<text.length; i++) {
      String char = text[i];
      result += map[char] ?? char;
    }
    
    // Convert to lowercase, replace non-alphanumeric with hyphens
    String slug = result.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]+'), '-');
    // Remove consecutive hyphens
    slug = slug.replaceAll(RegExp(r'-+'), '-');
    // Remove leading and trailing hyphens
    slug = slug.replaceAll(RegExp(r'^-+|-+$'), '');
    
    if (slug.length < 3 && slug.isNotEmpty) {
      slug += '-clinic';
    }
    
    return slug;
  }

  void _register() async {
    if (_clinicName.text.isEmpty || _adminName.text.isEmpty || _phone.text.isEmpty || _email.text.isEmpty || _password.text.isEmpty || _slug.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('الرجاء تعبئة جميع الحقول')));
      return;
    }

    setState(() => _isLoading = true);
    try {
      final dio = DioClient().dio;
      final response = await dio.post(ApiEndpoints.baseUrl + '/auth/register', data: {
        'fullName': _adminName.text,
        'email': _email.text,
        'phone': _phone.text,
        'password': _password.text,
        'confirmPassword': _password.text,
        'clinicName': _clinicName.text,
        'slug': _slug.text,
      });

      if (response.data['success']) {
        if (mounted) {
          final token = response.data['registrationToken'];
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم إرسال رمز التحقق إلى هاتفك')));
          Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => OtpVerificationScreen(token: token)));
        }
      }
    } on DioException catch (e) {
      if (mounted) {
        final errorMsg = e.response?.data['error'] ?? 'حدث خطأ أثناء التسجيل';
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(errorMsg), backgroundColor: Colors.red));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('تسجيل عيادة جديدة', style: GoogleFonts.ibmPlexSansArabic(fontSize: 28, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B))),
              const SizedBox(height: 8),
              Text('أدخل بيانات عيادتك للبدء في استخدام النظام', style: GoogleFonts.ibmPlexSansArabic(fontSize: 16, color: const Color(0xFF64748B))),
              const SizedBox(height: 32),
              
              _buildTextField('اسم العيادة', Icons.local_hospital_outlined, _clinicName),
              const SizedBox(height: 16),
              _buildTextField('رابط العيادة الفرعي', Icons.link, _slug, readOnly: true),
              const SizedBox(height: 16),
              _buildTextField('اسم المسؤول', Icons.person_outline, _adminName),
              const SizedBox(height: 16),
              _buildTextField('رقم الهاتف', Icons.phone_outlined, _phone),
              const SizedBox(height: 16),
              _buildTextField('البريد الإلكتروني', Icons.email_outlined, _email, autofillHints: [AutofillHints.email]),
              const SizedBox(height: 16),
              _buildTextField('كلمة المرور', Icons.lock_outline, _password, isPassword: true, autofillHints: [AutofillHints.newPassword]),
              
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2563EB),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: _isLoading ? null : _register,
                  child: _isLoading
                      ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : Text('إنشاء الحساب', style: GoogleFonts.ibmPlexSansArabic(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                ),
              ),
              const SizedBox(height: 24),
              Center(
                child: TextButton(
                  onPressed: () => Navigator.pushReplacementNamed(context, '/login'),
                  child: Text('هل لديك حساب بالفعل؟ تسجيل الدخول', style: GoogleFonts.ibmPlexSansArabic(fontSize: 16, color: const Color(0xFF2563EB), fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(String label, IconData icon, TextEditingController controller, {bool isPassword = false, bool readOnly = false, Iterable<String>? autofillHints}) {
    return TextField(
      controller: controller,
      obscureText: isPassword ? _obscurePassword : false,
      readOnly: readOnly,
      autofillHints: autofillHints,
      decoration: InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.ibmPlexSansArabic(),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        prefixIcon: Icon(icon),
        fillColor: readOnly ? const Color(0xFFF1F5F9) : Colors.white,
        suffixIcon: isPassword
            ? IconButton(
                icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility, color: const Color(0xFF94A3B8)),
                onPressed: () {
                  setState(() {
                    _obscurePassword = !_obscurePassword;
                  });
                },
              )
            : null,
      ),
    );
  }
}
