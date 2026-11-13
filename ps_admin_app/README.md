# PS Admin Console (Flutter Android App)

The official Flutter mobile administrator application for **Pullingal Soorath's Portfolio Website**. Connects in real-time to Cloud Firestore to view incoming portfolio inquiries, monitor active visitor chat sessions, and reply to visitors instantly with text, canned responses, and image attachments.

---

## 📱 App Highlights & Architecture

- **Sleek Cyberpunk / One UI Dark Neon Theme**: Matches the portfolio identity with `#00F5FF` (Cyan), `#7C4DFF` (Purple), and `#06080E` (Deep Space Dark).
- **Live Visitor Chats (Real-time Stream)**:
  - Subscribes to `/chats` ordered by `lastMessageTimestamp DESC`.
  - Unread message counters per visitor with real-time badges.
  - Search by visitor name, email, or message preview.
- **Interactive Chat Detail Screen**:
  - Live subcollection stream from `/chats/{chatId}/messages`.
  - Distinct speech bubbles: visitor messages (slate glass) vs Admin messages (cyan-to-purple gradient with `senderRole: 'adminPS'`).
  - Decodes and previews Base64 JPEG images and audio duration badges.
  - Quick canned responses carousel for one-tap replies.
  - Gallery photo picker with automatic Base64 compression.
  - Automatically marks thread as read on entry (`unreadCountAdmin: 0`).
- **Direct Contact & Mail Inquiries**:
  - Subscribes to `/messages` (submissions from both the Smartphone Messages App and Homepage Connect section).
  - Displays visitor name, contact email/phone, subject, source badge, IST time, and message body.
  - One-tap "Copy Contact" and "Copy Message".
  - One-tap "Delete / Archive" inquiry with confirmation dialog.
- **Cloud Database Health & Resume Metrics**:
  - Live status monitor for `pullingal-soorath.web.app`.
  - Live stream of `/resume_downloads` showing who downloaded your resume PDF and when.
- **Strict Role-Based Security Enforcement**:
  - Authenticates with Firebase Authentication (`adminPS` role).
  - Matches [`firestore.rules`](../firestore.rules) requiring `pullingalsoorath@gmail.com` or `pullingalsoorath.dev@gmail.com`.

---

## 🚀 How to Run the App

### 1. Run on Connected Android Device or Emulator
```bash
cd ps_admin_app
flutter run
```

### 2. Build Release APK for Your Android Phone
```bash
cd ps_admin_app
flutter build apk --release
```
The APK will be generated at:
`ps_admin_app/build/app/outputs/flutter-apk/app-release.apk`

---

## 🔑 Admin Credentials
- **Email**: `pullingalsoorath@gmail.com` or `pullingalsoorath.dev@gmail.com`
- **Password**: Your Firebase Authentication user password created in your Firebase Console.
