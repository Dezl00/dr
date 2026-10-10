import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../../core/api/dio_client.dart';
import '../../../core/api/api_endpoints.dart';
import 'reset_password_screen.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _phoneController = TextEditingController();
  bool _isLoading = false;

  Future<void> _submit() async {
    final phone = _phoneController.text.trim();
    if (phone.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('الرجاء إدخال رقم الهاتف')));
      return;
    }

    setState(() => _isLoading = true);

    try {
      final dio = DioClient().dio;
      final response = await dio.post('${ApiEndpoints.baseUrl}/auth/forgot-password', data: {
        'phone': phone,
      });

      if (response.data['success'] == true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم إرسال رمز التحقق بنجاح')));
          Navigator.push(context, MaterialPageRoute(builder: (_) => ResetPasswordScreen(phone: phone)));
        }
      }
    } on DioException catch (e) {
      if (mounted) {
        final errorMsg = e.response?.data['error'] ?? 'حدث خطأ، يرجى المحاولة لاحقاً';
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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('نسيت كلمة المرور', style: TextStyle(fontFamily: 'IBMPlexSansArabic', fontSize: 28, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B))),
              const SizedBox(height: 8),
              Text('أدخل رقم هاتفك وسنرسل لك رمزاً لإعادة تعيين كلمة المرور.', style: TextStyle(fontFamily: 'IBMPlexSansArabic', fontSize: 16, color: const Color(0xFF64748B))),
              const SizedBox(height: 32),
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(
                  labelText: 'رقم الهاتف',
                  labelStyle: TextStyle(fontFamily: 'IBMPlexSansArabic'),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  prefixIcon: const Icon(Icons.phone_outlined),
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2563EB),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: _isLoading ? null : _submit,
                  child: _isLoading
                      ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : Text('إرسال الرمز', style: TextStyle(fontFamily: 'IBMPlexSansArabic', fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
