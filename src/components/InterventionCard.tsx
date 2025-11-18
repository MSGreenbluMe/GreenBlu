import { useState, useEffect } from 'react';
import { db } from '../services/database';
import { generateId } from '../lib/utils';
import type { InterventionTemplate, VAD, Intervention } from '../types';

interface InterventionCardProps {
  template: InterventionTemplate;
  userId: string;
  moodBefore: VAD;
  onComplete?: () => void;
  onCancel?: () => void;
}

export default function InterventionCard({
  template,
  userId,
  moodBefore,
  onComplete,
  onCancel
}: InterventionCardProps) {
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(template.duration_seconds);
  const [isPaused, setIsPaused] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [interventionId] = useState(generateId());

  // Timer logic
  useEffect(() => {
    if (!started || isPaused || completed) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [started, isPaused, completed]);

  // Auto-advance steps based on time
  useEffect(() => {
    if (!started || completed) return;

    const stepDuration = template.duration_seconds / template.instructions.length;
    const elapsedTime = template.duration_seconds - timeRemaining;
    const calculatedStep = Math.floor(elapsedTime / stepDuration);

    if (calculatedStep < template.instructions.length) {
      setCurrentStep(calculatedStep);
    }
  }, [timeRemaining, started, completed, template]);

  const handleStart = async () => {
    setStarted(true);

    // Record intervention start
    const intervention: Intervention = {
      intervention_id: interventionId,
      user_id: userId,
      timestamp: Date.now(),
      type: template.type,
      subtype: template.template_id,
      triggered_by: 'user',
      mood_before: moodBefore,
      started: true,
      started_at: Date.now(),
      completed: false
    };

    await db.addIntervention(intervention);
  };

  const handleComplete = async (userRating: number) => {
    setRating(userRating);

    // Update intervention record
    await db.updateIntervention(interventionId, {
      completed: true,
      completed_at: Date.now(),
      duration_seconds: template.duration_seconds - timeRemaining,
      user_rating: userRating
    });

    // Callback for mood tracking
    if (onComplete) {
      setTimeout(() => onComplete(), 1000);
    }
  };

  const handleSkip = async () => {
    await db.updateIntervention(interventionId, {
      completed: false,
      completed_at: Date.now(),
      duration_seconds: template.duration_seconds - timeRemaining
    });

    if (onCancel) {
      onCancel();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((template.duration_seconds - timeRemaining) / template.duration_seconds) * 100;

  // Get icon for intervention type
  const getIcon = () => {
    switch (template.type) {
      case 'breathing':
        return '🫁';
      case 'eye_exercise':
        return '👁️';
      case 'physical':
        return '🧘';
      case 'cognitive':
        return '🧠';
      default:
        return '✨';
    }
  };

  // Get difficulty color
  const getDifficultyColor = () => {
    switch (template.difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
  };

  // Not started view
  if (!started) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{getIcon()}</div>
              <div>
                <h2 className="text-2xl font-bold">{template.name}</h2>
                <p className="text-teal-100 text-sm mt-1">
                  {Math.round(template.duration_seconds / 60)} min • {template.difficulty}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor()}`}>
              {template.difficulty}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {template.description}
          </p>

          {/* Effectiveness */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Effectiveness</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${template.avg_effectiveness * 100}%` }}
                />
              </div>
            </div>
            <div className="text-2xl font-bold text-teal-600">
              {Math.round(template.avg_effectiveness * 100)}%
            </div>
          </div>

          {/* Instructions Preview */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              What you'll do:
            </h3>
            <div className="space-y-2">
              {template.instructions.slice(0, 3).map((instruction, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-300 flex items-center justify-center text-xs font-semibold">
                    {idx + 1}
                  </span>
                  <span>{instruction}</span>
                </div>
              ))}
              {template.instructions.length > 3 && (
                <div className="text-sm text-gray-500 dark:text-gray-500 ml-9">
                  + {template.instructions.length - 3} more steps...
                </div>
              )}
            </div>
          </div>

          {/* Contraindications */}
          {template.contraindications && template.contraindications.length > 0 && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-2 text-sm">
                ⚠️ Important Notes:
              </h4>
              <ul className="space-y-1 text-xs text-amber-800 dark:text-amber-300">
                {template.contraindications.map((note, idx) => (
                  <li key={idx}>• {note}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleStart}
              className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start Intervention
            </button>
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Completed view - waiting for rating
  if (completed && rating === null) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Great job!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You completed the {template.name} intervention
        </p>

        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            How do you feel?
          </h3>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map(value => (
              <button
                key={value}
                onClick={() => handleComplete(value)}
                className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-teal-100 dark:hover:bg-teal-900 hover:scale-110 transition-all duration-200 flex items-center justify-center text-xl"
              >
                {value === 1 && '😞'}
                {value === 2 && '😕'}
                {value === 3 && '😐'}
                {value === 4 && '😊'}
                {value === 5 && '😄'}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2 max-w-xs mx-auto">
            <span>Worse</span>
            <span>Better</span>
          </div>
        </div>
      </div>
    );
  }

  // Rating submitted view
  if (completed && rating !== null) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-4">✨</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Thank you!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Let's check how your mood has changed
        </p>
      </div>
    );
  }

  // Active intervention view
  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Progress Bar */}
      <div className="h-2 bg-gray-200 dark:bg-gray-700">
        <div
          className="h-2 bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{getIcon()}</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {template.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Step {currentStep + 1} of {template.instructions.length}
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-teal-600">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-xs text-gray-500">remaining</div>
          </div>
        </div>
      </div>

      {/* Current Instruction */}
      <div className="p-8 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold">
            {currentStep + 1}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-semibold">
            Current Step
          </span>
        </div>
        <p className="text-lg text-gray-900 dark:text-white leading-relaxed">
          {template.instructions[currentStep]}
        </p>
      </div>

      {/* All Instructions */}
      <div className="p-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          All Steps:
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {template.instructions.map((instruction, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-300 ${
                idx === currentStep
                  ? 'bg-teal-100 dark:bg-teal-900/30 border-l-4 border-teal-500'
                  : idx < currentStep
                  ? 'opacity-50'
                  : 'opacity-70'
              }`}
            >
              <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                idx < currentStep
                  ? 'bg-teal-500 text-white'
                  : idx === currentStep
                  ? 'bg-teal-500 text-white animate-pulse'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
              }`}>
                {idx < currentStep ? '✓' : idx + 1}
              </span>
              <span className={`text-sm ${
                idx === currentStep
                  ? 'text-gray-900 dark:text-white font-medium'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {instruction}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {isPaused ? '▶️ Resume' : '⏸️ Pause'}
        </button>
        <button
          onClick={() => setCompleted(true)}
          className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          ✓ Complete Early
        </button>
        <button
          onClick={handleSkip}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
