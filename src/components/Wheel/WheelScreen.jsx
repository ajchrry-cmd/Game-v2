import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import './WheelScreen.css';

function WheelScreen() {
  const {
    wheels,
    currentWheelId,
    saveWheel,
    wheelRotation,
    setWheelRotation,
    wheelLastResult,
    setWheelLastResult,
    wheelSpinActive,
    setWheelSpinActive,
    wheelSpinStartTime,
    setWheelSpinStartTime,
    wheelSpinStartRotation,
    setWheelSpinStartRotation,
    wheelSpinTargetRotation,
    setWheelSpinTargetRotation,
    wheelSpinDuration,
    setWheelSpinDuration
  } = useGame();
  const [isSpinning, setIsSpinning] = useState(false);
  const [editingSegment, setEditingSegment] = useState(null);
  const canvasRef = useRef(null);
  const lastAnimatedSpinTime = useRef(null); // Track which spin we last animated

  const currentWheel = wheels.find(w => w.id === currentWheelId);
  const isBattleWheel = currentWheel?.type === 'battle';

  useEffect(() => {
    if (currentWheel && canvasRef.current) {
      drawWheel();
    }
  }, [currentWheel, wheelRotation, wheelLastResult]);

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
    ctx.rotate((wheelRotation * Math.PI) / 180);

    const segments = currentWheel.segments;
    const isJanky = currentWheel.type === 'janky';

    // Calculate total weight
    const totalWeight = segments.reduce((sum, seg) => sum + (seg.weight || 1), 0);

    // Draw segments based on their weights
    let currentAngle = 0;
    segments.forEach((segment, index) => {
      const weight = segment.weight || 1;
      const segmentAngle = (weight / totalWeight) * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + segmentAngle;

      if (isJanky) {
        // Draw jagged/bumpy segment
        ctx.beginPath();
        ctx.moveTo(0, 0);

        // Create jagged edge by drawing irregular points along the arc
        const numPoints = 30;
        for (let i = 0; i <= numPoints; i++) {
          const angle = startAngle + (segmentAngle * i) / numPoints;
          // Random variation in radius to create bumpy effect
          const radiusVariation = radius * (0.85 + Math.random() * 0.15);
          const x = Math.cos(angle) * radiusVariation;
          const y = Math.sin(angle) * radiusVariation;
          ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.fillStyle = segment.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        // Draw normal smooth segment
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = segment.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Highlight if this is the last result
      if (wheelLastResult === index) {
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

    // Draw pointer (on the right side)
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.moveTo(canvas.width - 20, centerY);  // Right side tip
    ctx.lineTo(canvas.width - 60, centerY - 20);  // Top left of triangle
    ctx.lineTo(canvas.width - 60, centerY + 20);  // Bottom left of triangle
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
    if (wheelSpinActive || !currentWheel) return;

    // Calculate spin parameters
    const spins = 5 + Math.random() * 5; // 5-10 full rotations
    const extraDegrees = Math.random() * 360;
    const totalRotation = spins * 360 + extraDegrees;
    const duration = 4000; // 4 seconds
    const targetRotation = wheelRotation + totalRotation;

    // Set spin state (this will sync to all users and trigger animations)
    setWheelSpinActive(true);
    setWheelSpinStartTime(Date.now());
    setWheelSpinStartRotation(wheelRotation);
    setWheelSpinTargetRotation(targetRotation);
    setWheelSpinDuration(duration);
  };

  // Animation effect - runs when spin state changes
  useEffect(() => {
    // Only start animation if we have valid spin parameters and a start time
    if (!wheelSpinStartTime || !currentWheel || wheelSpinDuration === 0) return;

    // Check if we've already animated this spin
    if (lastAnimatedSpinTime.current === wheelSpinStartTime) return;

    // Mark this spin as being animated
    lastAnimatedSpinTime.current = wheelSpinStartTime;

    // Check if this spin is still in progress based on elapsed time
    const elapsed = Date.now() - wheelSpinStartTime;
    if (elapsed >= wheelSpinDuration) {
      // Spin already completed before we got here, just set final state
      const finalRotation = wheelSpinTargetRotation % 360;
      setWheelRotation(finalRotation);
      setIsSpinning(false);
      return;
    }

    console.log('Starting wheel animation, elapsed:', elapsed, 'ms');
    setIsSpinning(true);
    let animationFrame;
    let hasCompleted = false;

    const animate = () => {
      const elapsed = Date.now() - wheelSpinStartTime;
      const progress = Math.min(elapsed / wheelSpinDuration, 1);

      // Easing function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentRotation = wheelSpinStartRotation + (wheelSpinTargetRotation - wheelSpinStartRotation) * easeOut;

      setWheelRotation(currentRotation % 360);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else if (!hasCompleted) {
        hasCompleted = true;
        setIsSpinning(false);

        // Calculate which segment the pointer is pointing at
        const wheelAngle = currentRotation % 360;
        const targetAngle = (360 - wheelAngle) % 360;
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

        // Save the result (only set these once per animation)
        console.log('Wheel animation completed, result:', resultIndex);
        setWheelLastResult(resultIndex);

        // Clear spin state after a delay to prevent rapid re-spins
        setTimeout(() => {
          setWheelSpinActive(false);
        }, 100);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    // Cleanup animation on unmount or when spin parameters change
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [wheelSpinStartTime, wheelSpinStartRotation, wheelSpinTargetRotation, wheelSpinDuration, currentWheel]);

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
      {wheelLastResult !== null && wheelLastResult !== undefined && (
        <div className="result-display">
          <h2>Result:</h2>
          <p>{currentWheel.segments[wheelLastResult]?.text}</p>
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
