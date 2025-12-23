# DND Game Master App

A web-based application for running DND-style games with a visual interface designed for TV displays. The game master controls everything from their mobile device, and all players see the same screen.

## Features

### 🗺️ Interactive Map
- Custom web of placeable squares that players can move between
- Draggable player tokens (color-coded or custom images)
- Player stats (Power & Money) and inventory (4 items max) displayed on sidebar
- Customizable map squares (shape, color, text, rotation)
- Support for multiple map shapes: square, circle, hexagon, triangle
- Save and load custom maps

### 🎡 Spinning Wheel
- Create predetermined wheels before game start
- Create custom wheels on-the-spot for random encounters
- Smooth spinning animation with visual result highlighting
- Similar to wheelofnames.com

### 🖼️ Scene Viewer
- Upload and display full-screen images
- Easy switching between scenes
- Perfect for storytelling and atmosphere

### 🛒 Shop System
- Display items with pictures, names, and descriptions
- Items sorted by price
- Static, non-scrolling layout for TV viewing
- Master item list with selective shop display

### 👥 Player Management
- Support for up to 6 players
- Track Power and Money stats
- 4-slot inventory system
- Custom player icons (color tokens or uploaded images)

### 💾 Session Management
- Save game states for multi-day campaigns
- Session data persists between games
- Character/element data is session-specific

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Firebase (Firestore + Storage)
- **Deployment**: GitHub Pages
- **Styling**: CSS3 with responsive design
- **Drag & Drop**: react-draggable

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- A Firebase project set up
- A GitHub repository

### 1. Clone the Repository
```bash
git clone https://github.com/ajchrry-cmd/Game-v2.git
cd Game-v2
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable Firestore Database:
   - Go to Firestore Database
   - Click "Create Database"
   - Start in production mode
   - Choose a location

4. Enable Storage:
   - Go to Storage
   - Click "Get Started"
   - Use default security rules for now

5. Get your Firebase config:
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click the web icon (</>)
   - Copy the configuration values

6. Create a `.env` file in the project root:
```bash
cp .env.example .env
```

7. Edit `.env` and add your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. GitHub Pages Setup

1. Go to your GitHub repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Add the following repository secrets (same values as your `.env`):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

4. Go to "Settings" → "Pages"
5. Under "Build and deployment":
   - Source: GitHub Actions

### 5. Run Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view in browser.

### 6. Deploy to GitHub Pages
```bash
npm run build
npm run deploy
```

Or simply push to the `main` branch and GitHub Actions will automatically deploy.

## Usage Guide

### First Time Setup

1. **Create a Session**
   - Click the menu button (bottom left)
   - Go to "Manage" → "Sessions"
   - Create a new session

2. **Add Players**
   - Open menu → "Manage" → "Players"
   - Add players (max 6)
   - Set their stats and choose icon style

3. **Create Items**
   - Open menu → "Manage" → "Items"
   - Create items with images, descriptions, and prices
   - Toggle "Add to Shop" for items you want in the shop

4. **Create a Map**
   - Open menu → "Manage" → "Maps"
   - Create a new map
   - Add squares with different shapes and colors
   - Save the map

5. **Create Wheels** (Optional)
   - Open menu → "Manage" → "Wheels"
   - Create preset wheels for encounters

6. **Upload Scenes** (Optional)
   - Open menu → "Manage" → "Scene Images"
   - Upload atmospheric images

### During the Game

1. **Switch Scenes**
   - Click menu button
   - Under "Scenes" section, select:
     - Map (main game board)
     - Wheels (for random events)
     - Scene Images (for storytelling)
     - Shop (to show available items)

2. **Control the Map**
   - Drag player tokens to move them
   - Players can overlap
   - Stats and inventory update in real-time

3. **Manage Players Mid-Game**
   - Open menu → "Manage" → "Players"
   - Add/remove items from inventory
   - Update Power and Money stats

4. **Spin the Wheel**
   - Select a wheel from the menu
   - Click "SPIN" button
   - Result highlights on the wheel
   - Manually switch back to other scenes

### TV Display Setup

1. Open the app on your mobile device or laptop
2. Use screen mirroring to connect to your TV:
   - **iOS**: AirPlay
   - **Android**: Cast / Smart View
   - **Windows/Mac**: HDMI or wireless display
3. The same view you see will appear on the TV
4. Control everything from your device

## Tips for Best Experience

- **Large TV Optimization**: All visuals are sized for large displays, so don't worry about text being too small
- **Clickable Elements**: Designed to be subtle and not distract from the main view
- **Session Saves**: Games automatically save every second, perfect for multi-day campaigns
- **Mobile First**: Optimized for mobile control, but works great on any device
- **Image Quality**: Upload high-resolution images for scenes and items for best TV display

## Project Structure

```
Game-v2/
├── src/
│   ├── components/
│   │   ├── Map/           # Map screen and editor
│   │   ├── Wheel/         # Spinning wheel
│   │   ├── Scenes/        # Scene viewer
│   │   ├── Shop/          # Shop display
│   │   └── UI/            # Managers and menu
│   ├── contexts/          # Game state management
│   ├── firebase/          # Firebase config
│   ├── App.jsx            # Main app component
│   └── main.jsx           # Entry point
├── .github/workflows/     # GitHub Actions
├── .env.example           # Environment template
└── package.json
```

## Firebase Security Rules

For production, update your Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Change this for production!
    }
  }
}
```

For Storage rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true; // Change this for production!
    }
  }
}
```

## Troubleshooting

**Images not uploading?**
- Check Firebase Storage is enabled
- Verify storage rules allow writes
- Check browser console for errors

**Data not persisting?**
- Verify Firestore is enabled
- Check that environment variables are set correctly
- Ensure you've created a session first

**Deployment fails?**
- Check that all GitHub secrets are set
- Verify the repository has Pages enabled
- Check GitHub Actions logs for specific errors

## Contributing

This is a personal project, but suggestions are welcome! Open an issue or submit a pull request.

## License

MIT License - Feel free to use and modify for your own games!

## Support

For issues or questions, please open an issue on GitHub.

---

**Enjoy your game! 🎲**
