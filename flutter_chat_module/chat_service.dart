import 'dart:typed_data';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:google_sign_in/google_sign_in.dart';

/// Pullingal Soorath Portfolio - Production Chat Service
/// Handles Firebase Auth (Google Sign-In), Cloud Firestore Real-time CRUD,
/// and Firebase Storage uploads for 1-on-1 conversations.
class ChatService {
  ChatService._();
  static final ChatService instance = ChatService._();

  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseStorage _storage = FirebaseStorage.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
  );

  /// Designated Admin Email addresses
  static const List<String> adminEmails = [
    'pullingalsoorath.dev@gmail.com',
    'pullingalsoorath@gmail.com',
  ];

  /// Checks if given email belongs to AdminPS
  bool isAdminEmail(String? email) {
    if (email == null) return false;
    return adminEmails.contains(email.trim().toLowerCase());
  }

  /// Current authenticated user
  User? get currentUser => _auth.currentUser;

  /// Stream of Auth State changes
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  /// Google Sign-In with automatic Firestore profile sync and role assignment
  Future<UserCredential?> signInWithGoogle() async {
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) return null; // User cancelled

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final OAuthCredential credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final UserCredential userCredential = await _auth.signInWithCredential(credential);
      final User? user = userCredential.user;

      if (user != null) {
        await _syncUserProfile(user);
      }

      return userCredential;
    } catch (e) {
      rethrow;
    }
  }

  /// Sign out from Firebase and Google
  Future<void> signOut() async {
    await _googleSignIn.signOut();
    await _auth.signOut();
  }

  /// Syncs user document at `users/{userId}`
  Future<void> _syncUserProfile(User user) async {
    final bool isAdmin = isAdminEmail(user.email);
    final String role = isAdmin ? 'adminPS' : 'user';

    final DocumentReference userDoc = _firestore.collection('users').doc(user.uid);
    final DocumentSnapshot docSnap = await userDoc.get();

    final Map<String, dynamic> data = {
      'uid': user.uid,
      'displayName': user.displayName ?? 'Portfolio Visitor',
      'email': user.email ?? '',
      'photoURL': user.photoURL ?? '',
      'role': role,
      'lastActive': FieldValue.serverTimestamp(),
    };

    if (docSnap.exists) {
      await userDoc.update(data);
    } else {
      data['createdAt'] = FieldValue.serverTimestamp();
      await userDoc.set(data);
    }
  }

  /// Real-time stream of messages in `chats/{chatId}/messages` ordered by `createdAt asc`
  Stream<QuerySnapshot<Map<String, dynamic>>> getMessagesStream(String chatId) {
    return _firestore
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .orderBy('createdAt', descending: false)
        .snapshots();
  }

  /// Real-time stream of all conversation threads for Admin Dashboard
  /// Ordered by `lastMessageTimestamp desc`
  Stream<QuerySnapshot<Map<String, dynamic>>> getAdminChatsStream() {
    return _firestore
        .collection('chats')
        .orderBy('lastMessageTimestamp', descending: true)
        .snapshots();
  }

  /// Sends a message into `chats/{chatId}/messages` and updates thread summary in `chats/{chatId}`
  Future<void> sendMessage({
    required String chatId,
    required String type, // 'text' | 'image' | 'audio'
    String? text,
    String? mediaUrl,
  }) async {
    final User? user = _auth.currentUser;
    if (user == null) throw Exception('User is not authenticated.');

    final bool isAdmin = isAdminEmail(user.email);
    final String senderRole = isAdmin ? 'adminPS' : 'user';

    // 1. Add Message Document
    final CollectionReference messagesRef =
        _firestore.collection('chats').doc(chatId).collection('messages');

    await messagesRef.add({
      'senderId': user.uid,
      'senderRole': senderRole,
      'type': type,
      'text': text ?? '',
      'mediaUrl': mediaUrl ?? '',
      'createdAt': FieldValue.serverTimestamp(),
      'isRead': false,
    });

    // 2. Format lastMessage snippet
    String snippet = text ?? '';
    if (type == 'image') snippet = '📷 Image attachment';
    if (type == 'audio') snippet = '🎙️ Voice note';

    // 3. Update or set thread metadata
    final DocumentReference threadRef = _firestore.collection('chats').doc(chatId);
    final DocumentSnapshot threadSnap = await threadRef.get();

    if (threadSnap.exists) {
      await threadRef.update({
        'lastMessage': snippet,
        'lastMessageTimestamp': FieldValue.serverTimestamp(),
        'updatedAt': FieldValue.serverTimestamp(),
        if (isAdmin)
          'unreadCountUser': FieldValue.increment(1)
        else ...{
          'unreadCountAdmin': FieldValue.increment(1),
          'userName': user.displayName ?? 'Visitor',
          'userEmail': user.email ?? '',
          'userAvatar': user.photoURL ?? '',
        }
      });
    } else {
      await threadRef.set({
        'userId': chatId,
        'userName': user.displayName ?? 'Visitor',
        'userEmail': user.email ?? '',
        'userAvatar': user.photoURL ?? '',
        'lastMessage': snippet,
        'lastMessageTimestamp': FieldValue.serverTimestamp(),
        'unreadCountAdmin': isAdmin ? 0 : 1,
        'unreadCountUser': isAdmin ? 1 : 0,
        'createdAt': FieldValue.serverTimestamp(),
        'updatedAt': FieldValue.serverTimestamp(),
      });
    }
  }

  /// Uploads media byte data to Firebase Storage:
  /// `chat_media/{chatId}/{type}s/{timestamp}_{filename}`
  Future<String> uploadChatMedia({
    required String chatId,
    required Uint8List bytes,
    required String type, // 'image' | 'audio'
    required String extension,
  }) async {
    final int timestamp = DateTime.now().millisecondsSinceEpoch;
    final String path = 'chat_media/$chatId/${type}s/${timestamp}_upload.$extension';
    final Reference ref = _storage.ref().child(path);

    final SettableMetadata metadata = SettableMetadata(
      contentType: type == 'image' ? 'image/jpeg' : 'audio/webm',
    );

    final UploadTask uploadTask = ref.putData(bytes, metadata);
    final TaskSnapshot snapshot = await uploadTask;
    return await snapshot.ref.getDownloadURL();
  }

  /// Marks thread as read and resets unread count for the active role
  Future<void> markThreadAsRead({
    required String chatId,
    required bool isAdmin,
  }) async {
    try {
      final DocumentReference threadRef = _firestore.collection('chats').doc(chatId);
      if (isAdmin) {
        await threadRef.update({'unreadCountAdmin': 0});
      } else {
        await threadRef.update({'unreadCountUser': 0});
      }
    } catch (_) {
      // Document might not exist yet if thread is fresh
    }
  }
}
