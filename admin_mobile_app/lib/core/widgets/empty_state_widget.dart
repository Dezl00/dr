import 'package:flutter/material.dart';
class EmptyStateWidget extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;

  const EmptyStateWidget({
    super.key,
    required this.icon,
    required this.title,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: const BoxDecoration(
              color: Color(0xFFF1F5F9), // Slate-100
              shape: BoxShape.circle,
            ),
            child: Icon(
              icon,
              size: 48,
              color: const Color(0xFF94A3B8), // Slate-400
            ),
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: TextStyle(fontFamily: 'IBMPlexSansArabic', fontSize: 18,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            description,
            style: TextStyle(fontFamily: 'IBMPlexSansArabic', fontSize: 14,
              color: const Color(0xFF64748B),
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
