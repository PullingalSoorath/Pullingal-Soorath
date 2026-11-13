// File generated for Pullingal Soorath Portfolio Admin Console
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      case TargetPlatform.windows:
        return windows;
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyAE7ASNzRFJ3wAhF0nLYNoCGzq3ukBQFAU',
    appId: '1:299906439534:web:77b0d374ebd37e054fc97f',
    messagingSenderId: '299906439534',
    projectId: 'pullingal-soorath',
    authDomain: 'pullingal-soorath.firebaseapp.com',
    storageBucket: 'pullingal-soorath.firebasestorage.app',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyAE7ASNzRFJ3wAhF0nLYNoCGzq3ukBQFAU',
    appId: '1:299906439534:android:77b0d374ebd37e054fc97f',
    messagingSenderId: '299906439534',
    projectId: 'pullingal-soorath',
    storageBucket: 'pullingal-soorath.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyAE7ASNzRFJ3wAhF0nLYNoCGzq3ukBQFAU',
    appId: '1:299906439534:ios:77b0d374ebd37e054fc97f',
    messagingSenderId: '299906439534',
    projectId: 'pullingal-soorath',
    storageBucket: 'pullingal-soorath.firebasestorage.app',
  );

  static const FirebaseOptions macos = FirebaseOptions(
    apiKey: 'AIzaSyAE7ASNzRFJ3wAhF0nLYNoCGzq3ukBQFAU',
    appId: '1:299906439534:ios:77b0d374ebd37e054fc97f',
    messagingSenderId: '299906439534',
    projectId: 'pullingal-soorath',
    storageBucket: 'pullingal-soorath.firebasestorage.app',
  );

  static const FirebaseOptions windows = FirebaseOptions(
    apiKey: 'AIzaSyAE7ASNzRFJ3wAhF0nLYNoCGzq3ukBQFAU',
    appId: '1:299906439534:web:77b0d374ebd37e054fc97f',
    messagingSenderId: '299906439534',
    projectId: 'pullingal-soorath',
    authDomain: 'pullingal-soorath.firebaseapp.com',
    storageBucket: 'pullingal-soorath.firebasestorage.app',
  );
}
