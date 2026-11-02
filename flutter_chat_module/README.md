# Flutter 1-on-1 Real-time Chat Module
**Author:** Pullingal Soorath (Professional Flutter Developer & UI/UX Architect)

This module provides a production-ready, interactive 1-on-1 real-time chat application connecting portfolio visitors directly with Pullingal Soorath.

---

## 📂 Architecture & Files

| File | Description |
|------|-------------|
| `chat_service.dart` | Authentication (Google Sign-In), role-based checking (`adminPS` vs `user`), Cloud Firestore streams, Storage upload pipeline, and unread counters. |
| `chat_user_screen.dart` | Dedicated visitor chat screen with real-time `StreamBuilder`, photo preview, and attachment triggers. |
| `chat_admin_dashboard.dart` | Dedicated Admin dashboard for `pullingalsoorath.dev@gmail.com` and `pullingalsoorath@gmail.com` streaming all visitor threads with unread counters and 1-click reply. |
| `chat_bubble_widgets.dart` | Message bubbles supporting **Text**, **Tap-to-Expand Images**, and **Inline Voice Notes** with animated waveform visualizers. |

---

## ⚙️ Dependencies (`pubspec.yaml`)

```yaml
dependencies:
  flutter:
    sdk: flutter
  firebase_core: ^3.8.0
  firebase_auth: ^5.3.3
  cloud_firestore: ^5.5.0
  firebase_storage: ^12.3.6
  google_sign_in: ^6.2.2
  image_picker: ^1.1.2
```

---

## 🛡️ Security Rules

- **Firestore**: Enforced via root `firestore.rules`. Visitors can only read and write to their own thread (`chats/{user_uid}`). Admins have full access across all threads.
- **Storage**: Enforced via root `storage.rules`. Visitors can only write media to `chat_media/{user_uid}/...`.
