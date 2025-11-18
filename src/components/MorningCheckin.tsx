import { useState, useEffect } from 'react';
import { db } from '../services/database';
import { calculateChronotype, getChronotypeProfile } from '../services/circadian-calculator';
import type { CircadianEntry, WeatherData } from '../types';

interface MorningCheckinProps {
  onComplete: () => void;
  onClose: () => void;
}

export default function MorningCheckin({ onComplete, onClose }: MorningCheckinProps) {
  const [step, setStep] = useState(1);
  const [wakeTime, setWakeTime] = useState('');
  const [sleepQuality, setSleepQuality] = useState(3);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  // Chronotype detection fields
  const [wakePreference, setWakePreference] = useState<'early' | 'late' | 'flexible'>('flexible');
  const [productiveTime, setProductiveTime] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');
  const [personType, setPersonType] = useState<'morning' | 'evening' | 'neither'>('neither');

  useEffect(() => {
    // Set default wake time to current time
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    setWakeTime(`${hours}:${minutes}`);

    // Fetch weather
    fetchWeather();
  }, []);

  async function fetchWeather() {
    try {
      // Try to get weather from OpenWeatherMap API
      // For now, we'll use mock data
      // In production, you would use: navigator.geolocation.getCurrentPosition()
      // and then call the OpenWeatherMap API

      const mockWeather: WeatherData = {
        temperature: 22,
        condition: 'partly-cloudy',
        pressure: 1013,
        humidity: 65
      };

      setWeather(mockWeather);
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      // Use default weather
      setWeather({
        temperature: 20,
        condition: 'partly-cloudy',
        pressure: 1013,
        humidity: 50
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];

      // Calculate chronotype
      const chronotype = calculateChronotype(wakePreference, productiveTime, personType);
      const profile = getChronotypeProfile(chronotype);

      const entry: CircadianEntry = {
        entry_id: `circadian-${Date.now()}`,
        user_id: 'default-user',
        date: dateStr,
        wake_time: wakeTime,
        sleep_quality: sleepQuality,
        chronotype: chronotype,
        optimal_windows: {
          peak_energy: {
            start: `${profile.peakEnergyWindow.start.toString().padStart(2, '0')}:00`,
            end: `${profile.peakEnergyWindow.end.toString().padStart(2, '0')}:00`,
          },
          creative_peak: {
            start: `${profile.peakCreativityWindow.start.toString().padStart(2, '0')}:00`,
            end: `${profile.peakCreativityWindow.end.toString().padStart(2, '0')}:00`,
          },
          analytical_peak: {
            start: `${profile.peakFocusWindow.start.toString().padStart(2, '0')}:00`,
            end: `${profile.peakFocusWindow.end.toString().padStart(2, '0')}:00`,
          },
        },
      };

      await db.saveCircadianEntry(entry);
      console.log('Morning check-in saved with chronotype:', entry);

      onComplete();
    } catch (error) {
      console.error('Failed to save morning check-in:', error);
      alert('Failed to save check-in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const sleepQualityLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  const weatherIcons: Record<string, string> = {
    'sunny': '☀️',
    'partly-cloudy': '⛅',
    'cloudy': '☁️',
    'rainy': '🌧️',
    'snowy': '❄️'
  };

  const getChronotypeIcon = () => {
    const chronotype = calculateChronotype(wakePreference, productiveTime, personType);
    if (chronotype === 'lark') return '🌅';
    if (chronotype === 'owl') return '🦉';
    return '☀️';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
        {/* Header - Flat Design */}
        <div className="bg-teal-500 p-8 text-center">
          <div className="text-6xl mb-2">🌅</div>
          <h2 className="text-3xl font-bold text-white mb-1">Good Morning!</h2>
          <p className="text-white">Let's start your day right</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <>
              {/* Weather Display */}
              {weather && (
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center border-2 border-gray-300 dark:border-gray-600">
                  <div className="text-4xl mb-2">{weatherIcons[weather.condition]}</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {weather.temperature}°C
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                    {weather.condition.replace('-', ' ')}
                  </div>
                </div>
              )}

              {/* Wake Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  What time did you wake up?
                </label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-lg font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                />
              </div>

              {/* Sleep Quality */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  How was your sleep quality?
                </label>
                <div className="text-center mb-4">
                  <div className="text-xl font-semibold text-gray-900 dark:text-white">
                    {sleepQualityLabels[sleepQuality - 1]}
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                  <span>Poor</span>
                  <span>Fair</span>
                  <span>Good</span>
                  <span>Very Good</span>
                  <span>Excellent</span>
                </div>
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors"
              >
                Next: Sleep Preferences
              </button>
            </>
          )}

          {/* Step 2: Chronotype Detection */}
          {step === 2 && (
            <>
              <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{getChronotypeIcon()}</div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">
                      Chronotype Detection
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Answer 3 quick questions to optimize your daily rhythm
                    </div>
                  </div>
                </div>
              </div>

              {/* Question 1: Wake Preference */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  1. Do you prefer to wake up early or late?
                </label>
                <div className="space-y-2">
                  {(['early', 'flexible', 'late'] as const).map((option) => (
                    <label
                      key={option}
                      className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        wakePreference === option
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="wakePreference"
                        value={option}
                        checked={wakePreference === option}
                        onChange={(e) => setWakePreference(e.target.value as typeof option)}
                        className="w-4 h-4 text-teal-600"
                      />
                      <span className="text-gray-900 dark:text-white capitalize">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 2: Productive Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  2. When do you feel most productive?
                </label>
                <div className="space-y-2">
                  {(['morning', 'afternoon', 'evening', 'night'] as const).map((option) => (
                    <label
                      key={option}
                      className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        productiveTime === option
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="productiveTime"
                        value={option}
                        checked={productiveTime === option}
                        onChange={(e) => setProductiveTime(e.target.value as typeof option)}
                        className="w-4 h-4 text-teal-600"
                      />
                      <span className="text-gray-900 dark:text-white capitalize">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 3: Person Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  3. Are you a morning person or evening person?
                </label>
                <div className="space-y-2">
                  {(['morning', 'neither', 'evening'] as const).map((option) => (
                    <label
                      key={option}
                      className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        personType === option
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="personType"
                        value={option}
                        checked={personType === option}
                        onChange={(e) => setPersonType(e.target.value as typeof option)}
                        className="w-4 h-4 text-teal-600"
                      />
                      <span className="text-gray-900 dark:text-white capitalize">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 px-6 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-6 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  disabled={loading}
                >
                  Skip
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Complete'}
                </button>
              </div>
            </>
          )}
        </form>

        {/* Morning Tip */}
        {step === 1 && (
          <div className="px-8 pb-8">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-400 dark:border-yellow-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💡</div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">
                    Morning Tip
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Consistent wake times help optimize your circadian rhythm and improve flow state readiness.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
