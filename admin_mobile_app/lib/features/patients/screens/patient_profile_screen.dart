import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/patient.dart';
import 'tabs/medical_history_tab.dart';
import 'tabs/prescriptions_tab.dart';
import 'tabs/dental_chart_tab.dart';
import 'edit_patient_screen.dart';

class PatientProfileScreen extends StatelessWidget {
  final Patient patient;
  const PatientProfileScreen({super.key, required this.patient});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 5,
      child: Scaffold(
        backgroundColor: Colors.white,
        body: Column(
          children: [
            Container(
              padding: const EdgeInsets.only(top: 40, left: 16, right: 16, bottom: 20),
              decoration: const BoxDecoration(color: Color(0xFF2563EB)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      IconButton(icon: const Icon(Icons.arrow_back, color: Colors.white), onPressed: () => Navigator.pop(context)),
                      IconButton(icon: const Icon(Icons.edit, color: Colors.white), onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => EditPatientScreen(patient: patient),
                            ),
                          );
                      }),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: const BoxDecoration(color: Colors.white24, shape: BoxShape.circle),
                        child: Icon(
                          patient.gender == 'MALE' ? Icons.person : (patient.gender == 'FEMALE' ? Icons.person_3 : Icons.person),
                          color: Colors.white,
                          size: 32,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(patient.fullName, style: GoogleFonts.ibmPlexSansArabic(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                          Text(patient.phone, style: GoogleFonts.ibmPlexSansArabic(color: Colors.white70, fontSize: 14)),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Container(
              decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0)))),
              child: TabBar(
                isScrollable: true,
                tabAlignment: TabAlignment.start,
                indicatorColor: const Color(0xFF2563EB),
                indicatorWeight: 3,
                labelColor: const Color(0xFF2563EB),
                unselectedLabelColor: const Color(0xFF64748B),
                labelStyle: GoogleFonts.ibmPlexSansArabic(fontWeight: FontWeight.w600, fontSize: 14),
                unselectedLabelStyle: GoogleFonts.ibmPlexSansArabic(fontWeight: FontWeight.w500, fontSize: 14),
                tabs: const [
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
                  Center(child: Text('سجل الفواتير (قريباً)', style: GoogleFonts.ibmPlexSansArabic())),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBasicInfo(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
            child: Column(
              children: [
                _buildListTile(icon: Icons.transgender_outlined, title: 'الجنس', subtitle: patient.gender == 'MALE' ? 'ذكر' : (patient.gender == 'FEMALE' ? 'أنثى' : 'غير محدد')),
                const Divider(height: 1, color: Color(0xFFE2E8F0)),
                _buildListTile(icon: Icons.cake_outlined, title: 'تاريخ الميلاد', subtitle: patient.dateOfBirth != null ? '\-\-' : 'غير محدد'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildListTile({required IconData icon, required String title, required String subtitle}) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Row(
        children: [
          Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(10)), child: Icon(icon, color: const Color(0xFF64748B), size: 24)),
          const SizedBox(width: 16),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(title, style: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF64748B), fontSize: 13, fontWeight: FontWeight.w500)),
            const SizedBox(height: 4),
            Text(subtitle, style: GoogleFonts.ibmPlexSansArabic(color: const Color(0xFF1E293B), fontSize: 15, fontWeight: FontWeight.w600)),
          ])),
        ],
      ),
    );
  }
}
