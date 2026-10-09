import 'package:hive/hive.dart';

class PendingAction {
  final String id;
  final String type;
  final Map<String, dynamic> data;
  
  PendingAction({
    required this.id,
    required this.type,
    required this.data,
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
    );
  }

  @override
  void write(BinaryWriter writer, PendingAction obj) {
    writer.writeMap({
      'id': obj.id,
      'type': obj.type,
      'data': obj.data,
    });
  }
}
