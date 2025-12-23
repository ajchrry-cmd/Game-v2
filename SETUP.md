# Quick Setup Guide

## 🔥 Firebase Setup (REQUIRED)

Your Firebase credentials are already configured in the `.env` file. Now you need to set up Firestore and Storage:

### 1. Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/project/you-just-lost-the-game-5d1d4/firestore)
2. Click **"Create Database"**
3. Choose **"Start in production mode"**
4. Select a location (choose closest to you)
5. Click **"Enable"**

### 2. Update Firestore Rules

1. In Firestore, go to the **"Rules"** tab
2. Copy the contents of `firestore.rules` from this repo
3. Paste into the rules editor
4. Click **"Publish"**

Or use Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

### 3. Enable Storage

1. Go to [Storage](https://console.firebase.google.com/project/you-just-lost-the-game-5d1d4/storage)
2. Click **"Get Started"**
3. Click **"Next"** (default security rules)
4. Select same location as Firestore
5. Click **"Done"**

### 4. Update Storage Rules

1. In Storage, go to the **"Rules"** tab
2. Copy the contents of `storage.rules` from this repo
3. Paste into the rules editor
4. Click **"Publish"**

Or use Firebase CLI:
```bash
firebase deploy --only storage
```

---

## 🚀 GitHub Pages Deployment

### 1. Add Firebase Secrets to GitHub

Go to your repository settings:
```
https://github.com/ajchrry-cmd/Game-v2/settings/secrets/actions
```

Click **"New repository secret"** and add each of these:

| Secret Name | Value |
|-------------|-------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyBwoZFzkz2zO58EBe43OEFULVh4R75bv5U` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `you-just-lost-the-game-5d1d4.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `you-just-lost-the-game-5d1d4` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `you-just-lost-the-game-5d1d4.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `435485092174` |
| `VITE_FIREBASE_APP_ID` | `1:435485092174:web:19e23fe1e54dcde156961f` |

### 2. Enable GitHub Pages

1. Go to repository settings:
   ```
   https://github.com/ajchrry-cmd/Game-v2/settings/pages
   ```

2. Under **"Build and deployment"**:
   - Source: **GitHub Actions**

3. Click **"Save"**

### 3. Trigger Deployment

Option A - Push to main:
```bash
git checkout main
git merge claude/dnd-game-master-app-0t2rh
git push origin main
```

Option B - Manual trigger:
1. Go to [Actions tab](https://github.com/ajchrry-cmd/Game-v2/actions)
2. Click "Deploy to GitHub Pages"
3. Click "Run workflow"

---

## 🎮 Testing Locally

Start the development server:
```bash
npm run dev
```

Open in browser: http://localhost:5173

---

## ✅ Verify Setup

After deployment, your app will be available at:
```
https://ajchrry-cmd.github.io/Game-v2/
```

### Quick Test Checklist:

1. ✓ App loads without errors
2. ✓ Create a new session
3. ✓ Add a player
4. ✓ Create an item (with image upload)
5. ✓ Create a map
6. ✓ Upload a scene image
7. ✓ Create a wheel

If all these work, your Firebase setup is correct! 🎉

---

## 🐛 Troubleshooting

**Error: "Missing or insufficient permissions"**
- Check Firestore rules are published
- Make sure you're using production mode

**Images not uploading**
- Check Storage is enabled
- Verify storage rules are published
- Check browser console for CORS errors

**App loads but data doesn't save**
- Verify Firestore is enabled
- Check browser console for errors
- Verify environment variables are set correctly

**GitHub Actions deployment fails**
- Check all secrets are added correctly
- Verify secret names match exactly (case-sensitive)
- Check Actions logs for specific errors

---

## 📱 Mobile/TV Setup

1. Open the app on your mobile device or laptop
2. Use screen mirroring:
   - **iOS**: AirPlay to Apple TV
   - **Android**: Cast or Smart View
   - **Windows/Mac**: HDMI or Miracast

3. Control everything from your device while players see the TV screen

---

## 🔒 Security Note

The current Firebase rules allow public read/write access. This is fine for a local game where you control access via the URL.

If you want to add authentication in the future, update the rules to require auth:

```javascript
// Firestore
allow read, write: if request.auth != null;

// Storage
allow read, write: if request.auth != null;
```

---

Need help? Check the main [README.md](./README.md) or open an issue on GitHub!
