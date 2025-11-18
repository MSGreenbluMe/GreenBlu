// GreenBlu.ai Personality Scoring Service
// Production-ready scoring algorithms for all personality frameworks

import type {
  PersonalityProfile,
  PersonalityResponse,
  BigFive,
  MBTI,
  DISC,
  Enneagram,
  GeniusProfile,
  GeniusType,
  Strength,
  DerivedTraits
} from '../types';
import { PERSONALITY_QUESTIONS } from '../data/personality-questions';

interface DimensionScore {
  rawScore: number;
  normalizedScore: number;
  confidence: number;
  questionCount: number;
}

interface FrameworkScores {
  [dimension: string]: DimensionScore;
}

/**
 * Calculate personality scores from user responses
 */
export class PersonalityScorer {
  /**
   * Update full personality profile with new response
   */
  static async scoreProfile(
    responses: PersonalityResponse[],
    currentProfile?: PersonalityProfile
  ): Promise<PersonalityProfile> {
    // Group responses by framework
    const byFramework = this.groupResponsesByFramework(responses);

    // Score each framework
    const bigFive = this.scoreBigFive(byFramework.big_five || []);
    const mbti = this.scoreMBTI(byFramework.mbti || []);
    const disc = this.scoreDISC(byFramework.disc || []);
    const enneagram = this.scoreEnneagram(byFramework.enneagram || []);
    const genius = this.scoreGenius(byFramework.genius || []);
    const strengths = this.scoreStrengths(byFramework.strengths || []);

    // Calculate derived traits from all frameworks
    const derived = this.calculateDerivedTraits(bigFive, mbti, disc, enneagram, genius);

    // Calculate overall progress
    const totalQuestions = PERSONALITY_QUESTIONS.length;
    const answeredQuestions = responses.length;
    const assessmentProgress = Math.min(100, (answeredQuestions / totalQuestions) * 100);

    return {
      user_id: responses[0]?.user_id || currentProfile?.user_id || 'default-user',
      last_updated: Date.now(),
      big_five: bigFive,
      mbti: mbti,
      disc: disc,
      enneagram: enneagram,
      genius: genius,
      strengths: strengths,
      derived: derived,
      questions_answered: answeredQuestions,
      assessment_progress: assessmentProgress,
      last_question_date: new Date().toISOString().split('T')[0]
    };
  }

  /**
   * Group responses by framework for easier processing
   */
  private static groupResponsesByFramework(
    responses: PersonalityResponse[]
  ): Record<string, PersonalityResponse[]> {
    return responses.reduce((acc, response) => {
      if (!acc[response.framework]) {
        acc[response.framework] = [];
      }
      acc[response.framework].push(response);
      return acc;
    }, {} as Record<string, PersonalityResponse[]>);
  }

  /**
   * Score Big Five personality traits (0-100 scale with confidence)
   */
  static scoreBigFive(responses: PersonalityResponse[]): BigFive {
    const dimensions = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    const scores: FrameworkScores = {};

    // Calculate raw scores for each dimension
    for (const dimension of dimensions) {
      const dimensionResponses = responses.filter(r => r.dimension === dimension);

      if (dimensionResponses.length === 0) {
        scores[dimension] = {
          rawScore: 50, // Default neutral score
          normalizedScore: 50,
          confidence: 0,
          questionCount: 0
        };
        continue;
      }

      let totalScore = 0;
      let maxPossible = 0;

      for (const response of dimensionResponses) {
        const question = PERSONALITY_QUESTIONS.find(q => q.question_id === response.question_id);
        if (!question || !question.scoring) continue;

        const scoreValue = question.scoring[response.response as string];
        if (scoreValue !== undefined) {
          totalScore += scoreValue;
          maxPossible += 5; // Maximum score per question
        }
      }

      // Normalize to 0-100 scale
      const normalizedScore = maxPossible > 0 ? (totalScore / maxPossible) * 100 : 50;

      // Calculate confidence based on number of questions answered
      // Require at least 6 questions for 50% confidence, 12 for 100%
      const targetQuestions = 12;
      const confidence = Math.min(1, dimensionResponses.length / targetQuestions);

      scores[dimension] = {
        rawScore: totalScore,
        normalizedScore: Math.round(normalizedScore),
        confidence: confidence,
        questionCount: dimensionResponses.length
      };
    }

    return {
      openness: scores.openness.normalizedScore,
      conscientiousness: scores.conscientiousness.normalizedScore,
      extraversion: scores.extraversion.normalizedScore,
      agreeableness: scores.agreeableness.normalizedScore,
      neuroticism: scores.neuroticism.normalizedScore,
      confidence: {
        openness: scores.openness.confidence,
        conscientiousness: scores.conscientiousness.confidence,
        extraversion: scores.extraversion.confidence,
        agreeableness: scores.agreeableness.confidence,
        neuroticism: scores.neuroticism.confidence
      }
    };
  }

