import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
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
      appBar: AppBar(
        title: const Text('إدارة المرضى'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Padding(
            padding: const EdgeInsets.all(8.0),
            child: TextField(
              controller: _searchController,
              onChanged: _onSearchChanged,
              decoration: InputDecoration(
                hintText: 'ابحث بالاسم أو رقم الهاتف...',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),
        ),
      ),
      body: _buildBody(state),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const CreatePatientScreen()),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildBody(PatientState state) {
    if (state.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state.error != null && state.patients.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('حدث خطأ: ${state.error}', textAlign: TextAlign.center),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => ref.read(patientStateProvider.notifier).fetchInitialPatients(),
              child: const Text('إعادة المحاولة'),
            ),
          ],
        ),
      );
    }

    if (state.patients.isEmpty) {
      return const Center(
        child: Text('لا يوجد مرضى مطابقين للبحث'),
      );
    }

    return RefreshIndicator(
      onRefresh: () => ref.read(patientStateProvider.notifier).fetchInitialPatients(),
      child: ListView.builder(
        controller: _scrollController,
        itemCount: state.patients.length + (state.isFetchingMore ? 1 : 0),
        itemBuilder: (context, index) {
          if (index == state.patients.length) {
            return const Padding(
              padding: EdgeInsets.symmetric(vertical: 16.0),
              child: Center(child: CircularProgressIndicator()),
            );
          }

          final patient = state.patients[index];
          return Card(
            margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                child: Text(
                  patient.fullName.substring(0, 1).toUpperCase(),
                  style: TextStyle(color: Theme.of(context).colorScheme.onPrimaryContainer),
                ),
              ),
              title: Text(patient.fullName, style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text(patient.phone),
              trailing: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('مواعيد: ${patient.appointmentsCount}', style: const TextStyle(fontSize: 12)),
                  if (patient.unpaidInvoicesCount > 0)
                    Text('فواتير غير مسددة: ${patient.unpaidInvoicesCount}', 
                        style: const TextStyle(fontSize: 12, color: Colors.red)),
                ],
              ),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => PatientProfileScreen(patient: patient),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

