// GreenBlu.ai CV Generator
// Generate revolutionary PersonalityCV from user data

import type {
  PersonalityCV,
  PersonalityProfile,
  FlowTrigger,
  EnergyActivity,
  RoleFitScore,
  GeniusType,
  FlowSession,
  MoodEntry
} from '../types';
import { RoleFitAnalyzer } from './role-fit-analyzer';
import { roleArchetypes } from '../data/role-archetypes';

export class CVGenerator {
  /**
   * Generate a complete PersonalityCV from user data
   */
  static async generateCV(
    userId: string,
    profile: PersonalityProfile,
    flowSessions: FlowSession[],
    moodEntries: MoodEntry[]
  ): Promise<PersonalityCV> {
    // Extract flow triggers from flow sessions
    const flowTriggers = this.extractFlowTriggers(flowSessions);

    // Extract energy map from mood entries and flow sessions
    const energyMap = this.extractEnergyMap(flowSessions, moodEntries);

    // Calculate role fit scores for all role archetypes
    const roleFitHistory = this.calculateRoleFitScores(profile, flowTriggers, energyMap.energizing_activities);

    // Calculate verification metrics
    const verificationDays = this.calculateVerificationDays(moodEntries, flowSessions);
    const dataVerified = verificationDays >= 60;
    const confidenceScore = this.calculateConfidenceScore(profile, flowSessions.length, moodEntries.length, verificationDays);

    // Generate summary
    const summary = this.generateSummary(profile, flowTriggers, energyMap, roleFitHistory);

    const cv: PersonalityCV = {
      cv_id: `cv_${userId}_${Date.now()}`,
      user_id: userId,
      created_at: Date.now(),
      last_updated: Date.now(),
      personality_profile: profile,
      flow_triggers: flowTriggers,
      energy_map: energyMap,
      role_fit_history: roleFitHistory,
      data_verified: dataVerified,
      verification_days: verificationDays,
      confidence_score: confidenceScore,
      summary: summary
    };

    return cv;
  }

  /**
   * Extract flow triggers from flow sessions
   */
  private static extractFlowTriggers(flowSessions: FlowSession[]): FlowTrigger[] {
    // Group sessions by activity type
    const activityMap = new Map<string, FlowSession[]>();

    for (const session of flowSessions) {
      if (!session.activity_type) continue;

      const key = session.activity_type;
      if (!activityMap.has(key)) {
        activityMap.set(key, []);
      }
      activityMap.get(key)!.push(session);
    }

    // Calculate aggregate metrics for each activity
    const flowTriggers: FlowTrigger[] = [];

    for (const [activityType, sessions] of activityMap.entries()) {
      const highFlowSessions = sessions.filter(s => s.flow_quality >= 0.6);

      if (highFlowSessions.length === 0) continue;

      // Calculate average flow score
      const avgFlowScore = highFlowSessions.reduce((sum, s) => sum + s.flow_quality, 0) / highFlowSessions.length;

      // Determine most common conditions
      const morningCount = sessions.filter(s => s.environment?.time_of_day === 'morning').length;
      const middayCount = sessions.filter(s => s.environment?.time_of_day === 'midday').length;
      const afternoonCount = sessions.filter(s => s.environment?.time_of_day === 'afternoon').length;
      const eveningCount = sessions.filter(s => s.environment?.time_of_day === 'evening').length;

      const mostCommonTime = [
        { time: 'morning' as const, count: morningCount },
        { time: 'midday' as const, count: middayCount },
        { time: 'afternoon' as const, count: afternoonCount },
        { time: 'evening' as const, count: eveningCount }
      ].sort((a, b) => b.count - a.count)[0];

      // Determine complexity level
      const complexityScores = { low: 0, medium: 0, high: 0 };
      sessions.forEach(s => {
        if (s.task_complexity) complexityScores[s.task_complexity]++;
      });
      const complexity = (Object.entries(complexityScores).sort((a, b) => b[1] - a[1])[0]?.[0] || 'medium') as 'low' | 'medium' | 'high';

      flowTriggers.push({
        activity_type: activityType,
        task_description: highFlowSessions[0].task_description || activityType,
        complexity_level: complexity,
        avg_flow_score: avgFlowScore,
        frequency: highFlowSessions.length,
        conditions: {
          time_of_day: mostCommonTime.count > 0 ? mostCommonTime.time : undefined,
          autonomy_level: this.inferAutonomyLevel(sessions)
        }
      });
    }

    // Sort by avg_flow_score and frequency
    return flowTriggers.sort((a, b) => {
      const scoreA = a.avg_flow_score * 0.7 + (a.frequency / flowSessions.length) * 0.3;
      const scoreB = b.avg_flow_score * 0.7 + (b.frequency / flowSessions.length) * 0.3;
      return scoreB - scoreA;
    }).slice(0, 10); // Keep top 10
  }

