import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/offline/hive_service.dart';
import '../../../core/utils/toast_util.dart';

class AccountSettingsScreen extends ConsumerStatefulWidget {
  const AccountSettingsScreen({super.key});

  @override
  ConsumerState<AccountSettingsScreen> createState() => _AccountSettingsScreenState();
}

class _AccountSettingsScreenState extends ConsumerState<AccountSettingsScreen> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _loadCachedData();
    _fetchData();
  }

  void _loadCachedData() {
    final cachedProfile = HiveService.getSettingsBox().get('profile');
    if (cachedProfile != null) {
      try {
        final data = jsonDecode(cachedProfile);
        _nameController.text = data['fullName']?.toString() ?? '';
        _emailController.text = data['email']?.toString() ?? '';
        _phoneController.text = _toEnglishNumbers(data['phone']?.toString() ?? '');
      } catch (e) {
        // Handle json decode error if necessary
      }
    } else {
      final authState = ref.read(authStateProvider);
      if (authState.user != null) {
        _nameController.text = authState.user!['fullName']?.toString() ?? '';
        _emailController.text = authState.user!['email']?.toString() ?? '';
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  String _toEnglishNumbers(String input) {
    const english = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const arabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    String result = input;
    for (int i = 0; i < arabic.length; i++) {
      result = result.replaceAll(arabic[i], english[i]);
    }
    return result;
  }

  Future<void> _fetchData() async {
    try {
      final dio = ref.read(dioProvider);
      final response = await dio.get(ApiEndpoints.profileSettings);
      
      if (response.statusCode == 200) {
        final data = response.data['data'] ?? response.data;
        HiveService.getSettingsBox().put('profile', jsonEncode(data));
        if (mounted) {
          setState(() {
            _nameController.text = data['fullName']?.toString() ?? _nameController.text;
            _emailController.text = data['email']?.toString() ?? _emailController.text;
            _phoneController.text = _toEnglishNumbers(data['phone']?.toString() ?? '');
          });
        }
      }
    } catch (e) {
      // Keep silent on error, UI is already populated from cache
    }
  }

  Future<void> _saveSettings() async {
    setState(() => _isSaving = true);
    try {
      final dio = ref.read(dioProvider);

      final response = await dio.put(
        ApiEndpoints.profileSettings,
        data: {
          'fullName': _nameController.text,
          'phone': _toEnglishNumbers(_phoneController.text),
        },
      );

      if (response.statusCode == 200) {
        if (mounted) {
          ToastUtil.showSuccess(context, 'تم حفظ الإعدادات بنجاح');
        }
      }
    } catch (e) {
      if (mounted) {
        ToastUtil.showError(context, 'حدث خطأ أثناء الحفظ');
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
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
          builder: (context, setModalState) {
            return Directionality(
              textDirection: TextDirection.rtl,
              child: Padding(
                padding: EdgeInsets.only(
                  bottom: MediaQuery.of(context).viewInsets.bottom + 20,
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
          backgroundColor: Colors.white,
          elevation: 0,
          scrolledUnderElevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios, color: Color(0xFF0F172A)),
            onPressed: () => Navigator.pop(context),
          ),
          title: const Text(
            'إعدادات الحساب',
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
              _buildTextField(label: 'الاسم الكامل', controller: _nameController),
              const SizedBox(height: 16),
              _buildTextField(label: 'رقم الهاتف', controller: _phoneController, isNumber: true),
              const SizedBox(height: 16),
              _buildTextField(label: 'البريد الإلكتروني', controller: _emailController, enabled: false),
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
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
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
    );
  }

  Widget _buildTextField({required String label, required TextEditingController controller, bool isNumber = false, bool enabled = true}) {
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
          enabled: enabled,
          textDirection: isNumber ? TextDirection.ltr : TextDirection.rtl,
          keyboardType: isNumber ? TextInputType.number : TextInputType.text,
          style: TextStyle(
            fontFamily: 'IBMPlexSansArabic',
            fontSize: 16,
            color: enabled ? const Color(0xFF0F172A) : const Color(0xFF94A3B8),
          ),
          decoration: InputDecoration(
            filled: true,
            fillColor: enabled ? Colors.white : const Color(0xFFF8FAFC),
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
}
