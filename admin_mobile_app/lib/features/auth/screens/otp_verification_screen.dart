import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:dio/dio.dart';
import 'package:pinput/pinput.dart';
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
  
  Timer? _timer;
  int _secondsRemaining = 60;
  bool _canResend = false;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _codeController.dispose();
    super.dispose();
  }

  void _startTimer() {
    setState(() {
      _secondsRemaining = 60;
      _canResend = false;
    });
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining > 0) {
        setState(() {
          _secondsRemaining--;
        });
      } else {
        setState(() {
          _canResend = true;
        });
        timer.cancel();
      }
    });
  }

  void _resendOtp() async {
    // Here you would call your backend to resend the OTP.
    // For now, we simulate success and restart the timer.
    _startTimer();
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم إعادة إرسال رمز التحقق')));
  }

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
    final defaultPinTheme = PinTheme(
      width: 56,
      height: 60,
      textStyle: GoogleFonts.ibmPlexSansArabic(
        fontSize: 24,
        color: const Color(0xFF1E293B),
        fontWeight: FontWeight.w600,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: const Color(0xFFE2E8F0)),
        borderRadius: BorderRadius.circular(12),
      ),
    );

    final focusedPinTheme = defaultPinTheme.copyDecorationWith(
      border: Border.all(color: const Color(0xFF2563EB), width: 2),
      borderRadius: BorderRadius.circular(12),
    );

    final submittedPinTheme = defaultPinTheme.copyWith(
      decoration: defaultPinTheme.decoration?.copyWith(
        color: const Color(0xFFF8FAFC),
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
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(height: 32),
              const Icon(Icons.mark_email_read_outlined, size: 80, color: Color(0xFF2563EB)),
              const SizedBox(height: 24),
              Text('التحقق من رقم الهاتف', style: GoogleFonts.ibmPlexSansArabic(fontSize: 24, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B))),
              const SizedBox(height: 8),
              Text('تم إرسال رمز تحقق (OTP) مكون من 6 أرقام\nالرجاء إدخاله هنا:', textAlign: TextAlign.center, style: GoogleFonts.ibmPlexSansArabic(fontSize: 16, color: const Color(0xFF64748B))),
              const SizedBox(height: 40),
              Directionality(
                textDirection: TextDirection.ltr,
                child: Pinput(
                  controller: _codeController,
                  length: 6,
                  defaultPinTheme: defaultPinTheme,
                  focusedPinTheme: focusedPinTheme,
                  submittedPinTheme: submittedPinTheme,
                  showCursor: true,
                  onCompleted: (pin) => _verifyOtp(),
                ),
              ),
              const SizedBox(height: 40),
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
                      ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : Text('تحقق', style: GoogleFonts.ibmPlexSansArabic(fontSize: 18, color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'لم يصلك الرمز؟',
                    style: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF64748B), fontSize: 16),
                  ),
                  TextButton(
                    onPressed: _canResend ? _resendOtp : null,
                    child: Text(
                      _canResend ? 'إعادة الإرسال' : 'إعادة الإرسال بعد $_secondsRemaining ثانية',
                      style: GoogleFonts.ibmPlexSansArabic(
                        color: _canResend ? const Color(0xFF2563EB) : const Color(0xFF94A3B8),
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
