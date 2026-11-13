import 'package:cloud_firestore/cloud_firestore.dart';

class PortfolioChatThread {
  final String id;
  final String userId;
  final String userName;
  final String userEmail;
  final String userAvatar;
  final String lastMessage;
  final DateTime? lastMessageTimestamp;
  final int unreadCountAdmin;
  final int unreadCountUser;
  final DateTime? updatedAt;

  PortfolioChatThread({
    required this.id,
    required this.userId,
    required this.userName,
    required this.userEmail,
    required this.userAvatar,
    required this.lastMessage,
    this.lastMessageTimestamp,
    required this.unreadCountAdmin,
    required this.unreadCountUser,
    this.updatedAt,
  });

  factory PortfolioChatThread.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};

    DateTime? lastMsgTime;
    if (data['lastMessageTimestamp'] is Timestamp) {
      lastMsgTime = (data['lastMessageTimestamp'] as Timestamp).toDate();
    }

    DateTime? updatedTime;
    if (data['updatedAt'] is Timestamp) {
      updatedTime = (data['updatedAt'] as Timestamp).toDate();
    }

    return PortfolioChatThread(
      id: doc.id,
      userId: data['userId'] ?? doc.id,
      userName: data['userName'] ?? 'Anonymous Visitor',
      userEmail: data['userEmail'] ?? '',
      userAvatar: data['userAvatar'] ?? '',
      lastMessage: data['lastMessage'] ?? 'Started a conversation',
      lastMessageTimestamp: lastMsgTime,
      unreadCountAdmin: (data['unreadCountAdmin'] as num?)?.toInt() ?? 0,
      unreadCountUser: (data['unreadCountUser'] as num?)?.toInt() ?? 0,
      updatedAt: updatedTime,
    );
  }
}
