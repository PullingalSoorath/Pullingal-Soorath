import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../models/chat_message.dart';
import '../../models/chat_thread.dart';
import '../../services/firebase_service.dart';
import '../../theme/app_theme.dart';
import 'widgets/audio_player_bubble.dart';

class ChatDetailScreen extends StatefulWidget {
  final PortfolioChatThread thread;
  final PortfolioFirebaseService service;

  const ChatDetailScreen({
    super.key,
    required this.thread,
    required this.service,
  });

  @override
  State<ChatDetailScreen> createState() => _ChatDetailScreenState();
}

class _ChatDetailScreenState extends State<ChatDetailScreen> {
  final _textController = TextEditingController();
  final _scrollController = ScrollController();
  final _picker = ImagePicker();
  late final AudioRecorder _audioRecorder;

  bool _isSending = false;
  bool _isRecording = false;
  int _recordSeconds = 0;
  Timer? _recordTimer;

  final List<String> _cannedReplies = [
    'Hello! Thanks for visiting my portfolio.',
    'I am actively available for Flutter roles!',
    'Let’s schedule a Google Meet or call.',
    'Feel free to check out my featured projects.',
  ];

  @override
  void initState() {
    super.initState();
    _audioRecorder = AudioRecorder();
    widget.service.markThreadAsRead(widget.thread.id);
  }

  @override
  void dispose() {
    _recordTimer?.cancel();
    _audioRecorder.dispose();
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _handleSendText([String? predefined]) async {
    final text = predefined ?? _textController.text.trim();
    if (text.isEmpty || _isSending) return;

    if (predefined == null) {
      _textController.clear();
    }

    setState(() => _isSending = true);

    try {
      await widget.service.sendAdminTextMessage(
        chatId: widget.thread.id,
        text: text,
      );
      _scrollToBottom();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to send: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isSending = false);
    }
  }

