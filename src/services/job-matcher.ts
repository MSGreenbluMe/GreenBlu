// GreenBlu.ai Job Matcher
// AI-powered matching between PersonalityCV and job requirements

import type {
  PersonalityCV,
  JobRequirement,
  JobMatchResult,
  RoleArchetype,
  PersonalityProfile,
} from '../types';
import { getRoleById } from '../data/role-archetypes';
import { RoleFitAnalyzer } from './role-fit-analyzer';

export class JobMatcher {
  /**
   * Match a PersonalityCV to a job requirement
   * Returns a comprehensive match result with explanations
   */
  static matchJob(cv: PersonalityCV, jobReq: JobRequirement): JobMatchResult {
    // Get the role archetype
    const role = getRoleById(jobReq.role_archetype_id);

    if (!role) {
      throw new Error(`Role archetype ${jobReq.role_archetype_id} not found`);
    }

    // Check minimum requirements
    if (jobReq.min_confidence_score && cv.confidence_score < jobReq.min_confidence_score) {
      return this.createLowConfidenceResult(cv, jobReq, role);
    }

    if (jobReq.min_verification_days && cv.verification_days < jobReq.min_verification_days) {
      return this.createInsufficientDataResult(cv, jobReq, role);
    }

    // Calculate component scores
    const personalityMatch = this.calculatePersonalityMatch(cv.personality_profile, role, jobReq);
    const geniusMatch = this.calculateGeniusMatch(cv.personality_profile, role, jobReq);
    const flowMatch = this.calculateFlowMatch(cv, role);
    const energyMatch = this.calculateEnergyMatch(cv, role);
    const teamFit = jobReq.team_personality_balance
      ? this.calculateTeamFit(cv.personality_profile, jobReq.team_personality_balance)
      : 75; // Default if no team context

    // Calculate weighted overall score
    const matchScore =
      personalityMatch * 0.25 +
      geniusMatch * 0.25 +
      flowMatch * 0.20 +
      energyMatch * 0.15 +
      teamFit * 0.15;

    const matchQuality = this.getMatchQuality(matchScore);

    // Generate explanations
    const strengths = this.generateStrengths(cv, role, personalityMatch, geniusMatch, flowMatch, energyMatch, teamFit);
    const concerns = this.generateConcerns(cv, role, personalityMatch, geniusMatch, flowMatch, energyMatch, teamFit);
    const growthAreas = this.generateGrowthAreas(cv, role, personalityMatch, geniusMatch);

    const compatibilityExplanation = this.generateCompatibilityExplanation(
      cv, role, matchScore, matchQuality, personalityMatch, geniusMatch
    );

    const teamBalanceImpact = jobReq.team_personality_balance
      ? this.generateTeamBalanceImpact(cv.personality_profile, jobReq.team_personality_balance, teamFit)
      : undefined;

    return {
      job_id: jobReq.job_id,
      cv_id: cv.cv_id,
      match_score: Math.round(matchScore),
      match_quality: matchQuality,
      component_scores: {
        personality_match: Math.round(personalityMatch),
        genius_match: Math.round(geniusMatch),
        flow_match: Math.round(flowMatch),
        energy_match: Math.round(energyMatch),
        team_fit: Math.round(teamFit)
      },
      strengths,
      concerns,
      growth_areas: growthAreas,
      compatibility_explanation: compatibilityExplanation,
      team_balance_impact: teamBalanceImpact,
      calculated_at: Date.now()
    };
  }

  /**
   * Match multiple CVs to a job and rank them
   */
  static matchMultipleCandidates(
    cvs: PersonalityCV[],
    jobReq: JobRequirement
  ): JobMatchResult[] {
    return cvs
      .map(cv => this.matchJob(cv, jobReq))
      .sort((a, b) => b.match_score - a.match_score);
  }

  /**
   * Find best job matches for a CV from multiple job postings
   */
  static findBestJobs(
    cv: PersonalityCV,
    jobs: JobRequirement[]
  ): JobMatchResult[] {
    return jobs
      .map(job => this.matchJob(cv, job))
      .sort((a, b) => b.match_score - a.match_score);
  }

