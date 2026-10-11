import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_endpoints.dart';
import '../../../core/providers/leads_provider.dart';
import '../../../core/utils/toast_util.dart';
import '../../auth/providers/auth_provider.dart';

class CreateLeadScreen extends ConsumerStatefulWidget {
  const CreateLeadScreen({super.key, this.lead});

  final Map<String, dynamic>? lead;

  bool get isEditing => lead != null;

  @override
  ConsumerState<CreateLeadScreen> createState() => _CreateLeadScreenState();
}

class _CreateLeadScreenState extends ConsumerState<CreateLeadScreen> {
  static const _statuses = ['NEW', 'CONTACTED', 'CONVERTED', 'LOST'];

  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _sourceController = TextEditingController();
  final _notesController = TextEditingController();
  String _status = 'NEW';
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    final lead = widget.lead;
    if (lead == null) return;
    _nameController.text = _text(lead['fullName']);
    _phoneController.text = _text(lead['phone']);
    _sourceController.text = _text(lead['source']);
    _notesController.text = _text(lead['notes']);
    final initialStatus = _text(lead['status']);
    _status = _statuses.contains(initialStatus) ? initialStatus : 'NEW';
  }

  String _text(dynamic value) => value == null ? '' : value.toString();

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _sourceController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    final payload = <String, dynamic>{
      'fullName': _nameController.text.trim(),
      'phone': _phoneController.text.trim(),
      'source': _optional(_sourceController),
      'notes': _optional(_notesController),
      'status': _status,
    };

    try {
      final dio = ref.read(dioProvider);
      if (widget.isEditing) {
        await dio.patch('${ApiEndpoints.leads}/${widget.lead!['id']}', data: payload);
      } else {
        await dio.post(ApiEndpoints.leads, data: payload);
      }
      await ref.read(leadsProvider.notifier).fetchData();
      if (!mounted) return;
      ToastUtil.showSuccess(
        context,
        widget.isEditing ? 'تم تحديث العميل المحتمل.' : 'تمت إضافة العميل المحتمل.',
      );
      Navigator.of(context).pop(true);
    } on DioException catch (error) {
      if (mounted) ToastUtil.showError(context, _apiError(error));
    } catch (_) {
      if (mounted) ToastUtil.showError(context, 'تعذر حفظ بيانات العميل المحتمل.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String? _optional(TextEditingController controller) {
    final value = controller.text.trim();
    return value.isEmpty ? null : value;
  }

  String _apiError(DioException error) {
    final body = error.response?.data;
    if (body is Map && body['error'] is String) return body['error'] as String;
    return 'تعذر حفظ البيانات. حاول مرة أخرى.';
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
          iconTheme: const IconThemeData(color: Colors.black),
          title: Text(
            widget.isEditing ? 'تعديل العميل المحتمل' : 'إضافة عميل محتمل',
            style: const TextStyle(
              color: Colors.black,
              fontFamily: 'IBMPlexSansArabic',
              fontWeight: FontWeight.bold,
            ),
          ),
          centerTitle: true,
        ),
        body: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _field('الاسم الكامل', _nameController, required: true, textCapitalization: TextCapitalization.words),
                  const SizedBox(height: 16),
                  _field(
                    'رقم الهاتف',
                    _phoneController,
                    required: true,
                    keyboardType: TextInputType.phone,
                    textDirection: TextDirection.ltr,
                    validator: (value) {
                      if (value == null || value.trim().length < 8) {
                        return 'أدخل رقم هاتف صحيحاً.';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  _field('المصدر', _sourceController, hint: 'مثال: فيسبوك، موقع إلكتروني، إحالة'),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String>(
                    value: _status,
                    isExpanded: true,
                    decoration: _decoration('حالة العميل المحتمل'),
                    items: _statuses
                        .map(
                          (value) => DropdownMenuItem(
                            value: value,
                            child: Text(_statusLabel(value), style: const TextStyle(fontFamily: 'IBMPlexSansArabic')),
                          ),
                        )
                        .toList(growable: false),
                    onChanged: _isLoading ? null : (value) => setState(() => _status = value ?? 'NEW'),
                  ),
                  const SizedBox(height: 16),
                  _field('ملاحظات', _notesController, maxLines: 5),
                  const SizedBox(height: 28),
                  SizedBox(
                    height: 52,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _submit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2563EB),
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: _isLoading
                          ? const SizedBox(
                              width: 22,
                              height: 22,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : Text(
                              widget.isEditing ? 'حفظ التعديلات' : 'إضافة العميل',
                              style: const TextStyle(
                                fontFamily: 'IBMPlexSansArabic',
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _field(
    String label,
    TextEditingController controller, {
    bool required = false,
    int maxLines = 1,
    String? hint,
    TextInputType? keyboardType,
    TextDirection? textDirection,
    TextCapitalization textCapitalization = TextCapitalization.none,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      keyboardType: keyboardType,
      textDirection: textDirection,
      textCapitalization: textCapitalization,
      style: const TextStyle(fontFamily: 'IBMPlexSansArabic'),
      decoration: _decoration(required ? '$label *' : label, hint: hint, multiline: maxLines > 1),
      validator: validator ??
          (required
              ? (value) {
                  if (value == null || value.trim().length < 2) {
                    return 'أدخل $label بشكل صحيح.';
                  }
                  return null;
                }
              : null),
    );
  }

  InputDecoration _decoration(String label, {String? hint, bool multiline = false}) {
    return InputDecoration(
      labelText: label,
      hintText: hint,
      alignLabelWithHint: multiline,
      labelStyle: const TextStyle(fontFamily: 'IBMPlexSansArabic', color: Colors.grey),
      hintStyle: const TextStyle(fontFamily: 'IBMPlexSansArabic', color: Colors.black38, fontSize: 12),
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFF2563EB), width: 1.5),
      ),
    );
  }

  String _statusLabel(String status) {
    switch (status) {
      case 'CONTACTED':
        return 'تم التواصل';
      case 'CONVERTED':
        return 'تحوّل إلى مريض';
      case 'LOST':
        return 'غير مهتم';
      default:
        return 'جديد';
    }
  }
}
