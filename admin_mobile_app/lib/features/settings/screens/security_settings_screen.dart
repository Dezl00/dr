import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_endpoints.dart';
import '../../auth/providers/auth_provider.dart';

class SecuritySettingsScreen extends ConsumerStatefulWidget {
  const SecuritySettingsScreen({super.key});

  @override
  ConsumerState<SecuritySettingsScreen> createState() => _SecuritySettingsScreenState();
}

class _SecuritySettingsScreenState extends ConsumerState<SecuritySettingsScreen> {
  final _formKey = GlobalKey<FormState>();
  final _currentPassword = TextEditingController();
  final _newPassword = TextEditingController();
  final _confirmation = TextEditingController();
  bool _saving = false;

  @override
  void dispose() {
    _currentPassword.dispose();
    _newPassword.dispose();
    _confirmation.dispose();
    super.dispose();
  }

  Future<void> _changePassword() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      final response = await ref.read(dioProvider).put(ApiEndpoints.profileSettings, data: {
        'currentPassword': _currentPassword.text,
        'newPassword': _newPassword.text,
      });
      if (response.data['success'] != true) throw Exception(response.data['error'] ?? 'تعذر تغيير كلمة المرور');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم تغيير كلمة المرور')));
      Navigator.pop(context);
    } catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.toString())));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  void _showDeleteAccountModal() {
    final rootNavigator = Navigator.of(context, rootNavigator: true);
    final messenger = ScaffoldMessenger.of(context);
    String selectedReason = 'لم أعد بحاجة للخدمة';
    final otherReasonController = TextEditingController();
    bool isSubmitting = false;

    final reasons = [
      'لم أعد بحاجة للخدمة',
      'واجهت صعوبة في استخدام التطبيق',
      'الانتقال لبرنامج آخر',
      'أسباب تتعلق بالتكلفة أو الخصوصية',
      'سبب آخر',
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (bottomSheetContext) {
        return StatefulBuilder(
          builder: (modalCtx, setModalState) {
            return Directionality(
              textDirection: TextDirection.rtl,
              child: Padding(
                padding: EdgeInsets.only(
                  bottom: MediaQuery.of(modalCtx).viewInsets.bottom + 20,
                  top: 16,
                  left: 20,
                  right: 20,
                ),
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Center(
                        child: Container(
                          width: 48,
                          height: 5,
                          decoration: BoxDecoration(
                            color: const Color(0xFFCBD5E1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFEE2E2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(
                              Icons.warning_amber_rounded,
                              color: Color(0xFFDC2626),
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 12),
                          const Expanded(
                            child: Text(
                              'تأكيد طلب حذف الحساب',
                              style: TextStyle(
                                fontFamily: 'IBMPlexSansArabic',
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF0F172A),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFFBEB),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFFDE68A)),
                        ),
                        child: const Text(
                          'تنبيه: سيتم جدولة حذف حسابك وكافة بيانات العيادة والموقع نهائياً خلال 15 يوماً.\nخلال هذه المدة، يمكنك إلغاء طلب الحذف في أي وقت بمجرد تسجيل الدخول مرة أخرى.',
                          style: TextStyle(
                            fontFamily: 'IBMPlexSansArabic',
                            fontSize: 13,
                            color: Color(0xFF92400E),
                            height: 1.5,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'يرجى اختيار سبب رغبتك في حذف الحساب:',
                        style: TextStyle(
                          fontFamily: 'IBMPlexSansArabic',
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF334155),
                        ),
                      ),
                      const SizedBox(height: 8),
                      ...reasons.map((reason) {
                        return RadioListTile<String>(
                          value: reason,
                          groupValue: selectedReason,
                          contentPadding: EdgeInsets.zero,
                          activeColor: const Color(0xFFDC2626),
                          title: Text(
                            reason,
                            style: const TextStyle(
                              fontFamily: 'IBMPlexSansArabic',
                              fontSize: 14,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                          onChanged: (val) {
                            if (val != null) {
                              setModalState(() {
                                selectedReason = val;
                              });
                            }
                          },
                        );
                      }),
                      if (selectedReason == 'سبب آخر') ...[
                        const SizedBox(height: 8),
                        TextField(
                          controller: otherReasonController,
                          maxLines: 2,
                          decoration: InputDecoration(
                            hintText: 'اكتب سبب الحذف هنا...',
                            hintStyle: const TextStyle(
                              fontFamily: 'IBMPlexSansArabic',
                              fontSize: 13,
                              color: Color(0xFF94A3B8),
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                            ),
                          ),
                        ),
                      ],
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: isSubmitting
                            ? null
                            : () async {
                                setModalState(() => isSubmitting = true);
                                try {
                                  final dio = ref.read(dioProvider);
                                  final finalReason = selectedReason == 'سبب آخر' && otherReasonController.text.trim().isNotEmpty
                                      ? otherReasonController.text.trim()
                                      : selectedReason;

                                  final response = await dio.post(
                                    ApiEndpoints.deleteAccount,
                                    data: {
                                      'reason': finalReason,
                                    },
                                  );

                                  if (response.statusCode == 200) {
                                    rootNavigator.pop();
                                    messenger.showSnackBar(
                                      const SnackBar(
                                        content: Text(
                                          'تم تسجيل طلب الحذف. سيتم حذف الحساب نهائياً خلال 15 يوماً ما لم تسجل دخولك مجدداً.',
                                          style: TextStyle(fontFamily: 'IBMPlexSansArabic'),
                                        ),
                                        backgroundColor: Color(0xFFDC2626),
                                        duration: Duration(seconds: 4),
                                      ),
                                    );

                                    // Logout and return to login screen
                                    await ref.read(authStateProvider.notifier).logout();
                                    rootNavigator.pushNamedAndRemoveUntil(
                                      '/login',
                                      (route) => false,
                                    );
                                  } else {
                                    throw Exception('Failed');
                                  }
                                } catch (e) {
                                  setModalState(() => isSubmitting = false);
                                  messenger.showSnackBar(
                                    const SnackBar(
                                      content: Text(
                                        'حدث خطأ أثناء معالجة طلب الحذف',
                                        style: TextStyle(fontFamily: 'IBMPlexSansArabic'),
                                      ),
                                    ),
                                  );
                                }
                              },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFDC2626),
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(50),
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                        child: isSubmitting
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                ),
                              )
                            : const Center(
                                child: Text(
                                  'تأكيد الحذف النهائي',
                                  style: TextStyle(
                                    fontFamily: 'IBMPlexSansArabic',
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                      ),
                      const SizedBox(height: 12),
                      Center(
                        child: TextButton(
                          onPressed: () => Navigator.pop(bottomSheetContext),
                          child: const Text(
                            'إلغاء والعودة',
                            style: TextStyle(
                              fontFamily: 'IBMPlexSansArabic',
                              fontSize: 14,
                              color: Color(0xFF64748B),
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
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          title: const Text(
            'الأمان والخصوصية',
            style: TextStyle(
              fontFamily: 'IBMPlexSansArabic',
              fontWeight: FontWeight.bold,
              fontSize: 18,
              color: Color(0xFF0F172A),
            ),
          ),
          backgroundColor: Colors.white,
          elevation: 0,
          scrolledUnderElevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios, color: Color(0xFF0F172A)),
            onPressed: () => Navigator.pop(context),
          ),
          centerTitle: true,
        ),
        body: SafeArea(
          child: Form(
            key: _formKey,
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                _passwordField('كلمة المرور الحالية', _currentPassword),
                const SizedBox(height: 16),
                _passwordField('كلمة المرور الجديدة', _newPassword, validator: (value) => value == null || value.length < 8 ? 'استخدم 8 أحرف على الأقل' : null),
                const SizedBox(height: 16),
                _passwordField('تأكيد كلمة المرور الجديدة', _confirmation, validator: (value) => value != _newPassword.text ? 'كلمتا المرور غير متطابقتين' : null),
                const SizedBox(height: 32),
                ElevatedButton(
                  onPressed: _saving ? null : _changePassword,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2563EB),
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(50)),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: _saving
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text(
                          'تغيير كلمة المرور',
                          style: TextStyle(
                            fontFamily: 'IBMPlexSansArabic',
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                ),

                const SizedBox(height: 48),

                // Danger Zone
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF2F2),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFFCA5A5)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(
                            Icons.delete_forever_outlined,
                            color: Color(0xFFDC2626),
                            size: 22,
                          ),
                          SizedBox(width: 8),
                          Text(
                            'منطقة الخطر - حذف الحساب',
                            style: TextStyle(
                              fontFamily: 'IBMPlexSansArabic',
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF991B1B),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      const Text(
                        'عند طلب حذف الحساب، سيتم إيقاف حسابك وجدولة الحذف النهائي لكافة بياناتك وعيادتك وموقعك الإلكتروني خلال 15 يوماً. يمكنك إلغاء الطلب بتسجيل الدخول مجدداً قبل انقضاء المدة.',
                        style: TextStyle(
                          fontFamily: 'IBMPlexSansArabic',
                          fontSize: 13,
                          color: Color(0xFF7F1D1D),
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 16),
                      OutlinedButton.icon(
                        onPressed: _showDeleteAccountModal,
                        icon: const Icon(Icons.delete_outline, color: Color(0xFFDC2626), size: 18),
                        label: const Text(
                          'حذف الحساب نهائياً',
                          style: TextStyle(
                            fontFamily: 'IBMPlexSansArabic',
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFDC2626),
                          ),
                        ),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Color(0xFFDC2626)),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(50),
                          ),
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _passwordField(String label, TextEditingController controller, {String? Function(String?)? validator}) {
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
          obscureText: true,
          textDirection: TextDirection.ltr,
          style: const TextStyle(fontFamily: 'IBMPlexSansArabic', fontSize: 16),
          decoration: InputDecoration(
            filled: true,
            fillColor: Colors.white,
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFF2563EB))),
          ),
          validator: validator ?? (value) => value == null || value.isEmpty ? 'هذا الحقل مطلوب' : null,
        ),
      ],
    );
  }
}
