import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/patient.dart';
import '../providers/patient_provider.dart';

class EditPatientScreen extends ConsumerStatefulWidget {
  final Patient patient;
  const EditPatientScreen({super.key, required this.patient});

  @override
  ConsumerState<EditPatientScreen> createState() => _EditPatientScreenState();
}

class _EditPatientScreenState extends ConsumerState<EditPatientScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  late TextEditingController _emailController;
  late TextEditingController _notesController;
  String? _selectedGender;
  DateTime? _selectedDate;
  bool _isLoading = false;

  String _formatEnglishNumbers(String input) {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    String result = input;
    for (int i = 0; i < arabicNumbers.length; i++) {
      result = result.replaceAll(arabicNumbers[i], englishNumbers[i]);
    }
    return result;
  }

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.patient.fullName);
    _phoneController = TextEditingController(text: _formatEnglishNumbers(widget.patient.phone));
    _emailController = TextEditingController();
    _notesController = TextEditingController();
    _selectedGender = widget.patient.gender;
    _selectedDate = widget.patient.dateOfBirth;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final success = await ref.read(patientStateProvider.notifier).updateItem(widget.patient.id, {
        'fullName': _nameController.text.trim(),
        'phone': _formatEnglishNumbers(_phoneController.text.trim()),
        if (_emailController.text.isNotEmpty) 'email': _emailController.text.trim(),
        if (_notesController.text.isNotEmpty) 'notes': _notesController.text.trim(),
        if (_selectedGender != null) 'gender': _selectedGender,
        if (_selectedDate != null) 'dateOfBirth': _selectedDate!.toIso8601String(),
      });

      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('تم التعديل بنجاح', style: TextStyle(fontFamily: 'IBMPlexSansArabic')),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString(), style: const TextStyle(fontFamily: 'IBMPlexSansArabic')),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _pickDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime.now(),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: Color(0xFF2563EB),
              onPrimary: Colors.white,
              onSurface: Color(0xFF0F172A),
            ),
            textButtonTheme: TextButtonThemeData(
              style: TextButton.styleFrom(
                foregroundColor: const Color(0xFF2563EB),
                textStyle: const TextStyle(fontFamily: 'IBMPlexSansArabic'),
              ),
            ),
          ),
          child: child!,
        );
      },
    );
    if (date != null) {
      setState(() => _selectedDate = date);
    }
  }

  @override
  Widget build(BuildContext context) {
    final border = OutlineInputBorder(
      borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
      borderRadius: BorderRadius.circular(16),
    );
    
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          title: const Text('تعديل بيانات المريض', style: TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF0F172A), fontSize: 18, fontWeight: FontWeight.bold)),
          backgroundColor: Colors.white,
          elevation: 0,
          scrolledUnderElevation: 0,
          iconTheme: const IconThemeData(color: Color(0xFF0F172A)),
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextFormField(
                  controller: _nameController,
                  style: const TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF0F172A)),
                  decoration: InputDecoration(
                    labelText: 'الاسم الكامل *',
                    labelStyle: const TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF475569)),
                    border: border,
                    enabledBorder: border,
                    focusedBorder: border.copyWith(borderSide: const BorderSide(color: Color(0xFF2563EB))),
                    filled: true,
                    fillColor: Colors.white,
                  ),
                  validator: (val) => val == null || val.length < 2 ? 'الاسم مطلوب' : null,
                ),
                const SizedBox(height: 16),
                Directionality(
                  textDirection: TextDirection.ltr,
                  child: TextFormField(
                    controller: _phoneController,
                    keyboardType: TextInputType.phone,
                    style: const TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF0F172A)),
                    decoration: InputDecoration(
                      labelText: '* رقم الهاتف',
                      alignLabelWithHint: true,
                      labelStyle: const TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF475569)),
                      border: border,
                      enabledBorder: border,
                      focusedBorder: border.copyWith(borderSide: const BorderSide(color: Color(0xFF2563EB))),
                      filled: true,
                      fillColor: Colors.white,
                    ),
                    validator: (val) => val == null || val.length < 8 ? 'رقم الهاتف غير صحيح' : null,
                  ),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  style: const TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF0F172A)),
                  textDirection: TextDirection.ltr,
                  decoration: InputDecoration(
                    labelText: 'البريد الإلكتروني',
                    labelStyle: const TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF475569)),
                    border: border,
                    enabledBorder: border,
                    focusedBorder: border.copyWith(borderSide: const BorderSide(color: Color(0xFF2563EB))),
                    filled: true,
                    fillColor: Colors.white,
                  ),
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  value: _selectedGender,
                  icon: const Icon(Icons.keyboard_arrow_down, color: Color(0xFF475569)),
                  dropdownColor: Colors.white,
                  style: const TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF0F172A)),
                  decoration: InputDecoration(
                    labelText: 'الجنس',
                    labelStyle: const TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF475569)),
                    border: border,
                    enabledBorder: border,
                    focusedBorder: border.copyWith(borderSide: const BorderSide(color: Color(0xFF2563EB))),
                    filled: true,
                    fillColor: Colors.white,
                  ),
                  items: const [
                    DropdownMenuItem(value: 'MALE', child: Text('ذكر', style: TextStyle(fontFamily: 'IBMPlexSansArabic'))),
                    DropdownMenuItem(value: 'FEMALE', child: Text('أنثى', style: TextStyle(fontFamily: 'IBMPlexSansArabic'))),
                  ],
                  onChanged: (val) => setState(() => _selectedGender = val),
                ),
                const SizedBox(height: 16),
                InkWell(
                  onTap: _pickDate,
                  borderRadius: BorderRadius.circular(16),
                  child: InputDecorator(
                    decoration: InputDecoration(
                      labelText: 'تاريخ الميلاد',
                      labelStyle: const TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF475569)),
                      border: border,
                      enabledBorder: border,
                      filled: true,
                      fillColor: Colors.white,
                    ),
                    child: Directionality(
                      textDirection: TextDirection.ltr,
                      child: Text(
                        _selectedDate != null 
                            ? _formatEnglishNumbers('${_selectedDate!.year}-${_selectedDate!.month.toString().padLeft(2, '0')}-${_selectedDate!.day.toString().padLeft(2, '0')}')
                            : 'اختر التاريخ',
                        textAlign: TextAlign.right,
                        style: TextStyle(
                          fontFamily: 'IBMPlexSansArabic',
                          color: _selectedDate != null ? const Color(0xFF0F172A) : const Color(0xFF94A3B8),
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _notesController,
                  maxLines: 3,
                  style: const TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF0F172A)),
                  decoration: InputDecoration(
                    labelText: 'ملاحظات',
                    labelStyle: const TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF475569)),
                    border: border,
                    enabledBorder: border,
                    focusedBorder: border.copyWith(borderSide: const BorderSide(color: Color(0xFF2563EB))),
                    filled: true,
                    fillColor: Colors.white,
                  ),
                ),
                const SizedBox(height: 32),
                SizedBox(
                  height: 50,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2563EB),
                      elevation: 0,
                      shadowColor: Colors.transparent,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(50)),
                    ),
                    onPressed: _isLoading ? null : _submit,
                    child: _isLoading 
                        ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Text('حفظ التعديلات', style: TextStyle(fontFamily: 'IBMPlexSansArabic', fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
                  ),
                )
              ],
            ),
          ),
        ),
      ),
    );
  }
}
