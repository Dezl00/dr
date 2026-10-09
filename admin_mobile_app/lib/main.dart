import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'features/auth/screens/login_screen.dart';
import 'features/dashboard/screens/dashboard_screen.dart';
import 'features/auth/providers/auth_provider.dart';
import 'core/theme/app_theme.dart';

void main() {
  runApp(const ProviderScope(child: DrsAdminApp()));
}

class DrsAdminApp extends ConsumerWidget {
  const DrsAdminApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);

    return MaterialApp(
      title: 'DRS Admin',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: authState.isAuthenticated ? const DashboardScreen() : const LoginScreen(),
    );
  }
}