  Future<void> _handlePickAndSendImage() async {
    try {
      final xFile = await _picker.pickImage(source: ImageSource.gallery, maxWidth: 900, imageQuality: 78);
      if (xFile == null) return;

      setState(() => _isSending = true);
      final bytes = await xFile.readAsBytes();

      await widget.service.sendAdminImageMessage(
        chatId: widget.thread.id,
        imageBytes: bytes,
      );
      _scrollToBottom();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to send image: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isSending = false);
    }
  }

  Future<void> _startRecording() async {
    try {
      if (await _audioRecorder.hasPermission()) {
        final tempDir = await getTemporaryDirectory();
        final path = '${tempDir.path}/admin_voice_${DateTime.now().millisecondsSinceEpoch}.m4a';

        await _audioRecorder.start(
          const RecordConfig(encoder: AudioEncoder.aacLc, bitRate: 128000),
          path: path,
        );

        setState(() {
          _isRecording = true;
          _recordSeconds = 0;
        });

        _recordTimer?.cancel();
        _recordTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
          if (mounted) {
            setState(() => _recordSeconds++);
          }
        });
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Microphone permission required to record audio')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error starting recording: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _stopAndSendRecording() async {
    _recordTimer?.cancel();
    setState(() => _isRecording = false);

    try {
      final path = await _audioRecorder.stop();
      if (path != null && _recordSeconds > 0) {
        final file = File(path);
        if (await file.exists()) {
          final bytes = await file.readAsBytes();
          final duration = _recordSeconds.toDouble();

          setState(() => _isSending = true);

          await widget.service.sendAdminVoiceMessage(
            chatId: widget.thread.id,
            audioBytes: bytes,
            durationSeconds: duration,
          );
          _scrollToBottom();
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to send voice note: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSending = false;
          _recordSeconds = 0;
        });
      }
    }
  }

  Future<void> _cancelRecording() async {
    _recordTimer?.cancel();
    try {
      await _audioRecorder.stop();
    } catch (_) {}
    if (mounted) {
      setState(() {
        _isRecording = false;
        _recordSeconds = 0;
      });
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent + 100,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Widget _buildMediaContent(PortfolioChatMessage msg) {
    if (msg.isImage) {
      try {
        if (msg.mediaUrl.startsWith('data:image')) {
          final base64Part = msg.mediaUrl.split(',').last;
          final bytes = base64Decode(base64Part);
          return ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Image.memory(
              bytes,
              fit: BoxFit.cover,
              width: 220,
              errorBuilder: (_, __, ___) => const Text('Failed to load image'),
            ),
          );
        } else if (msg.mediaUrl.isNotEmpty) {
          return ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Image.network(
              msg.mediaUrl,
              width: 220,
              errorBuilder: (_, __, ___) => const Text('Failed to load image'),
            ),
          );
        }
      } catch (_) {
        return const Text('Corrupted image payload');
      }
    }

    if (msg.isAudio) {
      return AudioPlayerBubble(
        mediaUrl: msg.mediaUrl,
        durationSeconds: msg.audioDuration,
        isAdmin: msg.isAdmin,
      );
    }

    return const SizedBox.shrink();
  }

  String _formatRecordTimer(int seconds) {
    final m = (seconds ~/ 60).toString().padLeft(2, '0');
    final s = (seconds % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        titleSpacing: 0,
        title: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: AppTheme.surfaceBg,
              backgroundImage: widget.thread.userAvatar.isNotEmpty
                  ? NetworkImage(widget.thread.userAvatar)
                  : null,
              child: widget.thread.userAvatar.isEmpty
                  ? Text(
                      widget.thread.userName.isNotEmpty ? widget.thread.userName[0].toUpperCase() : 'V',
                      style: const TextStyle(color: AppTheme.cyan, fontWeight: FontWeight.bold),
                    )
                  : null,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.thread.userName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    widget.thread.userEmail.isNotEmpty ? widget.thread.userEmail : 'Online Visitor',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.public, color: AppTheme.cyan, size: 20),
            tooltip: 'Open Live Website',
            onPressed: () {
              launchUrl(
                Uri.parse('https://pullingal-soorath.web.app/'),
                mode: LaunchMode.externalApplication,
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Messages Stream
          Expanded(
            child: StreamBuilder<List<PortfolioChatMessage>>(
              stream: widget.service.streamMessages(widget.thread.id),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator(color: AppTheme.cyan));
                }

                final messages = snapshot.data ?? [];
                if (messages.isEmpty) {
                  return Center(
                    child: Text(
                      'No messages in this conversation yet.',
                      style: TextStyle(color: AppTheme.textMuted.withOpacity(0.6), fontSize: 13),
                    ),
                  );
                }

                return ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  itemCount: messages.length,
                  itemBuilder: (context, index) {
                    final msg = messages[index];
                    final isAdmin = msg.isAdmin;

                    return Align(
                      alignment: isAdmin ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        constraints: BoxConstraints(
                          maxWidth: MediaQuery.of(context).size.width * 0.78,
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          gradient: isAdmin
                              ? const LinearGradient(
                                  colors: [AppTheme.cyan, AppTheme.purple],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                )
                              : null,
                          color: isAdmin ? null : AppTheme.cardBg,
                          borderRadius: BorderRadius.only(
                            topLeft: const Radius.circular(16),
                            topRight: const Radius.circular(16),
                            bottomLeft: Radius.circular(isAdmin ? 16 : 4),
                            bottomRight: Radius.circular(isAdmin ? 4 : 16),
                          ),
                          border: isAdmin ? null : Border.all(color: AppTheme.borderLight),
                        ),
                        child: Column(
                          crossAxisAlignment: isAdmin ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                          children: [
                            if (msg.isImage || msg.isAudio) ...[
                              _buildMediaContent(msg),
                              if (msg.text.isNotEmpty) const SizedBox(height: 6),
                            ],
                            if (msg.text.isNotEmpty)
                              Text(
                                msg.text,
                                style: TextStyle(
                                  color: isAdmin ? Colors.black : Colors.white,
                                  fontSize: 13.5,
                                  fontWeight: isAdmin ? FontWeight.w600 : FontWeight.normal,
                                ),
                              ),
                            const SizedBox(height: 4),
                            Text(
                              msg.createdAt != null
                                  ? DateFormat('hh:mm a').format(msg.createdAt!)
                                  : 'Just now',
                              style: TextStyle(
                                color: isAdmin ? Colors.black54 : AppTheme.textMuted,
                                fontSize: 10,
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

          // Canned Responses Carousel
          if (!_isRecording)
            Container(
              height: 38,
              margin: const EdgeInsets.only(bottom: 6),
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                scrollDirection: Axis.horizontal,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemCount: _cannedReplies.length,
                itemBuilder: (context, index) {
                  final reply = _cannedReplies[index];
                  return ActionChip(
                    label: Text(reply, style: const TextStyle(fontSize: 11, color: Colors.white70)),
                    backgroundColor: AppTheme.surfaceBg,
                    side: const BorderSide(color: AppTheme.borderLight),
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    onPressed: () => _handleSendText(reply),
                  );
                },
              ),
            ),

          // Message Composer Bar (Matching website design)
          Container(
            padding: const EdgeInsets.fromLTRB(10, 8, 10, 16),
            decoration: const BoxDecoration(
              color: AppTheme.cardBg,
              border: Border(top: BorderSide(color: AppTheme.borderLight)),
            ),
            child: SafeArea(
              child: _isRecording
                  ? // Recording Mode Active Bar
                  Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceBg,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: Colors.redAccent.withOpacity(0.5)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 10,
                            height: 10,
                            decoration: const BoxDecoration(
                              color: Colors.redAccent,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            _formatRecordTimer(_recordSeconds),
                            style: const TextStyle(
                              color: Colors.redAccent,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(width: 10),
                          const Expanded(
                            child: Text(
                              'Recording voice note...',
                              style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
                            ),
                          ),
                          // Cancel Recording
                          IconButton(
                            icon: const Icon(Icons.delete_outline_rounded, color: Colors.white70),
                            tooltip: 'Cancel',
                            onPressed: _cancelRecording,
                          ),
                          // Stop & Send
                          IconButton.filled(
                            style: IconButton.styleFrom(
                              backgroundColor: AppTheme.cyan,
                              foregroundColor: Colors.black,
                            ),
                            icon: const Icon(Icons.send_rounded, size: 18),
                            tooltip: 'Send voice note',
                            onPressed: _stopAndSendRecording,
                          ),
                        ],
                      ),
                    )
                  : // Standard Input Bar (Image, Mic, Input, Send)
                  Row(
                      children: [
                        // Image attachment button
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: AppTheme.surfaceBg,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppTheme.borderLight),
                          ),
                          child: IconButton(
                            icon: const Icon(Icons.photo_outlined, color: AppTheme.cyan, size: 20),
                            onPressed: _handlePickAndSendImage,
                            tooltip: 'Send image',
                            padding: EdgeInsets.zero,
                          ),
                        ),
                        const SizedBox(width: 8),

                        // Audio Voice Recording button
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: AppTheme.surfaceBg,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppTheme.borderLight),
                          ),
                          child: IconButton(
                            icon: const Icon(Icons.mic_none_rounded, color: AppTheme.cyan, size: 20),
                            onPressed: _startRecording,
                            tooltip: 'Record voice note',
                            padding: EdgeInsets.zero,
                          ),
                        ),
                        const SizedBox(width: 8),

                        // Text input field
                        Expanded(
                          child: TextField(
                            controller: _textController,
                            style: const TextStyle(color: Colors.white, fontSize: 14),
                            maxLines: 4,
                            minLines: 1,
                            decoration: InputDecoration(
                              hintText: 'Type message...',
                              fillColor: AppTheme.surfaceBg,
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(22),
                                borderSide: const BorderSide(color: AppTheme.borderLight),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(22),
                                borderSide: const BorderSide(color: AppTheme.borderLight),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(22),
                                borderSide: const BorderSide(color: AppTheme.cyan, width: 1.5),
                              ),
                            ),
                            onSubmitted: (_) => _handleSendText(),
                          ),
                        ),
                        const SizedBox(width: 8),

                        // Send Button
                        Container(
                          width: 42,
                          height: 42,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: LinearGradient(
                              colors: [AppTheme.cyan, AppTheme.blue],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                          ),
                          child: IconButton(
                            icon: _isSending
                                ? const SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                                  )
                                : const Icon(Icons.send_rounded, size: 19, color: Colors.black),
                            onPressed: _isSending ? null : () => _handleSendText(),
                            padding: EdgeInsets.zero,
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
