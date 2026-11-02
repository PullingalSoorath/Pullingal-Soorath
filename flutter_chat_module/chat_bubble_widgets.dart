import 'package:flutter/material.dart';

/// Pullingal Soorath Portfolio - Modular Chat Bubble Widgets
/// Handles Text, Tap-to-Expand Images, and Inline Audio Player Bubbles.

class ChatBubbleWidget extends StatelessWidget {
  final Map<String, dynamic> messageData;
  final bool isMe;

  const ChatBubbleWidget({
    super.key,
    required this.messageData,
    required this.isMe,
  });

  @override
  Widget build(BuildContext context) {
    final String type = messageData['type'] ?? 'text';
    final String text = messageData['text'] ?? '';
    final String mediaUrl = messageData['mediaUrl'] ?? '';
    final String senderRole = messageData['senderRole'] ?? 'user';
    final bool isRead = messageData['isRead'] ?? false;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 4.0),
      child: Row(
        mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isMe) ...[
            CircleAvatar(
              radius: 14,
              backgroundColor: const Color(0xFF00F5FF).withOpacity(0.2),
              backgroundImage: const AssetImage('assets/profile_neon.jpg'),
            ),
            const SizedBox(width: 6),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                gradient: isMe
                    ? const LinearGradient(
                        colors: [Color(0xFF00F5FF), Color(0xFF0072FF)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      )
                    : null,
                color: isMe ? null : const Color(0xFF1E293B),
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(18),
                  topRight: const Radius.circular(18),
                  bottomLeft: Radius.circular(isMe ? 18 : 2),
                  bottomRight: Radius.circular(isMe ? 2 : 18),
                ),
                border: isMe
                    ? null
                    : Border.all(color: Colors.white.withOpacity(0.08)),
                boxShadow: [
                  BoxShadow(
                    color: isMe
                        ? const Color(0xFF00F5FF).withOpacity(0.18)
                        : Colors.black.withOpacity(0.25),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment:
                    isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                children: [
                  // Admin Tag for incoming messages from Soorath
                  if (!isMe && senderRole == 'adminPS') ...[
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text(
                          'Pullingal Soorath',
                          style: TextStyle(
                            color: Color(0xFF00F5FF),
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 4, vertical: 1),
                          decoration: BoxDecoration(
                            color: const Color(0xFF00F5FF).withOpacity(0.15),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            'ADMIN',
                            style: TextStyle(
                              color: Color(0xFF00F5FF),
                              fontSize: 8,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                  ],

                  // Body Content by Type
                  if (type == 'text')
                    Text(
                      text,
                      style: TextStyle(
                        color: isMe ? Colors.black : Colors.white,
                        fontSize: 13,
                        fontWeight: isMe ? FontWeight.w500 : FontWeight.w400,
                        height: 1.35,
                      ),
                    )
                  else if (type == 'image')
                    ImageBubbleWidget(mediaUrl: mediaUrl)
                  else if (type == 'audio')
                    AudioBubbleWidget(audioUrl: mediaUrl, isMe: isMe),

                  const SizedBox(height: 4),

                  // Status and timestamp
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'IST',
                        style: TextStyle(
                          color: isMe ? Colors.black54 : Colors.white38,
                          fontSize: 9,
                          fontFamily: 'monospace',
                        ),
                      ),
                      if (isMe) ...[
                        const SizedBox(width: 4),
                        Icon(
                          isRead ? Icons.done_all : Icons.done,
                          size: 13,
                          color: isRead ? Colors.black : Colors.black45,
                        ),
                      ],
                    ],
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

/// Tap-to-expand Image Bubble Widget
class ImageBubbleWidget extends StatelessWidget {
  final String mediaUrl;

  const ImageBubbleWidget({super.key, required this.mediaUrl});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        showDialog(
          context: context,
          builder: (ctx) => Dialog(
            backgroundColor: Colors.black87,
            insetPadding: const EdgeInsets.all(12),
            child: Stack(
              children: [
                Center(
                  child: InteractiveViewer(
                    panEnabled: true,
                    minScale: 0.5,
                    maxScale: 4.0,
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: Image.network(
                        mediaUrl,
                        fit: BoxFit.contain,
                        loadingBuilder: (c, child, progress) {
                          if (progress == null) return child;
                          return const SizedBox(
                            height: 200,
                            child: Center(
                              child: CircularProgressIndicator(
                                color: Color(0xFF00F5FF),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                ),
                // Top Left Corner Back Button
                Positioned(
                  top: 12,
                  left: 12,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0B132B).withOpacity(0.9),
                      foregroundColor: const Color(0xFF00F5FF),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                        side: const BorderSide(color: Color(0xFF00F5FF), width: 0.8),
                      ),
                    ),
                    icon: const Icon(Icons.arrow_back, size: 16),
                    label: const Text('Back', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    onPressed: () => Navigator.of(ctx).pop(),
                  ),
                ),
              ],
            ),
          ),
        );
      },
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Image.network(
          mediaUrl,
          width: 200,
          height: 150,
          fit: BoxFit.cover,
          loadingBuilder: (context, child, progress) {
            if (progress == null) return child;
            return Container(
              width: 200,
              height: 150,
              color: Colors.black26,
              child: const Center(
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Color(0xFF00F5FF),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

/// Inline Audio Voice Note Player Bubble
class AudioBubbleWidget extends StatefulWidget {
  final String audioUrl;
  final bool isMe;

  const AudioBubbleWidget({
    super.key,
    required this.audioUrl,
    required this.isMe,
  });

  @override
  State<AudioBubbleWidget> createState() => _AudioBubbleWidgetState();
}

class _AudioBubbleWidgetState extends State<AudioBubbleWidget>
    with SingleTickerProviderStateMixin {
  bool _isPlaying = false;
  double _progress = 0.0;
  late AnimationController _waveController;

  @override
  void initState() {
    super.initState();
    _waveController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _waveController.dispose();
    super.dispose();
  }

  void _togglePlay() {
    setState(() {
      _isPlaying = !_isPlaying;
      if (_isPlaying) {
        _progress = 0.35;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 190,
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          InkWell(
            onTap: _togglePlay,
            borderRadius: BorderRadius.circular(20),
            child: CircleAvatar(
              radius: 16,
              backgroundColor: widget.isMe ? Colors.black : const Color(0xFF00F5FF),
              child: Icon(
                _isPlaying ? Icons.pause : Icons.play_arrow,
                color: widget.isMe ? const Color(0xFF00F5FF) : Colors.black,
                size: 18,
              ),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Simulated Waveform Bars
                AnimatedBuilder(
                  animation: _waveController,
                  builder: (context, child) {
                    return Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: List.generate(12, (index) {
                        final double h = _isPlaying
                            ? (8 + (12 * (index % 3 == 0 ? _waveController.value : (1 - _waveController.value))))
                            : 4.0;
                        return Container(
                          width: 3,
                          height: h,
                          decoration: BoxDecoration(
                            color: widget.isMe
                                ? Colors.black87
                                : const Color(0xFF00F5FF),
                            borderRadius: BorderRadius.circular(2),
                          ),
                        );
                      }),
                    );
                  },
                ),
                const SizedBox(height: 4),
                // Audio track slider / progress
                LinearProgressIndicator(
                  value: _progress,
                  backgroundColor: Colors.white12,
                  valueColor: AlwaysStoppedAnimation<Color>(
                    widget.isMe ? Colors.black87 : const Color(0xFF00F5FF),
                  ),
                  minHeight: 2,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
