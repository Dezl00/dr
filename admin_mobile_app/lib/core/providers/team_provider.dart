import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../api/api_endpoints.dart';
import '../offline/hive_service.dart';
import 'offline_list_notifier.dart';

final teamProvider = StateNotifierProvider<OfflineListNotifier, List<dynamic>>((ref) {
  final dio = ref.watch(dioProvider);
  final box = HiveService.getTeamBox();
  return OfflineListNotifier(
    box: box,
    endpoint: ApiEndpoints.team,
    dio: dio,
  );
});
