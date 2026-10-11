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

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        appBar: AppBar(title: const Text('الأمان والخصوصية')),
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
                FilledButton(
                  onPressed: _saving ? null : _changePassword,
                  style: FilledButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                  child: _saving ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('تغيير كلمة المرور'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _passwordField(String label, TextEditingController controller, {String? Function(String?)? validator}) {
    return TextFormField(
      controller: controller,
      obscureText: true,
      textDirection: TextDirection.ltr,
      decoration: InputDecoration(labelText: label, border: const OutlineInputBorder()),
      validator: validator ?? (value) => value == null || value.isEmpty ? 'هذا الحقل مطلوب' : null,
    );
  }
}
