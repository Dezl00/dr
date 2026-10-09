import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart' show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      // For now, web is not configured with Firebase. It will throw if attempted.
      // The user wants phone notifications mostly.
      throw UnsupportedError('Web not configured. Run flutterfire configure.');
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      default:
        throw UnsupportedError('Platform not configured');
    }
  }

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyD4pzefwf9lA6RluQ_hVLb2CuQXGYineeQ',
    appId: '1:580059182254:android:f04901d7a1c3f8b403e93f',
    messagingSenderId: '580059182254',
    projectId: 'doctors-3f2b6',
    storageBucket: 'doctors-3f2b6.firebasestorage.app',
  );
}
