import React from 'react';
import { useGame } from '../../contexts/GameContext';
import './SceneViewer.css';

function SceneViewer() {
  const { scenes, currentSceneId } = useGame();

  const currentScene = scenes.find(s => s.id === currentSceneId);

  if (!currentScene) {
    return (
      <div className="scene-viewer">
        <div className="no-scene">
          <p>No scene selected. Open the menu to select a scene.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="scene-viewer">
      <img
        src={currentScene.imageUrl}
        alt={currentScene.name}
        className="scene-image"
      />
    </div>
  );
}

export default SceneViewer;
