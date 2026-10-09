import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);

    // If clinic selection is required, show a different UI
    if (authState.requireClinicSelection) {
      return Scaffold(
        appBar: AppBar(title: const Text('اختيار العيادة')),
        body: authState.isLoading 
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: authState.availableClinics.length,
              itemBuilder: (context, index) {
                final clinic = authState.availableClinics[index];
                return Card(
                  child: ListTile(
                    title: Text(clinic['name']),
                    subtitle: Text(clinic['role']),
                    trailing: const Icon(Icons.arrow_forward_ios),
                    onTap: () {
                      ref.read(authStateProvider.notifier).loginWithClinic(clinic['id']);
                    },
                  ),
                );
              },
            ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('تسجيل الدخول')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (authState.error != null)
              Text(authState.error!, style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 16),
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(
                labelText: 'البريد الإلكتروني',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _passwordController,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'كلمة المرور',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: authState.isLoading
                    ? null
                    : () {
                        ref.read(authStateProvider.notifier).login(
                              _emailController.text,
                              _passwordController.text,
                            );
                      },
                child: authState.isLoading
                    ? const CircularProgressIndicator()
                    : const Text('دخول'),
              ),
            ),
          ],
        ),
      ),
    );
  }

}
