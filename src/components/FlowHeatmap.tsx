import { useMemo } from 'react';
import type { MoodEntry, FlowSession } from '../types';

interface FlowHeatmapProps {
  moodHistory: MoodEntry[];
  flowSessions: FlowSession[];
}

export default function FlowHeatmap({ moodHistory, flowSessions }: FlowHeatmapProps) {
  const heatmapData = useMemo(() => {
    // Create 7x24 grid (day of week x hour of day)
    const grid: number[][] = Array(7)
      .fill(0)
      .map(() => Array(24).fill(0));
    const counts: number[][] = Array(7)
      .fill(0)
      .map(() => Array(24).fill(0));

    // Process mood entries
    moodHistory.forEach(entry => {
      if (entry.flow_probability > 0.4) {
        // Only count near-flow or flow states
        const date = new Date(entry.timestamp);
        const day = date.getDay(); // 0 = Sunday
        const hour = date.getHours();

        grid[day][hour] += entry.flow_probability;
        counts[day][hour]++;
      }
    });

    // Process flow sessions
    flowSessions.forEach(session => {
      const date = new Date(session.start_time);
      const day = date.getDay();
      const hour = date.getHours();

      grid[day][hour] += session.flow_quality;
      counts[day][hour]++;
    });

    // Calculate averages
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        if (counts[d][h] > 0) {
          grid[d][h] = grid[d][h] / counts[d][h];
        }
      }
    }

    return { grid, counts };
  }, [moodHistory, flowSessions]);

  const maxValue = useMemo(() => {
    let max = 0;
    heatmapData.grid.forEach(row => {
      row.forEach(val => {
        if (val > max) max = val;
      });
    });
    return max;
  }, [heatmapData]);

  const getColor = (value: number): string => {
    if (value === 0) return '#f3f4f6'; // gray-100

    const intensity = maxValue > 0 ? value / maxValue : 0;

    if (intensity > 0.8) return '#0d9488'; // teal-700 - Deep flow
    if (intensity > 0.6) return '#14b8a6'; // teal-600 - Flow
    if (intensity > 0.4) return '#2dd4bf'; // teal-400 - Near flow
    if (intensity > 0.2) return '#5eead4'; // teal-300 - Light flow
    return '#99f6e4'; // teal-200 - Minimal flow
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const cellSize = 32;
  const hasData = heatmapData.grid.some(row => row.some(val => val > 0));

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 mb-2">No flow data available yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Track your mood to see when you're most likely to be in flow
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Flow Probability
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Low</span>
          <div className="flex gap-1">
            <div className="w-6 h-6 rounded" style={{ background: '#99f6e4' }}></div>
            <div className="w-6 h-6 rounded" style={{ background: '#5eead4' }}></div>
            <div className="w-6 h-6 rounded" style={{ background: '#2dd4bf' }}></div>
            <div className="w-6 h-6 rounded" style={{ background: '#14b8a6' }}></div>
            <div className="w-6 h-6 rounded" style={{ background: '#0d9488' }}></div>
          </div>
          <span className="text-xs text-gray-500">High</span>
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Hour labels */}
          <div className="flex mb-2">
            <div className="w-12"></div>
            {hours.map(hour => (
              <div
                key={hour}
                className="text-xs text-gray-600 dark:text-gray-400 text-center"
                style={{ width: cellSize }}
              >
                {hour % 3 === 0 ? hour : ''}
              </div>
            ))}
          </div>

          {/* Grid */}
          {days.map((day, dayIndex) => (
            <div key={day} className="flex items-center mb-1">
              {/* Day label */}
              <div className="w-12 text-sm font-medium text-gray-700 dark:text-gray-300">
                {day}
              </div>

              {/* Hour cells */}
              {hours.map(hour => {
                const value = heatmapData.grid[dayIndex][hour];
                const count = heatmapData.counts[dayIndex][hour];
                const color = getColor(value);

                return (
                  <div
                    key={hour}
                    className="relative group"
                    style={{ width: cellSize, height: cellSize }}
                  >
                    <div
                      className="w-full h-full rounded border border-gray-200 dark:border-gray-600 cursor-pointer transition-transform hover:scale-110"
                      style={{ background: color }}
                      title={`${day} ${hour}:00 - Flow: ${(value * 100).toFixed(0)}% (${count} entries)`}
                    ></div>

                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        <div className="font-semibold">
                          {day} {hour}:00
                        </div>
                        <div>Flow: {(value * 100).toFixed(0)}%</div>
                        <div className="text-gray-300">{count} entries</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Peak Times Summary */}
      <div className="mt-6 p-4 bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-200 dark:border-teal-800 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          🎯 Your Peak Flow Times
        </h4>
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {getPeakTimes(heatmapData.grid, days)}
        </div>
      </div>
    </div>
  );
}

function getPeakTimes(grid: number[][], days: string[]): string {
  // Find top 3 peak times
  const peaks: { day: number; hour: number; value: number }[] = [];

  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      if (grid[d][h] > 0) {
        peaks.push({ day: d, hour: h, value: grid[d][h] });
      }
    }
  }

  peaks.sort((a, b) => b.value - a.value);
  const top3 = peaks.slice(0, 3);

  if (top3.length === 0) {
    return 'Not enough data yet. Keep tracking your mood!';
  }

  return top3
    .map(
      (p, i) =>
        `${i + 1}. ${days[p.day]} at ${p.hour}:00 (${(p.value * 100).toFixed(0)}% flow probability)`
    )
    .join(' • ');
}
