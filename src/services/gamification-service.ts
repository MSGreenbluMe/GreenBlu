// Gamification Service for GreenBlu.ai
// Handles achievements, streaks, XP, and badges

import type {
  Achievement,
  Streak,
  GamificationProgress,
  XPEvent,
  AchievementCategory,
  AchievementRarity
} from '../types';

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlocked' | 'unlocked_at' | 'progress'>[] = [
  // Mood achievements
  {
    achievement_id: 'first_checkin',
    name: 'First Steps',
    description: 'Complete your first mood check-in',
    category: 'mood',
    rarity: 'common',
    icon: '🌱',
    points: 10,
    requirement: { type: 'mood_checkins', target: 1 }
  },
  {
    achievement_id: 'mood_10',
    name: 'Self-Aware',
    description: 'Complete 10 mood check-ins',
    category: 'mood',
    rarity: 'common',
    icon: '🎯',
    points: 25,
    requirement: { type: 'mood_checkins', target: 10 }
  },
  {
    achievement_id: 'mood_50',
    name: 'Mood Master',
    description: 'Complete 50 mood check-ins',
    category: 'mood',
    rarity: 'uncommon',
    icon: '🏆',
    points: 100,
    requirement: { type: 'mood_checkins', target: 50 }
  },
  {
    achievement_id: 'mood_100',
    name: 'Emotional Intelligence',
    description: 'Complete 100 mood check-ins',
    category: 'mood',
    rarity: 'rare',
    icon: '💎',
    points: 250,
    requirement: { type: 'mood_checkins', target: 100 }
  },
  {
    achievement_id: 'positive_day',
    name: 'Sunny Day',
    description: 'Maintain positive valence for a full day',
    category: 'mood',
    rarity: 'uncommon',
    icon: '☀️',
    points: 50,
    requirement: { type: 'positive_day', target: 1 }
  },

  // Flow achievements
  {
    achievement_id: 'first_flow',
    name: 'In The Zone',
    description: 'Enter flow state for the first time',
    category: 'flow',
    rarity: 'common',
    icon: '🌊',
    points: 20,
    requirement: { type: 'flow_sessions', target: 1 }
  },
  {
    achievement_id: 'flow_10',
    name: 'Flow Seeker',
    description: 'Complete 10 flow sessions',
    category: 'flow',
    rarity: 'uncommon',
    icon: '💫',
    points: 75,
    requirement: { type: 'flow_sessions', target: 10 }
  },
  {
    achievement_id: 'flow_master',
    name: 'Flow Master',
    description: 'Complete 50 flow sessions',
    category: 'flow',
    rarity: 'rare',
    icon: '🌟',
    points: 200,
    requirement: { type: 'flow_sessions', target: 50 }
  },
  {
    achievement_id: 'deep_flow',
    name: 'Deep Diver',
    description: 'Achieve deep flow state (quality > 0.9)',
    category: 'flow',
    rarity: 'rare',
    icon: '🔮',
    points: 150,
    requirement: { type: 'deep_flow', target: 1 }
  },
  {
    achievement_id: 'flow_hour',
    name: 'Hour of Power',
    description: 'Maintain flow for 60+ minutes',
    category: 'flow',
    rarity: 'epic',
    icon: '⚡',
    points: 300,
    requirement: { type: 'flow_duration', target: 60 }
  },

  // Personality achievements
  {
    achievement_id: 'personality_start',
    name: 'Know Thyself',
    description: 'Answer your first personality question',
    category: 'personality',
    rarity: 'common',
    icon: '🧠',
    points: 15,
    requirement: { type: 'personality_questions', target: 1 }
  },
  {
    achievement_id: 'personality_50',
    name: 'Self Discovery',
    description: 'Answer 50 personality questions',
    category: 'personality',
    rarity: 'uncommon',
    icon: '🔍',
    points: 100,
    requirement: { type: 'personality_questions', target: 50 }
  },
  {
    achievement_id: 'personality_complete',
    name: 'Complete Profile',
    description: 'Reach 90% personality assessment completion',
    category: 'personality',
    rarity: 'epic',
    icon: '👤',
    points: 500,
    requirement: { type: 'personality_completion', target: 90 }
  },
  {
    achievement_id: 'cv_generated',
    name: 'Career Ready',
    description: 'Generate your first Personality CV',
    category: 'personality',
    rarity: 'rare',
    icon: '📄',
    points: 200,
    requirement: { type: 'cv_generated', target: 1 }
  },

  // Streak achievements
  {
    achievement_id: 'streak_3',
    name: 'Getting Started',
    description: 'Maintain a 3-day check-in streak',
    category: 'streak',
    rarity: 'common',
    icon: '🔥',
    points: 30,
    requirement: { type: 'daily_streak', target: 3 }
  },
  {
    achievement_id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day check-in streak',
    category: 'streak',
    rarity: 'uncommon',
    icon: '💪',
    points: 75,
    requirement: { type: 'daily_streak', target: 7 }
  },
  {
    achievement_id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day check-in streak',
    category: 'streak',
    rarity: 'rare',
    icon: '🏅',
    points: 300,
    requirement: { type: 'daily_streak', target: 30 }
  },
  {
    achievement_id: 'streak_100',
    name: 'Centurion',
    description: 'Maintain a 100-day check-in streak',
    category: 'streak',
    rarity: 'legendary',
    icon: '👑',
    points: 1000,
    requirement: { type: 'daily_streak', target: 100 }
  },

  // Intervention achievements
  {
    achievement_id: 'first_intervention',
    name: 'Self Care',
    description: 'Complete your first intervention',
    category: 'intervention',
    rarity: 'common',
    icon: '🧘',
    points: 15,
    requirement: { type: 'interventions_completed', target: 1 }
  },
  {
    achievement_id: 'intervention_10',
    name: 'Wellness Warrior',
    description: 'Complete 10 interventions',
    category: 'intervention',
    rarity: 'uncommon',
    icon: '💆',
    points: 75,
    requirement: { type: 'interventions_completed', target: 10 }
  },
  {
    achievement_id: 'breathing_master',
    name: 'Breath Master',
    description: 'Complete 20 breathing exercises',
    category: 'intervention',
    rarity: 'rare',
    icon: '🌬️',
    points: 150,
    requirement: { type: 'breathing_exercises', target: 20 }
  },
  {
    achievement_id: 'effective_intervention',
    name: 'Mood Shifter',
    description: 'Achieve +0.3 valence improvement from intervention',
    category: 'intervention',
    rarity: 'rare',
    icon: '✨',
    points: 100,
    requirement: { type: 'intervention_effectiveness', target: 0.3 }
  },

  // Milestone achievements
  {
    achievement_id: 'level_5',
    name: 'Rising Star',
    description: 'Reach Level 5',
    category: 'milestone',
    rarity: 'uncommon',
    icon: '⭐',
    points: 0, // No points since level-based
    requirement: { type: 'level', target: 5 }
  },
  {
    achievement_id: 'level_10',
    name: 'Dedicated',
    description: 'Reach Level 10',
    category: 'milestone',
    rarity: 'rare',
    icon: '🌟',
    points: 0,
    requirement: { type: 'level', target: 10 }
  },
  {
    achievement_id: 'level_25',
    name: 'Expert',
    description: 'Reach Level 25',
    category: 'milestone',
    rarity: 'epic',
    icon: '💎',
    points: 0,
    requirement: { type: 'level', target: 25 }
  },
  {
    achievement_id: 'level_50',
    name: 'Legend',
    description: 'Reach Level 50',
    category: 'milestone',
    rarity: 'legendary',
    icon: '🏆',
    points: 0,
    requirement: { type: 'level', target: 50 }
  }
];

