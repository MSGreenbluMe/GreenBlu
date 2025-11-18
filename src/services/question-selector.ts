// GreenBlu.ai Adaptive Question Selection Service
// Uses Bayesian updating and information gain for intelligent question selection

import type {
  PersonalityQuestion,
  PersonalityProfile,
  PersonalityResponse,
  QuestionFramework
} from '../types';
import { PERSONALITY_QUESTIONS } from '../data/personality-questions';

// interface QuestionScore {
//   question: PersonalityQuestion;
//   informationGain: number;
//   priority: number;
//   confidence: number;
// }

export class QuestionSelector {
  /**
   * Select 1-2 optimal questions for the user to answer today
   */
  static selectDailyQuestions(
    profile: PersonalityProfile | undefined,
    responses: PersonalityResponse[],
    _lastQuestionDate?: string
  ): PersonalityQuestion[] {
    const today = new Date().toISOString().split('T')[0];

    // Get already answered question IDs
    const answeredIds = new Set(responses.map(r => r.question_id));

    // Get questions asked today
    const todayQuestionIds = new Set(
      responses
        .filter(r => {
          const responseDate = new Date(r.timestamp).toISOString().split('T')[0];
          return responseDate === today;
        })
        .map(r => r.question_id)
    );

    // If user already answered questions today, don't show more
    if (todayQuestionIds.size >= 2) {
      return [];
    }

    // Get unanswered questions
    const unansweredQuestions = PERSONALITY_QUESTIONS.filter(
      q => !answeredIds.has(q.question_id)
    );

    if (unansweredQuestions.length === 0) {
      return []; // All questions answered!
    }

    // Score each unanswered question
    const scoredQuestions = unansweredQuestions.map(question => {
      return {
        question,
        informationGain: this.calculateInformationGain(question, profile, responses),
        priority: this.getPriorityValue(question.priority_level),
        confidence: this.getDimensionConfidence(question, profile)
      };
    });

    // Sort by information gain (primary) and priority (secondary)
    scoredQuestions.sort((a, b) => {
      const gainDiff = b.informationGain - a.informationGain;
      if (Math.abs(gainDiff) > 0.1) {
        return gainDiff;
      }
      return b.priority - a.priority;
    });

    // Select top questions, avoiding same dimension/topic on same day
    const selectedQuestions: PersonalityQuestion[] = [];
    const usedDimensions = new Set<string>();
    const usedFrameworks = new Set<string>();

    for (const scored of scoredQuestions) {
      if (selectedQuestions.length >= 2) break;

      const dimensionKey = `${scored.question.framework}_${scored.question.dimension}`;

      // Avoid asking multiple questions from same dimension on same day
      if (usedDimensions.has(dimensionKey)) continue;

      // Try to diversify across frameworks
      if (selectedQuestions.length > 0 && usedFrameworks.has(scored.question.framework)) {
        // Allow if it's high priority
        if (scored.priority < 2) continue;
      }

      selectedQuestions.push(scored.question);
      usedDimensions.add(dimensionKey);
      usedFrameworks.add(scored.question.framework);
    }

    // Always return 1-2 questions
    return selectedQuestions.slice(0, 2);
  }

  /**
   * Calculate information gain for a question
   * Higher gain = more uncertainty in that dimension = more valuable to ask
   */
  private static calculateInformationGain(
    question: PersonalityQuestion,
    profile: PersonalityProfile | undefined,
    responses: PersonalityResponse[]
  ): number {
    if (!profile) {
      // No profile yet - high information gain for all questions
      return 1.0;
    }

    const confidence = this.getDimensionConfidence(question, profile);

    // Lower confidence = higher information gain
    const uncertaintyGain = 1 - confidence;

    // Boost for high-priority questions
    const priorityBoost = this.getPriorityBoost(question.priority_level);

    // Boost for frameworks with fewer responses
    const frameworkBoost = this.getFrameworkBalanceBoost(question.framework, responses);

    // Calculate cross-validation bonus
    const crossValidationBonus = this.getCrossValidationBonus(question, responses);

    // Combine factors
    const informationGain =
      uncertaintyGain * 0.5 +
      priorityBoost * 0.2 +
      frameworkBoost * 0.2 +
      crossValidationBonus * 0.1;

    return Math.min(1, informationGain);
  }

  /**
   * Get confidence level for the dimension this question targets
   */
  private static getDimensionConfidence(
    question: PersonalityQuestion,
    profile: PersonalityProfile | undefined
  ): number {
    if (!profile) return 0;

    switch (question.framework) {
      case 'big_five':
        const dimension = question.dimension as keyof typeof profile.big_five.confidence;
        return profile.big_five.confidence[dimension] || 0;

      case 'mbti':
        return profile.mbti.confidence;

      case 'disc':
        return profile.disc.confidence;

      case 'enneagram':
        return profile.enneagram.confidence;

      case 'genius':
        return profile.genius.confidence;

      case 'strengths':
        // For strengths, use average confidence of top strengths
        if (profile.strengths.length > 0) {
          return Math.min(1, profile.strengths.length / 5); // 5 target strengths
        }
        return 0;

      default:
        return 0;
    }
  }

  /**
   * Convert priority level to numerical value
   */
  private static getPriorityValue(priority: 'low' | 'medium' | 'high'): number {
    switch (priority) {
      case 'high':
        return 3;
      case 'medium':
        return 2;
      case 'low':
        return 1;
      default:
        return 1;
    }
  }

