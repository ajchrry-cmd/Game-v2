import React from 'react';
import './FirebaseSetupGuide.css';

function FirebaseSetupGuide() {
  return (
    <div className="setup-guide">
      <div className="setup-content">
        <h1>🔥 Firebase Setup Required</h1>
        <p className="setup-intro">
          Your app needs Firebase to save data. Follow these quick steps to get started:
        </p>

        <div className="setup-steps">
          <div className="setup-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Enable Firestore Database</h3>
              <p>Go to Firebase Console → Firestore Database → Create Database</p>
              <a
                href="https://console.firebase.google.com/project/you-just-lost-the-game-5d1d4/firestore"
                target="_blank"
                rel="noopener noreferrer"
                className="setup-link"
              >
                Open Firestore Console →
              </a>
              <ul>
                <li>Click "Create Database"</li>
                <li>Select "Start in production mode"</li>
                <li>Choose a location</li>
                <li>Click "Enable"</li>
              </ul>
            </div>
          </div>

          <div className="setup-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Set Firestore Rules</h3>
              <p>In Firestore, go to the "Rules" tab and paste this:</p>
              <pre><code>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}</code></pre>
              <p>Then click "Publish"</p>
            </div>
          </div>

          <div className="setup-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Enable Storage</h3>
              <a
                href="https://console.firebase.google.com/project/you-just-lost-the-game-5d1d4/storage"
                target="_blank"
                rel="noopener noreferrer"
                className="setup-link"
              >
                Open Storage Console →
              </a>
              <ul>
                <li>Click "Get Started"</li>
                <li>Use default rules</li>
                <li>Select same location as Firestore</li>
                <li>Click "Done"</li>
              </ul>
            </div>
          </div>

          <div className="setup-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Refresh This Page</h3>
              <p>After enabling Firestore and Storage, refresh the page and you're ready to play!</p>
              <button className="refresh-button" onClick={() => window.location.reload()}>
                🔄 Refresh Page
              </button>
            </div>
          </div>
        </div>

        <div className="setup-help">
          <p>
            <strong>Need more help?</strong> Check the{' '}
            <a
              href="https://github.com/ajchrry-cmd/Game-v2/blob/claude/dnd-game-master-app-0t2rh/SETUP.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              SETUP.md
            </a>{' '}
            file for detailed instructions.
          </p>
        </div>
      </div>
    </div>
  );
}

export default FirebaseSetupGuide;
