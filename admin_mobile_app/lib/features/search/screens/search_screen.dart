import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:async';

import '../../patients/providers/patient_provider.dart';
import '../../appointments/providers/appointment_provider.dart';
import '../../financials/providers/invoice_provider.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  Timer? _debounce;
  bool _isLoading = false;
  List<dynamic> _results = [];
  String _searchQuery = '';

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    
    setState(() {
      _searchQuery = query;
    });

    if (query.trim().isEmpty) {
      setState(() {
        _results = [];
        _isLoading = false;
      });
      return;
    }

    setState(() {
      _isLoading = true;
    });

    _debounce = Timer(const Duration(milliseconds: 500), () {
      _performSearch(query.trim().toLowerCase());
    });
  }

  Future<void> _performSearch(String query) async {
    final patients = ref.read(patientStateProvider).items;
    final appointments = ref.read(appointmentStateProvider).items;
    final invoices = ref.read(invoiceStateProvider).items;

    final List<dynamic> matched = [];

    for (var p in patients) {
      if (p.fullName.toLowerCase().contains(query) || p.phone.contains(query)) {
        matched.add({'type': 'مريض', 'title': p.fullName, 'subtitle': p.phone});
      }
    }

    for (var a in appointments) {
      if (a.patientName.toLowerCase().contains(query) || a.patientPhone.contains(query) || (a.serviceName != null && a.serviceName!.toLowerCase().contains(query))) {
        matched.add({'type': 'موعد', 'title': 'موعد مع ${a.patientName}', 'subtitle': a.serviceName ?? 'غير محدد'});
      }
    }

    for (var i in invoices) {
      if (i.patientName.toLowerCase().contains(query) || i.id.toLowerCase().contains(query)) {
        matched.add({'type': 'فاتورة', 'title': 'فاتورة ${i.id}', 'subtitle': i.patientName});
      }
    }

    if (mounted && query == _searchQuery.trim().toLowerCase()) {
      setState(() {
        _isLoading = false;
        _results = matched;
      });
    }
  }

  String _toEnglishNumerals(String input) {
    const english = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const arabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    for (int i = 0; i < arabic.length; i++) {
      input = input.replaceAll(arabic[i], english[i]);
    }
    return input;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Directionality(
          textDirection: TextDirection.rtl,
          child: Column(
            children: [
              // Top Search Bar with SafeArea & Margin
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.arrow_forward, color: Color(0xFF0F172A)),
                      onPressed: () => Navigator.pop(context),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(50),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: TextField(
                          controller: _searchController,
                          onChanged: _onSearchChanged,
                          autofocus: true,
                          style: const TextStyle(
                            fontFamily: 'IBMPlexSansArabic',
                            fontSize: 16,
                            color: Color(0xFF0F172A),
                          ),
                          decoration: const InputDecoration(
                            hintText: 'بحث شامل في جميع الأقسام...',
                            hintStyle: TextStyle(
                              fontFamily: 'IBMPlexSansArabic',
                              color: Color(0xFF94A3B8),
                              fontSize: 14,
                            ),
                            border: InputBorder.none,
                            contentPadding: EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                            suffixIcon: Icon(Icons.search, color: Color(0xFF94A3B8), size: 20),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              // Search Results
              Expanded(
                child: _isLoading
                    ? const Center(child: CircularProgressIndicator(color: Color(0xFF2563EB)))
                    : _searchQuery.isEmpty
                        ? const Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.search, size: 64, color: Color(0xFFE2E8F0)),
                                SizedBox(height: 16),
                                Text(
                                  'ابحث عن مريض، موعد، أو فاتورة...',
                                  style: TextStyle(
                                    fontFamily: 'IBMPlexSansArabic',
                                    color: Color(0xFF94A3B8),
                                    fontSize: 16,
                                  ),
                                ),
                              ],
                            ),
                          )
                        : _results.isEmpty
                            ? const Center(
                                child: Text(
                                  'لا توجد نتائج مطابقة',
                                  style: TextStyle(
                                    fontFamily: 'IBMPlexSansArabic',
                                    color: Color(0xFF94A3B8),
                                    fontSize: 16,
                                  ),
                                ),
                              )
                            : ListView.separated(
                                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                                itemCount: _results.length,
                                separatorBuilder: (_, __) => const Divider(color: Color(0xFFF1F5F9), height: 1),
                                itemBuilder: (context, index) {
                                  final result = _results[index];
                                  IconData icon;
                                  if (result['type'] == 'مريض') {
                                    icon = Icons.person_outline;
                                  } else if (result['type'] == 'موعد') {
                                    icon = Icons.calendar_today_outlined;
                                  } else {
                                    icon = Icons.receipt_long_outlined;
                                  }
                                  
                                  return ListTile(
                                    contentPadding: const EdgeInsets.symmetric(vertical: 8),
                                    leading: Container(
                                      width: 48,
                                      height: 48,
                                      decoration: const BoxDecoration(
                                        color: Color(0xFFF8FAFC),
                                        shape: BoxShape.circle,
                                      ),
                                      child: Icon(icon, color: const Color(0xFF64748B)),
                                    ),
                                    title: Text(
                                      result['title'],
                                      style: const TextStyle(
                                        fontFamily: 'IBMPlexSansArabic',
                                        fontSize: 16,
                                        fontWeight: FontWeight.w600,
                                        color: Color(0xFF0F172A),
                                      ),
                                    ),
                                    subtitle: Text(
                                      _toEnglishNumerals(result['subtitle']),
                                      style: const TextStyle(
                                        fontFamily: 'IBMPlexSansArabic',
                                        fontSize: 14,
                                        color: Color(0xFF64748B),
                                      ),
                                    ),
                                  );
                                },
                              ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