  /**
   * Calculate personality match score
   */
  private static calculatePersonalityMatch(
    profile: PersonalityProfile,
    role: RoleArchetype,
    jobReq: JobRequirement
  ): number {
    // Use custom weights if provided, otherwise use role defaults
    const weights = jobReq.custom_personality_weights || role.ideal_big_five;

    const bigFiveDimensions = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] as const;

    let totalScore = 0;
    let totalWeight = 0;

    for (const dimension of bigFiveDimensions) {
      const userScore = profile.big_five[dimension];
      const ideal = weights[dimension] || role.ideal_big_five[dimension];
      const weight = ideal.weight;

      let dimensionScore = 0;
      if (userScore >= ideal.min && userScore <= ideal.max) {
        dimensionScore = 100;
      } else if (userScore < ideal.min) {
        const distance = ideal.min - userScore;
        dimensionScore = Math.max(0, 100 - distance * 2);
      } else {
        const distance = userScore - ideal.max;
        dimensionScore = Math.max(0, 100 - distance * 2);
      }

      totalScore += dimensionScore * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? totalScore / totalWeight : 50;
  }

  /**
   * Calculate genius match score
   */
  private static calculateGeniusMatch(
    profile: PersonalityProfile,
    role: RoleArchetype,
    jobReq: JobRequirement
  ): number {
    const primaryWeight = jobReq.custom_genius_weights?.primary || 0.6;
    const secondaryWeight = jobReq.custom_genius_weights?.secondary || 0.4;

    const userPrimary = profile.genius.primary;
    const userSecondary = profile.genius.secondary;

    let score = 0;

    // Primary genius match
    if (role.required_genius.primary.includes(userPrimary)) {
      score += 60 * primaryWeight;
    } else if (role.required_genius.secondary.includes(userPrimary)) {
      score += 40 * primaryWeight;
    } else {
      const highestRequiredScore = Math.max(
        ...role.required_genius.primary.map(type => profile.genius[type])
      );
      score += (highestRequiredScore / 100) * 30 * primaryWeight;
    }

    // Secondary genius match
    if (role.required_genius.primary.includes(userSecondary)) {
      score += 40 * secondaryWeight;
    } else if (role.required_genius.secondary.includes(userSecondary)) {
      score += 30 * secondaryWeight;
    } else {
      const highestRequiredSecondaryScore = Math.max(
        ...role.required_genius.secondary.map(type => profile.genius[type])
      );
      score += (highestRequiredSecondaryScore / 100) * 20 * secondaryWeight;
    }

    // Bonus for overall high genius scores
    const avgGeniusScore = (profile.genius[userPrimary] + profile.genius[userSecondary]) / 2;
    score += (avgGeniusScore / 100) * 20;

    return Math.min(100, score);
  }

  /**
   * Calculate flow match score
   */
  private static calculateFlowMatch(cv: PersonalityCV, role: RoleArchetype): number {
    if (cv.flow_triggers.length === 0) return 50;

    let matchedTriggers = 0;
    let totalQuality = 0;

    for (const neededTrigger of role.flow_triggers_needed) {
      const matchingTrigger = cv.flow_triggers.find(trigger =>
        this.triggersMatch(trigger.activity_type, neededTrigger) ||
        this.triggersMatch(trigger.task_description, neededTrigger)
      );

      if (matchingTrigger) {
        matchedTriggers++;
        totalQuality += matchingTrigger.avg_flow_score * 100;
      }
    }

    if (role.flow_triggers_needed.length === 0) return 75;

    const matchRate = matchedTriggers / role.flow_triggers_needed.length;
    const avgQuality = matchedTriggers > 0 ? totalQuality / matchedTriggers : 0;

    return matchRate * 60 + avgQuality * 0.4;
  }

