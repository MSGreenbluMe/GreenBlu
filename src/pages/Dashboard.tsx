import { useState, useEffect } from 'react';
import { db } from '../services/database';
import { formatDate, getFlowLevel } from '../lib/utils';
import { predictionPipeline } from '../services/prediction-pipeline';
import Octopus from '../components/Octopus';
import type { EnsemblePrediction } from '../services/ensemble-predictor';
import type { MoodEntry, FlowSession, PersonalityProfile } from '../types';

interface DashboardProps {
  onNavigate: (view: 'mood' | 'dashboard' | 'personality' | 'personality-profile' | 'settings' | 'interventions' | 'job-crafting' | 'job-matching') => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [flowSessions, setFlowSessions] = useState<FlowSession[]>([]);
  const [predictions, setPredictions] = useState<EnsemblePrediction | null>(null);
  const [personalityProfile, setPersonalityProfile] = useState<PersonalityProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [predictionsLoading, setPredictionsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const userId = 'default-user';
      const moods = await db.getMoodHistory(userId, 7);
      const flows = await db.getFlowSessions(userId, 7);
      const profile = await db.getPersonalityProfile(userId);

      setMoodHistory(moods);
      setFlowSessions(flows);
      setPersonalityProfile(profile || null);

      // Load predictions if we have recent mood data
      if (moods.length > 0) {
        loadPredictions(moods[moods.length - 1]);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadPredictions(latestMood: MoodEntry) {
    setPredictionsLoading(true);
    try {
      await predictionPipeline.initialize('default-user');
      const prediction = await predictionPipeline.predict(latestMood);
      setPredictions(prediction);
    } catch (error) {
      console.error('Failed to load predictions:', error);
    } finally {
      setPredictionsLoading(false);
    }
  }

  // Calculate flow streak (consecutive days with flow sessions)
  function calculateFlowStreak(): number {
    if (flowSessions.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date().setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const dayStart = currentDate - (i * 24 * 60 * 60 * 1000);
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;

      const hasFlowToday = flowSessions.some(
        session => session.start_time >= dayStart && session.start_time < dayEnd
      );

      if (hasFlowToday) {
        if (i === streak) streak++;
        else break;
      } else if (i === 0) {
        // No flow today, check yesterday
        continue;
      } else {
        break;
      }
    }

    return streak;
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
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700 p-6 hover:border-teal-500 transition-all text-left"
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
            className="bg-teal-500 rounded-xl shadow-md border-2 border-teal-600 p-6 hover:bg-teal-600 transition-all text-left"
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
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700 p-6 hover:border-blue-500 transition-all text-left"
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
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700 p-6 hover:border-purple-500 transition-all text-left"
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
        <div className="bg-purple-500 rounded-xl shadow-md border-2 border-purple-600 p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Revolutionary Career Matching
          </h2>
          <p className="text-purple-100 mb-6">
            Discover your ideal career path based on personality, not resumes
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => onNavigate('job-crafting')}
              className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 hover:border-purple-500 transition-all text-left"
            >
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Job Crafting
              </h3>
              <p className="text-sm text-gray-600">
                Find roles that match your personality
              </p>
            </button>

            <button
              onClick={() => onNavigate('job-matching')}
              className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 hover:border-purple-500 transition-all text-left"
            >
              <div className="text-3xl mb-2">🔑</div>
              <h3 className="font-semibold text-gray-900 mb-1">
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
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700 p-6 hover:border-gray-400 transition-all text-left"
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

        {/* Weekly Summary & Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Weekly Summary */}
          <div className="bg-teal-500 rounded-xl shadow-md border-2 border-teal-600 p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">This Week</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm opacity-90">Check-ins</div>
                <div className="text-3xl font-bold">{moodHistory.length}</div>
              </div>
              <div>
                <div className="text-sm opacity-90">Avg Valence</div>
                <div className="text-2xl font-bold">
                  {moodHistory.length > 0
                    ? (moodHistory.reduce((sum, m) => sum + m.vad.valence, 0) / moodHistory.length).toFixed(2)
                    : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm opacity-90">Flow Sessions</div>
                <div className="text-2xl font-bold">{flowSessions.length}</div>
              </div>
            </div>
          </div>

          {/* Personality Assessment Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Personality Profile
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="text-gray-900 dark:text-white font-semibold">
                    {personalityProfile?.assessment_progress?.toFixed(0) || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${personalityProfile?.assessment_progress || 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Questions Answered</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {personalityProfile?.questions_answered || 0}
                </div>
              </div>
              <button
                onClick={() => onNavigate('personality')}
                className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Continue Assessment
              </button>
            </div>
          </div>

          {/* Flow Streak */}
          <div className="bg-orange-500 rounded-xl shadow-md border-2 border-orange-600 p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Flow Streak</h3>
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">{calculateFlowStreak()}</div>
              <div className="text-sm opacity-90">
                {calculateFlowStreak() === 1 ? 'day' : 'days'} in a row
              </div>
              <div className="mt-4 text-2xl">
                {calculateFlowStreak() >= 7 ? '🔥🔥🔥' : calculateFlowStreak() >= 3 ? '🔥🔥' : calculateFlowStreak() >= 1 ? '🔥' : '💪'}
              </div>
              <div className="text-xs mt-2 opacity-75">
                {calculateFlowStreak() === 0
                  ? 'Start your streak today!'
                  : calculateFlowStreak() >= 7
                  ? 'Incredible! Keep it up!'
                  : 'Great work! Keep going!'}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700 p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Mood Check-ins (7 days)
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {moodHistory.length}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700 p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Flow Hours (7 days)
            </div>
            <div className="text-3xl font-bold text-teal-600">
              {totalFlowHours.toFixed(1)}h
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700 p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Avg Flow Quality
            </div>
            <div className="text-3xl font-bold text-teal-600">
              {(avgFlowQuality * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Recent Mood History */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700 p-6 mb-8">
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
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <Octopus vad={entry.vad} size={60} />
                      </div>
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
                        <div className="text-sm text-teal-600 dark:text-teal-400 font-semibold">
                          {flowLevel === 'deep_flow'
                            ? 'Deep Flow'
                            : flowLevel === 'flow'
                            ? 'Flow'
                            : 'Near Flow'}
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

        {/* AI Predictions Section */}
        {predictions && (
          <div className="bg-purple-500 rounded-xl shadow-md border-2 border-purple-600 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">
                AI Mood Predictions
              </h2>
              <span className="px-3 py-1 bg-white/30 rounded-lg text-xs text-white font-semibold">
                PREDICTED
              </span>
            </div>
            <p className="text-purple-100 mb-6">
              Based on your patterns, here's how we predict you'll feel
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1h Prediction */}
              <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-purple-700 font-semibold">In 1 Hour</span>
                </div>
                <div className="flex justify-center mb-3">
                  <Octopus vad={predictions['1h']} size={80} />
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-gray-700">
                    <span>Valence:</span>
                    <span className="font-semibold">{predictions['1h'].valence.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Arousal:</span>
                    <span className="font-semibold">{predictions['1h'].arousal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Dominance:</span>
                    <span className="font-semibold">{predictions['1h'].dominance.toFixed(2)}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-300">
                    <div className="flex justify-between text-purple-700">
                      <span>Confidence:</span>
                      <span className="font-semibold">{(predictions['1h'].confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4h Prediction */}
              <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-purple-700 font-semibold">In 4 Hours</span>
                </div>
                <div className="flex justify-center mb-3">
                  <Octopus vad={predictions['4h']} size={80} />
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-gray-700">
                    <span>Valence:</span>
                    <span className="font-semibold">{predictions['4h'].valence.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Arousal:</span>
                    <span className="font-semibold">{predictions['4h'].arousal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Dominance:</span>
                    <span className="font-semibold">{predictions['4h'].dominance.toFixed(2)}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-300">
                    <div className="flex justify-between text-purple-700">
                      <span>Confidence:</span>
                      <span className="font-semibold">{(predictions['4h'].confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 8h Prediction */}
              <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-purple-700 font-semibold">In 8 Hours</span>
                </div>
                <div className="flex justify-center mb-3">
                  <Octopus vad={predictions['8h']} size={80} />
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-gray-700">
                    <span>Valence:</span>
                    <span className="font-semibold">{predictions['8h'].valence.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Arousal:</span>
                    <span className="font-semibold">{predictions['8h'].arousal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Dominance:</span>
                    <span className="font-semibold">{predictions['8h'].dominance.toFixed(2)}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-300">
                    <div className="flex justify-between text-purple-700">
                      <span>Confidence:</span>
                      <span className="font-semibold">{(predictions['8h'].confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {predictions.metadata.recommendedActions.length > 0 && (
              <div className="mt-4 bg-white rounded-lg p-4 border-2 border-purple-300">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Recommended Actions</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  {predictions.metadata.recommendedActions.map((action: string, idx: number) => (
                    <li key={idx}>• {action}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {predictionsLoading && (
          <div className="bg-purple-500 rounded-xl shadow-md border-2 border-purple-600 p-6 mb-8">
            <div className="text-center py-8 text-white">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
              <div>Loading AI predictions...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
