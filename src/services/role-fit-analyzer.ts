// GreenBlu.ai Role Fit Analyzer
// Calculate how well someone fits a job role based on personality, genius, flow, and energy

import type { PersonalityProfile, RoleArchetype, RoleFitScore, FlowTrigger, EnergyActivity, GeniusType } from '../types';

export interface RoleFitAnalysis {
  role: RoleArchetype;
  fit_score: RoleFitScore;
  detailed_analysis: {
    personality_breakdown: {
      dimension: string;
      user_score: number;
      ideal_range: { min: number; max: number };
      fit_score: number;
      status: 'perfect' | 'good' | 'acceptable' | 'concern';
    }[];
    genius_breakdown: {
      type: GeniusType;
      user_score: number;
      importance: 'primary' | 'secondary' | 'not_required';
      fit_score: number;
    }[];
    flow_alignment: {
      trigger: string;
      matched: boolean;
      importance: number;
    }[];
    energy_alignment: {
      task: string;
      energy_impact: 'energizing' | 'neutral' | 'draining';
      frequency: string;
    }[];
  };
  recommendations: string[];
  growth_areas: string[];
}

export class RoleFitAnalyzer {
  /**
   * Calculate overall fit score between a person and a role
   * Weights: personality (30%), genius (25%), flow (20%), energy (15%), skills (10%)
   */
  static calculateFitScore(
    profile: PersonalityProfile,
    role: RoleArchetype,
    flowTriggers?: FlowTrigger[],
    energyActivities?: EnergyActivity[]
  ): RoleFitScore {
    // Component scores
    const personalityScore = this.calculatePersonalityFit(profile, role);
    const geniusScore = this.calculateGeniusFit(profile, role);
    const flowScore = flowTriggers ? this.calculateFlowFit(flowTriggers, role) : 50;
    const energyScore = energyActivities ? this.calculateEnergyFit(energyActivities, role) : 50;
    const skillsScore = 50; // Placeholder - would be based on actual skills data

    // Weighted overall score
    const overallScore =
      personalityScore * 0.30 +
      geniusScore * 0.25 +
      flowScore * 0.20 +
      energyScore * 0.15 +
      skillsScore * 0.10;

    const matchQuality = this.getMatchQuality(overallScore);

    return {
      role_id: role.role_id,
      role_title: role.title,
      overall_score: Math.round(overallScore),
      component_scores: {
        personality_fit: Math.round(personalityScore),
        genius_fit: Math.round(geniusScore),
        flow_fit: Math.round(flowScore),
        energy_fit: Math.round(energyScore),
        skills_fit: Math.round(skillsScore)
      },
      match_quality: matchQuality,
      calculated_at: Date.now()
    };
  }

  /**
   * Calculate personality fit based on Big Five and derived traits
   */
  private static calculatePersonalityFit(profile: PersonalityProfile, role: RoleArchetype): number {
    const bigFiveDimensions = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] as const;

    let totalScore = 0;
    let totalWeight = 0;

    // Big Five fit
    for (const dimension of bigFiveDimensions) {
      const userScore = profile.big_five[dimension];
      const ideal = role.ideal_big_five[dimension];
      const weight = ideal.weight;

      // Calculate how close user is to ideal range
      let dimensionScore = 0;
      if (userScore >= ideal.min && userScore <= ideal.max) {
        // Perfect fit - within ideal range
        dimensionScore = 100;
      } else if (userScore < ideal.min) {
        // Below minimum - scale based on distance
        const distance = ideal.min - userScore;
        dimensionScore = Math.max(0, 100 - distance * 2);
      } else {
        // Above maximum - scale based on distance
        const distance = userScore - ideal.max;
        dimensionScore = Math.max(0, 100 - distance * 2);
      }

      totalScore += dimensionScore * weight;
      totalWeight += weight;
    }

    const bigFiveScore = totalWeight > 0 ? totalScore / totalWeight : 0;

