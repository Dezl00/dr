import 'package:flutter/material.dart';

class DoctorsScreen extends StatelessWidget {
  const DoctorsScreen({super.key});

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
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios, color: Color(0xFF0F172A)),
            onPressed: () => Navigator.pop(context),
          ),
          title: const Text(
            'الأطباء',
            style: TextStyle(
              fontFamily: 'IBMPlexSansArabic',
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF0F172A),
            ),
          ),
          centerTitle: true,
          actions: [
            IconButton(
              icon: const Icon(Icons.add, color: Color(0xFF2563EB)),
              onPressed: () {},
            ),
          ],
        ),
        body: SafeArea(
          child: ListView.builder(
            padding: const EdgeInsets.all(20.0),
            itemCount: 5,
            itemBuilder: (context, index) {
              final doctors = [
                {'name': 'د. أحمد محمود', 'specialty': 'طبيب أسنان', 'phone': '0599123456', 'rating': '4.8'},
                {'name': 'د. سارة خليل', 'specialty': 'تقويم أسنان', 'phone': '0599123457', 'rating': '4.9'},
                {'name': 'د. محمد الشوبكي', 'specialty': 'جراحة فم وأسنان', 'phone': '0599123458', 'rating': '5.0'},
                {'name': 'د. هدى سعيد', 'specialty': 'طب أسنان أطفال', 'phone': '0599123459', 'rating': '4.7'},
                {'name': 'د. عمر حسن', 'specialty': 'علاج عصب', 'phone': '0599123460', 'rating': '4.6'},
              ];

              final doctor = doctors[index];

              return Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 30,
                      backgroundColor: const Color(0xFFEFF6FF),
                      child: Text(
                        doctor['name']!.substring(3, 4),
                        style: const TextStyle(
                          fontFamily: 'IBMPlexSansArabic',
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF2563EB),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            doctor['name']!,
                            style: const TextStyle(
                              fontFamily: 'IBMPlexSansArabic',
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            doctor['specialty']!,
                            style: const TextStyle(
                              fontFamily: 'IBMPlexSansArabic',
                              fontSize: 14,
                              color: Color(0xFF475569),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              const Icon(Icons.phone, size: 14, color: Color(0xFF94A3B8)),
                              const SizedBox(width: 4),
                              Text(
                                doctor['phone']!,
                                textDirection: TextDirection.ltr,
                                style: const TextStyle(
                                  fontFamily: 'IBMPlexSansArabic',
                                  fontSize: 12,
                                  color: Color(0xFF64748B),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    Column(
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.star, size: 16, color: Color(0xFFF59E0B)),
                            const SizedBox(width: 4),
                            Text(
                              doctor['rating']!,
                              textDirection: TextDirection.ltr,
                              style: const TextStyle(
                                fontFamily: 'IBMPlexSansArabic',
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF0F172A),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEFF6FF),
                            borderRadius: BorderRadius.circular(50),
                          ),
                          child: const Text(
                            'عرض',
                            style: TextStyle(
                              fontFamily: 'IBMPlexSansArabic',
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF2563EB),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
