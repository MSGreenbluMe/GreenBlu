import { useState } from 'react';
import { db } from '../services/database';
import { generateId, getMoodEmoji, getMoodLabel, calculateFlowProbability, vadToHSL } from '../lib/utils';
import type { MoodEntry, VAD } from '../types';

interface MoodTrackerProps {
  userId: string;
  onComplete?: () => void;
}

export default function MoodTracker({ userId, onComplete }: MoodTrackerProps) {
  const [vad, setVAD] = useState<VAD>({
    valence: 0,
    arousal: 0,
    dominance: 0
  });
  const [note, setNote] = useState('');
  const [activity, setActivity] = useState('');
  const [saving, setSaving] = useState(false);

  const flowProbability = calculateFlowProbability(vad);
  const moodColor = vadToHSL(vad);

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
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          How are you feeling?
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Quick check-in • Takes less than 15 seconds
        </p>
      </div>

      {/* Mood Visualization */}
      <div className="mb-8 text-center">
        <div
          className="inline-flex items-center justify-center w-32 h-32 rounded-full text-6xl mb-4 transition-all duration-300"
          style={{ backgroundColor: moodColor }}
        >
          {getMoodEmoji(vad)}
        </div>
        <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          {getMoodLabel(vad)}
        </p>
        {flowProbability > 0.4 && (
          <p className="text-sm text-teal-600 dark:text-teal-400 mt-2">
            {flowProbability >= 0.8
              ? '🌊 Deep Flow Detected!'
              : flowProbability >= 0.6
              ? '🌊 You\'re in Flow!'
              : '🌊 Near Flow State'}
          </p>
        )}
      </div>

      {/* VAD Sliders */}
      <div className="space-y-6 mb-8">
        {/* Valence */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Valence: How positive do you feel?
            <span className="float-right text-teal-600">
              {vad.valence > 0 ? '😊' : vad.valence < 0 ? '😔' : '😐'}
            </span>
          </label>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.1"
            value={vad.valence}
            onChange={(e) => setVAD({ ...vad, valence: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Negative</span>
            <span>Neutral</span>
            <span>Positive</span>
          </div>
        </div>

        {/* Arousal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Arousal: How energized do you feel?
            <span className="float-right text-teal-600">
              {vad.arousal > 0 ? '⚡' : vad.arousal < 0 ? '😴' : '😌'}
            </span>
          </label>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.1"
            value={vad.arousal}
            onChange={(e) => setVAD({ ...vad, arousal: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Calm/Tired</span>
            <span>Neutral</span>
            <span>Alert/Energized</span>
          </div>
        </div>

        {/* Dominance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Dominance: How in control do you feel?
            <span className="float-right text-teal-600">
              {vad.dominance > 0 ? '💪' : vad.dominance < 0 ? '🤷' : '🙂'}
            </span>
          </label>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.1"
            value={vad.dominance}
            onChange={(e) => setVAD({ ...vad, dominance: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Submissive</span>
            <span>Neutral</span>
            <span>Dominant</span>
          </div>
        </div>
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
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
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
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white resize-none"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={saving}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? 'Saving...' : 'Save Mood Check-in'}
      </button>

      <p className="text-center text-xs text-gray-500 mt-4">
        Your data is private and stored locally on your device
      </p>
    </div>
  );
}
