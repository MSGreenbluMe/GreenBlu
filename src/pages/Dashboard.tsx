import { useState, useEffect } from 'react';
import { db } from '../services/database';
import { formatDate, getMoodEmoji, getFlowLevel } from '../lib/utils';
import type { MoodEntry, FlowSession } from '../types';

interface DashboardProps {
  onNavigate: (view: 'mood' | 'dashboard' | 'personality' | 'personality-profile' | 'settings' | 'interventions' | 'job-crafting' | 'job-matching') => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [flowSessions, setFlowSessions] = useState<FlowSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const moods = await db.getMoodHistory('default-user', 7);
      const flows = await db.getFlowSessions('default-user', 7);

      setMoodHistory(moods);
      setFlowSessions(flows);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalFlowHours = flowSessions.reduce(
    (sum, session) => sum + (session.duration_minutes || 0) / 60,
    0
  );

  const avgFlowQuality =
    flowSessions.length > 0
      ? flowSessions.reduce((sum, s) => sum + s.flow_quality, 0) / flowSessions.length
      : 0;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Your Flow Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your mood, flow states, and personal growth
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => onNavigate('mood')}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-left"
          >
            <div className="text-3xl mb-2">😊</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Mood Check-in
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Quick 15-second check-in
            </p>
          </button>

          <button
            onClick={() => onNavigate('interventions')}
            className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-left"
          >
            <div className="text-3xl mb-2">✨</div>
            <h3 className="font-semibold text-white mb-1">
              Interventions
            </h3>
            <p className="text-sm text-teal-50">
              Boost your mood & focus
            </p>
          </button>

          <button
            onClick={() => onNavigate('personality')}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-left"
          >
            <div className="text-3xl mb-2">💭</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Daily Question
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Build your personality profile
            </p>
          </button>

          <button
            onClick={() => onNavigate('personality-profile')}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-left"
          >
            <div className="text-3xl mb-2">🧠</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Your Profile
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View personality insights
            </p>
          </button>
        </div>

        {/* NEW: Career & Job Matching Section */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Revolutionary Career Matching
          </h2>
          <p className="text-purple-100 mb-6">
            Discover your ideal career path based on personality, not resumes
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => onNavigate('job-crafting')}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all text-left group"
            >
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                Job Crafting
              </h3>
              <p className="text-sm text-gray-600">
                Find roles that match your personality
              </p>
            </button>

            <button
              onClick={() => onNavigate('job-matching')}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all text-left group"
            >
              <div className="text-3xl mb-2">🔑</div>
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                Job Matching
              </h3>
              <p className="text-sm text-gray-600">
                Match candidates like key in lock
              </p>
            </button>
          </div>
        </div>

        {/* Original Settings Button */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <button
            onClick={() => onNavigate('settings')}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-left"
          >
            <div className="text-3xl mb-2">⚙️</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Settings
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Customize your experience
            </p>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Mood Check-ins (7 days)
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {moodHistory.length}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Flow Hours (7 days)
            </div>
            <div className="text-3xl font-bold text-teal-600">
              {totalFlowHours.toFixed(1)}h
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Avg Flow Quality
            </div>
            <div className="text-3xl font-bold text-teal-600">
              {(avgFlowQuality * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Recent Mood History */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Mood History
          </h2>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : moodHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No mood entries yet. Start with a quick check-in!
            </div>
          ) : (
            <div className="space-y-3">
              {moodHistory.slice(-10).reverse().map((entry) => {
                const flowLevel = getFlowLevel(entry.flow_probability);

                return (
                  <div
                    key={entry.entry_id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{getMoodEmoji(entry.vad)}</div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatDate(entry.timestamp)}
                        </div>
                        {entry.context?.activity && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {entry.context.activity}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      {flowLevel !== 'not_in_flow' && (
                        <div className="text-sm text-teal-600 dark:text-teal-400">
                          {flowLevel === 'deep_flow'
                            ? '🌊 Deep Flow'
                            : flowLevel === 'flow'
                            ? '🌊 Flow'
                            : '🌊 Near Flow'}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        V: {entry.vad.valence.toFixed(1)} | A: {entry.vad.arousal.toFixed(1)} | D:{' '}
                        {entry.vad.dominance.toFixed(1)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Coming Soon */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl shadow-lg p-6 text-white">
          <h2 className="text-2xl font-semibold mb-2">Coming Soon 🚀</h2>
          <ul className="space-y-2 text-sm">
            <li>• AI mood predictions (1h, 4h, 8h ahead)</li>
            <li>• Job crafting insights and career recommendations</li>
            <li>• Team analytics and collaboration optimization</li>
            <li>• Advanced flow state tracking and optimization</li>
            <li>• Personalized intervention scheduling</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