  /**
   * Score MBTI personality type (-100 to +100 per dimension)
   */
  static scoreMBTI(responses: PersonalityResponse[]): MBTI {
    const dimensions = ['EI', 'SN', 'TF', 'JP'];
    const scores: Record<string, number> = {};
    const counts: Record<string, number> = {};

    // Initialize
    dimensions.forEach(dim => {
      scores[dim] = 0;
      counts[dim] = 0;
    });

    // Calculate raw scores for each dimension
    for (const response of responses) {
      const question = PERSONALITY_QUESTIONS.find(q => q.question_id === response.question_id);
      if (!question || !question.scoring) continue;

      const dimension = response.dimension;
      const scoreValue = question.scoring[response.response as string];

      if (scoreValue !== undefined && dimensions.includes(dimension)) {
        scores[dimension] += scoreValue;
        counts[dimension]++;
      }
    }

    // Normalize to -100 to +100 scale
    const normalizedScores: Record<string, number> = {};
    for (const dim of dimensions) {
      if (counts[dim] > 0) {
        // Each question contributes -2 to +2, average them
        const avgScore = scores[dim] / counts[dim];
        // Scale to -100 to +100
        normalizedScores[dim] = Math.round(avgScore * 50);
      } else {
        normalizedScores[dim] = 0; // Neutral
      }
    }

    // Determine MBTI type
    const type = this.getMBTIType(normalizedScores);

    // Calculate overall confidence
    const totalResponses = responses.length;
    const targetResponses = 48; // 12 per dimension
    const confidence = Math.min(1, totalResponses / targetResponses);

    return {
      EI: normalizedScores.EI,
      SN: normalizedScores.SN,
      TF: normalizedScores.TF,
      JP: normalizedScores.JP,
      type: type,
      confidence: confidence
    };
  }

  /**
   * Determine 4-letter MBTI type from dimension scores
   */
  private static getMBTIType(scores: Record<string, number>): string {
    let type = '';
    type += scores.EI >= 0 ? 'E' : 'I';
    type += scores.SN >= 0 ? 'N' : 'S';
    type += scores.TF >= 0 ? 'F' : 'T';
    type += scores.JP >= 0 ? 'P' : 'J';
    return type;
  }

