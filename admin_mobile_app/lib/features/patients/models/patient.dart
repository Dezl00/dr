import 'package:hive/hive.dart';

class Patient {
  final String id;
  final String fullName;
  final String phone;
  final String? gender;
  final DateTime? dateOfBirth;
  final int appointmentsCount;
  final int unpaidInvoicesCount;

  Patient({
    required this.id,
    required this.fullName,
    required this.phone,
    this.gender,
    this.dateOfBirth,
    this.appointmentsCount = 0,
    this.unpaidInvoicesCount = 0,
  });

  factory Patient.fromJson(Map<String, dynamic> json) {
    return Patient(
      id: json['id']?.toString() ?? '',
      fullName: json['fullName']?.toString() ?? 'بدون اسم',
      phone: json['phone']?.toString() ?? 'بدون هاتف',
      gender: json['gender']?.toString(),
      dateOfBirth: json['dateOfBirth'] != null 
          ? DateTime.tryParse(json['dateOfBirth'].toString()) 
          : null,
      appointmentsCount: int.tryParse(json['_count']?['appointments']?.toString() ?? '0') ?? 0,
      unpaidInvoicesCount: int.tryParse(json['_count']?['invoices']?.toString() ?? '0') ?? 0,
    );
  }
}

class PaginatedPatients {
  final List<Patient> data;
  final int total;
  final int page;
  final int limit;
  final int totalPages;

  PaginatedPatients({
    required this.data,
    required this.total,
    required this.page,
    required this.limit,
    required this.totalPages,
  });

  factory PaginatedPatients.fromJson(Map<String, dynamic> json) {
    final meta = json['meta'] as Map<String, dynamic>? ?? {};
    final dataList = json['data'] as List<dynamic>? ?? [];
    
    return PaginatedPatients(
      data: dataList.map((e) => Patient.fromJson(e as Map<String, dynamic>)).toList(),
      total: int.tryParse(meta['total']?.toString() ?? '0') ?? 0,
      page: int.tryParse(meta['page']?.toString() ?? '1') ?? 1,
      limit: int.tryParse(meta['limit']?.toString() ?? '20') ?? 20,
      totalPages: int.tryParse(meta['totalPages']?.toString() ?? '1') ?? 1,
    );
  }
}


class PatientAdapter extends TypeAdapter<Patient> {
  @override
  final int typeId = 0;

  @override
  Patient read(BinaryReader reader) {
    final fields = reader.readMap();
    return Patient(
      id: fields['id'] as String,
      fullName: fields['fullName'] as String,
      phone: fields['phone'] as String,
      gender: fields['gender'] as String?,
      dateOfBirth: fields['dateOfBirth'] as DateTime?,
      appointmentsCount: fields['appointmentsCount'] as int? ?? 0,
      unpaidInvoicesCount: fields['unpaidInvoicesCount'] as int? ?? 0,
    );
  }

  @override
  void write(BinaryWriter writer, Patient obj) {
    writer.writeMap({
      'id': obj.id,
      'fullName': obj.fullName,
      'phone': obj.phone,
      'gender': obj.gender,
      'dateOfBirth': obj.dateOfBirth,
      'appointmentsCount': obj.appointmentsCount,
      'unpaidInvoicesCount': obj.unpaidInvoicesCount,
    });
  }
}
