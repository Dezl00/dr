import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_endpoints.dart';
import '../../../core/providers/team_provider.dart';
import '../../auth/providers/auth_provider.dart';

class CreateTeamScreen extends ConsumerStatefulWidget {
  const CreateTeamScreen({super.key});

  @override
  ConsumerState<CreateTeamScreen> createState() => _CreateTeamScreenState();
}

class _CreateTeamScreenState extends ConsumerState<CreateTeamScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _phone = TextEditingController();
  final _password = TextEditingController();
  List<dynamic> _roles = [];
  String? _roleId;
  bool _loadingRoles = true;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _loadRoles();
  }

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _phone.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _loadRoles() async {
    try {
      final response = await ref.read(dioProvider).get(ApiEndpoints.team);
      if (response.data['success'] == true && mounted) {
        setState(() => _roles = ((response.data['meta']?['roles'] as List?) ?? []));
      }
    } catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('تعذر تحميل الأدوار: $error')));
    } finally {
      if (mounted) setState(() => _loadingRoles = false);
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate() || _roleId == null) return;
    setState(() => _saving = true);
    try {
      final response = await ref.read(dioProvider).post(ApiEndpoints.team, data: {
        'fullName': _name.text.trim(),
        'email': _email.text.trim(),
        'phone': _phone.text.trim().isEmpty ? null : _phone.text.trim(),
        'password': _password.text,
        'roleId': _roleId,
      });
      if (response.data['success'] != true) throw Exception(response.data['error'] ?? 'تعذر إضافة عضو الفريق');
      await ref.read(teamProvider.notifier).fetchData();
      if (!mounted) return;
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تمت إضافة عضو الفريق')));
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
        appBar: AppBar(title: const Text('إضافة عضو فريق')),
        body: _loadingRoles
            ? const Center(child: CircularProgressIndicator())
            : Form(
                key: _formKey,
                child: ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    _field(_name, 'الاسم الكامل'),
                    const SizedBox(height: 16),
                    _field(_email, 'البريد الإلكتروني', keyboardType: TextInputType.emailAddress),
                    const SizedBox(height: 16),
                    _field(_phone, 'رقم الهاتف (اختياري)', required: false, keyboardType: TextInputType.phone),
                    const SizedBox(height: 16),
                    _field(_password, 'كلمة المرور', obscure: true, validator: (value) => value == null || value.length < 8 ? 'استخدم 8 أحرف على الأقل' : null),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      value: _roleId,
                      decoration: const InputDecoration(labelText: 'الدور', border: OutlineInputBorder()),
                      items: _roles.map((role) => DropdownMenuItem<String>(value: role['id']?.toString(), child: Text(role['nameAr']?.toString() ?? role['name']?.toString() ?? 'دور'))).toList(),
                      onChanged: (value) => setState(() => _roleId = value),
                      validator: (value) => value == null ? 'اختر الدور' : null,
                    ),
                    const SizedBox(height: 32),
                    FilledButton(onPressed: _saving ? null : _save, style: FilledButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)), child: _saving ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('حفظ')),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _field(TextEditingController controller, String label, {bool required = true, bool obscure = false, TextInputType? keyboardType, String? Function(String?)? validator}) {
    return TextFormField(
      controller: controller,
      obscureText: obscure,
      keyboardType: keyboardType,
      decoration: InputDecoration(labelText: label, border: const OutlineInputBorder()),
      validator: validator ?? (required ? (value) => value == null || value.trim().isEmpty ? 'هذا الحقل مطلوب' : null : null),
    );
  }
}