  /**
   * Extract energy map from flow sessions and mood entries
   */
  private static extractEnergyMap(flowSessions: FlowSession[], moodEntries: MoodEntry[]): {
    energizing_activities: EnergyActivity[];
    draining_activities: EnergyActivity[];
  } {
    const activityEnergyMap = new Map<string, { impacts: number[]; count: number }>();

    // Analyze flow sessions for energy change
    for (const session of flowSessions) {
      if (!session.activity_type || session.energy_change === undefined) continue;

      if (!activityEnergyMap.has(session.activity_type)) {
        activityEnergyMap.set(session.activity_type, { impacts: [], count: 0 });
      }

      const data = activityEnergyMap.get(session.activity_type)!;
      data.impacts.push(session.energy_change);
      data.count++;
    }

    // Analyze mood entries with activity context
    for (const entry of moodEntries) {
      if (!entry.context?.activity) continue;

      const activity = entry.context.activity;

      if (!activityEnergyMap.has(activity)) {
        activityEnergyMap.set(activity, { impacts: [], count: 0 });
      }

      const data = activityEnergyMap.get(activity)!;

      // Use valence as proxy for energy impact
      if (entry.context.energy_level !== undefined) {
        const energyImpact = (entry.context.energy_level - 50) / 50; // Normalize to -1 to 1
        data.impacts.push(energyImpact);
      } else {
        // Fallback to valence
        data.impacts.push(entry.vad.valence);
      }
      data.count++;
    }

    // Calculate average energy impact for each activity
    const energyActivities: EnergyActivity[] = [];

    for (const [activity, data] of activityEnergyMap.entries()) {
      if (data.impacts.length === 0) continue;

      const avgImpact = data.impacts.reduce((sum, i) => sum + i, 0) / data.impacts.length;

      energyActivities.push({
        activity: activity,
        energy_impact: avgImpact,
        frequency: data.count,
        duration_preference: this.inferDurationPreference(activity, flowSessions)
      });
    }

    // Sort and separate
    const sorted = energyActivities.sort((a, b) => b.energy_impact - a.energy_impact);

    return {
      energizing_activities: sorted.filter(a => a.energy_impact > 0.1).slice(0, 10),
      draining_activities: sorted.filter(a => a.energy_impact < -0.1).slice(-10)
    };
  }

  /**
   * Calculate role fit scores for all role archetypes
   */
  private static calculateRoleFitScores(
    profile: PersonalityProfile,
    flowTriggers: FlowTrigger[],
    energyActivities: EnergyActivity[]
  ): RoleFitScore[] {
    return RoleFitAnalyzer.compareRoles(profile, roleArchetypes, flowTriggers, energyActivities);
  }

  /**
   * Calculate how many days of data we have
   */
  private static calculateVerificationDays(moodEntries: MoodEntry[], flowSessions: FlowSession[]): number {
    const allTimestamps = [
      ...moodEntries.map(e => e.timestamp),
      ...flowSessions.map(s => s.start_time)
    ];

    if (allTimestamps.length === 0) return 0;

    const minTimestamp = Math.min(...allTimestamps);
    const maxTimestamp = Math.max(...allTimestamps);

    const daysDiff = Math.floor((maxTimestamp - minTimestamp) / (1000 * 60 * 60 * 24));
    return daysDiff;
  }

