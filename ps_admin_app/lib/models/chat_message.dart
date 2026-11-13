import 'package:cloud_firestore/cloud_firestore.dart';

class PortfolioChatMessage {
  final String id;
  final String senderId;
  final String senderRole; // 'user' | 'adminPS'
  final String type; // 'text' | 'image' | 'audio'
  final String text;
  final String mediaUrl;
  final double? audioDuration;
  final DateTime? createdAt;
  final bool isRead;

  PortfolioChatMessage({
    required this.id,
    required this.senderId,
    required this.senderRole,
    required this.type,
    required this.text,
    required this.mediaUrl,
    this.audioDuration,
    this.createdAt,
    required this.isRead,
  });

  bool get isAdmin => senderRole == 'adminPS';
  bool get isText => type == 'text';
  bool get isImage => type == 'image';
  bool get isAudio => type == 'audio';

  factory PortfolioChatMessage.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};

    DateTime? created;
    if (data['createdAt'] is Timestamp) {
      created = (data['createdAt'] as Timestamp).toDate();
    }

    return PortfolioChatMessage(
      id: doc.id,
      senderId: data['senderId'] ?? '',
      senderRole: data['senderRole'] ?? 'user',
      type: data['type'] ?? 'text',
      text: data['text'] ?? '',
      mediaUrl: data['mediaUrl'] ?? '',
      audioDuration: (data['audioDuration'] as num?)?.toDouble(),
      createdAt: created,
      isRead: data['isRead'] == true,
    );
  }
}
