import 'package:hive/hive.dart';

class Expense {
  final String id;
  final String category;
  final double amount;
  final String description;
  final DateTime expenseDate;

  Expense({
    required this.id,
    required this.category,
    required this.amount,
    required this.description,
    required this.expenseDate,
  });

  factory Expense.fromJson(Map<String, dynamic> json) {
    return Expense(
      id: json['id']?.toString() ?? '',
      category: json['category']?.toString() ?? 'OTHER',
      amount: double.tryParse(json['amount']?.toString() ?? '0') ?? 0.0,
      description: json['description']?.toString() ?? '',
      expenseDate: json['expenseDate'] != null ? DateTime.tryParse(json['expenseDate'].toString()) ?? DateTime.now() : DateTime.now(),
    );
  }
}

class ExpenseAdapter extends TypeAdapter<Expense> {
  @override
  final int typeId = 4;

  @override
  Expense read(BinaryReader reader) {
    final fields = reader.readMap();
    return Expense(
      id: fields['id'] as String,
      category: fields['category'] as String,
      amount: fields['amount'] as double,
      description: fields['description'] as String,
      expenseDate: fields['expenseDate'] as DateTime,
    );
  }

  @override
  void write(BinaryWriter writer, Expense obj) {
    writer.writeMap({
      'id': obj.id,
      'category': obj.category,
      'amount': obj.amount,
      'description': obj.description,
      'expenseDate': obj.expenseDate,
    });
  }
}
