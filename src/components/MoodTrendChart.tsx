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

interface MoodTrendChartProps {
  moodHistory: MoodEntry[];
  showValence?: boolean;
  showArousal?: boolean;
  showDominance?: boolean;
  timeRange?: 'day' | 'week' | 'month' | 'all';
}

export default function MoodTrendChart({
  moodHistory,
  showValence = true,
  showArousal = true,
  showDominance = true,
  timeRange = 'week'
}: MoodTrendChartProps) {
  const chartData = useMemo(() => {
    // Filter by time range
    const now = Date.now();
    const timeRanges = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      all: Infinity
    };

    const cutoff = now - timeRanges[timeRange];
    const filtered = moodHistory.filter(entry => entry.timestamp >= cutoff);

    // Convert to chart format
    return filtered.map(entry => {
      const date = new Date(entry.timestamp);
      const timeStr = timeRange === 'day'
        ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' });

      return {
        time: timeStr,
        timestamp: entry.timestamp,
        valence: entry.vad.valence,
        arousal: entry.vad.arousal,
        dominance: entry.vad.dominance,
        flow: entry.flow_probability
      };
    });
  }, [moodHistory, timeRange]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const date = new Date(data.timestamp);

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border-2 border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          {date.toLocaleString()}
        </p>
        <div className="space-y-1 text-sm">
          {showValence && (
            <div className="flex justify-between gap-4">
              <span className="text-teal-600 font-medium">Valence:</span>
              <span className="text-gray-900 dark:text-white">{data.valence.toFixed(2)}</span>
            </div>
          )}
          {showArousal && (
            <div className="flex justify-between gap-4">
              <span className="text-orange-600 font-medium">Arousal:</span>
              <span className="text-gray-900 dark:text-white">{data.arousal.toFixed(2)}</span>
            </div>
          )}
          {showDominance && (
            <div className="flex justify-between gap-4">
              <span className="text-purple-600 font-medium">Dominance:</span>
              <span className="text-gray-900 dark:text-white">{data.dominance.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between gap-4 pt-2 border-t border-gray-200 dark:border-gray-600">
            <span className="text-gray-600 dark:text-gray-400 font-medium">Flow:</span>
            <span className="text-gray-900 dark:text-white">{(data.flow * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>
    );
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">No mood data available for this time range</p>
      </div>
    );
  }

  return (
    <div className="w-full">
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

          {/* Reference line at 0 */}
          <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />

          {/* VAD Lines */}
          {showValence && (
            <Line
              type="monotone"
              dataKey="valence"
              stroke="#14b8a6"
              strokeWidth={2}
              dot={{ fill: '#14b8a6', r: 4 }}
              activeDot={{ r: 6 }}
              name="Valence (Positive/Negative)"
            />
          )}
          {showArousal && (
            <Line
              type="monotone"
              dataKey="arousal"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ fill: '#f97316', r: 4 }}
              activeDot={{ r: 6 }}
              name="Arousal (Energy)"
            />
          )}
          {showDominance && (
            <Line
              type="monotone"
              dataKey="dominance"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', r: 4 }}
              activeDot={{ r: 6 }}
              name="Dominance (Control)"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
