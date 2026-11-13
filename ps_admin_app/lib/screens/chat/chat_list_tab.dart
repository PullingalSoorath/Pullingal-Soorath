import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/chat_thread.dart';
import '../../services/firebase_service.dart';
import '../../theme/app_theme.dart';
import 'chat_detail_screen.dart';

class ChatListTab extends StatefulWidget {
  final PortfolioFirebaseService service;

  const ChatListTab({super.key, required this.service});

  @override
  State<ChatListTab> createState() => _ChatListTabState();
}

class _ChatListTabState extends State<ChatListTab> {
  String _searchQuery = '';
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  String _formatDate(DateTime? dt) {
    if (dt == null) return '';
    final now = DateTime.now();
    if (now.difference(dt).inDays == 0) {
      return DateFormat('hh:mm a').format(dt);
    }
    return DateFormat('dd MMM').format(dt);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Search & Filter Bar
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
          child: TextField(
            controller: _searchController,
            onChanged: (val) => setState(() => _searchQuery = val.trim().toLowerCase()),
            style: const TextStyle(color: Colors.white, fontSize: 13),
            decoration: InputDecoration(
              hintText: 'Search visitors or messages...',
              prefixIcon: const Icon(Icons.search, color: AppTheme.cyan, size: 20),
              suffixIcon: _searchQuery.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.close, color: AppTheme.textMuted, size: 18),
                      onPressed: () {
                        _searchController.clear();
                        setState(() => _searchQuery = '');
                      },
                    )
                  : null,
            ),
          ),
        ),

        // Live Chat Threads Stream
        Expanded(
          child: StreamBuilder<List<PortfolioChatThread>>(
            stream: widget.service.streamChatThreads(),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(
                  child: CircularProgressIndicator(color: AppTheme.cyan),
                );
              }

              if (snapshot.hasError) {
                return Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Text(
                      'Error loading chats: ${snapshot.error}',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.redAccent, fontSize: 13),
                    ),
                  ),
                );
              }

              final allThreads = snapshot.data ?? [];
              final filtered = allThreads.where((t) {
                if (_searchQuery.isEmpty) return true;
                return t.userName.toLowerCase().contains(_searchQuery) ||
                    t.userEmail.toLowerCase().contains(_searchQuery) ||
                    t.lastMessage.toLowerCase().contains(_searchQuery);
              }).toList();

              if (filtered.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.chat_bubble_outline, size: 48, color: AppTheme.textMuted.withOpacity(0.5)),
                      const SizedBox(height: 12),
                      const Text(
                        'No visitor conversations yet',
                        style: TextStyle(color: Colors.white70, fontSize: 15, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Incoming chats from your portfolio will appear here.',
                        style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
                      ),
                    ],
                  ),
                );
              }

              return ListView.separated(
                itemCount: filtered.length,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (context, index) {
                  final thread = filtered[index];
                  final hasUnread = thread.unreadCountAdmin > 0;

                  return InkWell(
                    borderRadius: BorderRadius.circular(16),
                    onTap: () {
                      widget.service.markThreadAsRead(thread.id);
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => ChatDetailScreen(
                            thread: thread,
                            service: widget.service,
                          ),
                        ),
                      );
                    },
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: hasUnread ? AppTheme.surfaceBg : AppTheme.cardBg,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: hasUnread ? AppTheme.cyan.withOpacity(0.5) : AppTheme.borderLight,
                          width: hasUnread ? 1.5 : 1,
                        ),
                      ),
                      child: Row(
                        children: [
                          // Visitor Avatar
                          Stack(
                            children: [
                              CircleAvatar(
                                radius: 24,
                                backgroundColor: AppTheme.surfaceBg,
                                backgroundImage: thread.userAvatar.isNotEmpty
                                    ? NetworkImage(thread.userAvatar)
                                    : null,
                                child: thread.userAvatar.isEmpty
                                    ? Text(
                                        thread.userName.isNotEmpty ? thread.userName[0].toUpperCase() : 'V',
                                        style: const TextStyle(
                                          color: AppTheme.cyan,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 18,
                                        ),
                                      )
                                    : null,
                              ),
                              if (hasUnread)
                                Positioned(
                                  right: 0,
                                  top: 0,
                                  child: Container(
                                    width: 12,
                                    height: 12,
                                    decoration: BoxDecoration(
                                      color: AppTheme.cyan,
                                      shape: BoxShape.circle,
                                      border: Border.all(color: AppTheme.cardBg, width: 2),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(width: 12),

                          // Name & Snippet
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        thread.userName,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 14,
                                          fontWeight: hasUnread ? FontWeight.bold : FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                    Text(
                                      _formatDate(thread.lastMessageTimestamp),
                                      style: TextStyle(
                                        color: hasUnread ? AppTheme.cyan : AppTheme.textMuted,
                                        fontSize: 11,
                                        fontWeight: hasUnread ? FontWeight.bold : FontWeight.normal,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    Expanded(
                                      child: Text(
                                        thread.lastMessage,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(
                                          color: hasUnread ? Colors.white : AppTheme.textMuted,
                                          fontSize: 12,
                                          fontWeight: hasUnread ? FontWeight.w500 : FontWeight.normal,
                                        ),
                                      ),
                                    ),
                                    if (hasUnread) ...[
                                      const SizedBox(width: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: AppTheme.cyan,
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        child: Text(
                                          '${thread.unreadCountAdmin}',
                                          style: const TextStyle(
                                            color: Colors.black,
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }
}