  /**
   * Calculate energy match score
   */
  private static calculateEnergyMatch(cv: PersonalityCV, role: RoleArchetype): number {
    let score = 50; // Base score
    let matches = 0;
    let mismatches = 0;

    // Check if high-energy tasks energize the user
    for (const highEnergyTask of role.energy_profile.high_energy_tasks) {
      const matchingActivity = cv.energy_map.energizing_activities.find(a =>
        this.activitiesMatch(a.activity, highEnergyTask)
      );

      if (matchingActivity) {
        score += matchingActivity.energy_impact * 20;
        matches++;
      } else {
        // Check if it's draining
        const drainingActivity = cv.energy_map.draining_activities.find(a =>
          this.activitiesMatch(a.activity, highEnergyTask)
        );
        if (drainingActivity) {
          score -= Math.abs(drainingActivity.energy_impact) * 15;
          mismatches++;
        }
      }
    }

    // Normalize
    if (matches + mismatches > 0) {
      const matchRatio = matches / (matches + mismatches);
      score = score * 0.5 + matchRatio * 50;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate team fit score
   */
  private static calculateTeamFit(
    candidateProfile: PersonalityProfile,
    teamBalance: JobRequirement['team_personality_balance']
  ): number {
    if (!teamBalance) return 75;

    let score = 60; // Base score

    const currentTeam = teamBalance.current_team_profile;
    const needed = teamBalance.needed_balance;

    // Check if candidate fills needed gaps
    for (const need of needed) {
      const lowerNeed = need.toLowerCase();

      // Check Big Five traits
      if (lowerNeed.includes('extraversion') && candidateProfile.big_five.extraversion > 60) {
        score += 10;
      }
      if (lowerNeed.includes('introversion') && candidateProfile.big_five.extraversion < 40) {
        score += 10;
      }
      if (lowerNeed.includes('conscientious') && candidateProfile.big_five.conscientiousness > 70) {
        score += 10;
      }
      if (lowerNeed.includes('creative') && candidateProfile.big_five.openness > 70) {
        score += 10;
      }
      if (lowerNeed.includes('agreeable') && candidateProfile.big_five.agreeableness > 70) {
        score += 10;
      }

      // Check genius types
      if (lowerNeed.includes('wonder') && candidateProfile.genius.wonder > 60) {
        score += 10;
      }
      if (lowerNeed.includes('invention') && candidateProfile.genius.invention > 60) {
        score += 10;
      }
      if (lowerNeed.includes('discern') && candidateProfile.genius.discernment > 60) {
        score += 10;
      }
      if (lowerNeed.includes('galvaniz') && candidateProfile.genius.galvanizing > 60) {
        score += 10;
      }
      if (lowerNeed.includes('enable') && candidateProfile.genius.enablement > 60) {
        score += 10;
      }
      if (lowerNeed.includes('tenac') && candidateProfile.genius.tenacity > 60) {
        score += 10;
      }
    }

    return Math.min(100, score);
  }

  /**
   * Generate strengths list
   */
  private static generateStrengths(
    cv: PersonalityCV,
    role: RoleArchetype,
    personalityMatch: number,
    geniusMatch: number,
    flowMatch: number,
    energyMatch: number,
    teamFit: number
  ): string[] {
    const strengths: string[] = [];

    // Personality strengths
    if (personalityMatch >= 80) {
      strengths.push('Exceptional personality alignment with role requirements');
    } else if (personalityMatch >= 65) {
      strengths.push('Strong personality fit for this role');
    }

    // Genius strengths
    if (geniusMatch >= 80) {
      const primary = cv.personality_profile.genius.primary;
      const secondary = cv.personality_profile.genius.secondary;
      strengths.push(`${primary} and ${secondary} genius types align perfectly with role needs`);
    } else if (geniusMatch >= 65) {
      strengths.push('Natural genius profile matches core role requirements');
    }

    // Flow strengths
    if (flowMatch >= 75) {
      strengths.push('Demonstrated flow states in key role activities');
      const topFlowTriggers = cv.flow_triggers.slice(0, 3).map(t => t.activity_type);
      strengths.push(`Achieves flow through: ${topFlowTriggers.join(', ')}`);
    }

    // Energy strengths
    if (energyMatch >= 75) {
      strengths.push('Core role activities are energizing rather than draining');
    }

    // Team fit strengths
    if (teamFit >= 80) {
      strengths.push('Excellent team personality balance contribution');
    }

    // Verification strengths
    if (cv.data_verified && cv.confidence_score >= 80) {
      strengths.push(`Verified by ${cv.verification_days} days of actual behavioral data`);
    }

    // Derived traits
    const derived = cv.personality_profile.derived;
    if (derived.stress_resilience > 75 && role.derived_traits_weight.stress_resilience > 0.7) {
      strengths.push('High stress resilience matches demanding role requirements');
    }

    if (derived.flow_tendency > 75 && role.derived_traits_weight.flow_tendency > 0.7) {
      strengths.push('Strong flow tendency ideal for deep work requirements');
    }

    return strengths;
  }

  /**
   * Generate concerns list
   */
  private static generateConcerns(
    cv: PersonalityCV,
    role: RoleArchetype,
    personalityMatch: number,
    geniusMatch: number,
    flowMatch: number,
    energyMatch: number,
    teamFit: number
  ): string[] {
    const concerns: string[] = [];

    // Personality concerns
    if (personalityMatch < 50) {
      concerns.push('Significant personality misalignment with role requirements');
    } else if (personalityMatch < 65) {
      concerns.push('Some personality traits outside ideal range for this role');
    }

    // Genius concerns
    if (geniusMatch < 50) {
      concerns.push('Primary genius types do not align with role requirements');
    } else if (geniusMatch < 65) {
      concerns.push('Partial genius type mismatch may require development');
    }

    // Flow concerns
    if (flowMatch < 50) {
      concerns.push('Limited evidence of flow in key role activities');
    }

    // Energy concerns
    if (energyMatch < 50) {
      concerns.push('Core role activities may be draining rather than energizing');
    } else if (energyMatch < 65) {
      concerns.push('Some role activities may not align with natural energy patterns');
    }

    // Team fit concerns
    if (teamFit < 60) {
      concerns.push('May not fill critical team personality gaps');
    }

    // Data concerns
    if (!cv.data_verified) {
      concerns.push(`Limited verification data (${cv.verification_days} days, recommend 60+)`);
    }

    if (cv.confidence_score < 70) {
      concerns.push(`Lower confidence score (${cv.confidence_score}/100) - more data needed for accurate assessment`);
    }

    return concerns;
  }

  /**
   * Generate growth areas
   */
  private static generateGrowthAreas(
    cv: PersonalityCV,
    role: RoleArchetype,
    personalityMatch: number,
    geniusMatch: number
  ): string[] {
    return RoleFitAnalyzer.getDetailedAnalysis(
      cv.personality_profile,
      role,
      cv.flow_triggers,
      cv.energy_map.energizing_activities
    ).growth_areas;
  }

  /**
   * Generate compatibility explanation
   */
  private static generateCompatibilityExplanation(
    cv: PersonalityCV,
    role: RoleArchetype,
    matchScore: number,
    matchQuality: string,
    personalityMatch: number,
    geniusMatch: number
  ): string {
    const parts: string[] = [];

    // Overall assessment
    if (matchScore >= 90) {
      parts.push(`This is a ${matchQuality} match (${Math.round(matchScore)}/100) - like a key in a lock.`);
    } else if (matchScore >= 75) {
      parts.push(`This is an ${matchQuality} match (${Math.round(matchScore)}/100) with strong alignment.`);
    } else if (matchScore >= 60) {
      parts.push(`This is a ${matchQuality} match (${Math.round(matchScore)}/100) with reasonable compatibility.`);
    } else if (matchScore >= 40) {
      parts.push(`This is a ${matchQuality} match (${Math.round(matchScore)}/100) with some concerns.`);
    } else {
      parts.push(`This is a ${matchQuality} match (${Math.round(matchScore)}/100) with significant misalignment.`);
    }

    // Personality explanation
    const profile = cv.personality_profile;
    const primary = profile.genius.primary;
    const secondary = profile.genius.secondary;

    parts.push(`The candidate's ${primary} and ${secondary} genius types ${geniusMatch >= 70 ? 'strongly align' : geniusMatch >= 50 ? 'partially align' : 'do not align well'} with the ${role.title} role requirements.`);

    // Work style explanation
    parts.push(`Their ideal work style (${cv.summary.ideal_work_style.toLowerCase()}) ${this.workStyleAligns(cv.summary, role) ? 'matches' : 'differs from'} the typical ${role.title} environment.`);

    // Flow explanation
    if (cv.flow_triggers.length > 0) {
      const topFlowActivity = cv.flow_triggers[0].activity_type;
      parts.push(`They achieve peak performance through ${topFlowActivity.toLowerCase()}.`);
    }

    return parts.join(' ');
  }

  /**
   * Generate team balance impact explanation
   */
  private static generateTeamBalanceImpact(
    profile: PersonalityProfile,
    teamBalance: JobRequirement['team_personality_balance'],
    teamFit: number
  ): string {
    if (!teamBalance) return '';

    const parts: string[] = [];

    if (teamFit >= 80) {
      parts.push('This candidate would significantly improve team balance.');
    } else if (teamFit >= 65) {
      parts.push('This candidate would contribute positively to team dynamics.');
    } else {
      parts.push('This candidate may not address key team personality gaps.');
    }

    // Specific contributions
    const needed = teamBalance.needed_balance;
    const contributions: string[] = [];

    for (const need of needed) {
      const lowerNeed = need.toLowerCase();

      if (lowerNeed.includes('extraversion') && profile.big_five.extraversion > 60) {
        contributions.push('brings extraverted energy');
      }
      if (lowerNeed.includes('creative') && profile.big_five.openness > 70) {
        contributions.push('adds creative perspective');
      }
      if (lowerNeed.includes('structure') && profile.big_five.conscientiousness > 70) {
        contributions.push('provides organizational structure');
      }
    }

    if (contributions.length > 0) {
      parts.push(`Specifically, they ${contributions.join(', ')}.`);
    }

    return parts.join(' ');
  }

  /**
   * Get match quality label
   */
  private static getMatchQuality(score: number): 'perfect' | 'excellent' | 'good' | 'moderate' | 'poor' {
    if (score >= 90) return 'perfect';
    if (score >= 75) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'moderate';
    return 'poor';
  }

  /**
   * Check if work style aligns
   */
  private static workStyleAligns(summary: PersonalityCV['summary'], role: RoleArchetype): boolean {
    // Check autonomy
    if (summary.autonomy_preference === 'high' && role.energy_profile.autonomy_level !== 'high') {
      return false;
    }

    // Check collaboration
    if (summary.optimal_team_size === 'solo' && role.energy_profile.collaboration_level === 'high') {
      return false;
    }

    if (summary.optimal_team_size === 'large' && role.energy_profile.collaboration_level === 'low') {
      return false;
    }

    return true;
  }

  /**
   * Helper: Check if triggers match
   */
  private static triggersMatch(trigger1: string, trigger2: string): boolean {
    const t1 = trigger1.toLowerCase();
    const t2 = trigger2.toLowerCase();

    if (t1 === t2) return true;
    if (t1.includes(t2) || t2.includes(t1)) return true;

    const words1 = t1.split(/\s+/);
    const words2 = t2.split(/\s+/);
    const overlap = words1.filter(w => words2.includes(w)).length;

    return overlap >= 2;
  }

  /**
   * Helper: Check if activities match
   */
  private static activitiesMatch(activity1: string, activity2: string): boolean {
    return this.triggersMatch(activity1, activity2);
  }

  /**
   * Create result for low confidence CV
   */
  private static createLowConfidenceResult(
    cv: PersonalityCV,
    jobReq: JobRequirement,
    role: RoleArchetype
  ): JobMatchResult {
    return {
      job_id: jobReq.job_id,
      cv_id: cv.cv_id,
      match_score: 0,
      match_quality: 'poor',
      component_scores: {
        personality_match: 0,
        genius_match: 0,
        flow_match: 0,
        energy_match: 0,
        team_fit: 0
      },
      strengths: [],
      concerns: [`Confidence score (${cv.confidence_score}) below minimum required (${jobReq.min_confidence_score})`],
      growth_areas: ['Complete more personality assessments to build confidence'],
      compatibility_explanation: 'Insufficient confidence in personality data for accurate matching.',
      calculated_at: Date.now()
    };
  }

  /**
   * Create result for insufficient verification data
   */
  private static createInsufficientDataResult(
    cv: PersonalityCV,
    jobReq: JobRequirement,
    role: RoleArchetype
  ): JobMatchResult {
    return {
      job_id: jobReq.job_id,
      cv_id: cv.cv_id,
      match_score: 0,
      match_quality: 'poor',
      component_scores: {
        personality_match: 0,
        genius_match: 0,
        flow_match: 0,
        energy_match: 0,
        team_fit: 0
      },
      strengths: [],
      concerns: [`Verification period (${cv.verification_days} days) below minimum required (${jobReq.min_verification_days} days)`],
      growth_areas: ['Continue tracking mood and flow data to build verification'],
      compatibility_explanation: 'Insufficient verification data for accurate matching.',
      calculated_at: Date.now()
    };
  }
}
