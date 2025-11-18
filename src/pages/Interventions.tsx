import { useState, useEffect } from 'react';
import { db } from '../services/database';
import { interventionRecommender } from '../services/intervention-recommender';
import { interventionTemplates } from '../data/intervention-templates';
import InterventionCard from '../components/InterventionCard';
import MoodTracker from '../components/MoodTracker';
import type { InterventionTemplate, Intervention, VAD, ScoredIntervention, InterventionType } from '../types';

interface InterventionsProps {
  userId: string;
  onNavigate?: (view: 'mood' | 'dashboard' | 'personality' | 'personality-profile' | 'settings' | 'interventions' | 'onboarding') => void;
}

type ViewMode = 'browse' | 'recommended' | 'history' | 'active';
type FilterType = 'all' | 'breathing' | 'eye_exercise' | 'physical' | 'cognitive';
type FilterDifficulty = 'all' | 'easy' | 'moderate' | 'advanced';

export default function Interventions({ userId, onNavigate }: InterventionsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('recommended');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<FilterDifficulty>('all');
  const [filterDuration, setFilterDuration] = useState<number>(0); // 0 = no filter
  const [selectedIntervention, setSelectedIntervention] = useState<InterventionTemplate | null>(null);
  const [moodBefore, setMoodBefore] = useState<VAD | null>(null);
  const [recommendations, setRecommendations] = useState<ScoredIntervention[]>([]);
  const [history, setHistory] = useState<Intervention[]>([]);
  const [stats, setStats] = useState({
    totalInterventions: 0,
    completionRate: 0,
    avgEffectiveness: 0,
    favoriteType: 'breathing' as InterventionType
  });
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [trackingPhase, setTrackingPhase] = useState<'before' | 'after'>('before');

  useEffect(() => {
    loadData();
  }, [userId]);

  async function loadData() {
    // Load intervention history
    const interventionHistory = await db.getInterventions(userId, 30);
    setHistory(interventionHistory);

    // Calculate stats
    const completed = interventionHistory.filter(i => i.completed);
    const withEffectiveness = completed.filter(i => i.effectiveness !== undefined);

    const totalEffectiveness = withEffectiveness.reduce(
      (sum, i) => sum + (i.effectiveness || 0),
      0
    );

    const typeCounts: Record<string, number> = {};
    completed.forEach(i => {
      typeCounts[i.type] = (typeCounts[i.type] || 0) + 1;
    });

    const favoriteType = (Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'breathing') as InterventionType;

    setStats({
      totalInterventions: completed.length,
      completionRate: interventionHistory.length > 0 ? completed.length / interventionHistory.length : 0,
      avgEffectiveness: withEffectiveness.length > 0 ? totalEffectiveness / withEffectiveness.length : 0,
      favoriteType
    });

    // Load recommendations
    await loadRecommendations();
  }

  async function loadRecommendations() {
    const lastMood = await db.getLastMoodEntry(userId);
    if (!lastMood) return;

    const personality = await db.getPersonalityProfile(userId);
    const recentInterventions = await db.getInterventions(userId, 7);

    const recs = await interventionRecommender.getRecommendations({
      userId,
      currentMood: lastMood.vad,
      energyLevel: lastMood.context?.energy_level || 3,
      timeOfDay: interventionRecommender.getTimeOfDay(),
      personality,
      recentInterventions
    }, 6);

    setRecommendations(recs);
  }

  async function handleStartIntervention(template: InterventionTemplate) {
    setSelectedIntervention(template);
    setShowMoodTracker(true);
    setTrackingPhase('before');
  }

  async function handleMoodTracked() {
    if (trackingPhase === 'before') {
      const lastMood = await db.getLastMoodEntry(userId);
      if (lastMood) {
        setMoodBefore(lastMood.vad);
        setShowMoodTracker(false);
        setViewMode('active');
      }
    } else {
      // After mood tracked
      const lastMood = await db.getLastMoodEntry(userId);
      if (lastMood && moodBefore) {
        // Calculate and save effectiveness
        const effectiveness = interventionRecommender.calculateInterventionEffectiveness(
          moodBefore,
          lastMood.vad
        );

        // Find the intervention record and update it
        const interventions = await db.getInterventions(userId, 1);
        const lastIntervention = interventions[interventions.length - 1];
        if (lastIntervention) {
          await db.updateIntervention(lastIntervention.intervention_id, {
            mood_after: lastMood.vad,
            effectiveness
          });
        }

        // Reset and reload
        setTimeout(() => {
          setSelectedIntervention(null);
          setMoodBefore(null);
          setShowMoodTracker(false);
          setViewMode('recommended');
          loadData();
        }, 2000);
      }
    }
  }

  function handleInterventionComplete() {
    // Show mood tracker for "after" mood
    setTrackingPhase('after');
    setShowMoodTracker(true);
  }

  function handleCancelIntervention() {
    setSelectedIntervention(null);
    setMoodBefore(null);
    setShowMoodTracker(false);
    setViewMode('recommended');
  }

  // Filter interventions
  const filteredInterventions = interventionTemplates.filter(template => {
    if (filterType !== 'all' && template.type !== filterType) return false;
    if (filterDifficulty !== 'all' && template.difficulty !== filterDifficulty) return false;
    if (filterDuration > 0 && template.duration_seconds > filterDuration) return false;
    return true;
  });

  // Show mood tracker
  if (showMoodTracker) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {trackingPhase === 'before' ? 'Before we start...' : 'How do you feel now?'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {trackingPhase === 'before'
                ? 'Quick mood check-in to track your progress'
                : 'Let\'s see how the intervention helped'}
            </p>
          </div>
          <MoodTracker userId={userId} onComplete={handleMoodTracked} />
        </div>
      </div>
    );
  }

  // Show active intervention
  if (viewMode === 'active' && selectedIntervention && moodBefore) {
    return (
      <div className="min-h-screen p-6">
        <InterventionCard
          template={selectedIntervention}
          userId={userId}
          moodBefore={moodBefore}
          onComplete={handleInterventionComplete}
          onCancel={handleCancelIntervention}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        {onNavigate && (
          <button
            onClick={() => onNavigate('dashboard')}
            className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Interventions
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Science-backed techniques to boost your mood and productivity
              </p>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                ← Back to Dashboard
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Completed
              </div>
              <div className="text-2xl font-bold text-teal-600">
                {stats.totalInterventions}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Completion Rate
              </div>
              <div className="text-2xl font-bold text-teal-600">
                {Math.round(stats.completionRate * 100)}%
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Avg Effectiveness
              </div>
              <div className="text-2xl font-bold text-teal-600">
                {stats.avgEffectiveness > 0 ? `${(stats.avgEffectiveness * 100).toFixed(0)}%` : 'N/A'}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Favorite Type
              </div>
              <div className="text-2xl font-bold text-teal-600">
                {stats.favoriteType === 'breathing' && '🫁 Breathing'}
                {stats.favoriteType === 'eye_exercise' && '👁️ Eye'}
                {stats.favoriteType === 'physical' && '🧘 Physical'}
                {stats.favoriteType === 'cognitive' && '🧠 Cognitive'}
              </div>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setViewMode('recommended')}
              className={`px-4 py-2 font-semibold transition-colors ${
                viewMode === 'recommended'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              ✨ Recommended
            </button>
            <button
              onClick={() => setViewMode('browse')}
              className={`px-4 py-2 font-semibold transition-colors ${
                viewMode === 'browse'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              📚 Browse All
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`px-4 py-2 font-semibold transition-colors ${
                viewMode === 'history'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              📊 History
            </button>
          </div>
        </div>

        {/* Recommended View */}
        {viewMode === 'recommended' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Recommended for you right now
              </h2>
              {recommendations.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                  <div className="text-4xl mb-3">💭</div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Complete a mood check-in to get personalized recommendations
                  </p>
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('mood')}
                      className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                    >
                      Check-in Now
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendations.map(({ template, reasons }) => (
                    <InterventionPreviewCard
                      key={template.template_id}
                      template={template}
                      reasons={reasons}
                      onStart={() => handleStartIntervention(template)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Browse View */}
        {viewMode === 'browse' && (
          <div>
            {/* Filters */}
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={filterType}
                    onChange={e => setFilterType(e.target.value as FilterType)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Types</option>
                    <option value="breathing">🫁 Breathing</option>
                    <option value="eye_exercise">👁️ Eye Exercises</option>
                    <option value="physical">🧘 Physical</option>
                    <option value="cognitive">🧠 Cognitive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={filterDifficulty}
                    onChange={e => setFilterDifficulty(e.target.value as FilterDifficulty)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Levels</option>
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Duration
                  </label>
                  <select
                    value={filterDuration}
                    onChange={e => setFilterDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="0">Any Duration</option>
                    <option value="120">2 minutes</option>
                    <option value="300">5 minutes</option>
                    <option value="600">10 minutes</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFilterType('all');
                      setFilterDifficulty('all');
                      setFilterDuration(0);
                    }}
                    className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Intervention Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInterventions.map(template => (
                <InterventionPreviewCard
                  key={template.template_id}
                  template={template}
                  onStart={() => handleStartIntervention(template)}
                />
              ))}
            </div>

            {filteredInterventions.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-gray-600 dark:text-gray-400">
                  No interventions match your filters
                </p>
              </div>
            )}
          </div>
        )}

        {/* History View */}
        {viewMode === 'history' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Your intervention history
            </h2>
            {history.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No interventions yet. Start your first one!
                </p>
                <button
                  onClick={() => setViewMode('recommended')}
                  className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  Browse Interventions
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {history.slice().reverse().map(intervention => {
                  const template = interventionTemplates.find(
                    t => t.template_id === intervention.subtype
                  );
                  if (!template) return null;

                  return (
                    <div
                      key={intervention.intervention_id}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">
                              {template.type === 'breathing' && '🫁'}
                              {template.type === 'eye_exercise' && '👁️'}
                              {template.type === 'physical' && '🧘'}
                              {template.type === 'cognitive' && '🧠'}
                            </span>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {template.name}
                            </h3>
                            {intervention.completed && (
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-semibold rounded">
                                ✓ Completed
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {new Date(intervention.timestamp).toLocaleString()}
                          </p>
                          {intervention.completed && (
                            <div className="flex items-center gap-6 text-sm">
                              {intervention.user_rating && (
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Rating: </span>
                                  <span className="font-semibold">
                                    {intervention.user_rating === 1 && '😞'}
                                    {intervention.user_rating === 2 && '😕'}
                                    {intervention.user_rating === 3 && '😐'}
                                    {intervention.user_rating === 4 && '😊'}
                                    {intervention.user_rating === 5 && '😄'}
                                  </span>
                                </div>
                              )}
                              {intervention.effectiveness !== undefined && (
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Effectiveness: </span>
                                  <span className={`font-semibold ${
                                    intervention.effectiveness > 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {intervention.effectiveness > 0 ? '+' : ''}
                                    {Math.round(intervention.effectiveness * 100)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Preview Card Component
function InterventionPreviewCard({
  template,
  reasons,
  onStart
}: {
  template: InterventionTemplate;
  reasons?: string[];
  onStart: () => void;
}) {
  const getIcon = () => {
    switch (template.type) {
      case 'breathing':
        return '🫁';
      case 'eye_exercise':
        return '👁️';
      case 'physical':
        return '🧘';
      case 'cognitive':
        return '🧠';
    }
  };

  const getDifficultyColor = () => {
    switch (template.difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getIcon()}</span>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {template.name}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {Math.round(template.duration_seconds / 60)} min
              </p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor()}`}>
            {template.difficulty}
          </span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {template.description}
        </p>

        {reasons && reasons.length > 0 && (
          <div className="mb-4 space-y-1">
            {reasons.slice(0, 2).map((reason, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-teal-600 dark:text-teal-400">
                <span>✓</span>
                <span>{reason}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Effectiveness
          </div>
          <div className="text-sm font-semibold text-teal-600">
            {Math.round(template.avg_effectiveness * 100)}%
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Start Now
        </button>
      </div>
    </div>
  );
}
