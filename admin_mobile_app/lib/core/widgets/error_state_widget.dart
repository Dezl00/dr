import 'package:flutter/material.dart';
class ErrorStateWidget extends StatelessWidget {
  final String error;
  final VoidCallback onRetry;

  const ErrorStateWidget({
    super.key,
    required this.error,
    required this.onRetry,
  });

  String _getFriendlyErrorMessage(String raw) {
    final lower = raw.toLowerCase();
    if (lower.contains('timeout') ||
        lower.contains('connect') ||
        lower.contains('requestoptions') ||
        lower.contains('socketexception') ||
        lower.contains('xmlhttprequest') ||
        lower.contains('abort')) {
      return 'تعذر الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت والمحاولة مجدداً';
    }
    if (lower.contains('401') || lower.contains('unauthorized')) {
      return 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً';
    }
    if (lower.contains('403') || lower.contains('forbidden')) {
      return 'ليس لديك صلاحية للوصول إلى هذه البيانات';
    }
    if (raw.startsWith('Exception: ')) {
      return raw.replaceFirst('Exception: ', '').trim();
    }
    return raw;
  }

  @override
  Widget build(BuildContext context) {
    final displayError = _getFriendlyErrorMessage(error);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Color(0xFFFEE2E2), // Red-100
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.error_outline,
                color: Color(0xFFDC2626), // Red-600
                size: 48,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'حدث خطأ',
              style: TextStyle(
                fontFamily: 'IBMPlexSansArabic',
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              displayError,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontFamily: 'IBMPlexSansArabic',
                color: Color(0xFF64748B),
                fontSize: 14,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: Text(
                'إعادة المحاولة',
                style: TextStyle(fontFamily: 'IBMPlexSansArabic'),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: const Color(0xFF2563EB),
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                  side: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}
