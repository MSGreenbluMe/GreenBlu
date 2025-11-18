// GreenBlu.ai Intervention Recommender
// Smart recommendation engine that matches interventions to user state

import { interventionTemplates } from '../data/intervention-templates';
import { db } from './database';
import type {
  InterventionTemplate,
  VAD,
  PersonalityProfile,
  Intervention
} from '../types';

export interface RecommendationContext {
  userId: string;
  currentMood: VAD;
  energyLevel: number; // 0-5
  timeOfDay: 'morning' | 'midday' | 'afternoon' | 'evening';
  availableTime?: number; // seconds
  personality?: PersonalityProfile;
  recentInterventions?: Intervention[];
}

export interface ScoredIntervention {
  template: InterventionTemplate;
  score: number;
  reasons: string[];
}

class InterventionRecommender {
  /**
   * Get personalized intervention recommendations
   */
  async getRecommendations(
    context: RecommendationContext,
    limit: number = 3
  ): Promise<ScoredIntervention[]> {
    const scored = interventionTemplates.map(template => ({
      template,
      ...this.scoreIntervention(template, context)
    }));

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Apply diversity filter to avoid suggesting the same types
    const diverse = this.applyDiversityFilter(scored, limit);

    return diverse.slice(0, limit);
  }

  /**
   * Score an intervention based on user context
   */
  private scoreIntervention(
    template: InterventionTemplate,
    context: RecommendationContext
  ): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // Base score from template effectiveness
    score += template.avg_effectiveness * 30;
    if (template.avg_effectiveness >= 0.85) {
      reasons.push('Highly effective intervention');
    }

    // Mood matching (most important factor)
    const moodScore = this.calculateMoodMatch(template, context.currentMood);
    score += moodScore * 40;
    if (moodScore >= 0.7) {
      reasons.push('Perfect match for your current mood');
    } else if (moodScore >= 0.5) {
      reasons.push('Good match for how you\'re feeling');
    }

    // Energy level matching
    const energyScore = this.calculateEnergyMatch(template, context.energyLevel);
    score += energyScore * 15;
    if (energyScore >= 0.7) {
      reasons.push('Matches your current energy level');
    }

    // Time of day matching
    const timeScore = this.calculateTimeMatch(template, context.timeOfDay);
    score += timeScore * 10;

    // Available time constraint
    if (context.availableTime && template.duration_seconds <= context.availableTime) {
      score += 10;
      reasons.push(`Quick ${Math.round(template.duration_seconds / 60)}min intervention`);
    } else if (context.availableTime && template.duration_seconds > context.availableTime) {
      score -= 20; // Penalize if too long
    }

    // Personality matching
    if (context.personality) {
      const personalityScore = this.calculatePersonalityMatch(template, context.personality);
      score += personalityScore * 20;
      if (personalityScore >= 0.7) {
        reasons.push('Tailored to your personality');
      }
    }

    // Recency penalty - avoid suggesting the same intervention too often
    if (context.recentInterventions) {
      const recentUse = context.recentInterventions.find(
        i => i.intervention_id === template.template_id
      );
      if (recentUse) {
        const hoursSince = (Date.now() - recentUse.timestamp) / (1000 * 60 * 60);
        if (hoursSince < 24) {
          score -= 30;
        } else if (hoursSince < 72) {
          score -= 15;
        }
      }
    }

    // Completion rate bonus
    if (template.completion_rate >= 0.85) {
      score += 5;
      reasons.push('Easy to complete');
    }

    // Difficulty matching based on stress level
    const stressLevel = this.estimateStressLevel(context.currentMood);
    if (stressLevel > 0.7 && template.difficulty === 'easy') {
      score += 10;
      reasons.push('Simple and straightforward');
    }

