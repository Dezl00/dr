import 'package:hive/hive.dart';

class Appointment {
  final String id;
  final String patientId;
  final String patientName;
  final String patientPhone;
  final String doctorId;
  final String doctorName;
  final String? serviceId;
  final String? serviceName;
  final DateTime date;
  final String startTime;
  final String? endTime;
  final String status;
  final String? notes;

  Appointment({
    required this.id,
    required this.patientId,
    required this.patientName,
    required this.patientPhone,
    required this.doctorId,
    required this.doctorName,
    this.serviceId,
    this.serviceName,
    required this.date,
    required this.startTime,
    this.endTime,
    required this.status,
    this.notes,
  });

  factory Appointment.fromJson(Map<String, dynamic> json) {
    return Appointment(
      id: json['id']?.toString() ?? '',
      patientId: json['patientId']?.toString() ?? '',
      patientName: json['patient']?['fullName']?.toString() ?? 'بدون اسم',
      patientPhone: json['patient']?['phone']?.toString() ?? 'بدون هاتف',
      doctorId: json['doctorId']?.toString() ?? '',
      doctorName: json['doctor']?['user']?['fullName']?.toString() ?? 'طبيب غير محدد',
      serviceId: json['serviceId']?.toString(),
      serviceName: json['service']?['name']?.toString(),
      date: json['date'] != null ? DateTime.tryParse(json['date'].toString()) ?? DateTime.now() : DateTime.now(),
      startTime: json['startTime']?.toString() ?? '00:00',
      endTime: json['endTime']?.toString(),
      status: json['status']?.toString() ?? 'SCHEDULED',
      notes: json['notes']?.toString(),
    );
  }
}

class AppointmentAdapter extends TypeAdapter<Appointment> {
  @override
  final int typeId = 2;

  @override
  Appointment read(BinaryReader reader) {
    final fields = reader.readMap();
    return Appointment(
      id: fields['id'] as String,
      patientId: fields['patientId'] as String,
      patientName: fields['patientName'] as String,
      patientPhone: fields['patientPhone'] as String,
      doctorId: fields['doctorId'] as String,
      doctorName: fields['doctorName'] as String,
      serviceId: fields['serviceId'] as String?,
      serviceName: fields['serviceName'] as String?,
      date: fields['date'] as DateTime,
      startTime: fields['startTime'] as String,
      endTime: fields['endTime'] as String?,
      status: fields['status'] as String,
      notes: fields['notes'] as String?,
    );
  }

  @override
  void write(BinaryWriter writer, Appointment obj) {
    writer.writeMap({
      'id': obj.id,
      'patientId': obj.patientId,
      'patientName': obj.patientName,
      'patientPhone': obj.patientPhone,
      'doctorId': obj.doctorId,
      'doctorName': obj.doctorName,
      'serviceId': obj.serviceId,
      'serviceName': obj.serviceName,
      'date': obj.date,
      'startTime': obj.startTime,
      'endTime': obj.endTime,
      'status': obj.status,
      'notes': obj.notes,
    });
  }
}
