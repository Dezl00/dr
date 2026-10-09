import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'features/auth/screens/login_screen.dart';
import 'features/auth/screens/splash_screen.dart';
import 'features/auth/screens/register_clinic_screen.dart';
import 'features/dashboard/screens/dashboard_screen.dart';
import 'features/auth/providers/auth_provider.dart';
import 'core/theme/app_theme.dart';

import 'package:flutter_native_splash/flutter_native_splash.dart';

import 'package:google_fonts/google_fonts.dart';

void main() async {
  WidgetsBinding widgetsBinding = WidgetsFlutterBinding.ensureInitialized();
  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);
  await GoogleFonts.pendingFonts([GoogleFonts.ibmPlexSansArabicTextTheme()]);
  runApp(const ProviderScope(child: DrsAdminApp()));
}

class DrsAdminApp extends ConsumerWidget {
  const DrsAdminApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
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
