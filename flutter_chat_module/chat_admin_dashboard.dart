import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:image_picker/image_picker.dart';
import 'chat_service.dart';
import 'chat_bubble_widgets.dart';

/// Pullingal Soorath Portfolio - Admin Conversations Dashboard
/// Exclusively available to `pullingalsoorath.dev@gmail.com` and `pullingalsoorath@gmail.com`.
class ChatAdminDashboard extends StatefulWidget {
  const ChatAdminDashboard({super.key});

  @override
  State<ChatAdminDashboard> createState() => _ChatAdminDashboardState();
}

class _ChatAdminDashboardState extends State<ChatAdminDashboard> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF030914),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0B132B),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF7C4DFF).withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.shield, color: Color(0xFF7C4DFF), size: 18),
            ),
            const SizedBox(width: 8),
            const Text(
              'PS Admin Console',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white70),
            tooltip: 'Sign Out',
            onPressed: () async {
              await ChatService.instance.signOut();
            },
          ),
        ],
      ),
      body: StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
        stream: ChatService.instance.getAdminChatsStream(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(color: Color(0xFF00F5FF)),
            );
          }

          if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Icon(Icons.inbox, size: 48, color: Colors.white24),
                  SizedBox(height: 12),
                  Text(
                    'No active conversations yet',
                    style: TextStyle(color: Colors.white60),
                  ),
                ],
              ),
            );
          }

          final docs = snapshot.data!.docs;

          return ListView.separated(
            padding: const EdgeInsets.all(12),
            itemCount: docs.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final thread = docs[index].data();
              final String chatId = docs[index].id;
              final String userName = thread['userName'] ?? 'Visitor';
              final String userEmail = thread['userEmail'] ?? '';
              final String lastMessage = thread['lastMessage'] ?? 'Started a chat';
              final int unreadCount = thread['unreadCountAdmin'] ?? 0;
              final String avatarUrl = thread['userAvatar'] ?? '';

              return InkWell(
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => AdminThreadChatView(
                        chatId: chatId,
                        userName: userName,
                        userEmail: userEmail,
                        userAvatar: avatarUrl,
                      ),
                    ),
                  );
                },
                borderRadius: BorderRadius.circular(14),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: unreadCount > 0
                        ? const Color(0xFF00F5FF).withOpacity(0.08)
                        : const Color(0xFF0B132B),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: unreadCount > 0
                          ? const Color(0xFF00F5FF).withOpacity(0.3)
                          : Colors.white.withOpacity(0.06),
                    ),
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 20,
                        backgroundColor: const Color(0xFF0072FF),
                        backgroundImage:
                            avatarUrl.isNotEmpty ? NetworkImage(avatarUrl) : null,
                        child: avatarUrl.isEmpty
                            ? Text(
                                userName.isNotEmpty ? userName[0].toUpperCase() : 'V',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                ),
                              )
                            : null,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.between,
                              children: [
                                Text(
                                  userName,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                  ),
                                ),
                                if (unreadCount > 0)
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 7, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF00F5FF),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: Text(
                                      '$unreadCount',
                                      style: const TextStyle(
                                        color: Colors.black,
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                            const SizedBox(height: 2),
                            Text(
                              userEmail,
                              style: const TextStyle(
                                color: Colors.white38,
                                fontSize: 10,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              lastMessage,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                color: unreadCount > 0
                                    ? const Color(0xFF00F5FF)
                                    : Colors.white70,
                                fontSize: 12,
                              ),
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
    );
  }
}

/// Admin detailed response view for a specific visitor thread
class AdminThreadChatView extends StatefulWidget {
  final String chatId;
  final String userName;
  final String userEmail;
  final String userAvatar;

  const AdminThreadChatView({
    super.key,
    required this.chatId,
    required this.userName,
    required this.userEmail,
    required this.userAvatar,
  });

  @override
  State<AdminThreadChatView> createState() => _AdminThreadChatViewState();
}

class _AdminThreadChatViewState extends State<AdminThreadChatView> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final ImagePicker _picker = ImagePicker();
  bool _isSending = false;

  @override
  void initState() {
    super.initState();
    ChatService.instance.markThreadAsRead(
      chatId: widget.chatId,
      isAdmin: true,
    );
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent + 60,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  Future<void> _handleSendText() async {
    final String text = _textController.text.trim();
    if (text.isEmpty || _isSending) return;

    _textController.clear();
    setState(() => _isSending = true);

    try {
      await ChatService.instance.sendMessage(
        chatId: widget.chatId,
        type: 'text',
        text: text,
      );
      _scrollToBottom();
    } finally {
      if (mounted) setState(() => _isSending = false);
    }
  }

  Future<void> _handlePickImage() async {
    if (_isSending) return;
    try {
      final XFile? file = await _picker.pickImage(source: ImageSource.gallery);
      if (file == null) return;

      setState(() => _isSending = true);
      final Uint8List bytes = await file.readAsBytes();

      final String mediaUrl = await ChatService.instance.uploadChatMedia(
        chatId: widget.chatId,
        bytes: bytes,
        type: 'image',
        extension: 'jpg',
      );

      await ChatService.instance.sendMessage(
        chatId: widget.chatId,
        type: 'image',
        mediaUrl: mediaUrl,
      );
      _scrollToBottom();
    } finally {
      if (mounted) setState(() => _isSending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF030914),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0B132B),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.userName,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
            ),
            Text(
              widget.userEmail,
              style: const TextStyle(fontSize: 10, color: Colors.white54),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
              stream: ChatService.instance.getMessagesStream(widget.chatId),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(
                    child: CircularProgressIndicator(color: Color(0xFF00F5FF)),
                  );
                }

                if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
                  return const Center(
                    child: Text(
                      'No messages in this thread yet.',
                      style: TextStyle(color: Colors.white54),
                    ),
                  );
                }

                final docs = snapshot.data!.docs;
                WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());

                return ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  itemCount: docs.length,
                  itemBuilder: (context, index) {
                    final data = docs[index].data();
                    final bool isMe = data['senderRole'] == 'adminPS';
                    return ChatBubbleWidget(
                      messageData: data,
                      isMe: isMe,
                    );
                  },
                );
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            color: const Color(0xFF0B132B),
            child: SafeArea(
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.image, color: Colors.white70),
                    onPressed: _isSending ? null : _handlePickImage,
                  ),
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF030914),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: Colors.white12),
                      ),
                      child: TextField(
                        controller: _textController,
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                        decoration: const InputDecoration(
                          hintText: 'Reply as Pullingal Soorath (Admin)...',
                          hintStyle: TextStyle(color: Colors.white38, fontSize: 13),
                          border: InputBorder.none,
                          contentPadding:
                              EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        ),
                        onSubmitted: (_) => _handleSendText(),
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  CircleAvatar(
                    radius: 20,
                    backgroundColor: const Color(0xFF00F5FF),
                    child: IconButton(
                      icon: const Icon(Icons.send, color: Colors.black, size: 18),
                      onPressed: _isSending ? null : _handleSendText,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