  /**
   * Get priority boost factor
   */
  private static getPriorityBoost(priority: 'low' | 'medium' | 'high'): number {
    switch (priority) {
      case 'high':
        return 0.3;
      case 'medium':
        return 0.15;
      case 'low':
        return 0;
      default:
        return 0;
    }
  }

  /**
   * Boost questions from frameworks with fewer responses (balancing)
   */
  private static getFrameworkBalanceBoost(
    framework: QuestionFramework,
    responses: PersonalityResponse[]
  ): number {
    const frameworkCounts: Record<QuestionFramework, number> = {
      big_five: 0,
      mbti: 0,
      disc: 0,
      enneagram: 0,
      genius: 0,
      strengths: 0
    };

    // Count responses per framework
    responses.forEach(r => {
      if (frameworkCounts[r.framework] !== undefined) {
        frameworkCounts[r.framework]++;
      }
    });

    // Target counts for each framework
    const targets: Record<QuestionFramework, number> = {
      big_five: 60,
      mbti: 48,
      disc: 40,
      enneagram: 90,
      genius: 36,
      strengths: 30
    };

    // Calculate completion percentage
    const currentCount = frameworkCounts[framework];
    const targetCount = targets[framework];
    const completionRatio = currentCount / targetCount;

    // Lower completion = higher boost
    return Math.max(0, 1 - completionRatio);
  }

  /**
   * Calculate cross-validation bonus
   * Favor questions that can validate/contradict previous responses
   */
  private static getCrossValidationBonus(
    question: PersonalityQuestion,
    responses: PersonalityResponse[]
  ): number {
    // Check if there are related questions in responses
    if (!question.related_questions || question.related_questions.length === 0) {
      return 0;
    }

    const answeredRelated = responses.filter(r =>
      question.related_questions?.includes(r.question_id)
    );

    // If we've answered related questions, this question can validate them
    if (answeredRelated.length > 0) {
      return 0.5; // Moderate boost for cross-validation
    }

    return 0;
  }

  /**
   * Select questions for initial assessment (first-time user)
   */
  static selectInitialQuestions(count: number = 10): PersonalityQuestion[] {
    // Select high-priority questions distributed across frameworks
    const frameworks: QuestionFramework[] = ['big_five', 'mbti', 'disc', 'enneagram', 'genius', 'strengths'];
    const questionsPerFramework = Math.ceil(count / frameworks.length);

    const selected: PersonalityQuestion[] = [];

    for (const framework of frameworks) {
      const frameworkQuestions = PERSONALITY_QUESTIONS.filter(
        q => q.framework === framework && q.priority_level === 'high'
      );

      // Shuffle and take first N
      const shuffled = this.shuffleArray([...frameworkQuestions]);
      selected.push(...shuffled.slice(0, questionsPerFramework));

      if (selected.length >= count) break;
    }

    return selected.slice(0, count);
  }

  /**
   * Get questions for a specific framework (for targeted assessment)
   */
  static getFrameworkQuestions(
    framework: QuestionFramework,
    responses: PersonalityResponse[]
  ): PersonalityQuestion[] {
    const answeredIds = new Set(responses.map(r => r.question_id));

    return PERSONALITY_QUESTIONS.filter(
      q => q.framework === framework && !answeredIds.has(q.question_id)
    ).sort((a, b) => {
      // Sort by priority
      const priorityA = this.getPriorityValue(a.priority_level);
      const priorityB = this.getPriorityValue(b.priority_level);
      return priorityB - priorityA;
    });
  }

  /**
   * Check if user should be shown questions today
   */
  static shouldShowQuestions(lastQuestionDate?: string): boolean {
    if (!lastQuestionDate) return true;

    const today = new Date().toISOString().split('T')[0];
    return lastQuestionDate !== today;
  }

  /**
   * Get progress breakdown by framework
   */
  static getProgressBreakdown(responses: PersonalityResponse[]): {
    framework: QuestionFramework;
    answered: number;
    total: number;
    percentage: number;
  }[] {
    const frameworks: QuestionFramework[] = ['big_five', 'mbti', 'disc', 'enneagram', 'genius', 'strengths'];

    return frameworks.map(framework => {
      const frameworkQuestions = PERSONALITY_QUESTIONS.filter(q => q.framework === framework);
      const answered = responses.filter(r => r.framework === framework).length;

      return {
        framework,
        answered,
        total: frameworkQuestions.length,
        percentage: frameworkQuestions.length > 0 ? (answered / frameworkQuestions.length) * 100 : 0
      };
    });
  }

  /**
   * Utility: Shuffle array (Fisher-Yates algorithm)
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get next best question for user (single question)
   */
  static getNextQuestion(
    profile: PersonalityProfile | undefined,
    responses: PersonalityResponse[]
  ): PersonalityQuestion | null {
    const questions = this.selectDailyQuestions(profile, responses);
    return questions.length > 0 ? questions[0] : null;
  }

  /**
   * Validate response before scoring
   */
  static validateResponse(
    question: PersonalityQuestion,
    response: any
  ): boolean {
    if (response === null || response === undefined) {
      return false;
    }

    switch (question.response_type) {
      case 'likert_5':
      case 'likert_7':
        return typeof response === 'number' && response >= 0 && response < (question.options?.length || 5);

      case 'multiple_choice':
        return question.options?.includes(response) ?? false;

      case 'ranking':
        return Array.isArray(response) && response.length === question.options?.length;

      default:
        return true;
    }
  }
}

export default QuestionSelector;
