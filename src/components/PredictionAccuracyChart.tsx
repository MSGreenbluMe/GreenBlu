import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import type { MoodEntry } from '../types';

interface PredictionAccuracyChartProps {
  moodHistory: MoodEntry[];
  predictionHorizon: '1h' | '4h' | '8h';
}

export default function PredictionAccuracyChart({
  moodHistory,
  predictionHorizon = '1h'
}: PredictionAccuracyChartProps) {
  const chartData = useMemo(() => {
    const horizonMs = {
      '1h': 3600000,
      '4h': 14400000,
      '8h': 28800000
    };

    const horizon = horizonMs[predictionHorizon];
    const data: any[] = [];

    // Find entries with predictions and their actual outcomes
    for (let i = 0; i < moodHistory.length; i++) {
      const entry = moodHistory[i];

      // Skip if no predictions
      if (!entry.predicted_next || !entry.predicted_next[predictionHorizon]) {
        continue;
      }

      const prediction = entry.predicted_next[predictionHorizon];
      const predictedTime = entry.timestamp + horizon;

      // Find actual mood at predicted time (within 30 min window)
      const actual = moodHistory.find(
        m => Math.abs(m.timestamp - predictedTime) < 1800000 // 30 min tolerance
      );

      if (actual) {
        const date = new Date(entry.timestamp);
        const timeStr = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit'
        });

        // Calculate errors
        const valenceError = Math.abs(prediction.valence - actual.vad.valence);
        const arousalError = Math.abs(prediction.arousal - actual.vad.arousal);
        const dominanceError = Math.abs(prediction.dominance - actual.vad.dominance);
        const avgError = (valenceError + arousalError + dominanceError) / 3;

        data.push({
          time: timeStr,
          timestamp: entry.timestamp,
          predictedValence: prediction.valence,
          actualValence: actual.vad.valence,
          predictedArousal: prediction.arousal,
          actualArousal: actual.vad.arousal,
          predictedDominance: prediction.dominance,
          actualDominance: actual.vad.dominance,
          valenceError,
          arousalError,
          dominanceError,
          avgError,
          confidence: prediction.confidence || 0.5
        });
      }
    }

    return data;
  }, [moodHistory, predictionHorizon]);

  const accuracy = useMemo(() => {
    if (chartData.length === 0) return null;

    const avgError = chartData.reduce((sum, d) => sum + d.avgError, 0) / chartData.length;
    const accuracy = Math.max(0, (1 - avgError) * 100);

    return {
      accuracy: accuracy.toFixed(1),
      avgError: avgError.toFixed(3),
      samples: chartData.length
    };
  }, [chartData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border-2 border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          {data.time}
        </p>
        <div className="space-y-2 text-sm">
          <div>
            <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">Valence:</div>
            <div className="flex justify-between gap-4 text-xs">
              <span className="text-teal-600">Predicted:</span>
              <span className="text-gray-900 dark:text-white">{data.predictedValence.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4 text-xs">
              <span className="text-teal-800">Actual:</span>
              <span className="text-gray-900 dark:text-white">{data.actualValence.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4 text-xs text-red-600">
              <span>Error:</span>
              <span>{data.valenceError.toFixed(3)}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-400">Avg Error:</span>
              <span className="text-gray-900 dark:text-white">{data.avgError.toFixed(3)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
              <span className="text-gray-900 dark:text-white">{(data.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 mb-2">
          No prediction data available yet
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Make more mood check-ins to see prediction accuracy
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Accuracy Stats */}
      {accuracy && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-200 dark:border-teal-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {accuracy.accuracy}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {accuracy.avgError}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Error</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {accuracy.samples}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Samples</div>
          </div>
        </div>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="time"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            domain={[-1, 1]}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            ticks={[-1, -0.5, 0, 0.5, 1]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />

          <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />

          {/* Predicted vs Actual - Valence */}
          <Line
            type="monotone"
            dataKey="predictedValence"
            stroke="#14b8a6"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#14b8a6', r: 3 }}
            name="Predicted Valence"
          />
          <Line
            type="monotone"
            dataKey="actualValence"
            stroke="#0d9488"
            strokeWidth={2}
            dot={{ fill: '#0d9488', r: 4 }}
            name="Actual Valence"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