// XP rewards for actions
const XP_REWARDS: Record<string, number> = {
  mood_checkin: 10,
  mood_checkin_streak_bonus: 5, // Per day of streak
  flow_session: 25,
  flow_session_quality_bonus: 25, // If quality > 0.8
  personality_question: 15,
  intervention_completed: 20,
  intervention_effective: 15, // Bonus if effective
  morning_checkin: 5,
  achievement_unlocked: 50 // Base bonus for any achievement
};

// Level thresholds
const LEVEL_THRESHOLDS = [
  0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, // 1-10
  3250, 3850, 4500, 5200, 5950, 6750, 7600, 8500, 9450, 10450, // 11-20
  11500, 12600, 13750, 14950, 16200, 17500, 18850, 20250, 21700, 23200, // 21-30
  24750, 26350, 28000, 29700, 31450, 33250, 35100, 37000, 38950, 40950, // 31-40
  43000, 45100, 47250, 49450, 51700, 54000, 56350, 58750, 61200, 63700 // 41-50
];

// Rank titles by level
const RANK_TITLES: Record<number, string> = {
  1: 'Novice',
  5: 'Apprentice',
  10: 'Journeyman',
  15: 'Expert',
  20: 'Master',
  25: 'Grandmaster',
  30: 'Sage',
  40: 'Legend',
  50: 'Transcendent'
};

