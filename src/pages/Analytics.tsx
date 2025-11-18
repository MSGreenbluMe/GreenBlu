import { useState, useEffect } from 'react';
import { db } from '../services/database';
import MoodTrendChart from '../components/MoodTrendChart';
import PredictionAccuracyChart from '../components/PredictionAccuracyChart';
import FlowHeatmap from '../components/FlowHeatmap';
import Octopus from '../components/Octopus';
import type { MoodEntry, FlowSession } from '../types';

interface AnalyticsProps {
  userId: string;
  onNavigate: (view: 'dashboard') => void;
}

export default function Analytics({ userId, onNavigate }: AnalyticsProps) {
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [flowSessions, setFlowSessions] = useState<FlowSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'all'>('week');
  const [predictionHorizon, setPredictionHorizon] = useState<'1h' | '4h' | '8h'>('1h');
  const [showValence, setShowValence] = useState(true);
  const [showArousal, setShowArousal] = useState(true);
  const [showDominance, setShowDominance] = useState(true);

  useEffect(() => {
    loadData();
  }, [userId]);

  async function loadData() {
    try {
      const moods = await db.getMoodHistory(userId, 90);
      const flows = await db.getFlowSessions(userId, 90);

      setMoodHistory(moods);
      setFlowSessions(flows);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  }

  const stats = {
    totalEntries: moodHistory.length,
    avgValence: moodHistory.length > 0
      ? moodHistory.reduce((sum, m) => sum + m.vad.valence, 0) / moodHistory.length
      : 0,
    avgArousal: moodHistory.length > 0
      ? moodHistory.reduce((sum, m) => sum + m.vad.arousal, 0) / moodHistory.length
      : 0,
    avgDominance: moodHistory.length > 0
      ? moodHistory.reduce((sum, m) => sum + m.vad.dominance, 0) / moodHistory.length
      : 0,
    flowCount: flowSessions.length,
    avgFlowQuality: flowSessions.length > 0
      ? flowSessions.reduce((sum, f) => sum + f.flow_quality, 0) / flowSessions.length
      : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Octopus
            vad={{
              valence: stats.avgValence,
              arousal: stats.avgArousal,
              dominance: stats.avgDominance
            }}
            size={80}
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Analytics & Insights
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Deep dive into your mood patterns and AI predictions
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700 p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Check-ins</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalEntries}
            </div>
          </div>

          <div className="bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-200 dark:border-teal-800 rounded-xl p-4">
            <div className="text-sm text-teal-700 dark:text-teal-300 mb-1">Avg Valence</div>
            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {stats.avgValence.toFixed(2)}
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-4">
            <div className="text-sm text-orange-700 dark:text-orange-300 mb-1">Avg Arousal</div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats.avgArousal.toFixed(2)}
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-4">
            <div className="text-sm text-purple-700 dark:text-purple-300 mb-1">Avg Dominance</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.avgDominance.toFixed(2)}
            </div>
          </div>

          <div className="bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-200 dark:border-teal-800 rounded-xl p-4">
            <div className="text-sm text-teal-700 dark:text-teal-300 mb-1">Flow Sessions</div>
            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {stats.flowCount}
            </div>
          </div>
        </div>

        {/* Mood Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-0">
              Mood Trends Over Time
            </h2>

            {/* Controls */}
            <div className="flex flex-wrap gap-4">
              {/* Time Range */}
              <div className="flex gap-2">
                {(['day', 'week', 'month', 'all'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      timeRange === range
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {range === 'all' ? 'All' : range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>

              {/* VAD Toggles */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowValence(!showValence)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    showValence
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  V
                </button>
                <button
                  onClick={() => setShowArousal(!showArousal)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    showArousal
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  A
                </button>
                <button
                  onClick={() => setShowDominance(!showDominance)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    showDominance
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  D
                </button>
              </div>
            </div>
          </div>

          <MoodTrendChart
            moodHistory={moodHistory}
            showValence={showValence}
            showArousal={showArousal}
            showDominance={showDominance}
            timeRange={timeRange}
          />
        </div>

        {/* Prediction Accuracy */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-0">
              AI Prediction Accuracy
            </h2>

            {/* Horizon Selector */}
            <div className="flex gap-2">
              {(['1h', '4h', '8h'] as const).map(horizon => (
                <button
                  key={horizon}
                  onClick={() => setPredictionHorizon(horizon)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    predictionHorizon === horizon
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {horizon} ahead
                </button>
              ))}
            </div>
          </div>

          <PredictionAccuracyChart
            moodHistory={moodHistory}
            predictionHorizon={predictionHorizon}
          />
        </div>

        {/* Flow Heatmap */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Flow State Heatmap
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Discover when you're most likely to enter flow state based on day and time
          </p>

          <FlowHeatmap moodHistory={moodHistory} flowSessions={flowSessions} />
        </div>
      </div>
    </div>
  );
}
