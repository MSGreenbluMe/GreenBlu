// GreenBlu.ai Daily Personality Question Component
// Beautiful UI for answering personality assessment questions

import { useState, useEffect } from 'react';
import { db } from '../services/database';
import { QuestionSelector } from '../services/question-selector';
import { PersonalityScorer } from '../services/personality-scorer';
import { generateId } from '../lib/utils';
import type { PersonalityQuestion, PersonalityResponse, PersonalityProfile } from '../types';

interface PersonalityQuestionProps {
  userId: string;
  onComplete?: () => void;
}

export default function PersonalityQuestionComponent({ userId, onComplete }: PersonalityQuestionProps) {
  const [question, setQuestion] = useState<PersonalityQuestion | null>(null);
  const [profile, setProfile] = useState<PersonalityProfile | undefined>();
  const [response, setResponse] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    loadQuestion();
  }, [userId]);

  async function loadQuestion() {
    try {
      setLoading(true);

      // Load current profile and responses
      const currentProfile = await db.getPersonalityProfile(userId);
      const responses = await db.getPersonalityResponses(userId);

      setProfile(currentProfile);

      // Check if user should get a question today
      if (!QuestionSelector.shouldShowQuestions(currentProfile?.last_question_date)) {
        setQuestion(null);
        setLoading(false);
        return;
      }

      // Select next question
      const nextQuestion = QuestionSelector.getNextQuestion(currentProfile, responses);
      setQuestion(nextQuestion);
    } catch (error) {
      console.error('Failed to load question:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!question || response === null || response === undefined) return;

    // Validate response
    if (!QuestionSelector.validateResponse(question, response)) {
      alert('Please provide a valid response');
      return;
    }

    setSaving(true);

    try {
      // Calculate response time
      const responseTime = Math.round((Date.now() - startTime) / 1000);

      // Get all responses including this new one
      const existingResponses = await db.getPersonalityResponses(userId);

      // Create new response object
      const newResponse: PersonalityResponse = {
        response_id: generateId(),
        user_id: userId,
        timestamp: Date.now(),
        question_id: question.question_id,
        framework: question.framework,
        dimension: question.dimension,
        question_text: question.question_text,
        response: response,
        response_time_seconds: responseTime,
        confidence_change: 0, // Will be updated after scoring
        profile_change: {}
      };

      // Add to responses
      const allResponses = [...existingResponses, newResponse];

      // Score the updated profile
      const newProfile = await PersonalityScorer.scoreProfile(allResponses, profile);

      // Calculate confidence change
      newResponse.confidence_change = PersonalityScorer.calculateConfidenceChange(
        profile,
        newProfile,
        question.framework
      );

      // Save response and profile
      await db.addPersonalityResponse(newResponse);
      await db.savePersonalityProfile(newProfile);

      console.log('Response saved:', newResponse);
      console.log('Profile updated:', newProfile);

      // Complete
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Failed to save response:', error);
      alert('Failed to save your response. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your daily question...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            All Done for Today!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Come back tomorrow for your next personality question.
          </p>
          {profile && (
            <div className="mt-6 inline-block bg-teal-50 dark:bg-teal-900/20 rounded-lg px-6 py-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Assessment Progress
              </div>
              <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                {Math.round(profile.assessment_progress)}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {profile.questions_answered} questions answered
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render based on response type
  const renderResponseOptions = () => {
    switch (question.response_type) {
      case 'likert_5':
      case 'likert_7':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => setResponse(index)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  response === index
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-gray-900 dark:text-white'
                    : 'border-gray-200 dark:border-gray-700 hover:border-teal-300 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option}</span>
                  {response === index && (
                    <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => setResponse(option)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  response === option
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-gray-900 dark:text-white'
                    : 'border-gray-200 dark:border-gray-700 hover:border-teal-300 text-gray-700 dark:text-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-500">
            Unsupported question type
          </div>
        );
    }
  };

  // Get framework display name
  const getFrameworkName = (framework: string): string => {
    const names: Record<string, string> = {
      big_five: 'Big Five',
      mbti: 'MBTI',
      disc: 'DISC',
      enneagram: 'Enneagram',
      genius: 'Genius Types',
      strengths: 'StrengthsFinder'
    };
    return names[framework] || framework;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-block px-4 py-1 bg-teal-100 dark:bg-teal-900/30 rounded-full text-sm font-medium text-teal-700 dark:text-teal-300 mb-4">
          {getFrameworkName(question.framework)}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Daily Personality Question
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Answer honestly • There are no right or wrong answers
        </p>
      </div>

      {/* Progress Indicator */}
      {profile && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Overall Progress</span>
            <span>{Math.round(profile.assessment_progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${profile.assessment_progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Question */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-lg p-6 mb-6">
          <p className="text-lg text-gray-900 dark:text-white font-medium">
            {question.question_text}
          </p>
        </div>

        {/* Response Options */}
        {renderResponseOptions()}
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          onClick={onComplete}
          className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Skip for Now
        </button>
        <button
          onClick={handleSubmit}
          disabled={response === null || response === undefined || saving}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
            response === null || response === undefined || saving
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:shadow-lg'
          }`}
        >
          {saving ? (
            <span className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Saving...
            </span>
          ) : (
            'Submit Answer'
          )}
        </button>
      </div>

      {/* Confidence Info */}
      {profile && response !== null && response !== undefined && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Building Your Profile
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Each answer helps us better understand your unique personality traits and work preferences.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
