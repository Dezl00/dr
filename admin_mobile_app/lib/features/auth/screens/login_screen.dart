import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _obscurePassword = true;

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);

    ref.listen(authStateProvider, (previous, next) {
      if (next.isAuthenticated == true) {
        if (Navigator.of(context).canPop()) Navigator.of(context).pop();
        Navigator.pushReplacementNamed(context, '/dashboard');
      } else if (next.requireClinicSelection && previous?.requireClinicSelection != true) {
        _showClinicPicker(next.availableClinics);
      } else if (next.error != null && next.error!.isNotEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(next.error!)));
      }
    });

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.monitor_heart_outlined, color: Color(0xFF2563EB), size: 64),
                const SizedBox(height: 16),
                Text('تسجيل الدخول', style: TextStyle(fontFamily: 'IBMPlexSansArabic', fontSize: 28, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B))),
                const SizedBox(height: 8),
                Text('قم بتسجيل الدخول لإدارة عيادتك', style: TextStyle(fontFamily: 'IBMPlexSansArabic', fontSize: 16, color: const Color(0xFF64748B))),
                const SizedBox(height: 32),
                TextField(
                  controller: _emailController,
                  autofillHints: const [AutofillHints.email],
                  decoration: InputDecoration(
                    labelText: 'البريد الإلكتروني',
                    labelStyle: TextStyle(fontFamily: 'IBMPlexSansArabic'),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    prefixIcon: const Icon(Icons.email_outlined),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  autofillHints: const [AutofillHints.password],
                  decoration: InputDecoration(
                    labelText: 'كلمة المرور',
                    labelStyle: TextStyle(fontFamily: 'IBMPlexSansArabic'),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    prefixIcon: const Icon(Icons.lock_outline),
                    suffixIcon: IconButton(
                      icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility, color: const Color(0xFF94A3B8)),
                      onPressed: () {
                        setState(() {
                          _obscurePassword = !_obscurePassword;
                        });
                      },
                    ),
                  ),
                ),
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () {
                      Navigator.pushNamed(context, '/forgot-password');
                    },
                    child: Text(
                      'نسيت كلمة المرور؟',
                      style: TextStyle(fontFamily: 'IBMPlexSansArabic', color: const Color(0xFF64748B)),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2563EB),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: authState.isLoading
                        ? null
                        : () {
                            ref.read(authStateProvider.notifier).login(
                                  _emailController.text,
                                  _passwordController.text,
                                );
                          },
                    child: authState.isLoading
                        ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : Text('دخول', style: TextStyle(fontFamily: 'IBMPlexSansArabic', fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                  ),
                ),
                const SizedBox(height: 24),
                TextButton(
                  onPressed: () => Navigator.pushNamed(context, '/register'),
                  child: Text('إنشاء عيادة جديدة', style: TextStyle(fontFamily: 'IBMPlexSansArabic', fontSize: 16, color: const Color(0xFF2563EB), fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _showClinicPicker(List<dynamic> clinics) async {
    await showModalBottomSheet<void>(
      context: context,
      isDismissible: false,
      builder: (sheetContext) => Directionality(
        textDirection: TextDirection.rtl,
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('اختر العيادة', style: TextStyle(fontFamily: 'IBMPlexSansArabic', fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                const Text('لديك صلاحية في أكثر من عيادة.'),
                const SizedBox(height: 12),
                ...clinics.map((clinic) => ListTile(
                  leading: const Icon(Icons.local_hospital_outlined),
                  title: Text(clinic['name']?.toString() ?? 'عيادة'),
                  subtitle: Text(clinic['role']?.toString() ?? ''),
                  onTap: () => ref.read(authStateProvider.notifier).loginWithClinic(clinic['id']?.toString() ?? ''),
                )),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
