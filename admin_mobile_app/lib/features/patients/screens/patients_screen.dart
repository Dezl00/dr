import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/patient_provider.dart';
import '../models/patient.dart';
import 'create_patient_screen.dart';
import 'patient_profile_screen.dart';

class PatientsScreen extends ConsumerStatefulWidget {
  const PatientsScreen({super.key});

  @override
  ConsumerState<PatientsScreen> createState() => _PatientsScreenState();
}

class _PatientsScreenState extends ConsumerState<PatientsScreen> {
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _searchController = TextEditingController();
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _searchController.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= 
        _scrollController.position.maxScrollExtent - 200) {
      ref.read(patientStateProvider.notifier).fetchNextPage();
    }
  }

  void _onSearchChanged(String query) {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () {
      ref.read(patientStateProvider.notifier).fetchInitialPatients(query: query);
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(patientStateProvider);

    return Scaffold(
      backgroundColor: Colors.white, // Tailwind Slate-50
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: Text(
          'إدارة المرضى',
          style: GoogleFonts.ibmPlexSansArabic(
            color: const Color(0xFF1E293B), // Slate-800
            fontWeight: FontWeight.bold,
          ),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(76),
          child: Container(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(
                bottom: BorderSide(color: Color(0xFFE2E8F0), width: 1), // Slate-200
              ),
            ),
            child: TextField(
              controller: _searchController,
              onChanged: _onSearchChanged,
              style: GoogleFonts.ibmPlexSansArabic(
                color: const Color(0xFF334155), // Slate-700
              ),
              decoration: InputDecoration(
                hintText: 'ابحث بالاسم أو رقم الهاتف...',
                hintStyle: GoogleFonts.ibmPlexSansArabic(
                  color: const Color(0xFF94A3B8), // Slate-400
                ),
                prefixIcon: const Icon(Icons.search, color: Color(0xFF64748B)), // Slate-500
                filled: true,
                fillColor: const Color(0xFFF1F5F9), // Slate-100
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF2563EB), width: 1.5),
                ),
              ),
            ),
          ),
        ),
      ),
      body: _buildBody(state),
      floatingActionButton: FloatingActionButton.extended(heroTag: null, 
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const CreatePatientScreen()),
          );
        },
        backgroundColor: Colors.white, // Blue-600
        elevation: 0,
        icon: const Icon(Icons.add, color: Colors.white),
        label: Text(
          'مريض جديد',
          style: GoogleFonts.ibmPlexSansArabic(
            color: Colors.white,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  Widget _buildBody(PatientState state) {
    if (state.isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: Color(0xFF2563EB)),
      );
    }

    if (state.error != null && state.patients.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, color: Color(0xFFEF4444), size: 48), // Red-500
              const SizedBox(height: 16),
              Text(
                'حدث خطأ: ${state.error}',
                textAlign: TextAlign.center,
                style: GoogleFonts.ibmPlexSansArabic(
                  color: const Color(0xFF64748B),
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                ),
                onPressed: () => ref.read(patientStateProvider.notifier).fetchInitialPatients(),
                child: Text(
                  'إعادة المحاولة',
                  style: GoogleFonts.ibmPlexSansArabic(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (state.patients.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.search_off, color: Color(0xFF94A3B8), size: 64),
            const SizedBox(height: 16),
            Text(
              'لا يوجد مرضى مطابقين للبحث',
              style: GoogleFonts.ibmPlexSansArabic(
                color: const Color(0xFF64748B),
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      color: const Color(0xFF2563EB),
      backgroundColor: Colors.white,
      onRefresh: () => ref.read(patientStateProvider.notifier).fetchInitialPatients(),
      child: ListView.separated(
        controller: _scrollController,
        padding: const EdgeInsets.all(16),
        itemCount: state.patients.length + (state.isFetchingMore ? 1 : 0),
        separatorBuilder: (context, index) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          if (index == state.patients.length) {
            return const Padding(
              padding: EdgeInsets.symmetric(vertical: 16.0),
              child: Center(
                child: CircularProgressIndicator(color: Color(0xFF2563EB)),
              ),
            );
          }

          final patient = state.patients[index];
          return InkWell(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => PatientProfileScreen(patient: patient),
                ),
              );
            },
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE2E8F0)), // Slate-200
              ),
              child: Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: const Color(0xFFEFF6FF), // Blue-50
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFBFDBFE)), // Blue-200
                    ),
                    child: Center(
                      child: Text(
                        patient.fullName.substring(0, 1).toUpperCase(),
                        style: GoogleFonts.ibmPlexSansArabic(
                          color: const Color(0xFF1D4ED8), // Blue-700
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
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
                          style: GoogleFonts.ibmPlexSansArabic(
                            color: const Color(0xFF1E293B), // Slate-800
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.phone_outlined, size: 14, color: Color(0xFF64748B)),
                            const SizedBox(width: 4),
                            Text(
                              patient.phone,
                              style: GoogleFonts.ibmPlexSansArabic(
                                color: const Color(0xFF64748B), // Slate-500
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9), // Slate-100
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          '${patient.appointmentsCount} موعد',
                          style: GoogleFonts.ibmPlexSansArabic(
                            color: const Color(0xFF475569), // Slate-600
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      if (patient.unpaidInvoicesCount > 0) ...[
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEF2F2), // Red-50
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: const Color(0xFFFECACA)), // Red-200
                          ),
                          child: Text(
                            '${patient.unpaidInvoicesCount} فواتير',
                            style: GoogleFonts.ibmPlexSansArabic(
                              color: const Color(0xFFDC2626), // Red-600
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