  /**
   * Score DISC profile (0-100 percentage distribution)
   */
  static scoreDISC(responses: PersonalityResponse[]): DISC {
    const dimensions = ['dominance', 'influence', 'steadiness', 'conscientiousness'];
    const rawScores: Record<string, number> = {};
    const counts: Record<string, number> = {};

    // Initialize
    dimensions.forEach(dim => {
      rawScores[dim] = 0;
      counts[dim] = 0;
    });

    // Calculate raw scores
    for (const response of responses) {
      const question = PERSONALITY_QUESTIONS.find(q => q.question_id === response.question_id);
      if (!question || !question.scoring) continue;

      const dimension = response.dimension;
      const scoreValue = question.scoring[response.response as string];

      if (scoreValue !== undefined && dimensions.includes(dimension)) {
        rawScores[dimension] += scoreValue;
        counts[dimension]++;
      }
    }

    // Normalize each dimension to 0-100
    const normalizedScores: Record<string, number> = {};
    for (const dim of dimensions) {
      if (counts[dim] > 0) {
        // Each question is 1-5, normalize to 0-100
        const avgScore = rawScores[dim] / counts[dim];
        normalizedScores[dim] = Math.round(((avgScore - 1) / 4) * 100);
      } else {
        normalizedScores[dim] = 50; // Default neutral
      }
    }

    // Calculate confidence
    const totalResponses = responses.length;
    const targetResponses = 40; // 10 per dimension
    const confidence = Math.min(1, totalResponses / targetResponses);

    return {
      dominance: normalizedScores.dominance,
      influence: normalizedScores.influence,
      steadiness: normalizedScores.steadiness,
      conscientiousness: normalizedScores.conscientiousness,
      confidence: confidence
    };
  }

  /**
   * Score Enneagram type (identify primary type and wing)
   */
  static scoreEnneagram(responses: PersonalityResponse[]): Enneagram {
    const typeScores: number[] = new Array(9).fill(0);
    const typeCounts: number[] = new Array(9).fill(0);

    // Calculate raw scores for each type
    for (const response of responses) {
      const question = PERSONALITY_QUESTIONS.find(q => q.question_id === response.question_id);
      if (!question || !question.scoring) continue;

      // Extract type number from dimension (e.g., 'type_1' -> 0)
      const typeMatch = response.dimension.match(/type_(\d+)/);
      if (typeMatch) {
        const typeIndex = parseInt(typeMatch[1]) - 1; // Convert to 0-indexed
        const scoreValue = question.scoring[response.response as string];

        if (scoreValue !== undefined && typeIndex >= 0 && typeIndex < 9) {
          typeScores[typeIndex] += scoreValue;
          typeCounts[typeIndex]++;
        }
      }
    }

    // Normalize scores to 0-100
    const normalizedScores = typeScores.map((score, index) => {
      if (typeCounts[index] > 0) {
        const avgScore = score / typeCounts[index];
        return Math.round(((avgScore - 1) / 4) * 100);
      }
      return 0;
    });

    // Find primary type (highest score)
    const maxScore = Math.max(...normalizedScores);
    const primaryType = normalizedScores.indexOf(maxScore) + 1;

    // Find wing (adjacent types with highest score)
    let wing: number | undefined;
    const leftWing = primaryType === 1 ? 9 : primaryType - 1;
    const rightWing = primaryType === 9 ? 1 : primaryType + 1;
    const leftScore = normalizedScores[leftWing - 1];
    const rightScore = normalizedScores[rightWing - 1];

    if (leftScore > rightScore && leftScore > 30) {
      wing = leftWing;
    } else if (rightScore > 30) {
      wing = rightWing;
    }

    // Calculate confidence
    const totalResponses = responses.length;
    const targetResponses = 90; // 10 per type
    const confidence = Math.min(1, totalResponses / targetResponses);

    return {
      type_scores: normalizedScores,
      primary_type: primaryType,
      wing: wing,
      confidence: confidence
    };
  }

