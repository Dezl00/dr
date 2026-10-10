import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'features/auth/screens/login_screen.dart';
import 'features/auth/screens/splash_screen.dart';
import 'features/auth/screens/register_clinic_screen.dart';
import 'features/auth/screens/forgot_password_screen.dart';
import 'features/dashboard/screens/dashboard_screen.dart';
import 'features/auth/providers/auth_provider.dart';
import 'core/theme/app_theme.dart';

import 'package:flutter_native_splash/flutter_native_splash.dart';

import 'core/offline/hive_service.dart';

import 'core/offline/sync_manager.dart';

import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'firebase_options.dart';
import 'core/services/notification_service.dart';

void main() async {
  WidgetsBinding widgetsBinding = WidgetsFlutterBinding.ensureInitialized();
  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);
  
  await HiveService.init();

  if (!kIsWeb) {
    try {
      await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
      await NotificationService().initialize();
    } catch (e) {
      debugPrint('Firebase init error: $e');
    }
  }


  runApp(const ProviderScope(child: DrsAdminApp()));
}

class DrsAdminApp extends ConsumerWidget {
  const DrsAdminApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Initialize global providers
    ref.watch(syncManagerProvider);

    return MaterialApp(
      title: 'DRS Admin',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      // RTL Setup for Arabic
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('ar', 'AE'), // Arabic
      ],
      locale: const Locale('ar', 'AE'),
      initialRoute: '/',
      routes: {
        '/': (context) => const AuthWrapper(),
        '/splash': (context) => const SplashScreen(),
        '/login': (context) => const LoginScreen(),
        '/register': (context) => const RegisterClinicScreen(),
        '/forgot-password': (context) => const ForgotPasswordScreen(),
        '/dashboard': (context) => const DashboardScreen(),
        '/auth_wrapper': (context) => const AuthWrapper(),
      },
    );
  }
}

class AuthWrapper extends ConsumerWidget {
  const AuthWrapper({super.key});
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);
    if (authState.isCheckingAuth) {
      return const SplashScreen();
    } else if (authState.isAuthenticated) {
      return const DashboardScreen();
    } else {
      return const LoginScreen();
    }
  }
}
