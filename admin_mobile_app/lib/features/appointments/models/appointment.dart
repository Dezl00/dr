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
