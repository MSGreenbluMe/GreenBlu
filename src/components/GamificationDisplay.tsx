import { useState, useEffect } from 'react';
import { gamificationService } from '../services/gamification-service';
import type { GamificationProgress, Achievement, Streak } from '../types';

interface GamificationDisplayProps {
  userId: string;
  compact?: boolean;
}

export default function GamificationDisplay({ userId, compact = false }: GamificationDisplayProps) {
  const [progress, setProgress] = useState<GamificationProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAchievements, setShowAchievements] = useState(false);

  useEffect(() => {
    loadProgress();
  }, [userId]);

  async function loadProgress() {
    try {
      await gamificationService.initialize(userId);
      setProgress(gamificationService.getProgress());
    } catch (error) {
      console.error('Failed to load gamification progress:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-24"></div>
    );
  }

  if (!progress) {
    return null;
  }

  const levelProgress = gamificationService.getLevelProgress();
  const nextAchievements = gamificationService.getNextAchievements(3);
  const unlockedAchievements = gamificationService.getUnlockedAchievements();
  const dailyStreak = progress.streaks.find(s => s.type === 'daily_checkin');

  if (compact) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          {/* Level */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
              {progress.level}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {progress.rank_title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {progress.total_xp} XP
              </div>
            </div>
          </div>

          {/* Streak */}
          {dailyStreak && dailyStreak.current_count > 0 && (
            <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded-lg">
              <span className="text-orange-500">🔥</span>
              <span className="font-bold text-orange-600 dark:text-orange-400">
                {dailyStreak.current_count}
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="flex items-center gap-2">
            <span className="text-yellow-500">🏆</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {progress.badges_earned}
            </span>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mt-3">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
            {progress.xp_to_next_level} XP to level {progress.level + 1}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Level Card */}
      <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-md p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
              {progress.level}
            </div>
            <div>
              <div className="text-2xl font-bold">{progress.rank_title}</div>
              <div className="text-teal-100">{progress.total_xp} Total XP</div>
            </div>
          </div>

          {/* Streak */}
          {dailyStreak && (
            <div className="text-center">
              <div className="text-3xl">🔥</div>
              <div className="font-bold text-xl">{dailyStreak.current_count}</div>
              <div className="text-xs text-teal-100">Day Streak</div>
            </div>
          )}
        </div>

        {/* XP Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Level {progress.level}</span>
            <span>Level {progress.level + 1}</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            ></div>
          </div>
          <div className="text-sm mt-1 text-teal-100 text-center">
            {progress.xp_to_next_level} XP to next level
          </div>
        </div>
      </div>

      {/* Streaks */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Streaks
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {progress.streaks.map(streak => (
            <StreakCard key={streak.streak_id} streak={streak} />
          ))}
        </div>
      </div>

      {/* Next Achievements */}
      {nextAchievements.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Next Up
          </h3>
          <div className="space-y-3">
            {nextAchievements.map(achievement => (
              <AchievementProgress key={achievement.achievement_id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      {/* Badges Button */}
      <button
        onClick={() => setShowAchievements(true)}
        className="w-full bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-4 text-center hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
      >
        <div className="text-2xl mb-1">🏆</div>
        <div className="font-medium text-purple-700 dark:text-purple-300">
          View All Achievements
        </div>
        <div className="text-sm text-purple-600 dark:text-purple-400">
          {progress.badges_earned} / {progress.achievements.length} unlocked
        </div>
      </button>

      {/* Achievements Modal */}
      {showAchievements && (
        <AchievementsModal
          achievements={progress.achievements}
          onClose={() => setShowAchievements(false)}
        />
      )}
    </div>
  );
}

function StreakCard({ streak }: { streak: Streak }) {
  const labels: Record<string, string> = {
    daily_checkin: 'Daily',
    flow_session: 'Flow',
    personality: 'Personality'
  };

  const icons: Record<string, string> = {
    daily_checkin: '🔥',
    flow_session: '🌊',
    personality: '🧠'
  };

  return (
    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="text-2xl mb-1">{icons[streak.type]}</div>
      <div className="font-bold text-xl text-gray-900 dark:text-white">
        {streak.current_count}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {labels[streak.type]}
      </div>
      {streak.longest_count > streak.current_count && (
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Best: {streak.longest_count}
        </div>
      )}
    </div>
  );
}

function AchievementProgress({ achievement }: { achievement: Achievement }) {
  const rarityColor = gamificationService.getRarityColor(achievement.rarity);

  return (
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
        style={{ backgroundColor: `${rarityColor}20` }}
      >
        {achievement.icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {achievement.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {Math.round(achievement.progress)}%
          </div>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${achievement.progress}%`,
              backgroundColor: rarityColor
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}

function AchievementsModal({
  achievements,
  onClose
}: {
  achievements: Achievement[];
  onClose: () => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'mood', label: 'Mood' },
    { id: 'flow', label: 'Flow' },
    { id: 'personality', label: 'Personality' },
    { id: 'streak', label: 'Streaks' },
    { id: 'intervention', label: 'Wellness' },
    { id: 'milestone', label: 'Milestones' }
  ];

  const filtered = selectedCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === selectedCategory);

  const unlocked = filtered.filter(a => a.unlocked);
  const locked = filtered.filter(a => !a.unlocked);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Achievements
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* Unlocked */}
          {unlocked.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                Unlocked ({unlocked.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {unlocked.map(achievement => (
                  <AchievementBadge key={achievement.achievement_id} achievement={achievement} />
                ))}
              </div>
            </div>
          )}

          {/* Locked */}
          {locked.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                Locked ({locked.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {locked.map(achievement => (
                  <AchievementBadge key={achievement.achievement_id} achievement={achievement} locked />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AchievementBadge({
  achievement,
  locked = false
}: {
  achievement: Achievement;
  locked?: boolean;
}) {
  const rarityColor = gamificationService.getRarityColor(achievement.rarity);

  return (
    <div
      className={`p-3 rounded-lg border-2 text-center transition-transform hover:scale-105 ${
        locked
          ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-60'
          : 'bg-white dark:bg-gray-800'
      }`}
      style={{
        borderColor: locked ? undefined : rarityColor
      }}
    >
      <div className={`text-3xl mb-2 ${locked ? 'grayscale' : ''}`}>
        {achievement.icon}
      </div>
      <div className="text-sm font-medium text-gray-900 dark:text-white">
        {achievement.name}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {achievement.description}
      </div>
      {!locked && achievement.points > 0 && (
        <div
          className="text-xs font-bold mt-2"
          style={{ color: rarityColor }}
        >
          +{achievement.points} XP
        </div>
      )}
      {locked && achievement.progress > 0 && (
        <div className="mt-2">
          <div className="h-1 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-500"
              style={{ width: `${achievement.progress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.round(achievement.progress)}%
          </div>
        </div>
      )}
    </div>
  );
}
