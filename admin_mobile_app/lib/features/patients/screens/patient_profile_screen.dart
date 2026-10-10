import 'package:flutter/material.dart';
import '../models/patient.dart';
import 'tabs/medical_history_tab.dart';
import 'tabs/prescriptions_tab.dart';
import 'tabs/dental_chart_tab.dart';
import 'edit_patient_screen.dart';

class PatientProfileScreen extends StatelessWidget {
  final Patient patient;
  const PatientProfileScreen({super.key, required this.patient});

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
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: DefaultTabController(
        length: 5,
        child: Scaffold(
          backgroundColor: Colors.white,
          appBar: AppBar(
            backgroundColor: Colors.white,
            elevation: 0,
            scrolledUnderElevation: 0,
            iconTheme: const IconThemeData(color: Color(0xFF0F172A)),
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_outlined),
              onPressed: () => Navigator.pop(context),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.edit_outlined),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => EditPatientScreen(patient: patient),
                    ),
                  );
                },
              ),
            ],
          ),
          body: Column(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                child: Row(
                  children: [
                    Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        border: Border.all(color: const Color(0xFFE2E8F0), width: 1),
                      ),
                      child: Center(
                        child: Icon(
                          patient.gender == 'FEMALE' ? Icons.face_3_outlined : Icons.person_outline,
                          color: const Color(0xFF2563EB),
                          size: 32,
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            patient.fullName,
                            style: const TextStyle(
                              fontFamily: 'IBMPlexSansArabic',
                              color: Color(0xFF0F172A),
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Align(
                            alignment: Alignment.centerRight,
                            child: Directionality(
                              textDirection: TextDirection.ltr,
                              child: Text(
                                _formatEnglishNumbers(patient.phone),
                                style: const TextStyle(
                                  fontFamily: 'IBMPlexSansArabic',
                                  color: Color(0xFF475569),
                                  fontSize: 14,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                decoration: const BoxDecoration(
                  border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0), width: 1)),
                ),
                child: const TabBar(
                  isScrollable: true,
                  tabAlignment: TabAlignment.start,
                  indicatorColor: Color(0xFF2563EB),
                  indicatorWeight: 3,
                  labelColor: Color(0xFF2563EB),
                  unselectedLabelColor: Color(0xFF94A3B8),
                  labelStyle: TextStyle(fontFamily: 'IBMPlexSansArabic', fontWeight: FontWeight.w600, fontSize: 14),
                  unselectedLabelStyle: TextStyle(fontFamily: 'IBMPlexSansArabic', fontWeight: FontWeight.w500, fontSize: 14),
                  dividerColor: Colors.transparent,
                  tabs: [
                    Tab(text: 'البيانات الأساسية', icon: Icon(Icons.person_outline, size: 20)),
                    Tab(text: 'التاريخ الطبي', icon: Icon(Icons.medical_information_outlined, size: 20)),
                    Tab(text: 'الخريطة السنية', icon: Icon(Icons.monitor_heart_outlined, size: 20)),
                    Tab(text: 'الروشتات', icon: Icon(Icons.medication_outlined, size: 20)),
                    Tab(text: 'الحسابات', icon: Icon(Icons.receipt_long_outlined, size: 20)),
                  ],
                ),
              ),
              Expanded(
                child: TabBarView(
                  children: [
                    _buildBasicInfo(context),
                    MedicalHistoryTab(patientId: patient.id),
                    DentalChartTab(patientId: patient.id),
                    PrescriptionsTab(patientId: patient.id),
                    const Center(
                      child: Text(
                        'سجل الفواتير (قريباً)',
                        style: TextStyle(fontFamily: 'IBMPlexSansArabic', color: Color(0xFF475569)),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBasicInfo(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              children: [
                _buildListTile(
                  icon: Icons.transgender_outlined,
                  title: 'الجنس',
                  subtitle: patient.gender == 'MALE' ? 'ذكر' : (patient.gender == 'FEMALE' ? 'أنثى' : 'غير محدد'),
                ),
                const Divider(height: 1, color: Color(0xFFE2E8F0)),
                _buildListTile(
                  icon: Icons.cake_outlined,
                  title: 'تاريخ الميلاد',
                  subtitle: patient.dateOfBirth != null
                      ? _formatEnglishNumbers('${patient.dateOfBirth!.year}-${patient.dateOfBirth!.month.toString().padLeft(2, '0')}-${patient.dateOfBirth!.day.toString().padLeft(2, '0')}')
                      : 'غير محدد',
                  isNumber: patient.dateOfBirth != null,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildListTile({required IconData icon, required String title, required String subtitle, bool isNumber = false}) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border.all(color: const Color(0xFFE2E8F0)),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(icon, color: const Color(0xFF2563EB), size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontFamily: 'IBMPlexSansArabic',
                    color: Color(0xFF475569),
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                Align(
                  alignment: Alignment.centerRight,
                  child: Directionality(
                    textDirection: isNumber ? TextDirection.ltr : TextDirection.rtl,
                    child: Text(
                      subtitle,
                      style: const TextStyle(
                        fontFamily: 'IBMPlexSansArabic',
                        color: Color(0xFF0F172A),
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
