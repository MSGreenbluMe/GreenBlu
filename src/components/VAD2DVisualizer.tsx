import { useState, useRef, useEffect } from 'react';
import type { VAD } from '../types';
import Octopus from './Octopus';

interface VAD2DVisualizerProps {
  vad: VAD;
  onChange: (vad: VAD) => void;
  size?: number;
}

export default function VAD2DVisualizer({ vad, onChange, size = 400 }: VAD2DVisualizerProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Convert VAD coordinates to canvas position
  const vadToPosition = (v: number, a: number) => {
    return {
      x: ((v + 1) / 2) * size,
      y: ((1 - a) / 2) * size, // Invert Y axis (higher arousal = higher on screen)
    };
  };

  // Convert canvas position to VAD coordinates
  const positionToVAD = (x: number, y: number) => {
    return {
      valence: (x / size) * 2 - 1,
      arousal: 1 - (y / size) * 2, // Invert Y axis
    };
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging && e.type !== 'click') return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = Math.max(0, Math.min(size, e.clientX - rect.left));
    const y = Math.max(0, Math.min(size, e.clientY - rect.top));

    const { valence, arousal } = positionToVAD(x, y);

    onChange({
      valence: Math.max(-1, Math.min(1, valence)),
      arousal: Math.max(-1, Math.min(1, arousal)),
      dominance: vad.dominance,
    });
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    handleMouseMove(e);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const position = vadToPosition(vad.valence, vad.arousal);

  // Calculate point size based on dominance
  const pointSize = 20 + vad.dominance * 20;

  // Get zone color
  const getZoneColor = (v: number, a: number): string => {
    // Flow zone: V[0.6-0.9], A[0.5-0.8]
    const inFlowZone = v >= 0.6 && v <= 0.9 && a >= 0.5 && a <= 0.8;
    if (inFlowZone) return 'rgba(20, 184, 166, 0.2)'; // Teal

    if (v > 0.3 && a > 0.3) return 'rgba(52, 211, 153, 0.1)'; // Green (energized & happy)
    if (v > 0.3 && a < -0.3) return 'rgba(96, 165, 250, 0.1)'; // Blue (calm & content)
    if (v < -0.3 && a > 0.3) return 'rgba(251, 146, 60, 0.1)'; // Orange (stressed)
    if (v < -0.3 && a < -0.3) return 'rgba(139, 92, 246, 0.1)'; // Purple (sad)

    return 'rgba(156, 163, 175, 0.1)'; // Gray (neutral)
  };

  return (
    <div className="space-y-4">
      {/* 2D Space */}
      <div className="relative">
        <div
          ref={canvasRef}
          className="relative border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-crosshair select-none bg-white dark:bg-gray-800"
          style={{ width: size, height: size }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
        >
          {/* Background zones */}
          <svg className="absolute inset-0 pointer-events-none" width={size} height={size}>
            {/* Flow zone highlight */}
            <rect
              x={vadToPosition(0.6, 0.8).x}
              y={vadToPosition(0.6, 0.8).y}
              width={vadToPosition(0.9, 0.5).x - vadToPosition(0.6, 0.8).x}
              height={vadToPosition(0.9, 0.5).y - vadToPosition(0.6, 0.8).y}
              fill="rgba(20, 184, 166, 0.15)"
              stroke="#14b8a6"
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            {/* Grid lines */}
            <line
              x1={size / 2}
              y1={0}
              x2={size / 2}
              y2={size}
              stroke="#d1d5db"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            <line
              x1={0}
              y1={size / 2}
              x2={size}
              y2={size / 2}
              stroke="#d1d5db"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
          </svg>

          {/* Labels */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-600 dark:text-gray-400 pointer-events-none">
            High Arousal
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-600 dark:text-gray-400 pointer-events-none">
            Low Arousal
          </div>
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600 dark:text-gray-400 pointer-events-none -rotate-90">
            Negative
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600 dark:text-gray-400 pointer-events-none rotate-90">
            Positive
          </div>

          {/* Flow zone label */}
          <div className="absolute text-xs font-semibold text-teal-600 dark:text-teal-400 pointer-events-none"
            style={{
              left: vadToPosition(0.75, 0.65).x,
              top: vadToPosition(0.75, 0.65).y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            FLOW
          </div>

          {/* Current position indicator */}
          <div
            className="absolute rounded-full bg-teal-500 transition-all duration-100 pointer-events-none border-2 border-white shadow-lg"
            style={{
              left: position.x,
              top: position.y,
              width: pointSize,
              height: pointSize,
              transform: 'translate(-50%, -50%)',
              opacity: 0.8,
            }}
          >
            <div className="absolute inset-0 rounded-full bg-teal-500 animate-ping opacity-75"></div>
          </div>

          {/* Octopus at current position */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: position.x,
              top: position.y - 60,
              transform: 'translate(-50%, 0)',
            }}
          >
            <Octopus vad={vad} size={80} />
          </div>
        </div>
      </div>

      {/* Dominance slider */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Dominance: How in control do you feel?
          <span className="float-right text-teal-600">
            {vad.dominance > 0.3 ? 'In Control' : vad.dominance < -0.3 ? 'Overwhelmed' : 'Neutral'}
          </span>
        </label>
        <input
          type="range"
          min="-1"
          max="1"
          step="0.1"
          value={vad.dominance}
          onChange={(e) => onChange({ ...vad, dominance: parseFloat(e.target.value) })}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Overwhelmed</span>
          <span>Neutral</span>
          <span>In Control</span>
        </div>
      </div>

      {/* Current values display */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-gray-600 dark:text-gray-400">Valence</div>
          <div className="font-semibold text-gray-900 dark:text-white">{vad.valence.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-600 dark:text-gray-400">Arousal</div>
          <div className="font-semibold text-gray-900 dark:text-white">{vad.arousal.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-600 dark:text-gray-400">Dominance</div>
          <div className="font-semibold text-gray-900 dark:text-white">{vad.dominance.toFixed(2)}</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Click or drag on the space above to set your mood. The flow zone is highlighted in teal.
      </div>
    </div>
  );
}