  /**
   * Score Genius Types (identify primary and secondary)
   */
  static scoreGenius(responses: PersonalityResponse[]): GeniusProfile {
    const types: GeniusType[] = ['wonder', 'invention', 'discernment', 'galvanizing', 'enablement', 'tenacity'];
    const typeScores: Record<GeniusType, number> = {
      wonder: 0,
      invention: 0,
      discernment: 0,
      galvanizing: 0,
      enablement: 0,
      tenacity: 0
    };
    const typeCounts: Record<GeniusType, number> = {
      wonder: 0,
      invention: 0,
      discernment: 0,
      galvanizing: 0,
      enablement: 0,
      tenacity: 0
    };

    // Calculate raw scores
    for (const response of responses) {
      const question = PERSONALITY_QUESTIONS.find(q => q.question_id === response.question_id);
      if (!question || !question.scoring) continue;

      const dimension = response.dimension as GeniusType;
      const scoreValue = question.scoring[response.response as string];

      if (scoreValue !== undefined && types.includes(dimension)) {
        typeScores[dimension] += scoreValue;
        typeCounts[dimension]++;
      }
    }

    // Normalize to 0-100
    const normalizedScores: Record<GeniusType, number> = {} as Record<GeniusType, number>;
    for (const type of types) {
      if (typeCounts[type] > 0) {
        const avgScore = typeScores[type] / typeCounts[type];
        normalizedScores[type] = Math.round(((avgScore - 1) / 4) * 100);
      } else {
        normalizedScores[type] = 0;
      }
    }

    // Find primary and secondary
    const sortedTypes = types.sort((a, b) => normalizedScores[b] - normalizedScores[a]);
    const primary = sortedTypes[0];
    const secondary = sortedTypes[1];

    // Calculate confidence
    const totalResponses = responses.length;
    const targetResponses = 36; // 6 per type
    const confidence = Math.min(1, totalResponses / targetResponses);

    return {
      wonder: normalizedScores.wonder,
      invention: normalizedScores.invention,
      discernment: normalizedScores.discernment,
      galvanizing: normalizedScores.galvanizing,
      enablement: normalizedScores.enablement,
      tenacity: normalizedScores.tenacity,
      primary: primary,
      secondary: secondary,
      confidence: confidence
    };
  }

  /**
   * Score StrengthsFinder themes (identify top 5)
   */
  static scoreStrengths(responses: PersonalityResponse[]): Strength[] {
    const strengthScores: Record<string, number> = {};
    const strengthCounts: Record<string, number> = {};

    // Calculate scores for each strength
    for (const response of responses) {
      const question = PERSONALITY_QUESTIONS.find(q => q.question_id === response.question_id);
      if (!question || !question.scoring) continue;

      const strength = response.dimension;
      const scoreValue = question.scoring[response.response as string];

      if (scoreValue !== undefined) {
        if (!strengthScores[strength]) {
          strengthScores[strength] = 0;
          strengthCounts[strength] = 0;
        }
        strengthScores[strength] += scoreValue;
        strengthCounts[strength]++;
      }
    }

    // Normalize and create strength objects
    const strengths: Strength[] = [];
    for (const [name, score] of Object.entries(strengthScores)) {
      if (strengthCounts[name] > 0) {
        const avgScore = score / strengthCounts[name];
        const normalizedScore = Math.round(((avgScore - 1) / 4) * 100);
        strengths.push({
          name: name,
          score: normalizedScore,
          rank: 0 // Will be set after sorting
        });
      }
    }

    // Sort by score and assign ranks
    strengths.sort((a, b) => b.score - a.score);
    strengths.forEach((strength, index) => {
      strength.rank = index + 1;
    });

    // Return top 5
    return strengths.slice(0, 5);
  }

