import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'firebase_options.dart';
import 'screens/auth/login_screen.dart';
import 'screens/home/main_navigation_screen.dart';
import 'services/firebase_service.dart';
import 'theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase with the portfolio project credentials
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  final firebaseService = PortfolioFirebaseService();
  runApp(PSAdminApp(service: firebaseService));
}

class PSAdminApp extends StatelessWidget {
  final PortfolioFirebaseService service;

  const PSAdminApp({super.key, required this.service});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PS Admin Console',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: StreamBuilder(
        stream: service.authStateChanges,
        builder: (context, snapshot) {
          // Checking authentication state
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Scaffold(
              body: Center(
                child: CircularProgressIndicator(color: AppTheme.cyan),
              ),
            );
          }

          final user = snapshot.data;
          final isAdmin = user != null && isEmailAdmin(user.email);

          if (isAdmin) {
            return MainNavigationScreen(service: service);
          }

          return LoginScreen(service: service);
        },
      ),
    );
  }
}
