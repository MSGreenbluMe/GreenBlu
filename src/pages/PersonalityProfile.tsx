// GreenBlu.ai Personality Profile Visualization Page
// Comprehensive display of all personality frameworks

import { useState, useEffect } from 'react';
import { db } from '../services/database';
import { QuestionSelector } from '../services/question-selector';
import type { PersonalityProfile, PersonalityResponse } from '../types';

interface PersonalityProfilePageProps {
  userId: string;
  onNavigate?: (view: string) => void;
}

export default function PersonalityProfilePage({ userId, onNavigate }: PersonalityProfilePageProps) {
  const [profile, setProfile] = useState<PersonalityProfile | null>(null);
  const [responses, setResponses] = useState<PersonalityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'big_five' | 'mbti' | 'disc' | 'enneagram' | 'genius' | 'strengths' | 'derived'>('big_five');

  useEffect(() => {
    loadProfile();
  }, [userId]);

  async function loadProfile() {
    try {
      setLoading(true);
      const profileData = await db.getPersonalityProfile(userId);
      const responsesData = await db.getPersonalityResponses(userId);

      setProfile(profileData || null);
      setResponses(responsesData);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your personality profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
            <div className="text-6xl mb-4">🧠</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Start Building Your Personality Profile
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Answer daily questions to unlock deep insights about yourself
            </p>
            <button
              onClick={() => onNavigate?.('personality')}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Answer Your First Question
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressBreakdown = QuestionSelector.getProgressBreakdown(responses);

  // Tab configuration
  const tabs = [
    { id: 'big_five', name: 'Big Five', icon: '🎯' },
    { id: 'mbti', name: 'MBTI', icon: '🧩' },
    { id: 'disc', name: 'DISC', icon: '💼' },
    { id: 'enneagram', name: 'Enneagram', icon: '⭐' },
    { id: 'genius', name: 'Genius Types', icon: '💡' },
    { id: 'strengths', name: 'Strengths', icon: '💪' },
    { id: 'derived', name: 'Derived Traits', icon: '🎨' }
  ] as const;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Your Personality Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive insights from {profile.questions_answered} questions answered
          </p>
        </div>

        {/* Overall Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Assessment Progress
            </h2>
            <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {Math.round(profile.assessment_progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-teal-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${profile.assessment_progress}%` }}
            ></div>
          </div>

          {/* Framework Progress */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {progressBreakdown.map(item => (
              <div key={item.framework} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 capitalize">
                  {item.framework.replace('_', ' ')}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {item.answered}/{item.total}
                  </span>
                  <span className="text-xs text-teal-600 dark:text-teal-400">
                    {Math.round(item.percentage)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-2 mb-6">
          <div className="flex overflow-x-auto gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
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

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          {activeTab === 'big_five' && <BigFiveView profile={profile} />}
          {activeTab === 'mbti' && <MBTIView profile={profile} />}
          {activeTab === 'disc' && <DISCView profile={profile} />}
          {activeTab === 'enneagram' && <EnneagramView profile={profile} />}
          {activeTab === 'genius' && <GeniusView profile={profile} />}
          {activeTab === 'strengths' && <StrengthsView profile={profile} />}
          {activeTab === 'derived' && <DerivedTraitsView profile={profile} />}
        </div>
      </div>
    </div>
  );
}

// Big Five View
function BigFiveView({ profile }: { profile: PersonalityProfile }) {
  const dimensions = [
    { key: 'openness', label: 'Openness to Experience', color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { key: 'conscientiousness', label: 'Conscientiousness', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { key: 'extraversion', label: 'Extraversion', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    { key: 'agreeableness', label: 'Agreeableness', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    { key: 'neuroticism', label: 'Neuroticism', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' }
  ];

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Big Five Personality Traits
      </h3>

      <div className="space-y-6">
        {dimensions.map(dim => {
          const score = profile.big_five[dim.key as keyof typeof profile.big_five] as number;
          const confidence = profile.big_five.confidence[dim.key as keyof typeof profile.big_five.confidence] as number;

          return (
            <div key={dim.key}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900 dark:text-white">{dim.label}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${dim.color}`}>{score}</span>
                  <span className="text-xs text-gray-500">
                    ({Math.round(confidence * 100)}% confidence)
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative overflow-hidden">
                <div
                  className={`${dim.bg} h-4 rounded-full transition-all duration-500`}
                  style={{ width: `${score}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                  {score < 40 && 'Low'}
                  {score >= 40 && score <= 60 && 'Moderate'}
                  {score > 60 && 'High'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// MBTI View
function MBTIView({ profile }: { profile: PersonalityProfile }) {
  const dimensions = [
    { key: 'EI', label: 'Extraversion vs Introversion', left: 'Introvert', right: 'Extravert' },
    { key: 'SN', label: 'Sensing vs Intuition', left: 'Sensing', right: 'Intuitive' },
    { key: 'TF', label: 'Thinking vs Feeling', left: 'Thinking', right: 'Feeling' },
    { key: 'JP', label: 'Judging vs Perceiving', left: 'Judging', right: 'Perceiving' }
  ];

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Myers-Briggs Type Indicator (MBTI)
      </h3>
      {profile.mbti.type && (
        <div className="mb-6 inline-block">
          <div className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-8 py-4 rounded-xl">
            <div className="text-sm font-medium mb-1">Your Type</div>
            <div className="text-4xl font-bold tracking-wider">{profile.mbti.type}</div>
            <div className="text-xs mt-1 opacity-90">
              {Math.round(profile.mbti.confidence * 100)}% confidence
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {dimensions.map(dim => {
          const score = profile.mbti[dim.key as keyof typeof profile.mbti] as number;
          const percentage = ((score + 100) / 200) * 100;

          return (
            <div key={dim.key}>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {dim.label}
              </div>
              <div className="relative">
                <div className="w-full bg-gradient-to-r from-blue-200 via-gray-200 to-green-200 dark:from-blue-900/30 dark:via-gray-700 dark:to-green-900/30 rounded-full h-8">
                  <div
                    className="absolute top-1 w-6 h-6 bg-teal-500 rounded-full border-2 border-white shadow-lg transition-all duration-500"
                    style={{ left: `calc(${percentage}% - 12px)` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                  <span>{dim.left}</span>
                  <span className="font-medium">{score > 0 ? '+' : ''}{score}</span>
                  <span>{dim.right}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// DISC View
function DISCView({ profile }: { profile: PersonalityProfile }) {
  const dimensions = [
    { key: 'dominance', label: 'Dominance (D)', description: 'Direct, results-oriented', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
    { key: 'influence', label: 'Influence (I)', description: 'Outgoing, enthusiastic', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    { key: 'steadiness', label: 'Steadiness (S)', description: 'Patient, supportive', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    { key: 'conscientiousness', label: 'Conscientiousness (C)', description: 'Analytical, precise', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' }
  ];

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        DISC Personality Profile
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {Math.round(profile.disc.confidence * 100)}% confidence
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dimensions.map(dim => {
          const score = profile.disc[dim.key as keyof typeof profile.disc] as number;

          return (
            <div key={dim.key} className={`${dim.bg} rounded-xl p-6`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className={`text-lg font-bold ${dim.color}`}>{dim.label}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{dim.description}</p>
                </div>
                <div className={`text-3xl font-bold ${dim.color}`}>{score}</div>
              </div>
              <div className="w-full bg-white dark:bg-gray-800 rounded-full h-3">
                <div
                  className={`${dim.bg} h-3 rounded-full transition-all duration-500 border-2 border-current ${dim.color}`}
                  style={{ width: `${score}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Enneagram View
function EnneagramView({ profile }: { profile: PersonalityProfile }) {
  const types = [
    { num: 1, name: 'The Perfectionist', desc: 'Principled, purposeful, self-controlled' },
    { num: 2, name: 'The Helper', desc: 'Generous, demonstrative, people-pleasing' },
    { num: 3, name: 'The Achiever', desc: 'Success-oriented, pragmatic, driven' },
    { num: 4, name: 'The Individualist', desc: 'Sensitive, withdrawn, expressive' },
    { num: 5, name: 'The Investigator', desc: 'Perceptive, innovative, isolated' },
    { num: 6, name: 'The Loyalist', desc: 'Committed, security-oriented, anxious' },
    { num: 7, name: 'The Enthusiast', desc: 'Spontaneous, versatile, scattered' },
    { num: 8, name: 'The Challenger', desc: 'Self-confident, decisive, confrontational' },
    { num: 9, name: 'The Peacemaker', desc: 'Receptive, reassuring, complacent' }
  ];

  const primaryType = types.find(t => t.num === profile.enneagram.primary_type);

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Enneagram Personality Type
      </h3>

      {primaryType && (
        <div className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-6">
          <div className="text-sm font-medium mb-2">Your Primary Type</div>
          <div className="text-4xl font-bold mb-2">
            Type {primaryType.num} {profile.enneagram.wing && `(Wing ${profile.enneagram.wing})`}
          </div>
          <div className="text-xl font-semibold mb-1">{primaryType.name}</div>
          <div className="text-sm opacity-90">{primaryType.desc}</div>
          <div className="text-xs mt-3 opacity-80">
            {Math.round(profile.enneagram.confidence * 100)}% confidence
          </div>
        </div>
      )}

      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">All Type Scores</h4>
      <div className="grid grid-cols-3 gap-4">
        {types.map((type, index) => {
          const score = profile.enneagram.type_scores[index];
          const isPrimary = type.num === profile.enneagram.primary_type;

          return (
            <div
              key={type.num}
              className={`p-4 rounded-lg border-2 transition-all ${
                isPrimary
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {type.num}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {type.name}
              </div>
              <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                {score}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Genius Types View
function GeniusView({ profile }: { profile: PersonalityProfile }) {
  const types = [
    { key: 'wonder', label: 'Wonder', icon: '🔮', desc: 'Curiosity and exploration' },
    { key: 'invention', label: 'Invention', icon: '⚙️', desc: 'Creating and building' },
    { key: 'discernment', label: 'Discernment', icon: '🎯', desc: 'Wise judgment' },
    { key: 'galvanizing', label: 'Galvanizing', icon: '⚡', desc: 'Inspiring action' },
    { key: 'enablement', label: 'Enablement', icon: '🤝', desc: 'Empowering others' },
    { key: 'tenacity', label: 'Tenacity', icon: '💪', desc: 'Persistent determination' }
  ];

  const primaryType = types.find(t => t.key === profile.genius.primary);
  const secondaryType = types.find(t => t.key === profile.genius.secondary);

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Your Genius Types
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {primaryType && (
          <div className="bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-xl p-6">
            <div className="text-sm font-medium mb-2">Primary Genius</div>
            <div className="text-4xl mb-2">{primaryType.icon}</div>
            <div className="text-2xl font-bold mb-1">{primaryType.label}</div>
            <div className="text-sm opacity-90">{primaryType.desc}</div>
          </div>
        )}
        {secondaryType && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-6">
            <div className="text-sm font-medium mb-2">Secondary Genius</div>
            <div className="text-4xl mb-2">{secondaryType.icon}</div>
            <div className="text-2xl font-bold mb-1">{secondaryType.label}</div>
            <div className="text-sm opacity-90">{secondaryType.desc}</div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {types.map(type => {
          const score = profile.genius[type.key as keyof typeof profile.genius] as number;

          return (
            <div key={type.key}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{type.icon}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{type.label}</span>
                </div>
                <span className="text-lg font-bold text-teal-600">{score}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-teal-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${score}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        {Math.round(profile.genius.confidence * 100)}% confidence
      </div>
    </div>
  );
}

// Strengths View
function StrengthsView({ profile }: { profile: PersonalityProfile }) {
  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Your Top Strengths
      </h3>

      {profile.strengths.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Answer more questions to discover your strengths
        </div>
      ) : (
        <div className="space-y-4">
          {profile.strengths.map((strength, index) => (
            <div
              key={strength.name}
              className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-xl p-6"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 text-white flex items-center justify-center font-bold">
                      {strength.rank}
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                      {strength.name.replace('_', ' ')}
                    </h4>
                  </div>
                </div>
                <div className="text-2xl font-bold text-teal-600">
                  {strength.score}
                </div>
              </div>
              <div className="w-full bg-white dark:bg-gray-800 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-teal-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${strength.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Derived Traits View
function DerivedTraitsView({ profile }: { profile: PersonalityProfile }) {
  const traits = [
    { key: 'stress_resilience', label: 'Stress Resilience', icon: '🛡️', desc: 'Ability to handle pressure' },
    { key: 'optimism', label: 'Optimism', icon: '☀️', desc: 'Positive outlook on life' },
    { key: 'flow_tendency', label: 'Flow Tendency', icon: '🌊', desc: 'Likelihood to enter flow states' },
    { key: 'collaboration_preference', label: 'Collaboration', icon: '👥', desc: 'Preference for teamwork' },
    { key: 'structure_need', label: 'Structure Need', icon: '📋', desc: 'Need for organization' },
    { key: 'energy_baseline', label: 'Energy Level', icon: '⚡', desc: 'Natural energy baseline' },
    { key: 'recovery_speed', label: 'Recovery Speed', icon: '🔄', desc: 'Bounce back from setbacks' },
    { key: 'risk_tolerance', label: 'Risk Tolerance', icon: '🎲', desc: 'Comfort with uncertainty' }
  ];

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Derived Personality Traits
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        These traits are calculated from your responses across all frameworks
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {traits.map(trait => {
          const score = profile.derived[trait.key as keyof typeof profile.derived];

          return (
            <div key={trait.key} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{trait.icon}</div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{trait.label}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{trait.desc}</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-teal-600">{score}</div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-teal-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${score}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
