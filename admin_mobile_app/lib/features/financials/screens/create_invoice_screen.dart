import 'package:flutter/material.dart';

class CreateInvoiceScreen extends StatefulWidget {
  const CreateInvoiceScreen({super.key});

  @override
  State<CreateInvoiceScreen> createState() => _CreateInvoiceScreenState();
}

class _CreateInvoiceScreenState extends State<CreateInvoiceScreen> {
  final _formKey = GlobalKey<FormState>();
  final List<Map<String, dynamic>> _invoiceItems = [];
  double _total = 0;

  void _addItem() {
    // Show dialog to add item
    showDialog(
      context: context,
      builder: (context) {
        final descController = TextEditingController();
        final priceController = TextEditingController();
        return AlertDialog(
          title: const Text('إضافة خدمة للفاتورة'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: descController,
                decoration: const InputDecoration(labelText: 'وصف الخدمة', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: priceController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'السعر', border: OutlineInputBorder()),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('إلغاء')),
            ElevatedButton(
              onPressed: () {
                if (descController.text.isNotEmpty && priceController.text.isNotEmpty) {
                  final price = double.tryParse(priceController.text) ?? 0;
                  setState(() {
                    _invoiceItems.add({
                      'description': descController.text,
                      'price': price,
                    });
                    _total += price;
                  });
                  Navigator.pop(context);
                }
              },
              child: const Text('إضافة'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('فاتورة جديدة')),
      body: Form(
        key: _formKey,
        child: Column(
          children: [
            // Mock patient selector
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: DropdownButtonFormField<String>(
                decoration: const InputDecoration(labelText: 'اختر المريض', border: OutlineInputBorder()),
                items: const [
                  DropdownMenuItem(value: '1', child: Text('أحمد محمد')),
                  DropdownMenuItem(value: '2', child: Text('سارة علي')),
                ],
                onChanged: (val) {},
              ),
            ),
            const Divider(),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('الخدمات المقدمة:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  TextButton.icon(
                    onPressed: _addItem,
                    icon: const Icon(Icons.add),
                    label: const Text('إضافة خدمة'),
                  )
                ],
              ),
            ),
            Expanded(
              child: ListView.builder(
                itemCount: _invoiceItems.length,
                itemBuilder: (context, index) {
                  final item = _invoiceItems[index];
                  return ListTile(
                    title: Text(item['description']),
                    trailing: Text('${item['price']} ج.م'),
                  );
                },
              ),
            ),
            Container(
              padding: const EdgeInsets.all(16),
              color: Theme.of(context).colorScheme.primaryContainer,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('الإجمالي: $_total ج.م', 
                    style: TextStyle(
                      fontSize: 18, 
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).colorScheme.onPrimaryContainer,
                    )
                  ),
                  ElevatedButton(
                    onPressed: _invoiceItems.isEmpty ? null : () {
                      // TODO: API Call
                      Navigator.pop(context);
                    },
                    child: const Text('حفظ وإصدار'),
                  )
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}
