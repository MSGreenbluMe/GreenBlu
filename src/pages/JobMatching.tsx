// GreenBlu.ai Job Matching Page
// HR/Hiring view for posting jobs and matching candidates

import { useState, useEffect } from 'react';
import { db } from '../services/database';
import { CVGenerator } from '../services/cv-generator';
import { JobMatcher } from '../services/job-matcher';
import { roleArchetypes, getAllCategories } from '../data/role-archetypes';
import type { JobRequirement, JobMatchResult, PersonalityCV, RoleArchetype } from '../types';

interface JobMatchingProps {
  userId: string;
  onNavigate?: (view: 'mood' | 'dashboard' | 'personality' | 'personality-profile' | 'settings' | 'interventions' | 'job-crafting' | 'job-matching') => void;
}

type View = 'create-job' | 'view-matches';

export default function JobMatching({ userId, onNavigate: _onNavigate }: JobMatchingProps) {
  const [view, setView] = useState<View>('create-job');
  const [jobRequirement, setJobRequirement] = useState<JobRequirement | null>(null);
  const [matches, setMatches] = useState<JobMatchResult[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<JobMatchResult | null>(null);
  const [candidateCVs, setCandidateCVs] = useState<PersonalityCV[]>([]);
  const [_loading, setLoading] = useState(false);

  // Form state for job creation
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [teamSize, setTeamSize] = useState(5);
  const [minConfidence, setMinConfidence] = useState(70);
  const [minVerificationDays, setMinVerificationDays] = useState(60);
  const [teamBalanceNeeds, setTeamBalanceNeeds] = useState<string[]>([]);

  useEffect(() => {
    loadCandidateCVs();
  }, []);

  async function loadCandidateCVs() {
    // In a real app, this would load CVs from multiple users
    // For demo, we'll generate one CV for the current user
    try {
      const [profile, flowSessions, moodEntries] = await Promise.all([
        db.getPersonalityProfile(userId),
        db.getFlowSessions(userId, 90),
        db.getMoodHistory(userId, 90)
      ]);

      if (profile) {
        const cv = await CVGenerator.generateCV(userId, profile, flowSessions, moodEntries);
        setCandidateCVs([cv]);
      }
    } catch (error) {
      console.error('Failed to load candidate CVs:', error);
    }
  }

  function handleCreateJob() {
    if (!jobTitle || !selectedRoleId) {
      alert('Please fill in all required fields');
      return;
    }

    const newJob: JobRequirement = {
      job_id: `job_${Date.now()}`,
      title: jobTitle,
      company: company || undefined,
      role_archetype_id: selectedRoleId,
      team_size: teamSize,
      min_confidence_score: minConfidence,
      min_verification_days: minVerificationDays,
      team_personality_balance: teamBalanceNeeds.length > 0 ? {
        current_team_profile: {},
        needed_balance: teamBalanceNeeds
      } : undefined
    };

    setJobRequirement(newJob);
    setLoading(true);

    // Match all candidates
    const matchResults = JobMatcher.matchMultipleCandidates(candidateCVs, newJob);
    setMatches(matchResults);
    setLoading(false);
    setView('view-matches');
  }

  const categories = getAllCategories();

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Job Matching Platform
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find the perfect personality fit for your open positions
          </p>
        </div>

        {/* View Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-2 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setView('create-job')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                view === 'create-job'
                  ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Create Job Posting
            </button>
            <button
              onClick={() => setView('view-matches')}
              disabled={!jobRequirement}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                view === 'view-matches'
                  ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              View Matches ({matches.length})
            </button>
          </div>
        </div>

        {/* Content */}
        {view === 'create-job' ? (
          <CreateJobView
            jobTitle={jobTitle}
            setJobTitle={setJobTitle}
            company={company}
            setCompany={setCompany}
            selectedRoleId={selectedRoleId}
            setSelectedRoleId={setSelectedRoleId}
            teamSize={teamSize}
            setTeamSize={setTeamSize}
            minConfidence={minConfidence}
            setMinConfidence={setMinConfidence}
            minVerificationDays={minVerificationDays}
            setMinVerificationDays={setMinVerificationDays}
            teamBalanceNeeds={teamBalanceNeeds}
            setTeamBalanceNeeds={setTeamBalanceNeeds}
            onCreateJob={handleCreateJob}
            categories={categories}
          />
        ) : (
          <MatchesView
            jobRequirement={jobRequirement}
            matches={matches}
            selectedMatch={selectedMatch}
            setSelectedMatch={setSelectedMatch}
            candidateCVs={candidateCVs}
          />
        )}
      </div>
    </div>
  );
}

