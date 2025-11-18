// GreenBlu.ai Job Crafting Page
// Career exploration, role fit analysis, and job crafting insights

import { useState, useEffect } from 'react';
import { db } from '../services/database';
import { CVGenerator } from '../services/cv-generator';
import { RoleFitAnalyzer, type RoleFitAnalysis } from '../services/role-fit-analyzer';
import { roleArchetypes, getAllCategories, getRolesByCategory } from '../data/role-archetypes';
import PersonalityCVComponent from '../components/PersonalityCV';
import type { PersonalityCV, RoleArchetype } from '../types';

interface JobCraftingProps {
  userId: string;
  onNavigate?: (view: 'mood' | 'dashboard' | 'personality' | 'personality-profile' | 'settings' | 'interventions' | 'job-crafting' | 'job-matching') => void;
}

type Tab = 'overview' | 'cv' | 'role-fit' | 'career-paths' | 'task-energy';

export default function JobCrafting({ userId, onNavigate }: JobCraftingProps) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [cv, setCV] = useState<PersonalityCV | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleArchetype | null>(null);
  const [roleFitAnalysis, setRoleFitAnalysis] = useState<RoleFitAnalysis | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [userId]);

  useEffect(() => {
    if (selectedRole && cv) {
      const analysis = RoleFitAnalyzer.getDetailedAnalysis(
        cv.personality_profile,
        selectedRole,
        cv.flow_triggers,
        cv.energy_map.energizing_activities
      );
      setRoleFitAnalysis(analysis);
    }
  }, [selectedRole, cv]);

  async function loadData() {
    try {
      setLoading(true);

      const [profile, flowSessions, moodEntries] = await Promise.all([
        db.getPersonalityProfile(userId),
        db.getFlowSessions(userId, 90),
        db.getMoodHistory(userId, 90)
      ]);

      if (!profile) {
        setLoading(false);
        return;
      }

      // Generate CV
      const generatedCV = await CVGenerator.generateCV(userId, profile, flowSessions, moodEntries);
      setCV(generatedCV);

      // Set default selected role to top match
      if (generatedCV.role_fit_history.length > 0) {
        const topRoleId = generatedCV.role_fit_history[0].role_id;
        const topRole = roleArchetypes.find(r => r.role_id === topRoleId);
        if (topRole) {
          setSelectedRole(topRole);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Analyzing your career fit...</p>
        </div>
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
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

          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Build Your Career Profile
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Complete personality assessments and track your flow to unlock career insights
            </p>
            <button
              onClick={() => onNavigate?.('personality')}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Start Assessments
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as const, name: 'Overview', icon: '📊' },
    { id: 'cv' as const, name: 'Personality CV', icon: '📄' },
    { id: 'role-fit' as const, name: 'Role Fit Analysis', icon: '🎯' },
    { id: 'career-paths' as const, name: 'Career Paths', icon: '🚀' },
    { id: 'task-energy' as const, name: 'Task Energy', icon: '⚡' }
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Job Crafting & Career Explorer
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover roles that match your personality and craft your ideal career path
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-2 mb-6">
          <div className="flex overflow-x-auto gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab cv={cv} />}
        {activeTab === 'cv' && <PersonalityCVComponent cv={cv} />}
        {activeTab === 'role-fit' && (
          <RoleFitTab
            cv={cv}
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
            roleFitAnalysis={roleFitAnalysis}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        )}
        {activeTab === 'career-paths' && <CareerPathsTab cv={cv} />}
        {activeTab === 'task-energy' && <TaskEnergyTab cv={cv} />}
      </div>
    </div>
  );
}

// Overview Tab
function OverviewTab({ cv }: { cv: PersonalityCV }) {
  const topRoles = cv.role_fit_history.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="text-teal-600 dark:text-teal-400 text-3xl mb-2">
            {cv.personality_profile.genius.primary}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Primary Genius</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="text-blue-600 dark:text-blue-400 text-3xl mb-2 capitalize">
            {topRoles[0]?.role_title || 'Analyzing...'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Best Role Match</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="text-purple-600 dark:text-purple-400 text-3xl mb-2">
            {cv.flow_triggers.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Flow Triggers</div>
        </div>
      </div>

      {/* Top Role Matches */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Your Top 5 Role Matches
        </h2>

        <div className="space-y-4">
          {topRoles.map((roleFit, index) => (
            <div key={roleFit.role_id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 text-white flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-lg text-gray-900 dark:text-white">
                      {roleFit.role_title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {roleFit.match_quality} match
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-teal-600">{roleFit.overall_score}</div>
                  <div className="text-xs text-gray-500">/ 100</div>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-3">
                {Object.entries(roleFit.component_scores).map(([key, score]) => (
                  <div key={key}>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 text-center">
                      {key.replace('_', ' ').replace('fit', '').replace('match', '').trim()}
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full"
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-center font-semibold text-gray-900 dark:text-white mt-1">
                      {score}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Work Style Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Your Ideal Work Style
        </h2>
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-xl p-6">
          <p className="text-lg text-gray-900 dark:text-white mb-4">
            {cv.summary.ideal_work_style}
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Team Size</div>
              <div className="font-bold text-gray-900 dark:text-white capitalize">
                {cv.summary.optimal_team_size}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Autonomy</div>
              <div className="font-bold text-gray-900 dark:text-white capitalize">
                {cv.summary.autonomy_preference}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Structure</div>
              <div className="font-bold text-gray-900 dark:text-white capitalize">
                {cv.summary.structure_preference}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Role Fit Tab
function RoleFitTab({
  cv,
  selectedRole,
  setSelectedRole,
  roleFitAnalysis,
  selectedCategory,
  setSelectedCategory
}: {
  cv: PersonalityCV;
  selectedRole: RoleArchetype | null;
  setSelectedRole: (role: RoleArchetype) => void;
  roleFitAnalysis: RoleFitAnalysis | null;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}) {
  const categories = getAllCategories();
  const filteredRoles = selectedCategory === 'all'
    ? roleArchetypes
    : getRolesByCategory(selectedCategory as any);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Role Selector */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl sticky top-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Select Role</h3>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg mb-4"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat} className="capitalize">{cat}</option>
            ))}
          </select>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredRoles.map(role => {
              const fitScore = cv.role_fit_history.find(r => r.role_id === role.role_id);
              return (
                <button
                  key={role.role_id}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                    selectedRole?.role_id === role.role_id
                      ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{role.title}</span>
                    {fitScore && (
                      <span className="text-xs font-bold">{fitScore.overall_score}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Role Analysis */}
      <div className="lg:col-span-2">
        {roleFitAnalysis ? (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {roleFitAnalysis.role.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {roleFitAnalysis.role.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-5xl font-bold text-teal-600">
                    {roleFitAnalysis.fit_score.overall_score}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Overall Fit Score</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                    {roleFitAnalysis.fit_score.match_quality}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Match Quality</div>
                </div>
              </div>

              {/* Component Scores */}
              <div className="grid grid-cols-5 gap-3">
                {Object.entries(roleFitAnalysis.fit_score.component_scores).map(([key, score]) => (
                  <div key={key}>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 text-center">
                      {key.replace('_', ' ')}
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-blue-500 h-3 rounded-full"
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-center font-semibold text-gray-900 dark:text-white mt-1">
                      {score}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            {roleFitAnalysis.recommendations.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Recommendations
                </h4>
                <ul className="space-y-2">
                  {roleFitAnalysis.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Growth Areas */}
            {roleFitAnalysis.growth_areas.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Growth Areas
                </h4>
                <ul className="space-y-2">
                  {roleFitAnalysis.growth_areas.map((area, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">→</span>
                      <span className="text-gray-700 dark:text-gray-300">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-xl text-center">
            <p className="text-gray-500">Select a role to see detailed fit analysis</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Career Paths Tab
function CareerPathsTab({ cv }: { cv: PersonalityCV }) {
  const categories = getAllCategories();
  const topRolesByCategory = categories.map(category => {
    const categoryRoles = cv.role_fit_history.filter(roleFit => {
      const role = roleArchetypes.find(r => r.role_id === roleFit.role_id);
      return role?.category === category;
    });

    return {
      category,
      topRole: categoryRoles.sort((a, b) => b.overall_score - a.overall_score)[0]
    };
  }).filter(item => item.topRole);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Career Path Explorer
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Explore different career paths based on your personality and see your fit in each category
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topRolesByCategory.map(({ category, topRole }) => (
            <div key={category} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize mb-1">
                    {category}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Best fit: {topRole.role_title}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-teal-600">{topRole.overall_score}</div>
                  <div className="text-xs text-gray-500">Fit Score</div>
                </div>
              </div>

              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-teal-500 to-blue-500 h-3 rounded-full"
                  style={{ width: `${topRole.overall_score}%` }}
                ></div>
              </div>

              <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 capitalize">
                Match quality: {topRole.match_quality}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Task Energy Tab
function TaskEnergyTab({ cv }: { cv: PersonalityCV }) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Task Energy Map
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Understand which activities energize or drain you to craft your ideal workday
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Energizing */}
          <div>
            <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-4 flex items-center gap-2">
              <span>⚡</span> Energizing Activities
            </h3>
            <div className="space-y-3">
              {cv.energy_map.energizing_activities.slice(0, 10).map((activity, index) => (
                <div key={index} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {activity.activity}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Duration: {activity.duration_preference}
                      </div>
                    </div>
                    <div className="text-green-600 dark:text-green-400 font-bold text-xl">
                      +{Math.round(activity.energy_impact * 100)}
                    </div>
                  </div>
                  <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${activity.energy_impact * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Draining */}
          <div>
            <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
              <span>⬇️</span> Draining Activities
            </h3>
            <div className="space-y-3">
              {cv.energy_map.draining_activities.slice(0, 10).map((activity, index) => (
                <div key={index} className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {activity.activity}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Duration: {activity.duration_preference}
                      </div>
                    </div>
                    <div className="text-red-600 dark:text-red-400 font-bold text-xl">
                      {Math.round(activity.energy_impact * 100)}
                    </div>
                  </div>
                  <div className="w-full bg-red-200 dark:bg-red-800 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${Math.abs(activity.energy_impact) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Energy Optimization Tips
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <span className="text-2xl">💡</span>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Front-load energizing tasks</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Schedule your most energizing activities during your peak hours
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <span className="text-2xl">⏰</span>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Batch draining tasks</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Group similar low-energy tasks together and limit their duration
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <span className="text-2xl">🔄</span>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Create recovery breaks</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Schedule short breaks after draining activities to recharge
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
