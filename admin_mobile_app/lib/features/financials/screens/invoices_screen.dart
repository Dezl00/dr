import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/financial_provider.dart';
import '../models/invoice.dart';
import 'create_invoice_screen.dart';

class InvoicesScreen extends ConsumerStatefulWidget {
  const InvoicesScreen({super.key});

  @override
  ConsumerState<InvoicesScreen> createState() => _InvoicesScreenState();
}

class _InvoicesScreenState extends ConsumerState<InvoicesScreen> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= 
        _scrollController.position.maxScrollExtent - 200) {
      ref.read(invoiceStateProvider.notifier).fetchNextPage();
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(invoiceStateProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('إدارة الفواتير'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Row(
              children: [
                Expanded(
                  child: SegmentedButton<String>(
                    segments: const [
                      ButtonSegment(value: 'ALL', label: Text('الكل')),
                      ButtonSegment(value: 'UNPAID', label: Text('غير مسدد')),
                      ButtonSegment(value: 'PAID', label: Text('مسدد')),
                    ],
                    selected: {state.statusFilter},
                    onSelectionChanged: (Set<String> newSelection) {
                      ref.read(invoiceStateProvider.notifier)
                         .fetchInitialInvoices(status: newSelection.first);
                    },
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      body: _buildBody(state),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const CreateInvoiceScreen()),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildBody(InvoiceState state) {
    if (state.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state.error != null && state.invoices.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('حدث خطأ: ${state.error}'),
            ElevatedButton(
              onPressed: () => ref.read(invoiceStateProvider.notifier).fetchInitialInvoices(),
              child: const Text('إعادة المحاولة'),
            ),
          ],
        ),
      );
    }

    if (state.invoices.isEmpty) {
      return const Center(child: Text('لا توجد فواتير'));
    }

    return RefreshIndicator(
      onRefresh: () => ref.read(invoiceStateProvider.notifier).fetchInitialInvoices(),
      child: ListView.builder(
        controller: _scrollController,
        itemCount: state.invoices.length + (state.isFetchingMore ? 1 : 0),
        itemBuilder: (context, index) {
          if (index == state.invoices.length) {
            return const Padding(
              padding: EdgeInsets.all(16.0),
              child: Center(child: CircularProgressIndicator()),
            );
          }

          final invoice = state.invoices[index];
          return _buildInvoiceCard(context, invoice);
        },
      ),
    );
  }

  Widget _buildInvoiceCard(BuildContext context, Invoice invoice) {
    Color statusColor;
    String statusText;
    switch (invoice.status) {
      case 'PAID': 
        statusColor = Colors.green; 
        statusText = 'مسدد';
        break;
      case 'PARTIAL': 
        statusColor = Colors.orange; 
        statusText = 'مسدد جزئياً';
        break;
      case 'UNPAID': 
        statusColor = Colors.red; 
        statusText = 'غير مسدد';
        break;
      default: 
        statusColor = Colors.grey; 
        statusText = invoice.status;
    }

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: ListTile(
        title: Text(invoice.patientName, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text('التاريخ: ${invoice.issueDate.year}-${invoice.issueDate.month}-${invoice.issueDate.day}'),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              '${invoice.total} ج.م', 
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: statusColor.withOpacity(0.2),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                statusText,
                style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        onTap: () {
          // Open invoice details
        },
      ),
    );
  }
}
