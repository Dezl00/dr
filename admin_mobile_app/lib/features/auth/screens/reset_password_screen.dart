import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:pinput/pinput.dart';
import '../../../core/api/dio_client.dart';
import '../../../core/api/api_endpoints.dart';

class ResetPasswordScreen extends StatefulWidget {
  final String phone;
  const ResetPasswordScreen({super.key, required this.phone});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _codeController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  bool _isLoading = false;
  bool _obscurePassword = true;

  Future<void> _submit() async {
    if (_codeController.text.length != 6) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('الرجاء إدخال الرمز المكون من 6 أرقام')));
      return;
    }
    if (_passwordController.text.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('كلمة المرور يجب أن تكون 6 أحرف على الأقل')));
      return;
    }
    if (_passwordController.text != _confirmController.text) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('كلمتا المرور غير متطابقتين')));
      return;
    }

    setState(() => _isLoading = true);

    try {
      final dio = DioClient().dio;
      final response = await dio.post('${ApiEndpoints.baseUrl}/auth/reset-password', data: {
        'phone': widget.phone,
        'code': _codeController.text,
        'newPassword': _passwordController.text,
      });

      if (response.data['success'] == true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم إعادة تعيين كلمة المرور بنجاح')));
          Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
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
    final defaultPinTheme = PinTheme(
      width: 56,
      height: 56,
      textStyle: const TextStyle(fontSize: 20, color: Color(0xFF1E293B), fontWeight: FontWeight.w600),
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFFCBD5E1)),
        borderRadius: BorderRadius.circular(12),
      ),
    );

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
              Text('تعيين كلمة مرور جديدة', style: TextStyle(fontFamily: 'IBMPlexSansArabic', fontSize: 28, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B))),
              const SizedBox(height: 8),
              Text('أدخل الرمز المرسل إلى ${widget.phone} وكلمة المرور الجديدة', style: TextStyle(fontFamily: 'IBMPlexSansArabic', fontSize: 16, color: const Color(0xFF64748B))),
              const SizedBox(height: 32),
              Center(
                child: Directionality(
                  textDirection: TextDirection.ltr,
                  child: Pinput(
                    length: 6,
                    controller: _codeController,
                    defaultPinTheme: defaultPinTheme,
                    focusedPinTheme: defaultPinTheme.copyDecorationWith(
                      border: Border.all(color: const Color(0xFF2563EB)),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 32),
              TextField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                decoration: InputDecoration(
                  labelText: 'كلمة المرور الجديدة',
                  labelStyle: TextStyle(fontFamily: 'IBMPlexSansArabic'),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  prefixIcon: const Icon(Icons.lock_outline),
                  suffixIcon: IconButton(
                    icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility, color: const Color(0xFF94A3B8)),
                    onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _confirmController,
                obscureText: _obscurePassword,
                decoration: InputDecoration(
                  labelText: 'تأكيد كلمة المرور',
                  labelStyle: TextStyle(fontFamily: 'IBMPlexSansArabic'),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  prefixIcon: const Icon(Icons.lock_outline),
                ),
              ),
              const SizedBox(height: 32),
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
                      : Text('إعادة تعيين', style: TextStyle(fontFamily: 'IBMPlexSansArabic', fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
