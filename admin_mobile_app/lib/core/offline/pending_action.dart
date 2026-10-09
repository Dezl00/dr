import 'package:hive/hive.dart';

class PendingAction {
  final String id;
  final String type;
  final Map<String, dynamic> data;
  int retryCount;
  String? errorMessage;
  
  PendingAction({
    required this.id,
    required this.type,
    required this.data,
    this.retryCount = 0,
    this.errorMessage,
  });
}

class PendingActionAdapter extends TypeAdapter<PendingAction> {
  @override
  final int typeId = 1;

  @override
  PendingAction read(BinaryReader reader) {
    final fields = reader.readMap();
    return PendingAction(
      id: fields['id'] as String,
      type: fields['type'] as String,
      data: Map<String, dynamic>.from(fields['data'] as Map),
      retryCount: fields['retryCount'] as int? ?? 0,
      errorMessage: fields['errorMessage'] as String?,
    );
  }

  @override
  void write(BinaryWriter writer, PendingAction obj) {
    writer.writeMap({
      'id': obj.id,
      'type': obj.type,
      'data': obj.data,
      'retryCount': obj.retryCount,
      'errorMessage': obj.errorMessage,
    });
  }
}
