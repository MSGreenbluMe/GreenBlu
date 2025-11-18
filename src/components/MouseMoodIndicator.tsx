import { useState, useEffect } from 'react';
import { mouseTracker } from '../services/mouse-tracker';
import Octopus from './Octopus';
import type { MouseMetrics, VAD } from '../types';

interface MouseMoodIndicatorProps {
  userId: string;
  compact?: boolean;
  showMetrics?: boolean;
}

export default function MouseMoodIndicator({
  userId,
  compact = false,
  showMetrics = false
}: MouseMoodIndicatorProps) {
  const [metrics, setMetrics] = useState<MouseMetrics | null>(null);
  const [smoothedVAD, setSmoothedVAD] = useState<VAD | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Initialize and start tracking
    async function init() {
      await mouseTracker.initialize(userId);
      mouseTracker.start();
      setIsTracking(true);
    }

    init();

    // Subscribe to updates
    const unsubscribe = mouseTracker.onMetricsUpdate((newMetrics) => {
      setMetrics(newMetrics);
      setSmoothedVAD(mouseTracker.getSmoothedVAD(5));
    });

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, [userId]);

  if (!isTracking || !metrics) {
    if (compact) return null;

    return (
      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Analyzing mouse patterns...
        </div>
      </div>
    );
  }

  const vad = smoothedVAD || metrics.estimated_vad;
  const confidence = metrics.confidence;

  if (compact) {
    return (
      <button
        onClick={() => setExpanded(!expanded)}
        className="relative group"
        title="Mouse-detected mood"
      >
        <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center">
          <Octopus vad={vad} size={28} />
        </div>
        {confidence > 0.5 && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
        )}

        {/* Expanded tooltip */}
        {expanded && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border-2 border-gray-200 dark:border-gray-700 p-4 z-50">
            <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Mouse-Detected Mood
            </div>
            <div className="flex justify-center mb-3">
              <Octopus vad={vad} size={60} />
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Valence:</span>
                <span className={vad.valence > 0 ? 'text-green-600' : 'text-red-600'}>
                  {vad.valence.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Arousal:</span>
                <span>{vad.arousal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Dominance:</span>
                <span>{vad.dominance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400 pt-1 border-t border-gray-200 dark:border-gray-600 mt-1">
                <span>Confidence:</span>
                <span>{(confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Mouse-Detected Mood
        </h3>
        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
          AI Estimated
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Octopus */}
        <div className="flex-shrink-0">
          <Octopus vad={vad} size={80} />
        </div>

        {/* Metrics */}
        <div className="flex-1 space-y-2">
          {/* VAD values */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Valence</div>
              <div className={`text-sm font-bold ${vad.valence > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {vad.valence.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Arousal</div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {vad.arousal.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Dominance</div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {vad.dominance.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Confidence bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500 dark:text-gray-400">Confidence</span>
              <span className="text-gray-700 dark:text-gray-300">{(confidence * 100).toFixed(0)}%</span>
            </div>
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${confidence * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed metrics toggle */}
      {showMetrics && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <MetricItem label="Avg Velocity" value={`${metrics.avg_velocity.toFixed(0)} px/s`} />
            <MetricItem label="Path Efficiency" value={`${(metrics.path_efficiency * 100).toFixed(0)}%`} />
            <MetricItem label="Hesitation" value={`${(metrics.hesitation_ratio * 100).toFixed(0)}%`} />
            <MetricItem label="Direction Changes" value={metrics.direction_changes.toString()} />
            <MetricItem label="Pauses" value={metrics.pause_count.toString()} />
            <MetricItem label="Clicks" value={metrics.click_count.toString()} />
          </div>
        </div>
      )}

      {/* Mood interpretation */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {getMoodInterpretation(vad)}
        </p>
      </div>
    </div>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500 dark:text-gray-400">{label}:</span>
      <span className="text-gray-900 dark:text-white font-medium">{value}</span>
    </div>
  );
}

function getMoodInterpretation(vad: VAD): string {
  const valence = vad.valence;
  const arousal = vad.arousal;
  const dominance = vad.dominance;

  // High valence interpretations
  if (valence > 0.3) {
    if (arousal > 0.3) {
      return "Your mouse patterns suggest high energy and positive mood - you seem engaged and focused!";
    } else {
      return "Your movements indicate a calm, content state - smooth and deliberate patterns detected.";
    }
  }

  // Low valence interpretations
  if (valence < -0.3) {
    if (arousal > 0.3) {
      return "Detecting some tension in your movements - consider taking a short break.";
    } else {
      return "Your patterns suggest low energy - a quick stretch or breathing exercise might help.";
    }
  }

  // Neutral interpretations
  if (dominance > 0.3) {
    return "Your movements show good control and precision - you seem in command.";
  } else if (dominance < -0.3) {
    return "Some hesitation detected - take your time, there's no rush.";
  }

  return "Monitoring your mouse patterns to estimate mood...";
}

// Compact indicator for floating display
export function FloatingMouseIndicator({ userId }: { userId: string }) {
  const [metrics, setMetrics] = useState<MouseMetrics | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    async function init() {
      await mouseTracker.initialize(userId);
      mouseTracker.start();
    }

    init();

    const unsubscribe = mouseTracker.onMetricsUpdate((newMetrics) => {
      setMetrics(newMetrics);
      setVisible(true);
    });

    return () => unsubscribe();
  }, [userId]);

  if (!visible || !metrics) return null;

  const vad = metrics.estimated_vad;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg border-2 border-gray-200 dark:border-gray-700 p-2 flex items-center gap-2">
        <Octopus vad={vad} size={32} />
        <div className="pr-2">
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {metrics.confidence > 0.5 ? 'Mood Detected' : 'Analyzing...'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {(metrics.confidence * 100).toFixed(0)}% confidence
          </div>
        </div>
      </div>
    </div>
  );
}
