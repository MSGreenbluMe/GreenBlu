import { useState } from 'react';
import { db } from '../services/database';
import { generateId, getMoodLabel, calculateFlowProbability } from '../lib/utils';
import type { MoodEntry, VAD } from '../types';
import VAD2DVisualizer from './VAD2DVisualizer';
import Octopus from './Octopus';

interface MoodTrackerProps {
  userId: string;
  onComplete?: () => void;
  onBack?: () => void;
}

export default function MoodTracker({ userId, onComplete, onBack }: MoodTrackerProps) {
  const [vad, setVAD] = useState<VAD>({
    valence: 0,
    arousal: 0,
    dominance: 0
  });
  const [note, setNote] = useState('');
  const [activity, setActivity] = useState('');
  const [saving, setSaving] = useState(false);

  const flowProbability = calculateFlowProbability(vad);

  async function handleSubmit() {
    setSaving(true);

    try {
      const entry: MoodEntry = {
        entry_id: generateId(),
        user_id: userId,
        timestamp: Date.now(),
        vad,
        context: {
          activity: activity || undefined,
          energy_level: Math.round(((vad.arousal + 1) / 2) * 5)
        },
        note: note || undefined,
        flow_probability: flowProbability
      };

      await db.addMoodEntry(entry);

      // Store last mood entry for service worker
      await chrome.storage.local.set({ last_mood_entry: entry });

      console.log('Mood entry saved:', entry);

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Failed to save mood entry:', error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            How are you feeling?
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Quick check-in • Takes less than 15 seconds
          </p>
        </div>

        {/* Mood Visualization with Octopus */}
        <div className="mb-8 text-center">
          <div className="inline-block mb-4">
            <Octopus vad={vad} size={150} />
          </div>
          <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            {getMoodLabel(vad)}
          </p>
          {flowProbability > 0.4 && (
            <div className="mt-2 inline-block px-4 py-2 bg-teal-100 dark:bg-teal-900 border-2 border-teal-500 rounded-lg">
              <p className="text-sm text-teal-700 dark:text-teal-300 font-semibold">
                {flowProbability >= 0.8
                  ? 'Deep Flow Detected!'
                  : flowProbability >= 0.6
                  ? "You're in Flow!"
                  : 'Near Flow State'}
              </p>
            </div>
          )}
        </div>

        {/* VAD 2D Visualizer */}
        <div className="mb-8 flex justify-center">
          <VAD2DVisualizer vad={vad} onChange={setVAD} size={400} />
        </div>

        {/* Optional Context */}
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What are you doing? (optional)
            </label>
            <input
              type="text"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="e.g., coding, meeting, break"
              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Any notes? (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How you're feeling, what's on your mind..."
              rows={3}
              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white resize-none transition-colors"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {saving ? 'Saving...' : 'Save Mood Check-in'}
        </button>

        <p className="text-center text-xs text-gray-500 mt-4">
          Your data is private and stored locally on your device
        </p>
      </div>
    </div>
  );
}
