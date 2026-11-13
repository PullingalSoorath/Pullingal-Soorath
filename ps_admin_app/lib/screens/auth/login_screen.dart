import 'package:flutter/material.dart';
import '../../services/firebase_service.dart';
import '../../theme/app_theme.dart';
import '../home/main_navigation_screen.dart';

class LoginScreen extends StatefulWidget {
  final PortfolioFirebaseService service;

  const LoginScreen({super.key, required this.service});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController(text: 'pullingalsoorath@gmail.com');
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _isSignUp = false;
  String? _errorMessage;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _showSetupInstructionDialog() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppTheme.cardBg,
        title: const Row(
          children: [
            Icon(Icons.info_outline, color: AppTheme.cyan),
            SizedBox(width: 8),
            Text('Enable Email Auth', style: TextStyle(fontSize: 16)),
          ],
        ),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'To sign in with Email & Password in your Firebase project (pullingal-soorath):\n',
              style: TextStyle(color: Colors.white70, fontSize: 13),
            ),
            Text(
              '1. Go to console.firebase.google.com\n'
              '2. Select project "pullingal-soorath"\n'
              '3. Go to Authentication -> Sign-in method\n'
              '4. Enable "Email/Password" and click Save.\n\n'
              'Then return to this app and create or enter your password!',
              style: TextStyle(color: AppTheme.cyan, fontSize: 12.5, height: 1.4),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK, Got It', style: TextStyle(color: AppTheme.cyan)),
          ),
        ],
      ),
    );
  }

  Future<void> _handleAuthAction() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty || password.isEmpty) {
      setState(() {
        _errorMessage = 'Please enter both admin email and password.';
      });
      return;
    }

    if (password.length < 6) {
      setState(() {
        _errorMessage = 'Password must be at least 6 characters.';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      if (_isSignUp) {
        await widget.service.signUpAdmin(email: email, password: password);
      } else {
        await widget.service.signInAdmin(email: email, password: password);
      }

      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => MainNavigationScreen(service: widget.service),
        ),
      );
    } catch (e) {
      final msg = e.toString();
      if (msg.contains('operation-not-allowed')) {
        _showSetupInstructionDialog();
        setState(() {
          _errorMessage =
              'Email/Password auth is not enabled yet in your Firebase Console. Tap "How to enable" below.';
        });
      } else if (msg.contains('user-not-found') || msg.contains('invalid-credential')) {
        setState(() {
          _errorMessage =
              'No account found with this password. If this is your first time, tap "Set up admin password" below!';
        });
      } else if (msg.contains('email-already-in-use')) {
        setState(() {
          _errorMessage =
              'Account already exists! Please switch to "Sign In" and enter your password.';
        });
      } else {
        setState(() {
          _errorMessage = msg.replaceAll('Exception:', '').trim();
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // App Icon / Logo Badge
                  Center(
                    child: Container(
                      width: 76,
                      height: 76,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppTheme.cyan, AppTheme.purple],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(22),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.cyan.withOpacity(0.3),
                            blurRadius: 20,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Text(
                          'PS',
                          style: TextStyle(
                            color: Colors.black,
                            fontSize: 32,
                            fontWeight: FontWeight.w900,
                            letterSpacing: -1,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Header Titles
                  const Text(
                    'PS Admin Console',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _isSignUp
                        ? 'Create / Set Your Admin Password'
                        : 'Pullingal Soorath Portfolio Mobile Gateway',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: AppTheme.cyan,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 30),

                  // Error Banner
                  if (_errorMessage != null) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.red.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.red.withOpacity(0.4)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.error_outline, color: Colors.redAccent, size: 20),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              _errorMessage!,
                              style: const TextStyle(color: Colors.redAccent, fontSize: 12),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 18),
                  ],

                  // Email Field
                  const Text(
                    'Admin Email (Designated Admin)',
                    style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    style: const TextStyle(color: Colors.white),
                    decoration: const InputDecoration(
                      prefixIcon: Icon(Icons.email_outlined, color: AppTheme.cyan, size: 20),
                      hintText: 'pullingalsoorath@gmail.com',
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Password Field
                  Text(
                    _isSignUp ? 'Choose Admin Password (min 6 characters)' : 'Admin Password',
                    style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      prefixIcon: const Icon(Icons.lock_outline, color: AppTheme.cyan, size: 20),
                      hintText: _isSignUp ? 'Choose a secure password' : 'Enter your password',
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                          color: AppTheme.textMuted,
                          size: 20,
                        ),
                        onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Submit Button
                  ElevatedButton(
                    onPressed: _isLoading ? null : _handleAuthAction,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: _isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2.5),
                          )
                        : Text(
                            _isSignUp ? 'CREATE ADMIN PASSWORD & ENTER' : 'SIGN IN AS ADMIN',
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                          ),
                  ),
                  const SizedBox(height: 16),

                  // Toggle Sign In vs Sign Up
                  TextButton(
                    onPressed: () {
                      setState(() {
                        _isSignUp = !_isSignUp;
                        _errorMessage = null;
                      });
                    },
                    child: Text(
                      _isSignUp
                          ? 'Already set up a password? Sign In'
                          : 'First time? Tap here to set up your admin password',
                      style: const TextStyle(color: AppTheme.cyan, fontSize: 12.5),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Info Box
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.cardBg,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.borderLight),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.shield_outlined, color: AppTheme.cyan, size: 16),
                            SizedBox(width: 8),
                            Text(
                              'Authorized Admin Accounts:',
                              style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          '• pullingalsoorath@gmail.com\n• pullingalsoorath.dev@gmail.com',
                          style: TextStyle(color: AppTheme.textMuted, fontSize: 11, height: 1.3),
                        ),
                        const SizedBox(height: 6),
                        GestureDetector(
                          onTap: _showSetupInstructionDialog,
                          child: const Text(
                            'Need help with password setup? Click here',
                            style: TextStyle(color: AppTheme.purple, fontSize: 11, decoration: TextDecoration.underline),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
