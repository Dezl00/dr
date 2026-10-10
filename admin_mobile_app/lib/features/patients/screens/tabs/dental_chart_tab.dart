import 'package:flutter/material.dart';
import '../../../../core/api/dio_client.dart';
import '../../../../core/api/api_endpoints.dart';
class DentalChartTab extends StatefulWidget {
  final String patientId;

  const DentalChartTab({super.key, required this.patientId});

  @override
  State<DentalChartTab> createState() => _DentalChartTabState();
}

class _DentalChartTabState extends State<DentalChartTab> {
  // Map to hold tooth status
  final Map<int, String> _toothStatus = {};
  
  // FDI Numbering
  final List<int> upperRight = [18, 17, 16, 15, 14, 13, 12, 11];
  final List<int> upperLeft = [21, 22, 23, 24, 25, 26, 27, 28];
  final List<int> lowerRight = [48, 47, 46, 45, 44, 43, 42, 41];
  final List<int> lowerLeft = [31, 32, 33, 34, 35, 36, 37, 38];

  bool _isLoading = false;

  void _showToothDialog(int toothNumber) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('تحديث السن رقم ', style: TextStyle(fontFamily: 'IBMPlexSansArabic', fontWeight: FontWeight.bold)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildToothOption(context, toothNumber, 'سليم', 'HEALTHY', Colors.green),
              _buildToothOption(context, toothNumber, 'تسوس', 'DECAYED', Colors.red),
              _buildToothOption(context, toothNumber, 'حشو', 'FILLED', Colors.blue),
              _buildToothOption(context, toothNumber, 'مخلوع', 'MISSING', Colors.grey),
              _buildToothOption(context, toothNumber, 'تاج', 'CROWNED', Colors.orange),
            ],
          ),
        );
      },
    );
  }

  Widget _buildToothOption(BuildContext context, int toothNumber, String label, String status, Color color) {
    return ListTile(
      leading: CircleAvatar(backgroundColor: color, radius: 10),
      title: Text(label, style: TextStyle(fontFamily: 'IBMPlexSansArabic')),
      onTap: () {
        setState(() => _toothStatus[toothNumber] = status);
        Navigator.pop(context);
      },
    );
  }

  Color _getToothColor(int toothNumber) {
    switch (_toothStatus[toothNumber]) {
      case 'DECAYED': return Colors.red.shade400;
      case 'MISSING': return Colors.grey.shade400;
      case 'HEALTHY': return Colors.green.shade400;
      case 'FILLED': return Colors.blue.shade400;
      case 'CROWNED': return Colors.orange.shade400;
      default: return Colors.white;
    }
  }

  Widget _buildJaw(List<int> right, List<int> left, String label) {
    return Column(
      children: [
        Text(label, style: TextStyle(fontFamily: 'IBMPlexSansArabic', fontSize: 16, fontWeight: FontWeight.bold, color: const Color(0xFF64748B))),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Right Side (Patient's right is on the left side of the screen when facing them)
            Row(
              children: right.map((num) => _buildTooth(num)).toList(),
            ),
            Container(width: 2, height: 60, color: const Color(0xFFE2E8F0), margin: const EdgeInsets.symmetric(horizontal: 4)),
            // Left Side
            Row(
              children: left.map((num) => _buildTooth(num)).toList(),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildTooth(int toothNumber) {
    return GestureDetector(
      onTap: () => _showToothDialog(toothNumber),
      child: Container(
        width: 32,
        height: 48,
        margin: const EdgeInsets.symmetric(horizontal: 2),
        decoration: BoxDecoration(
          color: _getToothColor(toothNumber),
          border: Border.all(color: const Color(0xFFCBD5E1), width: 2),
          borderRadius: const BorderRadius.only(topLeft: Radius.circular(8), topRight: Radius.circular(8)),
        ),
        child: Center(
          child: Text('', style: TextStyle(fontFamily: 'IBMPlexSansArabic', fontSize: 12, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B))),
        ),
      ),
    );
  }

  void _saveChart() async {
    setState(() => _isLoading = true);
    try {
      final dio = DioClient().dio;
      for (var entry in _toothStatus.entries) {
        await dio.post('${ApiEndpoints.baseUrl}/patients/${widget.patientId}/dental-records', data: {
          'toothNumber': entry.key,
          'condition': entry.value,
          'notes': 'تم التحديث من التطبيق'
        });
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('تم حفظ الخريطة السنية بنجاح', style: TextStyle(fontFamily: 'IBMPlexSansArabic', color: Colors.white)), backgroundColor: Colors.green));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('حدث خطأ أثناء الحفظ', style: TextStyle(fontFamily: 'IBMPlexSansArabic', color: Colors.white)), backgroundColor: Colors.red));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Column(
                children: [
                  _buildJaw(upperRight, upperLeft, 'الفك العلوي'),
                  const SizedBox(height: 32),
                  const Divider(color: Color(0xFFE2E8F0)),
                  const SizedBox(height: 32),
                  _buildJaw(lowerRight, lowerLeft, 'الفك السفلي'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton.icon(
              onPressed: _isLoading ? null : _saveChart,
              icon: _isLoading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white)) : const Icon(Icons.save_outlined, color: Colors.white),
              label: Text('حفظ التحديثات', style: TextStyle(fontFamily: 'IBMPlexSansArabic', fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2563EB),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