/**
 * Gamification Service
 * Manages achievements, XP, levels, and streaks
 */
export class GamificationService {
  private userId: string = '';
  private progress: GamificationProgress | null = null;

  /**
   * Initialize the service for a user
   */
  async initialize(userId: string): Promise<void> {
    this.userId = userId;
    await this.loadProgress();
  }

  /**
   * Load progress from storage
   */
  private async loadProgress(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(`gamification_${this.userId}`);

      if (result[`gamification_${this.userId}`]) {
        this.progress = result[`gamification_${this.userId}`];
      } else {
        // Initialize new progress
        this.progress = this.createInitialProgress();
        await this.saveProgress();
      }
    } catch (error) {
      console.error('Failed to load gamification progress:', error);
      this.progress = this.createInitialProgress();
    }
  }

  /**
   * Create initial progress for new user
   */
  private createInitialProgress(): GamificationProgress {
    return {
      user_id: this.userId,
      level: 1,
      current_xp: 0,
      total_xp: 0,
      xp_to_next_level: LEVEL_THRESHOLDS[1],
      achievements: ACHIEVEMENT_DEFINITIONS.map(def => ({
        ...def,
        unlocked: false,
        progress: 0
      })),
      streaks: [
        {
          streak_id: `${this.userId}_daily_checkin`,
          type: 'daily_checkin',
          current_count: 0,
          longest_count: 0,
          last_activity: 0,
          started_at: 0
        },
        {
          streak_id: `${this.userId}_flow_session`,
          type: 'flow_session',
          current_count: 0,
          longest_count: 0,
          last_activity: 0,
          started_at: 0
        },
        {
          streak_id: `${this.userId}_personality`,
          type: 'personality',
          current_count: 0,
          longest_count: 0,
          last_activity: 0,
          started_at: 0
        }
      ],
      badges_earned: 0,
      rank_title: 'Novice',
      updated_at: Date.now()
    };
  }

  /**
   * Save progress to storage
   */
  private async saveProgress(): Promise<void> {
    if (!this.progress) return;

    try {
      this.progress.updated_at = Date.now();
      await chrome.storage.local.set({
        [`gamification_${this.userId}`]: this.progress
      });
    } catch (error) {
      console.error('Failed to save gamification progress:', error);
    }
  }

  /**
   * Get current progress
   */
  getProgress(): GamificationProgress | null {
    return this.progress;
  }

  /**
   * Award XP and check for level up
   */
  async awardXP(action: string, multiplier: number = 1): Promise<XPEvent | null> {
    if (!this.progress) return null;

    const baseXP = XP_REWARDS[action] || 0;
    if (baseXP === 0) return null;

    const xpEarned = Math.round(baseXP * multiplier);

    // Create XP event
    const event: XPEvent = {
      event_id: `xp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      user_id: this.userId,
      timestamp: Date.now(),
      action,
      xp_earned: xpEarned,
      multiplier,
      source: action
    };

    // Update progress
    this.progress.current_xp += xpEarned;
    this.progress.total_xp += xpEarned;

    // Check for level up
    await this.checkLevelUp();

    await this.saveProgress();

    return event;
  }

  /**
   * Check and process level up
   */
  private async checkLevelUp(): Promise<boolean> {
    if (!this.progress) return false;

    let leveledUp = false;

    while (
      this.progress.level < LEVEL_THRESHOLDS.length &&
      this.progress.total_xp >= LEVEL_THRESHOLDS[this.progress.level]
    ) {
      this.progress.level++;
      leveledUp = true;

      // Update rank title
      const rankKeys = Object.keys(RANK_TITLES).map(Number).sort((a, b) => b - a);
      for (const rankLevel of rankKeys) {
        if (this.progress.level >= rankLevel) {
          this.progress.rank_title = RANK_TITLES[rankLevel];
          break;
        }
      }

      // Check level-based achievements
      await this.checkAchievementProgress('level', this.progress.level);
    }

    // Update XP to next level
    if (this.progress.level < LEVEL_THRESHOLDS.length) {
      this.progress.xp_to_next_level = LEVEL_THRESHOLDS[this.progress.level] - this.progress.total_xp;
    } else {
      this.progress.xp_to_next_level = 0; // Max level
    }

    return leveledUp;
  }

  /**
   * Update streak for an activity
   */
  async updateStreak(type: Streak['type']): Promise<Streak | null> {
    if (!this.progress) return null;

    const streak = this.progress.streaks.find(s => s.type === type);
    if (!streak) return null;

    const now = Date.now();
    const today = new Date(now).setHours(0, 0, 0, 0);
    const lastDay = new Date(streak.last_activity).setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today - lastDay) / (24 * 60 * 60 * 1000));

    if (daysDiff === 0) {
      // Same day, no change
      return streak;
    } else if (daysDiff === 1) {
      // Consecutive day
      streak.current_count++;
      streak.last_activity = now;

      if (streak.current_count > streak.longest_count) {
        streak.longest_count = streak.current_count;
      }

      // Check streak achievements
      if (type === 'daily_checkin') {
        await this.checkAchievementProgress('daily_streak', streak.current_count);
      }
    } else if (daysDiff > 1) {
      // Streak broken (unless frozen)
      if (!streak.frozen_until || now > streak.frozen_until) {
        streak.current_count = 1;
        streak.started_at = now;
      }
      streak.last_activity = now;
    } else if (streak.current_count === 0) {
      // First activity
      streak.current_count = 1;
      streak.started_at = now;
      streak.last_activity = now;
      streak.longest_count = 1;
    }

    await this.saveProgress();
    return streak;
  }

  /**
   * Check and update achievement progress
   */
  async checkAchievementProgress(
    requirementType: string,
    currentValue: number
  ): Promise<Achievement[]> {
    if (!this.progress) return [];

    const newlyUnlocked: Achievement[] = [];

    for (const achievement of this.progress.achievements) {
      if (achievement.unlocked) continue;
      if (achievement.requirement.type !== requirementType) continue;

      // Update progress
      const progress = Math.min(100, (currentValue / achievement.requirement.target) * 100);
      achievement.progress = progress;
      achievement.requirement.current = currentValue;

      // Check if unlocked
      if (currentValue >= achievement.requirement.target) {
        achievement.unlocked = true;
        achievement.unlocked_at = Date.now();
        this.progress.badges_earned++;
        newlyUnlocked.push(achievement);

        // Award achievement points as XP
        if (achievement.points > 0) {
          await this.awardXP('achievement_unlocked', achievement.points / 50);
        }
      }
    }

    if (newlyUnlocked.length > 0) {
      await this.saveProgress();
    }

    return newlyUnlocked;
  }

  /**
   * Record mood check-in
   */
  async recordMoodCheckin(valence: number): Promise<{
    xp: XPEvent | null;
    streak: Streak | null;
    achievements: Achievement[];
  }> {
    // Get current counts
    const result = await chrome.storage.local.get('mood_checkin_count');
    const count = (result.mood_checkin_count || 0) + 1;
    await chrome.storage.local.set({ mood_checkin_count: count });

    // Award XP with streak bonus
    const streak = await this.updateStreak('daily_checkin');
    const multiplier = 1 + (streak?.current_count || 0) * 0.1; // 10% bonus per streak day
    const xp = await this.awardXP('mood_checkin', multiplier);

    // Check achievements
    const achievements = await this.checkAchievementProgress('mood_checkins', count);

    // Check positive day if applicable
    if (valence > 0.3) {
      // Track positive entries for the day
      const today = new Date().toDateString();
      const positiveResult = await chrome.storage.local.get('positive_day_tracker');
      const tracker = positiveResult.positive_day_tracker || { date: '', count: 0 };

      if (tracker.date === today) {
        tracker.count++;
      } else {
        tracker.date = today;
        tracker.count = 1;
      }

      await chrome.storage.local.set({ positive_day_tracker: tracker });

      if (tracker.count >= 3) {
        const positiveAchievements = await this.checkAchievementProgress('positive_day', 1);
        achievements.push(...positiveAchievements);
      }
    }

    return { xp, streak, achievements };
  }

  /**
   * Record flow session
   */
  async recordFlowSession(
    durationMinutes: number,
    quality: number
  ): Promise<{
    xp: XPEvent | null;
    achievements: Achievement[];
  }> {
    // Get current counts
    const result = await chrome.storage.local.get('flow_session_count');
    const count = (result.flow_session_count || 0) + 1;
    await chrome.storage.local.set({ flow_session_count: count });

    // Award XP with quality bonus
    let multiplier = 1;
    if (quality > 0.8) multiplier = 1.5;
    const xp = await this.awardXP('flow_session', multiplier);

    // Check achievements
    const achievements = await this.checkAchievementProgress('flow_sessions', count);

    // Check deep flow
    if (quality > 0.9) {
      const deepAchievements = await this.checkAchievementProgress('deep_flow', 1);
      achievements.push(...deepAchievements);
    }

    // Check duration
    if (durationMinutes >= 60) {
      const durationAchievements = await this.checkAchievementProgress('flow_duration', durationMinutes);
      achievements.push(...durationAchievements);
    }

    return { xp, achievements };
  }

  /**
   * Record personality question
   */
  async recordPersonalityQuestion(
    questionsAnswered: number,
    completionPercent: number
  ): Promise<{
    xp: XPEvent | null;
    streak: Streak | null;
    achievements: Achievement[];
  }> {
    const xp = await this.awardXP('personality_question');
    const streak = await this.updateStreak('personality');

    const achievements = [
      ...await this.checkAchievementProgress('personality_questions', questionsAnswered),
      ...await this.checkAchievementProgress('personality_completion', completionPercent)
    ];

    return { xp, streak, achievements };
  }

  /**
   * Record intervention
   */
  async recordIntervention(
    type: string,
    effectiveness: number
  ): Promise<{
    xp: XPEvent | null;
    achievements: Achievement[];
  }> {
    // Get counts
    const result = await chrome.storage.local.get(['intervention_count', 'breathing_count']);
    const count = (result.intervention_count || 0) + 1;
    await chrome.storage.local.set({ intervention_count: count });

    // Track breathing exercises
    if (type === 'breathing') {
      const breathingCount = (result.breathing_count || 0) + 1;
      await chrome.storage.local.set({ breathing_count: breathingCount });
    }

    // Award XP
    let multiplier = 1;
    if (effectiveness > 0.2) multiplier = 1.5;
    const xp = await this.awardXP('intervention_completed', multiplier);

    // Check achievements
    const achievements = [
      ...await this.checkAchievementProgress('interventions_completed', count)
    ];

    if (type === 'breathing') {
      const breathingResult = await chrome.storage.local.get('breathing_count');
      const breathingAchievements = await this.checkAchievementProgress(
        'breathing_exercises',
        breathingResult.breathing_count || 0
      );
      achievements.push(...breathingAchievements);
    }

    if (effectiveness >= 0.3) {
      const effectiveAchievements = await this.checkAchievementProgress(
        'intervention_effectiveness',
        effectiveness
      );
      achievements.push(...effectiveAchievements);
    }

    return { xp, achievements };
  }

  /**
   * Record CV generation
   */
  async recordCVGenerated(): Promise<Achievement[]> {
    return await this.checkAchievementProgress('cv_generated', 1);
  }

  /**
   * Get unlocked achievements
   */
  getUnlockedAchievements(): Achievement[] {
    if (!this.progress) return [];
    return this.progress.achievements.filter(a => a.unlocked);
  }

  /**
   * Get achievements by category
   */
  getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    if (!this.progress) return [];
    return this.progress.achievements.filter(a => a.category === category);
  }

  /**
   * Get next achievements to unlock
   */
  getNextAchievements(limit: number = 3): Achievement[] {
    if (!this.progress) return [];

    return this.progress.achievements
      .filter(a => !a.unlocked && a.progress > 0)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, limit);
  }

  /**
   * Freeze streak (grace period)
   */
  async freezeStreak(type: Streak['type'], hours: number = 24): Promise<void> {
    if (!this.progress) return;

    const streak = this.progress.streaks.find(s => s.type === type);
    if (streak) {
      streak.frozen_until = Date.now() + hours * 60 * 60 * 1000;
      await this.saveProgress();
    }
  }

  /**
   * Get level progress percentage
   */
  getLevelProgress(): number {
    if (!this.progress) return 0;

    const currentLevelXP = this.progress.level > 1
      ? LEVEL_THRESHOLDS[this.progress.level - 1]
      : 0;
    const nextLevelXP = LEVEL_THRESHOLDS[this.progress.level] || currentLevelXP;
    const xpInLevel = this.progress.total_xp - currentLevelXP;
    const xpNeeded = nextLevelXP - currentLevelXP;

    return xpNeeded > 0 ? (xpInLevel / xpNeeded) * 100 : 100;
  }

  /**
   * Get rarity color
   */
  getRarityColor(rarity: AchievementRarity): string {
    switch (rarity) {
      case 'common': return '#9CA3AF'; // gray
      case 'uncommon': return '#22C55E'; // green
      case 'rare': return '#3B82F6'; // blue
      case 'epic': return '#A855F7'; // purple
      case 'legendary': return '#F59E0B'; // gold
    }
  }
}

// Export singleton
export const gamificationService = new GamificationService();
