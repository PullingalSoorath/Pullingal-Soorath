import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:image_picker/image_picker.dart';
import 'chat_service.dart';
import 'chat_bubble_widgets.dart';

/// Pullingal Soorath Portfolio - Visitor 1-on-1 Chat Screen
/// Dedicated real-time communication room with Pullingal Soorath.
class ChatUserScreen extends StatefulWidget {
  final String chatId; // Visitor's UID

  const ChatUserScreen({super.key, required this.chatId});

  @override
  State<ChatUserScreen> createState() => _ChatUserScreenState();
}

class _ChatUserScreenState extends State<ChatUserScreen> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final ImagePicker _picker = ImagePicker();
  bool _isSending = false;

  @override
  void initState() {
    super.initState();
    ChatService.instance.markThreadAsRead(
      chatId: widget.chatId,
      isAdmin: false,
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
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to send: $e')),
        );
      }
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
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to upload image: $e')),
        );
      }
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
        elevation: 1,
        titleSpacing: 0,
        title: Row(
          children: [
            Stack(
              alignment: Alignment.bottomRight,
              children: [
                const CircleAvatar(
                  radius: 18,
                  backgroundImage: AssetImage('assets/profile_neon.jpg'),
                ),
                Container(
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(
                    color: const Color(0xFF00FF88),
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.black, width: 1.5),
                  ),
                ),
              ],
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'Pullingal Soorath',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Text(
                  'Online • Typically replies quickly',
                  style: TextStyle(
                    fontSize: 10,
                    color: Color(0xFF00FF88),
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white70, size: 20),
            tooltip: 'Sign Out',
            onPressed: () async {
              await ChatService.instance.signOut();
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Real-time messages stream
          Expanded(
            child: StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
              stream: ChatService.instance.getMessagesStream(widget.chatId),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(
                    child: CircularProgressIndicator(
                      color: Color(0xFF00F5FF),
                    ),
                  );
                }

                if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Icon(
                            Icons.chat_bubble_outline,
                            size: 48,
                            color: Color(0xFF00F5FF),
                          ),
                          SizedBox(height: 12),
                          Text(
                            'Say hello to Pullingal Soorath!',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(height: 6),
                          Text(
                            'Ask about projects, architecture, or available opportunities.',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: Colors.white60,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
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
                    final isMe = data['senderId'] == widget.chatId;
                    return ChatBubbleWidget(
                      messageData: data,
                      isMe: isMe,
                    );
                  },
                );
              },
            ),
          ),

          // Input Bottom Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF0B132B),
              border: Border(
                top: BorderSide(color: Colors.white.withOpacity(0.06)),
              ),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.image, color: Colors.white70),
                    onPressed: _isSending ? null : _handlePickImage,
                    tooltip: 'Attach Image',
                  ),
                  IconButton(
                    icon: const Icon(Icons.mic, color: Colors.white70),
                    onPressed: _isSending ? null : () {},
                    tooltip: 'Record Voice Note',
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
                          hintText: 'Message Pullingal Soorath...',
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
                      icon: _isSending
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.black,
                              ),
                            )
                          : const Icon(Icons.send, color: Colors.black, size: 18),
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
