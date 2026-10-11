import 'package:hive/hive.dart';

class Invoice {
  final String id;
  final String? invoiceNumber;
  final String patientName;
  final String status; // DRAFT, UNPAID, PARTIAL, PAID, CANCELLED, REFUNDED
  final double total;
  final double subtotal;
  final double discount;
  final double tax;
  final DateTime issueDate;
  final DateTime? dueDate;

  Invoice({
    required this.id,
    this.invoiceNumber,
    required this.patientName,
    required this.status,
    required this.total,
    required this.subtotal,
    this.discount = 0,
    this.tax = 0,
    required this.issueDate,
    this.dueDate,
  });

  factory Invoice.fromJson(Map<String, dynamic> json) {
    return Invoice(
      id: json['id']?.toString() ?? '',
      invoiceNumber: json['invoiceNumber']?.toString(),
      patientName: json['patient']?['fullName']?.toString() ?? 'بدون اسم',
      status: json['status']?.toString() ?? 'UNKNOWN',
      total: double.tryParse(json['total']?.toString() ?? '0') ?? 0.0,
      subtotal: double.tryParse(json['subtotal']?.toString() ?? '0') ?? 0.0,
      discount: double.tryParse(json['discount']?.toString() ?? '0') ?? 0.0,
      tax: double.tryParse(json['tax']?.toString() ?? '0') ?? 0.0,
      issueDate: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : (json['issueDate'] != null ? DateTime.tryParse(json['issueDate'].toString()) ?? DateTime.now() : DateTime.now()),
      dueDate: json['dueDate'] != null ? DateTime.tryParse(json['dueDate'].toString()) : null,
    );
  }
}

class PaginatedInvoices {
  final List<Invoice> data;
  final int total;
  final int page;
  final int limit;

  PaginatedInvoices({
    required this.data,
    required this.total,
    required this.page,
    required this.limit,
  });

  factory PaginatedInvoices.fromJson(Map<String, dynamic> json) {
    final meta = json['meta'] as Map<String, dynamic>? ?? {};
    final dataList = json['data'] as List<dynamic>? ?? [];
    
    return PaginatedInvoices(
      data: dataList.map((e) => Invoice.fromJson(e as Map<String, dynamic>)).toList(),
      total: int.tryParse(meta['total']?.toString() ?? '0') ?? 0,
      page: int.tryParse(meta['page']?.toString() ?? '1') ?? 1,
      limit: int.tryParse(meta['limit']?.toString() ?? '20') ?? 20,
    );
  }
}

class InvoiceAdapter extends TypeAdapter<Invoice> {
  @override
  final int typeId = 3;

  @override
  Invoice read(BinaryReader reader) {
    final fields = reader.readMap();
    return Invoice(
      id: fields['id'] as String,
      invoiceNumber: fields['invoiceNumber'] as String?,
      patientName: fields['patientName'] as String,
      status: fields['status'] as String,
      total: fields['total'] as double,
      subtotal: fields['subtotal'] as double,
      discount: fields['discount'] as double? ?? 0,
      tax: fields['tax'] as double? ?? 0,
      issueDate: fields['issueDate'] as DateTime,
      dueDate: fields['dueDate'] as DateTime?,
    );
  }

  @override
  void write(BinaryWriter writer, Invoice obj) {
    writer.writeMap({
      'id': obj.id,
      'invoiceNumber': obj.invoiceNumber,
      'patientName': obj.patientName,
      'status': obj.status,
      'total': obj.total,
      'subtotal': obj.subtotal,
      'discount': obj.discount,
      'tax': obj.tax,
      'issueDate': obj.issueDate,
      'dueDate': obj.dueDate,
    });
  }
}
