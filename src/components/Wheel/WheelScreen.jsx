import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import './WheelScreen.css';

function WheelScreen() {
  const { wheels, currentWheelId, saveWheel } = useGame();
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [editingSegment, setEditingSegment] = useState(null);
  const canvasRef = useRef(null);

  const currentWheel = wheels.find(w => w.id === currentWheelId);
  const isBattleWheel = currentWheel?.type === 'battle';

  useEffect(() => {
    if (currentWheel && canvasRef.current) {
      drawWheel();
    }
  }, [currentWheel, rotation]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentWheel) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);

    const segments = currentWheel.segments;

    // Calculate total weight
    const totalWeight = segments.reduce((sum, seg) => sum + (seg.weight || 1), 0);

    // Draw segments based on their weights
    let currentAngle = 0;
    segments.forEach((segment, index) => {
      const weight = segment.weight || 1;
      const segmentAngle = (weight / totalWeight) * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + segmentAngle;

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segment.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Highlight if this is the last result
      if (currentWheel.lastResult === index) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 8;
        ctx.stroke();
      }

      // Draw text
      ctx.save();
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px Arial';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(segment.text, radius / 1.5, 0);
      ctx.restore();

      currentAngle = endAngle;
    });

    ctx.restore();

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#d4af37';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw pointer
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.moveTo(centerX, 20);
    ctx.lineTo(centerX - 20, 60);
    ctx.lineTo(centerX + 20, 60);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const handleUpdateSegment = (index, field, value) => {
    if (!isBattleWheel) return;

    const newSegments = [...currentWheel.segments];
    newSegments[index] = { ...newSegments[index], [field]: value };
    saveWheel({ ...currentWheel, segments: newSegments });
  };

  const handleAddSegment = () => {
    if (!isBattleWheel) return;

    const newSegment = {
      text: `Option ${currentWheel.segments.length + 1}`,
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      weight: 1
    };
    saveWheel({ ...currentWheel, segments: [...currentWheel.segments, newSegment] });
  };

  const handleRemoveSegment = (index) => {
    if (!isBattleWheel || currentWheel.segments.length <= 2) return;

    const newSegments = currentWheel.segments.filter((_, i) => i !== index);
    saveWheel({ ...currentWheel, segments: newSegments });
  };

  const calculatePercentage = (segments, weight) => {
    const totalWeight = segments.reduce((sum, seg) => sum + (seg.weight || 1), 0);
    return ((weight / totalWeight) * 100).toFixed(1);
  };

  const spinWheel = () => {
    if (isSpinning || !currentWheel) return;

    setIsSpinning(true);
    const spins = 5 + Math.random() * 5; // 5-10 full rotations
    const extraDegrees = Math.random() * 360;
    const totalRotation = spins * 360 + extraDegrees;
    const duration = 4000; // 4 seconds

    const startTime = Date.now();
    const startRotation = rotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentRotation = startRotation + totalRotation * easeOut;

      setRotation(currentRotation % 360);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        // Calculate which segment the pointer is pointing at
        // Pointer is at top (270 degrees in standard coords, or -90 from right)
        // We need to account for the wheel's rotation
        const pointerAngle = 270; // Top of circle
        const wheelAngle = currentRotation % 360;

        // The actual angle we're pointing at on the wheel
        const targetAngle = (pointerAngle - wheelAngle + 360) % 360;
        const targetRadians = (targetAngle * Math.PI) / 180;

        // Calculate total weight and find which segment
        const totalWeight = currentWheel.segments.reduce((sum, seg) => sum + (seg.weight || 1), 0);

        let cumulativeAngle = 0;
        let resultIndex = 0;

        for (let i = 0; i < currentWheel.segments.length; i++) {
          const weight = currentWheel.segments[i].weight || 1;
          const segmentAngle = (weight / totalWeight) * 2 * Math.PI;

          if (targetRadians >= cumulativeAngle && targetRadians < cumulativeAngle + segmentAngle) {
            resultIndex = i;
            break;
          }

          cumulativeAngle += segmentAngle;
        }

        // Save the result
        saveWheel({ ...currentWheel, lastResult: resultIndex });
      }
    };

    requestAnimationFrame(animate);
  };

  if (!currentWheel) {
    return (
      <div className="wheel-screen">
        <div className="no-wheel">
          <p>No wheel selected. Open the menu to select a wheel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wheel-screen">
      <h1 className="wheel-title">{currentWheel.name}</h1>
      <div className="wheel-container">
        <canvas
          ref={canvasRef}
          width={800}
          height={800}
          className="wheel-canvas"
        />
      </div>
      <button
        className="spin-button"
        onClick={spinWheel}
        disabled={isSpinning}
      >
        {isSpinning ? 'Spinning...' : 'SPIN'}
      </button>
      {currentWheel.lastResult !== null && currentWheel.lastResult !== undefined && (
        <div className="result-display">
          <h2>Result:</h2>
          <p>{currentWheel.segments[currentWheel.lastResult]?.text}</p>
        </div>
      )}
      {isBattleWheel && (
        <div className="battle-wheel-editor">
          <h2>Edit Segments</h2>
          <div className="segments-list">
            {currentWheel.segments.map((segment, index) => (
              <div key={index} className="segment-edit-row">
                <input
                  type="text"
                  placeholder="Name"
                  value={segment.text}
                  onChange={(e) => handleUpdateSegment(index, 'text', e.target.value)}
                  className="segment-name-input"
                />
                <input
                  type="color"
                  value={segment.color}
                  onChange={(e) => handleUpdateSegment(index, 'color', e.target.value)}
                  className="segment-color-input"
                />
                <input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Weight"
                  value={segment.weight || 1}
                  onChange={(e) => handleUpdateSegment(index, 'weight', parseInt(e.target.value) || 1)}
                  className="segment-weight-input"
                />
                <span className="segment-percentage">{calculatePercentage(currentWheel.segments, segment.weight || 1)}%</span>
                <button
                  className="remove-segment-btn"
                  onClick={() => handleRemoveSegment(index)}
                  disabled={currentWheel.segments.length <= 2}
                  title="Remove segment"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button className="add-segment-btn" onClick={handleAddSegment}>
            + Add Segment
          </button>
        </div>
      )}
    </div>
  );
}

export default WheelScreen;