  /**
   * Calculate derived traits from all personality frameworks
   */
  static calculateDerivedTraits(
    bigFive: BigFive,
    mbti: MBTI,
    disc: DISC,
    enneagram: Enneagram,
    genius: GeniusProfile
  ): DerivedTraits {
    // Stress Resilience: Low neuroticism + high conscientiousness + DISC steadiness
    const stressResilience = Math.round(
      (100 - bigFive.neuroticism) * 0.4 +
      bigFive.conscientiousness * 0.3 +
      disc.steadiness * 0.3
    );

    // Optimism: Low neuroticism + high extraversion + Type 7 enneagram
    const type7Score = enneagram.type_scores[6] || 0;
    const optimism = Math.round(
      (100 - bigFive.neuroticism) * 0.4 +
      bigFive.extraversion * 0.3 +
      type7Score * 0.3
    );

    // Flow Tendency: High openness + MBTI perceiving + genius wonder/invention
    const perceiving = mbti.JP < 0 ? (Math.abs(mbti.JP) / 100) * 100 : 0;
    const flowTendency = Math.round(
      bigFive.openness * 0.3 +
      perceiving * 0.2 +
      genius.wonder * 0.25 +
      genius.invention * 0.25
    );

    // Collaboration Preference: High agreeableness + high extraversion + DISC influence
    const collaborationPreference = Math.round(
      bigFive.agreeableness * 0.35 +
      bigFive.extraversion * 0.35 +
      disc.influence * 0.3
    );

    // Structure Need: High conscientiousness + MBTI judging + DISC conscientiousness
    const judging = mbti.JP > 0 ? (mbti.JP / 100) * 100 : 0;
    const structureNeed = Math.round(
      bigFive.conscientiousness * 0.4 +
      judging * 0.3 +
      disc.conscientiousness * 0.3
    );

    // Energy Baseline: High extraversion + low neuroticism + genius galvanizing
    const energyBaseline = Math.round(
      bigFive.extraversion * 0.4 +
      (100 - bigFive.neuroticism) * 0.3 +
      genius.galvanizing * 0.3
    );

    // Recovery Speed: Low neuroticism + genius tenacity + Type 8 enneagram
    const type8Score = enneagram.type_scores[7] || 0;
    const recoverySpeed = Math.round(
      (100 - bigFive.neuroticism) * 0.4 +
      genius.tenacity * 0.3 +
      type8Score * 0.3
    );

    // Risk Tolerance: High openness + DISC dominance + MBTI intuition
    const intuition = mbti.SN > 0 ? (mbti.SN / 100) * 100 : 0;
    const riskTolerance = Math.round(
      bigFive.openness * 0.4 +
      disc.dominance * 0.3 +
      intuition * 0.3
    );

    return {
      stress_resilience: stressResilience,
      optimism: optimism,
      flow_tendency: flowTendency,
      collaboration_preference: collaborationPreference,
      structure_need: structureNeed,
      energy_baseline: energyBaseline,
      recovery_speed: recoverySpeed,
      risk_tolerance: riskTolerance
    };
  }

  /**
   * Calculate confidence change for a single response
   */
  static calculateConfidenceChange(
    previousProfile: PersonalityProfile | undefined,
    newProfile: PersonalityProfile,
    framework: string
  ): number {
    if (!previousProfile) return 0.1; // First response

    let previousConfidence = 0;
    let newConfidence = 0;

    switch (framework) {
      case 'big_five':
        const prevBigFive = previousProfile.big_five.confidence;
        const newBigFive = newProfile.big_five.confidence;
        previousConfidence = (
          prevBigFive.openness +
          prevBigFive.conscientiousness +
          prevBigFive.extraversion +
          prevBigFive.agreeableness +
          prevBigFive.neuroticism
        ) / 5;
        newConfidence = (
          newBigFive.openness +
          newBigFive.conscientiousness +
          newBigFive.extraversion +
          newBigFive.agreeableness +
          newBigFive.neuroticism
        ) / 5;
        break;

      case 'mbti':
        previousConfidence = previousProfile.mbti.confidence;
        newConfidence = newProfile.mbti.confidence;
        break;

      case 'disc':
        previousConfidence = previousProfile.disc.confidence;
        newConfidence = newProfile.disc.confidence;
        break;

      case 'enneagram':
        previousConfidence = previousProfile.enneagram.confidence;
        newConfidence = newProfile.enneagram.confidence;
        break;

      case 'genius':
        previousConfidence = previousProfile.genius.confidence;
        newConfidence = newProfile.genius.confidence;
        break;

      default:
        return 0;
    }

    return newConfidence - previousConfidence;
  }
}

export default PersonalityScorer;