    return { score: Math.max(0, score), reasons };
  }

  /**
   * Calculate how well the intervention matches the current mood
   */
  private calculateMoodMatch(template: InterventionTemplate, currentMood: VAD): number {
    if (!template.best_for_mood) return 0.5; // neutral if no mood specification

    const { valence, arousal, dominance } = template.best_for_mood;
    const current = currentMood;

    // Calculate distance in VAD space
    // Lower distance = better match
    const valenceDiff = Math.abs((valence || 0) - current.valence);
    const arousalDiff = Math.abs((arousal || 0) - current.arousal);
    const dominanceDiff = Math.abs((dominance || 0) - current.dominance);

    // Average difference (0 to 2)
    const avgDiff = (valenceDiff + arousalDiff + dominanceDiff) / 3;

    // Convert to 0-1 score (lower diff = higher score)
    return 1 - (avgDiff / 2);
  }

  /**
   * Calculate energy level match
   */
  private calculateEnergyMatch(template: InterventionTemplate, energyLevel: number): number {
    // Map template types to ideal energy levels (0-5)
    const idealEnergy: Record<string, number> = {
      breathing: 2.5, // works at any energy
      eye_exercise: 2.0, // better when tired
      physical: 3.5, // needs some energy
      cognitive: 3.0 // moderate energy needed
    };

    const ideal = idealEnergy[template.type] || 2.5;
    const diff = Math.abs(ideal - energyLevel);

    // Convert difference to 0-1 score
    return 1 - (diff / 5);
  }

  /**
   * Calculate time of day match
   */
  private calculateTimeMatch(
    template: InterventionTemplate,
    timeOfDay: 'morning' | 'midday' | 'afternoon' | 'evening'
  ): number {
    // Some interventions work better at certain times
    const preferences: Record<string, Record<string, number>> = {
      'breathing-wim-hof': { morning: 1.0, midday: 0.6, afternoon: 0.4, evening: 0.2 },
      'breathing-478': { morning: 0.6, midday: 0.7, afternoon: 0.8, evening: 1.0 },
      'physical-walking-break': { morning: 0.8, midday: 1.0, afternoon: 0.9, evening: 0.6 },
      'cognitive-gratitude': { morning: 1.0, midday: 0.7, afternoon: 0.7, evening: 0.9 }
    };

    return preferences[template.template_id]?.[timeOfDay] || 0.7; // default neutral
  }

  /**
   * Calculate personality match
   */
  private calculatePersonalityMatch(
    template: InterventionTemplate,
    personality: PersonalityProfile
  ): number {
    if (!template.best_for_personality) return 0.5;

    let matches = 0;
    let total = 0;

    // Check Big Five matches
    if (template.best_for_personality.big_five) {
      const templateBigFive = template.best_for_personality.big_five;
      const userBigFive = personality.big_five;

      Object.entries(templateBigFive).forEach(([trait, threshold]) => {
        if (typeof threshold === 'number') {
          total++;
          const userScore = userBigFive[trait as keyof typeof userBigFive];
          if (typeof userScore === 'number' && userScore >= threshold) {
            matches++;
          }
        }
      });
    }

    // Check derived traits
    if (template.best_for_personality.derived) {
      const templateDerived = template.best_for_personality.derived;
      const userDerived = personality.derived;

      Object.entries(templateDerived).forEach(([trait, threshold]) => {
        if (typeof threshold === 'number') {
          total++;
          const userScore = userDerived[trait as keyof typeof userDerived];
          if (typeof userScore === 'number' && userScore >= threshold) {
            matches++;
          }
        }
      });
    }

    return total > 0 ? matches / total : 0.5;
  }

  /**
   * Estimate stress level from mood
   */
  private estimateStressLevel(mood: VAD): number {
    // High arousal + low valence + low dominance = high stress
    const stressScore =
      (1 - mood.valence) * 0.4 + // negative feelings
      Math.abs(mood.arousal) * 0.3 + // high arousal (either direction)
      (1 - mood.dominance) * 0.3; // low control

    return Math.min(1, stressScore / 2); // normalize to 0-1
  }

  /**
   * Apply diversity filter to avoid suggesting too many of the same type
   */
  private applyDiversityFilter(
    scored: ScoredIntervention[],
    limit: number
  ): ScoredIntervention[] {
    const selected: ScoredIntervention[] = [];
    const typeCount: Record<string, number> = {};

    for (const item of scored) {
      if (selected.length >= limit) break;

      const type = item.template.type;
      const count = typeCount[type] || 0;

      // Allow max 2 of the same type in recommendations
      if (count < 2) {
        selected.push(item);
        typeCount[type] = count + 1;
      }
    }

    // If we didn't get enough, add more without diversity filter
    if (selected.length < limit) {
      for (const item of scored) {
        if (selected.length >= limit) break;
        if (!selected.includes(item)) {
          selected.push(item);
        }
      }
    }

    return selected;
  }

  /**
   * Get time of day from hour
   */
  getTimeOfDay(hour: number = new Date().getHours()): 'morning' | 'midday' | 'afternoon' | 'evening' {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 14) return 'midday';
    if (hour >= 14 && hour < 18) return 'afternoon';
    return 'evening';
  }

  /**
   * Track intervention effectiveness for a user
   */
  async trackEffectiveness(interventionId: string, userId: string): Promise<{
    avgEffectiveness: number;
    completionRate: number;
    usageCount: number;
  }> {
    const interventions = await db.getInterventions(userId, 90); // last 90 days
    const userInterventions = interventions.filter(
      i => i.type === interventionId && i.completed
    );

    if (userInterventions.length === 0) {
      return { avgEffectiveness: 0, completionRate: 0, usageCount: 0 };
    }

    const effectiveCount = userInterventions.filter(i => i.effectiveness && i.effectiveness > 0).length;
    const totalEffectiveness = userInterventions.reduce(
      (sum, i) => sum + (i.effectiveness || 0),
      0
    );

    const allAttempts = interventions.filter(i => i.type === interventionId);

    return {
      avgEffectiveness: effectiveCount > 0 ? totalEffectiveness / effectiveCount : 0,
      completionRate: allAttempts.length > 0 ? userInterventions.length / allAttempts.length : 0,
      usageCount: userInterventions.length
    };
  }

  /**
   * Calculate effectiveness of an intervention based on mood change
   */
  calculateInterventionEffectiveness(moodBefore: VAD, moodAfter: VAD): number {
    // Positive change in valence is good
    const valenceDelta = moodAfter.valence - moodBefore.valence;

    // Movement toward moderate arousal is good (extreme arousal either way is bad)
    const arousalBefore = Math.abs(moodBefore.arousal);
    const arousalAfter = Math.abs(moodAfter.arousal);
    const arousalDelta = arousalBefore - arousalAfter; // reduction is good

    // Increase in dominance (feeling more in control) is good
    const dominanceDelta = moodAfter.dominance - moodBefore.dominance;

    // Weighted average
    const effectiveness = (valenceDelta * 0.5 + arousalDelta * 0.2 + dominanceDelta * 0.3);

    // Normalize to -1 to 1
    return Math.max(-1, Math.min(1, effectiveness));
  }

  /**
   * A/B testing framework - select variant
   */
  selectABVariant(userId: string, testName: string): 'A' | 'B' {
    // Simple hash-based assignment for consistent user experience
    const hash = this.hashString(userId + testName);
    return hash % 2 === 0 ? 'A' : 'B';
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Get intervention suggestions based on predicted mood
   */
  async getProactiveRecommendations(
    userId: string,
    predictedMood: VAD,
    currentMood: VAD
  ): Promise<ScoredIntervention[]> {
    // Only suggest if predicted mood is significantly worse
    const predictedStress = this.estimateStressLevel(predictedMood);
    const currentStress = this.estimateStressLevel(currentMood);

    if (predictedStress <= currentStress + 0.15) {
      return []; // No significant deterioration predicted
    }

    // Get recent interventions to avoid repetition
    const recentInterventions = await db.getInterventions(userId, 7);

    const context: RecommendationContext = {
      userId,
      currentMood: predictedMood, // Use predicted mood for matching
      energyLevel: Math.round(((predictedMood.arousal + 1) / 2) * 5),
      timeOfDay: this.getTimeOfDay(),
      personality: await db.getPersonalityProfile(userId),
      recentInterventions
    };

    return this.getRecommendations(context, 2); // Return top 2 proactive suggestions
  }
}

// Export singleton instance
export const interventionRecommender = new InterventionRecommender();
