import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';

class ClinicSettingsScreen extends ConsumerWidget {
  const ClinicSettingsScreen({super.key});

  String _toEnglishNumbers(String input) {
    const english = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const arabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    String result = input;
    for (int i = 0; i < arabic.length; i++) {
      result = result.replaceAll(arabic[i], english[i]);
    }
    return result;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);
    final clinic = authState.clinic;

    final name = clinic?['name']?.toString() ?? '';
    final address = clinic?['address']?.toString() ?? '';
    final phone = _toEnglishNumbers(clinic?['phone']?.toString() ?? '');
    final taxNumber = _toEnglishNumbers(clinic?['taxNumber']?.toString() ?? '');

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
            'إعدادات العيادة',
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
              _buildTextField(label: 'اسم العيادة', initialValue: name),
              const SizedBox(height: 16),
              _buildTextField(label: 'العنوان', initialValue: address),
              const SizedBox(height: 16),
              _buildTextField(label: 'رقم هاتف العيادة', initialValue: phone, isNumber: true),
              const SizedBox(height: 16),
              _buildTextField(label: 'الرقم الضريبي', initialValue: taxNumber, isNumber: true),
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

  Widget _buildTextField({required String label, required String initialValue, bool isNumber = false}) {
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
          textDirection: isNumber ? TextDirection.ltr : TextDirection.rtl,
          keyboardType: isNumber ? TextInputType.number : TextInputType.text,
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
}
