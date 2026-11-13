import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../models/contact_message.dart';
import '../../services/firebase_service.dart';
import '../../theme/app_theme.dart';

class InquiriesTab extends StatelessWidget {
  final PortfolioFirebaseService service;

  const InquiriesTab({super.key, required this.service});

  void _copyToClipboard(BuildContext context, String text, String label) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$label copied to clipboard'),
        duration: const Duration(seconds: 2),
        backgroundColor: AppTheme.surfaceBg,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<PortfolioContactMessage>>(
      stream: service.streamContactMessages(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator(color: AppTheme.cyan));
        }

        if (snapshot.hasError) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Text(
                'Error loading inquiries: ${snapshot.error}',
                style: const TextStyle(color: Colors.redAccent),
              ),
            ),
          );
        }

        final messages = snapshot.data ?? [];
        if (messages.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.mail_outline, size: 48, color: AppTheme.textMuted.withOpacity(0.5)),
                const SizedBox(height: 12),
                const Text(
                  'No direct inquiries yet',
                  style: TextStyle(color: Colors.white70, fontSize: 15, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Messages submitted via the contact form will show up here.',
                  style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
                ),
              ],
            ),
          );
        }

        return ListView.separated(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          itemCount: messages.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final msg = messages[index];
            final isPhoneApp = msg.source.contains('Phone');

            return Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.borderLight),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header Row: Name & Source Badge
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          msg.name,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: isPhoneApp ? AppTheme.cyan.withOpacity(0.12) : AppTheme.purple.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: isPhoneApp ? AppTheme.cyan.withOpacity(0.4) : AppTheme.purple.withOpacity(0.4),
                          ),
                        ),
                        child: Text(
                          isPhoneApp ? 'Phone App' : 'Website Form',
                          style: TextStyle(
                            color: isPhoneApp ? AppTheme.cyan : AppTheme.purple,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),

                  // Contact (Email / Phone)
                  InkWell(
                    onTap: () => _copyToClipboard(context, msg.emailOrPhone, 'Contact info'),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.alternate_email, size: 14, color: AppTheme.cyan),
                        const SizedBox(width: 6),
                        Text(
                          msg.emailOrPhone,
                          style: const TextStyle(color: AppTheme.cyan, fontSize: 12, fontWeight: FontWeight.w500),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Subject Pill
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceBg,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      msg.subject,
                      style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600),
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Message Content
                  Text(
                    msg.message,
                    style: const TextStyle(color: Colors.white, fontSize: 13, height: 1.4),
                  ),
                  const SizedBox(height: 12),

                  // Timestamp & Action Buttons
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        msg.createdAt.isNotEmpty ? msg.createdAt : 'Just now',
                        style: const TextStyle(color: AppTheme.textMuted, fontSize: 10.5),
                      ),
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.copy_rounded, size: 18, color: AppTheme.textMuted),
                            tooltip: 'Copy Message',
                            onPressed: () => _copyToClipboard(context, msg.message, 'Message'),
                          ),
                          IconButton(
                            icon: const Icon(Icons.delete_outline, size: 18, color: Colors.redAccent),
                            tooltip: 'Delete inquiry',
                            onPressed: () async {
                              final confirm = await showDialog<bool>(
                                context: context,
                                builder: (_) => AlertDialog(
                                  backgroundColor: AppTheme.cardBg,
                                  title: const Text('Delete inquiry?'),
                                  content: Text('Remove message from "${msg.name}"?'),
                                  actions: [
                                    TextButton(
                                      onPressed: () => Navigator.pop(context, false),
                                      child: const Text('Cancel'),
                                    ),
                                    TextButton(
                                      onPressed: () => Navigator.pop(context, true),
                                      child: const Text('Delete', style: TextStyle(color: Colors.redAccent)),
                                    ),
                                  ],
                                ),
                              );
                              if (confirm == true) {
                                await service.deleteContactMessage(msg.id);
                              }
                            },
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
