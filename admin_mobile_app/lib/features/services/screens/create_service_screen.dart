import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_endpoints.dart';
import '../../../core/providers/services_provider.dart';
import '../../../core/utils/toast_util.dart';
import '../../auth/providers/auth_provider.dart';

class CreateServiceScreen extends ConsumerStatefulWidget {
  const CreateServiceScreen({super.key, this.service});

  final Map<String, dynamic>? service;

  bool get isEditing => service != null;

  @override
  ConsumerState<CreateServiceScreen> createState() => _CreateServiceScreenState();
}

class _CreateServiceScreenState extends ConsumerState<CreateServiceScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _nameEnController = TextEditingController();
  final _priceController = TextEditingController();
  final _durationController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _contentController = TextEditingController();
  final _imageUrlController = TextEditingController();

  bool _isLoading = false;
  bool _isActive = true;
  bool _showOnWebsite = true;

  @override
  void initState() {
    super.initState();
    final service = widget.service;
    if (service == null) return;

    _nameController.text = _text(service['name']);
    _nameEnController.text = _text(service['nameEn']);
    _priceController.text = _text(service['price']);
    _durationController.text = _text(service['duration']);
    _descriptionController.text = _text(service['description']);
    _contentController.text = _text(service['content']);
    _imageUrlController.text = _text(service['imageUrl']);
    _isActive = service['isActive'] != false;
    _showOnWebsite = service['showOnWebsite'] != false;
  }

  String _text(dynamic value) => value == null ? '' : value.toString();

  @override
  void dispose() {
    _nameController.dispose();
    _nameEnController.dispose();
    _priceController.dispose();
    _durationController.dispose();
    _descriptionController.dispose();
    _contentController.dispose();
    _imageUrlController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final priceText = _priceController.text.trim().replaceAll(',', '.');
    final durationText = _durationController.text.trim();
    final price = priceText.isEmpty ? null : double.tryParse(priceText);
    final duration = durationText.isEmpty ? null : int.tryParse(durationText);

    if (priceText.isNotEmpty && price == null) {
      ToastUtil.showError(context, 'أدخل سعراً صحيحاً.');
      return;
    }
    if (durationText.isNotEmpty && (duration == null || duration <= 0)) {
      ToastUtil.showError(context, 'أدخل مدة صحيحة بالدقائق.');
      return;
    }

    final imageUrl = _imageUrlController.text.trim();
    if (imageUrl.isNotEmpty) {
      final uri = Uri.tryParse(imageUrl);
      if (uri == null || !uri.hasScheme || !uri.hasAuthority) {
        ToastUtil.showError(context, 'أدخل رابط صورة صحيحاً يبدأ بـ https:// أو http://.');
        return;
      }
    }

    setState(() => _isLoading = true);

    final payload = <String, dynamic>{
      'name': _nameController.text.trim(),
      'nameEn': _nullable(_nameEnController),
      'price': price,
      'duration': duration,
      'description': _nullable(_descriptionController),
      'content': _nullable(_contentController),
      'imageUrl': imageUrl.isEmpty ? null : imageUrl,
      'isActive': _isActive,
      'showOnWebsite': _showOnWebsite,
    };

    try {
      final dio = ref.read(dioProvider);
      if (widget.isEditing) {
        await dio.patch(
          '${ApiEndpoints.services}/${widget.service!['id']}',
          data: payload,
        );
      } else {
        await dio.post(ApiEndpoints.services, data: payload);
      }

      await ref.read(servicesProvider.notifier).fetchData();
      if (!mounted) return;
      ToastUtil.showSuccess(
        context,
        widget.isEditing ? 'تم تحديث الخدمة بنجاح.' : 'تمت إضافة الخدمة بنجاح.',
      );
      Navigator.of(context).pop(true);
    } on DioException catch (error) {
      if (mounted) ToastUtil.showError(context, _apiError(error));
    } catch (_) {
      if (mounted) ToastUtil.showError(context, 'تعذر حفظ الخدمة حالياً.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String? _nullable(TextEditingController controller) {
    final value = controller.text.trim();
    return value.isEmpty ? null : value;
  }

  String _apiError(DioException error) {
    final data = error.response?.data;
    if (data is Map && data['error'] is String) return data['error'] as String;
    return 'تعذر حفظ الخدمة. حاول مرة أخرى.';
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.isEditing ? 'تعديل الخدمة' : 'إضافة خدمة';

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        iconTheme: const IconThemeData(color: Colors.black),
        title: Text(
          title,
          style: const TextStyle(
            color: Colors.black,
            fontFamily: 'IBMPlexSansArabic',
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: Directionality(
        textDirection: TextDirection.rtl,
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _textField(
                    label: 'اسم الخدمة',
                    controller: _nameController,
                    required: true,
                    textCapitalization: TextCapitalization.words,
                  ),
                  const SizedBox(height: 16),
                  _textField(
                    label: 'الاسم بالإنجليزية',
                    controller: _nameEnController,
                    textDirection: TextDirection.ltr,
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: _textField(
                          label: 'السعر (ج.م)',
                          controller: _priceController,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _textField(
                          label: 'المدة بالدقائق',
                          controller: _durationController,
                          keyboardType: TextInputType.number,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _textField(
                    label: 'وصف مختصر',
                    controller: _descriptionController,
                    maxLines: 3,
                  ),
                  const SizedBox(height: 16),
                  _textField(
                    label: 'تفاصيل الخدمة',
                    controller: _contentController,
                    maxLines: 6,
                  ),
                  const SizedBox(height: 16),
                  _textField(
                    label: 'رابط الصورة',
                    controller: _imageUrlController,
                    keyboardType: TextInputType.url,
                    textDirection: TextDirection.ltr,
                  ),
                  const SizedBox(height: 8),
                  Card(
                    elevation: 0,
                    color: const Color(0xFFF8FAFC),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: const BorderSide(color: Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      children: [
                        SwitchListTile.adaptive(
                          value: _isActive,
                          onChanged: _isLoading
                              ? null
                              : (value) => setState(() => _isActive = value),
                          title: const Text('الخدمة نشطة', style: TextStyle(fontFamily: 'IBMPlexSansArabic')),
                          subtitle: const Text(
                            'يمكن استخدامها عند إنشاء المواعيد والفواتير.',
                            style: TextStyle(fontFamily: 'IBMPlexSansArabic', fontSize: 12),
                          ),
                        ),
                        const Divider(height: 1),
                        SwitchListTile.adaptive(
                          value: _showOnWebsite,
                          onChanged: _isLoading
                              ? null
                              : (value) => setState(() => _showOnWebsite = value),
                          title: const Text('عرضها في الموقع', style: TextStyle(fontFamily: 'IBMPlexSansArabic')),
                          subtitle: const Text(
                            'تظهر الخدمة للزوار في موقع العيادة عند نشره.',
                            style: TextStyle(fontFamily: 'IBMPlexSansArabic', fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  ),
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
                              height: 22,
                              width: 22,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : Text(
                              widget.isEditing ? 'حفظ التعديلات' : 'إضافة الخدمة',
                              style: const TextStyle(
                                fontFamily: 'IBMPlexSansArabic',
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
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

  Widget _textField({
    required String label,
    required TextEditingController controller,
    bool required = false,
    int maxLines = 1,
    TextInputType? keyboardType,
    TextDirection? textDirection,
    TextCapitalization textCapitalization = TextCapitalization.none,
  }) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      keyboardType: keyboardType,
      textDirection: textDirection,
      textCapitalization: textCapitalization,
      style: const TextStyle(fontFamily: 'IBMPlexSansArabic'),
      decoration: InputDecoration(
        labelText: required ? '$label *' : label,
        labelStyle: const TextStyle(fontFamily: 'IBMPlexSansArabic', color: Colors.grey),
        alignLabelWithHint: maxLines > 1,
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
      ),
      validator: required
          ? (value) {
              if (value == null || value.trim().length < 2) {
                return 'أدخل اسم الخدمة من حرفين على الأقل.';
              }
              return null;
            }
          : null,
    );
  }
}
