import 'package:cloud_firestore/cloud_firestore.dart';

class PortfolioContactMessage {
  final String id;
  final String name;
  final String emailOrPhone;
  final String message;
  final String subject;
  final String source;
  final String createdAt;
  final DateTime? timestamp;

  PortfolioContactMessage({
    required this.id,
    required this.name,
    required this.emailOrPhone,
    required this.message,
    required this.subject,
    required this.source,
    required this.createdAt,
    this.timestamp,
  });

  factory PortfolioContactMessage.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};

    DateTime? parsedTime;
    if (data['timestamp'] is Timestamp) {
      parsedTime = (data['timestamp'] as Timestamp).toDate();
    }

    return PortfolioContactMessage(
      id: doc.id,
      name: data['name'] ?? 'Anonymous',
      emailOrPhone: data['emailOrPhone'] ?? '',
      message: data['message'] ?? '',
      subject: data['subject'] ?? 'Direct Portfolio Message',
      source: data['source'] ?? 'Website Form',
      createdAt: data['createdAt'] ?? '',
      timestamp: parsedTime,
    );
  }
}
