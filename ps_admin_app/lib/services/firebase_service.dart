import 'dart:convert';
import 'dart:typed_data';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/chat_message.dart';
import '../models/chat_thread.dart';
import '../models/contact_message.dart';

const List<String> kAdminEmails = [
  'pullingalsoorath.dev@gmail.com',
  'pullingalsoorath@gmail.com',
];

bool isEmailAdmin(String? email) {
  if (email == null) return false;
  return kAdminEmails.contains(email.toLowerCase().trim());
}

class PortfolioFirebaseService {
  final FirebaseFirestore _firestore;
  final FirebaseAuth _auth;

  PortfolioFirebaseService({
    FirebaseFirestore? firestore,
    FirebaseAuth? auth,
  })  : _firestore = firestore ?? FirebaseFirestore.instance,
        _auth = auth ?? FirebaseAuth.instance;

  User? get currentUser => _auth.currentUser;
  bool get isAdmin => isEmailAdmin(_auth.currentUser?.email);

  Stream<User?> get authStateChanges => _auth.authStateChanges();

  // --------------------------------------------------------------------------
  // AUTHENTICATION
  // --------------------------------------------------------------------------

  Future<UserCredential> signInAdmin({
    required String email,
    required String password,
  }) async {
    final cred = await _auth.signInWithEmailAndPassword(
      email: email.trim(),
      password: password,
    );

    if (!isEmailAdmin(cred.user?.email)) {
      await _auth.signOut();
      throw FirebaseAuthException(
        code: 'unauthorized-admin',
        message: 'This account (${cred.user?.email}) is not authorized as a Portfolio Administrator.',
      );
    }

    await _syncAdminProfile(cred.user!);
    return cred;
  }

  Future<void> signOut() async {
    await _auth.signOut();
  }

  Future<void> _syncAdminProfile(User user) async {
    try {
      await _firestore.collection('users').doc(user.uid).set({
        'uid': user.uid,
        'displayName': user.displayName ?? 'Pullingal Soorath (Admin)',
        'email': user.email ?? '',
        'photoURL': user.photoURL ?? '',
        'role': 'adminPS',
        'lastActive': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));
    } catch (_) {}
  }

  // --------------------------------------------------------------------------
  // CONTACT & MAIL SUBMISSIONS (messages collection)
  // --------------------------------------------------------------------------

  Stream<List<PortfolioContactMessage>> streamContactMessages() {
    return _firestore
        .collection('messages')
        .orderBy('timestamp', descending: true)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs
          .map((doc) => PortfolioContactMessage.fromFirestore(doc))
          .toList();
    });
  }

  Future<void> deleteContactMessage(String docId) async {
    await _firestore.collection('messages').doc(docId).delete();
  }

  // --------------------------------------------------------------------------
  // CHAT THREADS (chats collection)
  // --------------------------------------------------------------------------

  Stream<List<PortfolioChatThread>> streamChatThreads() {
    return _firestore
        .collection('chats')
        .orderBy('lastMessageTimestamp', descending: true)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs
          .map((doc) => PortfolioChatThread.fromFirestore(doc))
          .toList();
    });
  }

  Stream<List<PortfolioChatMessage>> streamMessages(String chatId) {
    return _firestore
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .orderBy('createdAt', descending: false)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs
          .map((doc) => PortfolioChatMessage.fromFirestore(doc))
          .toList();
    });
  }

  Future<void> markThreadAsRead(String chatId) async {
    try {
      final threadRef = _firestore.collection('chats').doc(chatId);
      await threadRef.update({
        'unreadCountAdmin': 0,
      });
    } catch (_) {}
  }

  // --------------------------------------------------------------------------
  // ADMIN REPLIES ('adminPS')
  // --------------------------------------------------------------------------

  Future<void> sendAdminTextMessage({
    required String chatId,
    required String text,
  }) async {
    final adminUser = _auth.currentUser;
    if (adminUser == null) throw Exception('Admin is not signed in.');

    final cleanText = text.trim();
    if (cleanText.isEmpty) return;

    final batch = _firestore.batch();

    final messageDocRef = _firestore
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .doc();

    batch.set(messageDocRef, {
      'senderId': adminUser.uid,
      'senderRole': 'adminPS',
      'type': 'text',
      'text': cleanText,
      'mediaUrl': '',
      'createdAt': FieldValue.serverTimestamp(),
      'isRead': false,
    });

    final threadRef = _firestore.collection('chats').doc(chatId);
    batch.update(threadRef, {
      'lastMessage': cleanText,
      'lastMessageTimestamp': FieldValue.serverTimestamp(),
      'updatedAt': FieldValue.serverTimestamp(),
      'unreadCountUser': FieldValue.increment(1),
    });

    await batch.commit();
  }

  Future<void> sendAdminImageMessage({
    required String chatId,
    required Uint8List imageBytes,
    String? caption,
  }) async {
    final adminUser = _auth.currentUser;
    if (adminUser == null) throw Exception('Admin is not signed in.');

    final base64String = base64Encode(imageBytes);
    final dataUri = 'data:image/jpeg;base64,$base64String';
    final snippet = (caption != null && caption.trim().isNotEmpty)
        ? caption.trim()
        : '📷 Image attachment';

    final batch = _firestore.batch();

    final messageDocRef = _firestore
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .doc();

    batch.set(messageDocRef, {
      'senderId': adminUser.uid,
      'senderRole': 'adminPS',
      'type': 'image',
      'text': caption?.trim() ?? '',
      'mediaUrl': dataUri,
      'createdAt': FieldValue.serverTimestamp(),
      'isRead': false,
    });

    final threadRef = _firestore.collection('chats').doc(chatId);
    batch.update(threadRef, {
      'lastMessage': snippet,
      'lastMessageTimestamp': FieldValue.serverTimestamp(),
      'updatedAt': FieldValue.serverTimestamp(),
      'unreadCountUser': FieldValue.increment(1),
    });

    await batch.commit();
  }

  // --------------------------------------------------------------------------
  // RESUME DOWNLOAD METRICS
  // --------------------------------------------------------------------------

  Stream<QuerySnapshot> streamResumeDownloads() {
    return _firestore
        .collection('resume_downloads')
        .orderBy('timestamp', descending: true)
        .limit(50)
        .snapshots();
  }
}
