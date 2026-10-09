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
