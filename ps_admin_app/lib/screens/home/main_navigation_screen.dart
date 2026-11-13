import 'package:flutter/material.dart';
import '../../services/firebase_service.dart';
import '../../theme/app_theme.dart';
import '../auth/login_screen.dart';
import '../chat/chat_list_tab.dart';
import '../inquiries/inquiries_tab.dart';
import '../analytics/analytics_tab.dart';

class MainNavigationScreen extends StatefulWidget {
  final PortfolioFirebaseService service;

  const MainNavigationScreen({super.key, required this.service});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  Future<void> _handleSignOut() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppTheme.cardBg,
        title: const Text('Sign Out?'),
        content: const Text('Are you sure you want to sign out of the Admin Console?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Sign Out', style: TextStyle(color: Colors.redAccent)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      await widget.service.signOut();
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => LoginScreen(service: widget.service),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final userEmail = widget.service.currentUser?.email ?? 'pullingalsoorath@gmail.com';

    final tabs = [
      ChatListTab(service: widget.service),
      InquiriesTab(service: widget.service),
      AnalyticsTab(service: widget.service),
    ];

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [AppTheme.cyan, AppTheme.purple]),
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Text(
                'PS',
                style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 11),
              ),
            ),
            const SizedBox(width: 8),
            const Text('Admin Console'),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(vertical: 10),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: AppTheme.surfaceBg,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppTheme.borderLight),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.verified, color: AppTheme.cyan, size: 14),
                const SizedBox(width: 4),
                Text(
                  userEmail.split('@').first,
                  style: const TextStyle(fontSize: 11, color: Colors.white70),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: Colors.redAccent, size: 20),
            tooltip: 'Sign Out',
            onPressed: _handleSignOut,
          ),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: tabs,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
        backgroundColor: AppTheme.cardBg,
        indicatorColor: AppTheme.cyan.withOpacity(0.2),
        elevation: 0,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.chat_bubble_outline, color: AppTheme.textMuted),
            selectedIcon: Icon(Icons.chat_bubble, color: AppTheme.cyan),
            label: 'Live Chats',
          ),
          NavigationDestination(
            icon: Icon(Icons.mail_outline, color: AppTheme.textMuted),
            selectedIcon: Icon(Icons.mail, color: AppTheme.cyan),
            label: 'Inquiries',
          ),
          NavigationDestination(
            icon: Icon(Icons.analytics_outlined, color: AppTheme.textMuted),
            selectedIcon: Icon(Icons.analytics, color: AppTheme.cyan),
            label: 'Cloud Vault',
          ),
        ],
      ),
    );
  }
}