  /**
   * Calculate overall confidence score in the CV
   */
  private static calculateConfidenceScore(
    profile: PersonalityProfile,
    flowSessionCount: number,
    moodEntryCount: number,
    verificationDays: number
  ): number {
    // Factors affecting confidence:
    // 1. Personality assessment progress
    // 2. Number of flow sessions
    // 3. Number of mood entries
    // 4. Verification days

    const personalityConfidence = profile.assessment_progress;
    const flowConfidence = Math.min(100, (flowSessionCount / 30) * 100); // 30+ sessions is ideal
    const moodConfidence = Math.min(100, (moodEntryCount / 180) * 100); // 180+ entries (60 days * 3/day) is ideal
    const timeConfidence = Math.min(100, (verificationDays / 90) * 100); // 90 days is ideal

    // Weighted average
    const overallConfidence =
      personalityConfidence * 0.4 +
      flowConfidence * 0.2 +
      moodConfidence * 0.2 +
      timeConfidence * 0.2;

    return Math.round(overallConfidence);
  }

  /**
   * Generate summary insights
   */
  private static generateSummary(
    profile: PersonalityProfile,
    flowTriggers: FlowTrigger[],
    energyMap: { energizing_activities: EnergyActivity[]; draining_activities: EnergyActivity[] },
    roleFitScores: RoleFitScore[]
  ): PersonalityCV['summary'] {
    // Top genius types
    const topGeniusTypes: GeniusType[] = [profile.genius.primary, profile.genius.secondary];

    // Ideal work style
    let idealWorkStyle = 'Balanced approach';
    if (profile.derived.structure_need !== undefined) {
      const autonomy = profile.derived.structure_need;
      const collaboration = profile.derived.collaboration_preference;

      if (autonomy > 70 && collaboration < 40) {
        idealWorkStyle = 'Independent deep work with minimal interruptions';
      } else if (autonomy < 40 && collaboration > 70) {
        idealWorkStyle = 'Collaborative team environment with structured guidance';
      } else if (autonomy > 60 && collaboration > 60) {
        idealWorkStyle = 'Flexible mix of independent work and team collaboration';
      } else {
        idealWorkStyle = 'Structured environment with moderate collaboration';
      }
    }

    // Optimal team size
    let optimalTeamSize: 'solo' | 'small' | 'medium' | 'large' = 'small';
    const extraversion = profile.big_five.extraversion;
    const collaboration = profile.derived.collaboration_preference;

    if (extraversion < 40 && collaboration < 40) {
      optimalTeamSize = 'solo';
    } else if (extraversion < 60 || collaboration < 60) {
      optimalTeamSize = 'small';
    } else if (extraversion < 80 || collaboration < 80) {
      optimalTeamSize = 'medium';
    } else {
      optimalTeamSize = 'large';
    }

    // Autonomy preference
    let autonomyPreference: 'high' | 'medium' | 'low' = 'medium';
    const conscientiousness = profile.big_five.conscientiousness;

    if (conscientiousness > 70 && profile.derived.structure_need < 50) {
      autonomyPreference = 'high';
    } else if (conscientiousness < 50 || profile.derived.structure_need > 70) {
      autonomyPreference = 'low';
    }

    // Structure preference
    let structurePreference: 'high' | 'medium' | 'low' = 'medium';
    const structureNeed = profile.derived.structure_need;

    if (structureNeed > 70) {
      structurePreference = 'high';
    } else if (structureNeed < 40) {
      structurePreference = 'low';
    }

    return {
      top_genius_types: topGeniusTypes,
      ideal_work_style: idealWorkStyle,
      optimal_team_size: optimalTeamSize,
      autonomy_preference: autonomyPreference,
      structure_preference: structurePreference
    };
  }

  /**
   * Export CV to JSON
   */
  static exportToJSON(cv: PersonalityCV): string {
    return JSON.stringify(cv, null, 2);
  }

  /**
   * Import CV from JSON
   */
  static importFromJSON(jsonString: string): PersonalityCV {
    return JSON.parse(jsonString) as PersonalityCV;
  }