// Create Job View
function CreateJobView({
  jobTitle,
  setJobTitle,
  company,
  setCompany,
  selectedRoleId,
  setSelectedRoleId,
  teamSize,
  setTeamSize,
  minConfidence,
  setMinConfidence,
  minVerificationDays,
  setMinVerificationDays,
  teamBalanceNeeds,
  setTeamBalanceNeeds,
  onCreateJob,
  categories
}: {
  jobTitle: string;
  setJobTitle: (v: string) => void;
  company: string;
  setCompany: (v: string) => void;
  selectedRoleId: string;
  setSelectedRoleId: (v: string) => void;
  teamSize: number;
  setTeamSize: (v: number) => void;
  minConfidence: number;
  setMinConfidence: (v: number) => void;
  minVerificationDays: number;
  setMinVerificationDays: (v: number) => void;
  teamBalanceNeeds: string[];
  setTeamBalanceNeeds: (v: string[]) => void;
  onCreateJob: () => void;
  categories: string[];
}) {
  const [selectedCategory, setSelectedCategory] = useState('');

  const filteredRoles = selectedCategory
    ? roleArchetypes.filter(r => r.category === selectedCategory)
    : roleArchetypes;

  const selectedRole = roleArchetypes.find(r => r.role_id === selectedRoleId);

  const balanceOptions = [
    'High extraversion',
    'High introversion',
    'Creative thinking (high openness)',
    'Conscientious organization',
    'Agreeableness and empathy',
    'Wonder genius',
    'Invention genius',
    'Discernment genius',
    'Galvanizing genius',
    'Enablement genius',
    'Tenacity genius'
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Job Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Senior Frontend Engineer"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g., GreenBlu.ai"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role Category *
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white capitalize"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat} className="capitalize">{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role Archetype *
              </label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select a role...</option>
                {filteredRoles.map(role => (
                  <option key={role.role_id} value={role.role_id}>
                    {role.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Team Size: {teamSize}
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={teamSize}
                onChange={(e) => setTeamSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Confidence Score: {minConfidence}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={minConfidence}
                onChange={(e) => setMinConfidence(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Verification Days: {minVerificationDays}
              </label>
              <input
                type="range"
                min="0"
                max="90"
                value={minVerificationDays}
                onChange={(e) => setMinVerificationDays(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Team Balance Needs (Optional)
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Select personality traits your team needs for better balance
          </p>

          <div className="space-y-2">
            {balanceOptions.map(option => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={teamBalanceNeeds.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setTeamBalanceNeeds([...teamBalanceNeeds, option]);
                    } else {
                      setTeamBalanceNeeds(teamBalanceNeeds.filter(n => n !== option));
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={onCreateJob}
          className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
        >
          Create Job & Find Matches
        </button>
      </div>

      {/* Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Job Preview
        </h2>

        {selectedRole ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {jobTitle || 'Job Title'}
              </h3>
              {company && (
                <p className="text-gray-600 dark:text-gray-400">{company}</p>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Role: {selectedRole.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedRole.description}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Required Genius Types
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedRole.required_genius.primary.map(type => (
                  <span key={type} className="px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full text-sm capitalize">
                    {type} (Primary)
                  </span>
                ))}
                {selectedRole.required_genius.secondary.map(type => (
                  <span key={type} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm capitalize">
                    {type} (Secondary)
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Typical Tasks
              </h4>
              <ul className="space-y-2">
                {selectedRole.typical_tasks.slice(0, 5).map((task, i) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-teal-500 mt-0.5">•</span>
                    <span>{task.task} ({task.frequency})</span>
                  </li>
                ))}
              </ul>
            </div>

            {teamBalanceNeeds.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Team Balance Needs
                </h4>
                <div className="flex flex-wrap gap-2">
                  {teamBalanceNeeds.map(need => (
                    <span key={need} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                      {need}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Team Size</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{teamSize}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Min Confidence</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{minConfidence}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Min Days</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{minVerificationDays}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Select a role archetype to see preview
          </div>
        )}
      </div>
    </div>
  );
}

// Matches View
function MatchesView({
  jobRequirement,
  matches,
  selectedMatch,
  setSelectedMatch,
  candidateCVs
}: {
  jobRequirement: JobRequirement | null;
  matches: JobMatchResult[];
  selectedMatch: JobMatchResult | null;
  setSelectedMatch: (match: JobMatchResult) => void;
  candidateCVs: PersonalityCV[];
}) {
  if (!jobRequirement) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-xl text-center">
        <p className="text-gray-500">Create a job posting first</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Matches List */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Candidates ({matches.length})
          </h3>

          {matches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No candidates match your requirements
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((match) => {
                const cv = candidateCVs.find(c => c.cv_id === match.cv_id);
                return (
                  <button
                    key={match.cv_id}
                    onClick={() => setSelectedMatch(match)}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      selectedMatch?.cv_id === match.cv_id
                        ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">
                        {cv?.personality_profile.genius.primary || 'Candidate'}
                      </div>
                      <div className="text-2xl font-bold">{match.match_score}</div>
                    </div>
                    <div className="text-sm opacity-90 capitalize">
                      {match.match_quality} match
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Match Details */}
      <div className="lg:col-span-2">
        {selectedMatch ? (
          <div className="space-y-6">
            {/* Overall Match */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Match Analysis
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 capitalize">
                    {selectedMatch.match_quality} match
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold text-teal-600">{selectedMatch.match_score}</div>
                  <div className="text-sm text-gray-500">/ 100</div>
                </div>
              </div>

              {/* Component Scores */}
              <div className="grid grid-cols-5 gap-4 mb-6">
                {Object.entries(selectedMatch.component_scores).map(([key, score]) => (
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

              {/* Explanation */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedMatch.compatibility_explanation}
                </p>
              </div>

              {selectedMatch.team_balance_impact && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Team Balance Impact
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedMatch.team_balance_impact}
                  </p>
                </div>
              )}
            </div>

            {/* Strengths */}
            {selectedMatch.strengths.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Strengths
                </h4>
                <ul className="space-y-2">
                  {selectedMatch.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Concerns */}
            {selectedMatch.concerns.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Concerns
                </h4>
                <ul className="space-y-2">
                  {selectedMatch.concerns.map((concern, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">⚠</span>
                      <span className="text-gray-700 dark:text-gray-300">{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Growth Areas */}
            {selectedMatch.growth_areas.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Growth Areas
                </h4>
                <ul className="space-y-2">
                  {selectedMatch.growth_areas.map((area, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">→</span>
                      <span className="text-gray-700 dark:text-gray-300">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-xl text-center">
            <p className="text-gray-500">Select a candidate to see match details</p>
          </div>
        )}
      </div>
    </div>
  );
}
