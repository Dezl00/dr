import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
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

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.patient.fullName);
    _phoneController = TextEditingController(text: widget.patient.phone);
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
      final success = await ref.read(patientStateProvider.notifier).updatePatient(widget.patient.id, {
        'fullName': _nameController.text.trim(),
        'phone': _phoneController.text.trim(),
        if (_emailController.text.isNotEmpty) 'email': _emailController.text.trim(),
        if (_notesController.text.isNotEmpty) 'notes': _notesController.text.trim(),
        if (_selectedGender != null) 'gender': _selectedGender,
        if (_selectedDate != null) 'dateOfBirth': _selectedDate!.toIso8601String(),
      });

      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('تم التعديل بنجاح', style: GoogleFonts.ibmPlexSansArabic()), backgroundColor: Colors.green),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString(), style: GoogleFonts.ibmPlexSansArabic()), backgroundColor: Colors.red),
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
    );
    if (date != null) {
      setState(() => _selectedDate = date);
    }
  }

  @override
  Widget build(BuildContext context) {
    final border = OutlineInputBorder(
      borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
      borderRadius: BorderRadius.circular(8),
    );
    
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text('تعديل بيانات المريض', style: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF1E293B))),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Color(0xFF1E293B)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _nameController,
                style: GoogleFonts.ibmPlexSansArabic(),
                decoration: InputDecoration(
                  labelText: 'الاسم الكامل *',
                  labelStyle: GoogleFonts.ibmPlexSansArabic(),
                  border: border,
                  enabledBorder: border,
                  focusedBorder: border.copyWith(borderSide: const BorderSide(color: Color(0xFF2563EB))),
                ),
                validator: (val) => val == null || val.length < 2 ? 'الاسم مطلوب' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                style: GoogleFonts.ibmPlexSansArabic(),
                decoration: InputDecoration(
                  labelText: 'رقم الهاتف *',
                  labelStyle: GoogleFonts.ibmPlexSansArabic(),
                  border: border,
                  enabledBorder: border,
                  focusedBorder: border.copyWith(borderSide: const BorderSide(color: Color(0xFF2563EB))),
                ),
                validator: (val) => val == null || val.length < 8 ? 'رقم الهاتف غير صحيح' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                style: GoogleFonts.ibmPlexSansArabic(),
                decoration: InputDecoration(
                  labelText: 'البريد الإلكتروني',
                  labelStyle: GoogleFonts.ibmPlexSansArabic(),
                  border: border,
                  enabledBorder: border,
                  focusedBorder: border.copyWith(borderSide: const BorderSide(color: Color(0xFF2563EB))),
                ),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _selectedGender,
                style: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF1E293B)),
                decoration: InputDecoration(
                  labelText: 'الجنس',
                  labelStyle: GoogleFonts.ibmPlexSansArabic(),
                  border: border,
                  enabledBorder: border,
                  focusedBorder: border.copyWith(borderSide: const BorderSide(color: Color(0xFF2563EB))),
                ),
                items: [
                  DropdownMenuItem(value: 'MALE', child: Text('ذكر', style: GoogleFonts.ibmPlexSansArabic())),
                  DropdownMenuItem(value: 'FEMALE', child: Text('أنثى', style: GoogleFonts.ibmPlexSansArabic())),
                ],
                onChanged: (val) => setState(() => _selectedGender = val),
              ),
              const SizedBox(height: 16),
              InkWell(
                onTap: _pickDate,
                child: InputDecorator(
                  decoration: InputDecoration(
                    labelText: 'تاريخ الميلاد',
                    labelStyle: GoogleFonts.ibmPlexSansArabic(),
                    border: border,
                    enabledBorder: border,
                  ),
                  child: Text(
                    _selectedDate != null 
                        ? '${_selectedDate!.year}-${_selectedDate!.month.toString().padLeft(2, '0')}-${_selectedDate!.day.toString().padLeft(2, '0')}'
                        : 'اختر التاريخ',
                    style: GoogleFonts.ibmPlexSansArabic(),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _notesController,
                maxLines: 3,
                style: GoogleFonts.ibmPlexSansArabic(),
                decoration: InputDecoration(
                  labelText: 'ملاحظات',
                  labelStyle: GoogleFonts.ibmPlexSansArabic(),
                  border: border,
                  enabledBorder: border,
                  focusedBorder: border.copyWith(borderSide: const BorderSide(color: Color(0xFF2563EB))),
                ),
              ),
              const SizedBox(height: 32),
              SizedBox(
                height: 50,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2563EB),
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: _isLoading ? null : _submit,
                  child: _isLoading 
                      ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : Text('حفظ التعديلات', style: GoogleFonts.ibmPlexSansArabic(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
