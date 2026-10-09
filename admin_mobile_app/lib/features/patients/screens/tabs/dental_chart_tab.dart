import 'package:flutter/material.dart';

class DentalChartTab extends StatefulWidget {
  final String patientId;

  const DentalChartTab({super.key, required this.patientId});

  @override
  State<DentalChartTab> createState() => _DentalChartTabState();
}

class _DentalChartTabState extends State<DentalChartTab> {
  // Simple map to hold tooth status
  final Map<int, String> _toothStatus = {};

  void _showToothDialog(int toothNumber) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('تحديث السن رقم $toothNumber'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                title: const Text('سليم'),
                onTap: () {
                  setState(() => _toothStatus[toothNumber] = 'HEALTHY');
                  Navigator.pop(context);
                },
              ),
              ListTile(
                title: const Text('تسوس'),
                onTap: () {
                  setState(() => _toothStatus[toothNumber] = 'CAVITY');
                  Navigator.pop(context);
                },
              ),
              ListTile(
                title: const Text('مخلوع'),
                onTap: () {
                  setState(() => _toothStatus[toothNumber] = 'EXTRACTED');
                  Navigator.pop(context);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Color _getToothColor(int toothNumber) {
    switch (_toothStatus[toothNumber]) {
      case 'CAVITY': return Colors.orange;
      case 'EXTRACTED': return Colors.red;
      case 'HEALTHY': return Colors.green;
      default: return Colors.grey.shade300;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const Padding(
          padding: EdgeInsets.all(16.0),
          child: Text('الخريطة السنية العلوية والسفلية', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        ),
        Expanded(
          child: GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 8,
              crossAxisSpacing: 8,
              mainAxisSpacing: 8,
            ),
            itemCount: 32,
            itemBuilder: (context, index) {
              // Standard FDI numbering logic (simplified for mockup)
              int toothNumber = index + 1;
              return GestureDetector(
                onTap: () => _showToothDialog(toothNumber),
                child: Container(
                  decoration: BoxDecoration(
                    color: _getToothColor(toothNumber),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text('$toothNumber', style: const TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              );
            },
          ),
        ),
        ElevatedButton(
          onPressed: () {
            // TODO: Submit to /api/v1/patients/[id]/dental-records
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم حفظ الخريطة السنية')));
          },
          child: const Padding(
            padding: EdgeInsets.all(16.0),
            child: Text('حفظ التحديثات'),
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }
}
