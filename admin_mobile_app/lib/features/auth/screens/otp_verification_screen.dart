import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:dio/dio.dart';
import '../../../core/api/dio_client.dart';
import '../../../core/api/api_endpoints.dart';

class OtpVerificationScreen extends StatefulWidget {
  final String userId;
  const OtpVerificationScreen({super.key, required this.userId});

  @override
  State<OtpVerificationScreen> createState() => _OtpVerificationScreenState();
}

class _OtpVerificationScreenState extends State<OtpVerificationScreen> {
  final _codeController = TextEditingController();
  bool _isLoading = false;

  void _verifyOtp() async {
    if (_codeController.text.length != 6) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('الرمز يجب أن يتكون من 6 أرقام')));
      return;
    }

    setState(() => _isLoading = true);
    try {
      final dio = DioClient().dio;
      final response = await dio.post(ApiEndpoints.baseUrl + '/auth/verify-otp', data: {
        'userId': widget.userId,
        'code': _codeController.text,
      });

      if (response.data['success']) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم التحقق بنجاح! يمكنك الآن تسجيل الدخول')));
          Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
        }
      }
    } on DioException catch (e) {
      if (mounted) {
        final errorMsg = e.response?.data['error'] ?? 'رمز التحقق غير صحيح';
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
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.mark_email_read_outlined, size: 80, color: Color(0xFF2563EB)),
              const SizedBox(height: 24),
              Text('التحقق من رقم الهاتف', style: GoogleFonts.ibmPlexSansArabic(fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text('تم إرسال رمز تحقق (OTP) في رسالة نصية، الرجاء إدخاله هنا:', textAlign: TextAlign.center, style: GoogleFonts.ibmPlexSansArabic(fontSize: 16, color: const Color(0xFF64748B))),
              const SizedBox(height: 32),
              TextField(
                controller: _codeController,
                keyboardType: TextInputType.number,
                maxLength: 6,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 24, letterSpacing: 8, fontWeight: FontWeight.bold),
                decoration: InputDecoration(
                  counterText: '',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  hintText: '000000',
                ),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _verifyOtp,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2563EB),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Text('تحقق', style: GoogleFonts.ibmPlexSansArabic(fontSize: 18, color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
