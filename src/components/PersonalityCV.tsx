// GreenBlu.ai Personality CV Component
// Beautiful visualization of the revolutionary personality-based CV

import type { PersonalityCV } from '../types';

interface PersonalityCVProps {
  cv: PersonalityCV;
  onExport?: () => void;
  compact?: boolean;
}

export default function PersonalityCVComponent({ cv, onExport, compact = false }: PersonalityCVProps) {
  const geniusIcons: Record<string, string> = {
    wonder: '🔮',
    invention: '⚙️',
    discernment: '🎯',
    galvanizing: '⚡',
    enablement: '🤝',
    tenacity: '💪'
  };

  if (compact) {
    return <CompactCV cv={cv} geniusIcons={geniusIcons} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-2xl p-8 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Personality-Based CV</h1>
            <p className="text-teal-50 text-lg">Verified by Real Behavioral Data</p>
          </div>
          {onExport && (
            <button
              onClick={onExport}
              className="px-4 py-2 bg-white text-teal-600 rounded-lg font-medium hover:bg-teal-50 transition-all"
            >
              Export
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6 mt-6">
          <div>
            <div className="text-teal-100 text-sm mb-1">Verification</div>
            <div className="text-2xl font-bold">{cv.verification_days} days</div>
            {cv.data_verified && (
              <div className="text-xs text-teal-100 mt-1 flex items-center gap-1">
                <span>✓</span> Verified
              </div>
            )}
          </div>
          <div>
            <div className="text-teal-100 text-sm mb-1">Confidence Score</div>
            <div className="text-2xl font-bold">{cv.confidence_score}/100</div>
            <div className="text-xs text-teal-100 mt-1">
              {cv.confidence_score >= 80 ? 'High' : cv.confidence_score >= 60 ? 'Good' : 'Building'}
            </div>
          </div>
          <div>
            <div className="text-teal-100 text-sm mb-1">Last Updated</div>
            <div className="text-lg font-semibold">
              {new Date(cv.last_updated).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Genius Profile */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Genius Profile</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-xl p-6">
            <div className="text-sm font-medium mb-2">Primary Genius</div>
            <div className="flex items-center gap-3 mb-2">
              <div className="text-5xl">{geniusIcons[cv.personality_profile.genius.primary]}</div>
              <div>
                <div className="text-3xl font-bold capitalize">{cv.personality_profile.genius.primary}</div>
                <div className="text-sm text-teal-100">
                  Score: {cv.personality_profile.genius[cv.personality_profile.genius.primary]}/100
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
            <div className="text-sm font-medium mb-2">Secondary Genius</div>
            <div className="flex items-center gap-3 mb-2">
              <div className="text-5xl">{geniusIcons[cv.personality_profile.genius.secondary]}</div>
              <div>
                <div className="text-3xl font-bold capitalize">{cv.personality_profile.genius.secondary}</div>
                <div className="text-sm text-blue-100">
                  Score: {cv.personality_profile.genius[cv.personality_profile.genius.secondary]}/100
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* All Genius Scores */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(geniusIcons).map(([type, icon]) => {
            const score = cv.personality_profile.genius[type as keyof typeof cv.personality_profile.genius] as number;
            return (
              <div key={type} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{icon}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{type}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{score}/100</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Work Style Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Ideal Work Style</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Work Environment</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {cv.summary.ideal_work_style}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Optimal Team Size</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                {cv.summary.optimal_team_size}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Autonomy Preference</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-blue-500 h-3 rounded-full"
                    style={{
                      width: cv.summary.autonomy_preference === 'high' ? '100%' :
                             cv.summary.autonomy_preference === 'medium' ? '60%' : '30%'
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {cv.summary.autonomy_preference}
                </span>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Structure Need</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                    style={{
                      width: cv.summary.structure_preference === 'high' ? '100%' :
                             cv.summary.structure_preference === 'medium' ? '60%' : '30%'
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {cv.summary.structure_preference}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flow Triggers */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Flow Triggers
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Activities that consistently lead to peak performance states
        </p>

        {cv.flow_triggers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No flow triggers identified yet. Continue tracking to discover your flow patterns.
          </div>
        ) : (
          <div className="space-y-3">
            {cv.flow_triggers.slice(0, 8).map((trigger, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {trigger.activity_type}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {trigger.task_description}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-teal-600">
                      {Math.round(trigger.avg_flow_score * 100)}%
                    </div>
                    <div className="text-xs text-gray-500">Flow Score</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded">
                    {trigger.complexity_level} complexity
                  </span>
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded">
                    {trigger.frequency} sessions
                  </span>
                  {trigger.conditions.time_of_day && (
                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs rounded">
                      {trigger.conditions.time_of_day}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Energy Map */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Energy Map</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Energizing */}
          <div>
            <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-4 flex items-center gap-2">
              <span>⚡</span> Energizing Activities
            </h3>
            {cv.energy_map.energizing_activities.length === 0 ? (
              <div className="text-sm text-gray-500">No data yet</div>
            ) : (
              <div className="space-y-2">
                {cv.energy_map.energizing_activities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {activity.activity}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {activity.duration_preference}
                        </div>
                      </div>
                      <div className="text-green-600 dark:text-green-400 font-bold">
                        +{Math.round(activity.energy_impact * 100)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Draining */}
          <div>
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
              <span>⬇️</span> Draining Activities
            </h3>
            {cv.energy_map.draining_activities.length === 0 ? (
              <div className="text-sm text-gray-500">No data yet</div>
            ) : (
              <div className="space-y-2">
                {cv.energy_map.draining_activities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {activity.activity}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {activity.duration_preference}
                        </div>
                      </div>
                      <div className="text-red-600 dark:text-red-400 font-bold">
                        {Math.round(activity.energy_impact * 100)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Role Matches */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Top Role Matches
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Roles that best fit your personality, genius types, and flow patterns
        </p>

        <div className="space-y-3">
          {cv.role_fit_history.slice(0, 5).map((roleFit, index) => (
            <div key={roleFit.role_id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {roleFit.role_title}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                      {roleFit.match_quality} match
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-teal-600">{roleFit.overall_score}</div>
                  <div className="text-xs text-gray-500">/ 100</div>
                </div>
              </div>

              {/* Component scores */}
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(roleFit.component_scores).map(([key, score]) => (
                  <div key={key} className="text-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {key.replace('_', ' ').replace('fit', '').replace('match', '').trim()}
                    </div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{score}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Compact CV view for previews
function CompactCV({ cv, geniusIcons }: { cv: PersonalityCV; geniusIcons: Record<string, string> }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Personality CV</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {cv.verification_days} days verified
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-teal-600">{cv.confidence_score}</div>
          <div className="text-xs text-gray-500">Confidence</div>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex-1 bg-teal-50 dark:bg-teal-900/20 rounded-lg p-3 text-center">
          <div className="text-2xl mb-1">{geniusIcons[cv.personality_profile.genius.primary]}</div>
          <div className="text-xs font-medium text-gray-900 dark:text-white capitalize">
            {cv.personality_profile.genius.primary}
          </div>
        </div>
        <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
          <div className="text-2xl mb-1">{geniusIcons[cv.personality_profile.genius.secondary]}</div>
          <div className="text-xs font-medium text-gray-900 dark:text-white capitalize">
            {cv.personality_profile.genius.secondary}
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        <div className="mb-2">
          <span className="font-medium">Work Style:</span> {cv.summary.ideal_work_style}
        </div>
        <div>
          <span className="font-medium">Top Match:</span> {cv.role_fit_history[0]?.role_title || 'Calculating...'}
        </div>
      </div>
    </div>
  );
}
