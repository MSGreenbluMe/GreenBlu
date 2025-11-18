import { useState, useEffect } from 'react';
import { db } from '../services/database';
import type { CircadianEntry, WeatherData } from '../types';

interface MorningCheckinProps {
  onComplete: () => void;
  onClose: () => void;
}

export default function MorningCheckin({ onComplete, onClose }: MorningCheckinProps) {
  const [wakeTime, setWakeTime] = useState('');
  const [sleepQuality, setSleepQuality] = useState(3);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

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

      const entry: CircadianEntry = {
        entry_id: `circadian-${Date.now()}`,
        user_id: 'default-user',
        date: dateStr,
        wake_time: wakeTime,
        sleep_quality: sleepQuality,
      };

      await db.saveCircadianEntry(entry);
      console.log('Morning check-in saved:', entry);

      onComplete();
    } catch (error) {
      console.error('Failed to save morning check-in:', error);
      alert('Failed to save check-in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const sleepQualityLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  const sleepQualityEmojis = ['😴', '😕', '😊', '😃', '🌟'];

  const weatherIcons: Record<string, string> = {
    'sunny': '☀️',
    'partly-cloudy': '⛅',
    'cloudy': '☁️',
    'rainy': '🌧️',
    'snowy': '❄️'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 dark:from-orange-900 dark:via-pink-900 dark:to-purple-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Sunrise Header */}
        <div className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-yellow-300 rounded-full blur-3xl"></div>
          </div>
          <div className="relative">
            <div className="text-6xl mb-2">🌅</div>
            <h2 className="text-3xl font-bold text-white mb-1">Good Morning!</h2>
            <p className="text-white/90">Let's start your day right</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Weather Display */}
          {weather && (
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 text-center">
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
              className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border-2 border-purple-300 dark:border-purple-600 rounded-xl text-lg font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Sleep Quality */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              How was your sleep quality?
            </label>
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">{sleepQualityEmojis[sleepQuality - 1]}</div>
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
              className="w-full h-3 bg-gradient-to-r from-orange-300 via-pink-300 to-purple-300 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #fdba74 0%, #f9a8d4 50%, #c084fc 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
              <span>Poor</span>
              <span>Fair</span>
              <span>Good</span>
              <span>Very Good</span>
              <span>Excellent</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              disabled={loading}
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Start My Day'}
            </button>
          </div>
        </form>

        {/* Morning Tip */}
        <div className="px-8 pb-8">
          <div className="bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl p-4">
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
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          border: 2px solid #9333ea;
        }

        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          border: 2px solid #9333ea;
        }
      `}</style>
    </div>
  );
}