  /**
   * Generate a text-based CV summary
   */
  static generateTextSummary(cv: PersonalityCV): string {
    const lines: string[] = [];

    lines.push('=== PERSONALITY-BASED CV ===');
    lines.push('');
    lines.push(`Verified by ${cv.verification_days} days of actual data`);
    lines.push(`Confidence Score: ${cv.confidence_score}/100`);
    lines.push(`Data Verified: ${cv.data_verified ? 'Yes' : 'No'}`);
    lines.push('');

    lines.push('GENIUS PROFILE:');
    lines.push(`Primary: ${cv.personality_profile.genius.primary}`);
    lines.push(`Secondary: ${cv.personality_profile.genius.secondary}`);
    lines.push('');

    lines.push('WORK STYLE:');
    lines.push(`Ideal Style: ${cv.summary.ideal_work_style}`);
    lines.push(`Team Size: ${cv.summary.optimal_team_size}`);
    lines.push(`Autonomy: ${cv.summary.autonomy_preference}`);
    lines.push(`Structure: ${cv.summary.structure_preference}`);
    lines.push('');

    lines.push('FLOW TRIGGERS:');
    for (const trigger of cv.flow_triggers.slice(0, 5)) {
      lines.push(`- ${trigger.activity_type} (Flow Score: ${Math.round(trigger.avg_flow_score * 100)}%)`);
    }
    lines.push('');

    lines.push('ENERGIZING ACTIVITIES:');
    for (const activity of cv.energy_map.energizing_activities.slice(0, 5)) {
      lines.push(`- ${activity.activity} (+${Math.round(activity.energy_impact * 100)}%)`);
    }
    lines.push('');

    lines.push('TOP ROLE MATCHES:');
    for (const roleFit of cv.role_fit_history.slice(0, 5)) {
      lines.push(`- ${roleFit.role_title}: ${roleFit.overall_score}/100 (${roleFit.match_quality})`);
    }

    return lines.join('\n');
  }

  /**
   * Helper: Infer autonomy level from sessions
   */
  private static inferAutonomyLevel(sessions: FlowSession[]): 'high' | 'medium' | 'low' {
    // This is a heuristic - in real implementation, we'd track this explicitly
    const avgFlowQuality = sessions.reduce((sum, s) => sum + s.flow_quality, 0) / sessions.length;

    if (avgFlowQuality > 0.75) return 'high';
    if (avgFlowQuality > 0.5) return 'medium';
    return 'low';
  }

  /**
   * Helper: Infer duration preference
   */
  private static inferDurationPreference(activity: string, flowSessions: FlowSession[]): string {
    const relevantSessions = flowSessions.filter(s => s.activity_type === activity && s.duration_minutes);

    if (relevantSessions.length === 0) return '30-60 min';

    const avgDuration = relevantSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / relevantSessions.length;

    if (avgDuration < 30) return '15-30 min';
    if (avgDuration < 60) return '30-60 min';
    if (avgDuration < 120) return '1-2 hours';
    return '2+ hours';
  }

  /**
   * Update an existing CV with new data
   */
  static updateCV(
    existingCV: PersonalityCV,
    profile: PersonalityProfile,
    flowSessions: FlowSession[],
    moodEntries: MoodEntry[]
  ): PersonalityCV {
    const flowTriggers = this.extractFlowTriggers(flowSessions);
    const energyMap = this.extractEnergyMap(flowSessions, moodEntries);
    const roleFitHistory = this.calculateRoleFitScores(profile, flowTriggers, energyMap.energizing_activities);
    const verificationDays = this.calculateVerificationDays(moodEntries, flowSessions);
    const dataVerified = verificationDays >= 60;
    const confidenceScore = this.calculateConfidenceScore(profile, flowSessions.length, moodEntries.length, verificationDays);
    const summary = this.generateSummary(profile, flowTriggers, energyMap, roleFitHistory);

    return {
      ...existingCV,
      last_updated: Date.now(),
      personality_profile: profile,
      flow_triggers: flowTriggers,
      energy_map: energyMap,
      role_fit_history: roleFitHistory,
      data_verified: dataVerified,
      verification_days: verificationDays,
      confidence_score: confidenceScore,
      summary: summary
    };
  }
}