    // Derived traits fit
    const derivedScore = this.calculateDerivedTraitsFit(profile, role);

    // Combine (70% Big Five, 30% derived traits)
    return bigFiveScore * 0.7 + derivedScore * 0.3;
  }

  /**
   * Calculate fit based on derived personality traits
   */
  private static calculateDerivedTraitsFit(profile: PersonalityProfile, role: RoleArchetype): number {
    const derivedDimensions = [
      'stress_resilience',
      'optimism',
      'flow_tendency',
      'collaboration_preference',
      'structure_need',
      'energy_baseline',
      'recovery_speed',
      'risk_tolerance'
    ] as const;

    let totalScore = 0;
    let totalWeight = 0;

    for (const dimension of derivedDimensions) {
      const userScore = profile.derived[dimension];
      const weight = role.derived_traits_weight[dimension];

      if (weight === 0) continue;

      // For high-weight traits, user should have high scores
      // For low-weight traits, user score doesn't matter as much
      let dimensionScore = 0;

      if (weight >= 0.7) {
        // High importance - user needs 60+ score
        dimensionScore = userScore >= 60 ? 100 : (userScore / 60) * 100;
      } else if (weight >= 0.4) {
        // Medium importance - user needs 40+ score
        dimensionScore = userScore >= 40 ? 100 : (userScore / 40) * 100;
      } else {
        // Low importance - any score is acceptable
        dimensionScore = 80;
      }

      totalScore += dimensionScore * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? totalScore / totalWeight : 50;
  }

  /**
   * Calculate genius fit based on primary and secondary genius types
   */
  private static calculateGeniusFit(profile: PersonalityProfile, role: RoleArchetype): number {
    const userPrimary = profile.genius.primary;
    const userSecondary = profile.genius.secondary;
    const userPrimaryScore = profile.genius[userPrimary];
    const userSecondaryScore = profile.genius[userSecondary];

    let score = 0;

    // Check if user's primary genius matches role's primary requirements
    if (role.required_genius.primary.includes(userPrimary)) {
      score += 50; // Perfect primary match
    } else if (role.required_genius.secondary.includes(userPrimary)) {
      score += 30; // Primary matches secondary requirement
    } else {
      // Check if user has a high score in any required primary genius
      const highestRequiredScore = Math.max(
        ...role.required_genius.primary.map(type => profile.genius[type])
      );
      score += (highestRequiredScore / 100) * 25;
    }

    // Check if user's secondary genius matches role requirements
    if (role.required_genius.primary.includes(userSecondary)) {
      score += 30; // Secondary matches primary requirement
    } else if (role.required_genius.secondary.includes(userSecondary)) {
      score += 20; // Perfect secondary match
    } else {
      // Check if user has high scores in required secondary genius
      const highestRequiredSecondaryScore = Math.max(
        ...role.required_genius.secondary.map(type => profile.genius[type])
      );
      score += (highestRequiredSecondaryScore / 100) * 15;
    }

    // Bonus for high genius scores
    const avgGeniusScore = (userPrimaryScore + userSecondaryScore) / 2;
    score += (avgGeniusScore / 100) * 15;

    return Math.min(100, score);
  }

  /**
   * Calculate flow fit based on flow triggers
   */
  private static calculateFlowFit(flowTriggers: FlowTrigger[], role: RoleArchetype): number {
    if (flowTriggers.length === 0) return 50;

    let matchScore = 0;
    let totalTriggersNeeded = role.flow_triggers_needed.length;

    for (const neededTrigger of role.flow_triggers_needed) {
      // Check if user has this trigger in their flow patterns
      const matchingTrigger = flowTriggers.find(trigger =>
        this.triggersMatch(trigger.activity_type, neededTrigger) ||
        this.triggersMatch(trigger.task_description, neededTrigger)
      );

      if (matchingTrigger) {
        // Weight by flow score and frequency
        const triggerQuality = matchingTrigger.avg_flow_score * 100;
        const triggerFrequency = Math.min(1, matchingTrigger.frequency / 10) * 100;
        const triggerScore = (triggerQuality * 0.7 + triggerFrequency * 0.3);
        matchScore += triggerScore;
      }
    }

    const averageScore = totalTriggersNeeded > 0 ? matchScore / totalTriggersNeeded : 50;
    return Math.min(100, averageScore);
  }

  /**
   * Calculate energy fit based on energy activities
   */
  private static calculateEnergyFit(energyActivities: EnergyActivity[], role: RoleArchetype): number {
    if (energyActivities.length === 0) return 50;

    let energizingScore = 0;
    let drainingScore = 0;
    let energizingCount = 0;
    let drainingCount = 0;

    // Check energizing activities
    for (const highEnergyTask of role.energy_profile.high_energy_tasks) {
      const matchingActivity = energyActivities.find(activity =>
        this.activitiesMatch(activity.activity, highEnergyTask)
      );

      if (matchingActivity) {
        // If this energizes the user, great!
        if (matchingActivity.energy_impact > 0) {
          energizingScore += matchingActivity.energy_impact * 100 * matchingActivity.frequency;
          energizingCount += matchingActivity.frequency;
        } else {
          // If this drains the user but role needs it, that's a problem
          drainingScore += Math.abs(matchingActivity.energy_impact) * 100 * matchingActivity.frequency;
          drainingCount += matchingActivity.frequency;
        }
      }
    }

    // Check draining activities
    for (const lowEnergyTask of role.energy_profile.low_energy_tasks) {
      const matchingActivity = energyActivities.find(activity =>
        this.activitiesMatch(activity.activity, lowEnergyTask)
      );

      if (matchingActivity) {
        // If this drains the user and it's a low-energy task in the role, that's expected
        // So we don't penalize heavily
        if (matchingActivity.energy_impact < 0) {
          // Mild penalty
          drainingScore += Math.abs(matchingActivity.energy_impact) * 50 * matchingActivity.frequency;
          drainingCount += matchingActivity.frequency;
        }
      }
    }

    const avgEnergizing = energizingCount > 0 ? energizingScore / energizingCount : 50;
    const avgDraining = drainingCount > 0 ? drainingScore / drainingCount : 50;

    // Higher weight on energizing activities
    const finalScore = avgEnergizing * 0.7 - avgDraining * 0.3;
    return Math.max(0, Math.min(100, finalScore));
  }

  /**
   * Get detailed analysis of role fit
   */
  static getDetailedAnalysis(
    profile: PersonalityProfile,
    role: RoleArchetype,
    flowTriggers?: FlowTrigger[],
    energyActivities?: EnergyActivity[]
  ): RoleFitAnalysis {
    const fitScore = this.calculateFitScore(profile, role, flowTriggers, energyActivities);

    // Personality breakdown
    const personalityBreakdown = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'].map(dim => {
      const dimension = dim as keyof typeof profile.big_five;
      if (dimension === 'confidence') return null;

      const userScore = profile.big_five[dimension] as number;
      const ideal = role.ideal_big_five[dimension];

      let dimensionFitScore = 0;
      let status: 'perfect' | 'good' | 'acceptable' | 'concern' = 'concern';

      if (userScore >= ideal.min && userScore <= ideal.max) {
        dimensionFitScore = 100;
        status = 'perfect';
      } else if (userScore < ideal.min) {
        const distance = ideal.min - userScore;
        dimensionFitScore = Math.max(0, 100 - distance * 2);
        status = distance <= 10 ? 'good' : distance <= 20 ? 'acceptable' : 'concern';
      } else {
        const distance = userScore - ideal.max;
        dimensionFitScore = Math.max(0, 100 - distance * 2);
        status = distance <= 10 ? 'good' : distance <= 20 ? 'acceptable' : 'concern';
      }

      return {
        dimension: dim,
        user_score: userScore,
        ideal_range: { min: ideal.min, max: ideal.max },
        fit_score: dimensionFitScore,
        status
      };
    }).filter(Boolean) as RoleFitAnalysis['detailed_analysis']['personality_breakdown'];

    // Genius breakdown
    const geniusTypes: GeniusType[] = ['wonder', 'invention', 'discernment', 'galvanizing', 'enablement', 'tenacity'];
    const geniusBreakdown = geniusTypes.map(type => {
      const userScore = profile.genius[type];
      let importance: 'primary' | 'secondary' | 'not_required' = 'not_required';
      let fitScore = 0;

      if (role.required_genius.primary.includes(type)) {
        importance = 'primary';
        fitScore = userScore >= 60 ? 100 : (userScore / 60) * 100;
      } else if (role.required_genius.secondary.includes(type)) {
        importance = 'secondary';
        fitScore = userScore >= 50 ? 100 : (userScore / 50) * 100;
      } else {
        fitScore = 50; // Not required
      }

      return {
        type,
        user_score: userScore,
        importance,
        fit_score: Math.round(fitScore)
      };
    });

    // Flow alignment
    const flowAlignment = role.flow_triggers_needed.map(trigger => {
      const matched = flowTriggers?.some(ft =>
        this.triggersMatch(ft.activity_type, trigger) ||
        this.triggersMatch(ft.task_description, trigger)
      ) || false;

      return {
        trigger,
        matched,
        importance: 1 // Could be weighted based on role requirements
      };
    });

    // Energy alignment
    const energyAlignment: RoleFitAnalysis['detailed_analysis']['energy_alignment'] = [];

    for (const task of role.typical_tasks) {
      const matchingActivity = energyActivities?.find(activity =>
        this.activitiesMatch(activity.activity, task.task)
      );

      let energyImpact: 'energizing' | 'neutral' | 'draining' = 'neutral';
      if (matchingActivity) {
        energyImpact = matchingActivity.energy_impact > 0.3 ? 'energizing' :
                       matchingActivity.energy_impact < -0.3 ? 'draining' : 'neutral';
      }

      energyAlignment.push({
        task: task.task,
        energy_impact: energyImpact,
        frequency: task.frequency
      });
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(fitScore, personalityBreakdown, geniusBreakdown, role);
    const growthAreas = this.generateGrowthAreas(personalityBreakdown, geniusBreakdown, role);

    return {
      role,
      fit_score: fitScore,
      detailed_analysis: {
        personality_breakdown: personalityBreakdown,
        genius_breakdown: geniusBreakdown,
        flow_alignment: flowAlignment,
        energy_alignment: energyAlignment
      },
      recommendations,
      growth_areas: growthAreas
    };
  }

  /**
   * Compare fit across multiple roles
   */
  static compareRoles(
    profile: PersonalityProfile,
    roles: RoleArchetype[],
    flowTriggers?: FlowTrigger[],
    energyActivities?: EnergyActivity[]
  ): RoleFitScore[] {
    return roles
      .map(role => this.calculateFitScore(profile, role, flowTriggers, energyActivities))
      .sort((a, b) => b.overall_score - a.overall_score);
  }

  /**
   * Get match quality label based on score
   */
  private static getMatchQuality(score: number): 'perfect' | 'excellent' | 'good' | 'moderate' | 'poor' {
    if (score >= 90) return 'perfect';
    if (score >= 75) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'moderate';
    return 'poor';
  }

  /**
   * Check if two triggers match (fuzzy matching)
   */
  private static triggersMatch(trigger1: string, trigger2: string): boolean {
    const t1 = trigger1.toLowerCase();
    const t2 = trigger2.toLowerCase();

    // Exact match
    if (t1 === t2) return true;

    // Substring match
    if (t1.includes(t2) || t2.includes(t1)) return true;

    // Word overlap
    const words1 = t1.split(/\s+/);
    const words2 = t2.split(/\s+/);
    const overlap = words1.filter(w => words2.includes(w)).length;

    return overlap >= 2; // At least 2 words in common
  }

  /**
   * Check if two activities match (fuzzy matching)
   */
  private static activitiesMatch(activity1: string, activity2: string): boolean {
    return this.triggersMatch(activity1, activity2);
  }

  /**
   * Generate recommendations based on fit analysis
   */
  private static generateRecommendations(
    fitScore: RoleFitScore,
    personalityBreakdown: RoleFitAnalysis['detailed_analysis']['personality_breakdown'],
    geniusBreakdown: RoleFitAnalysis['detailed_analysis']['genius_breakdown'],
    role: RoleArchetype
  ): string[] {
    const recommendations: string[] = [];

    if (fitScore.overall_score >= 90) {
      recommendations.push('Outstanding match! Your personality profile aligns exceptionally well with this role.');
    } else if (fitScore.overall_score >= 75) {
      recommendations.push('Excellent fit! You have strong alignment with the core requirements of this role.');
    } else if (fitScore.overall_score >= 60) {
      recommendations.push('Good potential fit. Consider the growth areas to maximize your success in this role.');
    } else {
      recommendations.push('Moderate fit. This role may require significant adaptation from your natural working style.');
    }

    // Check for genius strengths
    const primaryGeniusMatches = geniusBreakdown.filter(g =>
      g.importance === 'primary' && g.user_score >= 70
    );

    if (primaryGeniusMatches.length > 0) {
      recommendations.push(
        `Your ${primaryGeniusMatches.map(g => g.type).join(' and ')} genius types are strong matches for this role.`
      );
    }

    // Check for personality strengths
    const perfectPersonality = personalityBreakdown.filter(p => p.status === 'perfect');
    if (perfectPersonality.length >= 3) {
      recommendations.push('Your personality traits align well with the role requirements across multiple dimensions.');
    }

    return recommendations;
  }

  /**
   * Generate growth areas based on fit analysis
   */
  private static generateGrowthAreas(
    personalityBreakdown: RoleFitAnalysis['detailed_analysis']['personality_breakdown'],
    geniusBreakdown: RoleFitAnalysis['detailed_analysis']['genius_breakdown'],
    role: RoleArchetype
  ): string[] {
    const growthAreas: string[] = [];

    // Check for personality concerns
    const concernDimensions = personalityBreakdown.filter(p => p.status === 'concern');
    for (const concern of concernDimensions) {
      if (concern.user_score < concern.ideal_range.min) {
        growthAreas.push(
          `Consider developing higher ${concern.dimension} (currently ${concern.user_score}, ideal ${concern.ideal_range.min}-${concern.ideal_range.max})`
        );
      } else {
        growthAreas.push(
          `Your ${concern.dimension} score is higher than typical for this role (currently ${concern.user_score}, ideal ${concern.ideal_range.min}-${concern.ideal_range.max})`
        );
      }
    }

    // Check for missing genius types
    const weakGeniusTypes = geniusBreakdown.filter(g =>
      g.importance === 'primary' && g.user_score < 50
    );

    for (const weak of weakGeniusTypes) {
      growthAreas.push(
        `Strengthen your ${weak.type} genius (currently ${weak.user_score}/100) as it's critical for this role`
      );
    }

    // Role-specific recommendations
    if (role.energy_profile.collaboration_level === 'high' &&
        personalityBreakdown.find(p => p.dimension === 'extraversion')?.user_score || 0 < 50) {
      growthAreas.push('This role requires high collaboration - consider developing comfort with extensive teamwork');
    }

    if (role.energy_profile.autonomy_level === 'high' &&
        personalityBreakdown.find(p => p.dimension === 'conscientiousness')?.user_score || 0 < 60) {
      growthAreas.push('High autonomy roles benefit from strong self-direction and discipline');
    }

    return growthAreas;
  }
}
