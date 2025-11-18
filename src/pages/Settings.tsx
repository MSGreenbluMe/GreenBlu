import { useState, useEffect } from 'react';
import { db } from '../services/database';
import { predictionPipeline } from '../services/prediction-pipeline';
import { reminderScheduler } from '../services/reminder-scheduler';
import { notificationService } from '../services/notification-service';
import { weatherService } from '../services/weather-service';
import type { UserSettings } from '../types';

interface SettingsProps {
  onNavigate: (view: 'dashboard') => void;
}

export default function Settings({ onNavigate }: SettingsProps) {
  const [settings, setSettings] = useState<UserSettings>({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notification_preferences: {
      mood_check_frequency: 180, // 3 hours
      intervention_suggestions: true,
      flow_mode_protection: true,
      daily_personality_question: true
    },
    privacy: {
      enable_sync: false,
      share_anonymous_data: true,
      share_with_manager: false
    },
    display: {
      theme: 'auto',
      character_design: 'default',
      dashboard_layout: 'default'
    }
  });

  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<{
    enabled: boolean;
    nextMoodReminder: number | null;
    nextPersonalityReminder: number | null;
    deferredCount: number;
  } | null>(null);
  const [weatherApiKey, setWeatherApiKey] = useState('');
  const [weatherTestResult, setWeatherTestResult] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
    loadNotificationStatus();
    loadWeatherApiKey();
  }, []);

  async function loadWeatherApiKey() {
    try {
      const result = await chrome.storage.local.get('weather_api_key');
      if (result.weather_api_key) {
        setWeatherApiKey(result.weather_api_key);
      }
    } catch (error) {
      console.error('Failed to load weather API key:', error);
    }
  }

  async function saveWeatherApiKey() {
    try {
      await chrome.storage.local.set({ weather_api_key: weatherApiKey });
      weatherService.setApiKey(weatherApiKey);
      setWeatherTestResult('API key saved successfully!');
      setTimeout(() => setWeatherTestResult(null), 3000);
    } catch (error) {
      console.error('Failed to save weather API key:', error);
      setWeatherTestResult('Failed to save API key');
    }
  }

  async function testWeatherApi() {
    if (!weatherApiKey) {
      setWeatherTestResult('Please enter an API key first');
      return;
    }

    try {
      weatherService.setApiKey(weatherApiKey);
      const weather = await weatherService.getCurrentWeather();
      setWeatherTestResult(`✅ Success! Current: ${weather.temperature}°C, ${weather.condition}`);
      await chrome.storage.local.set({ weather_api_key: weatherApiKey });
    } catch (error) {
      setWeatherTestResult('❌ Failed to fetch weather. Check your API key.');
    }
  }

  async function loadSettings() {
    try {
      const user = await db.getUser('default-user');
      if (user && user.settings) {
        setSettings(user.settings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async function loadNotificationStatus() {
    try {
      const status = await reminderScheduler.getStatus();
      setNotificationStatus(status);
    } catch (error) {
      console.error('Failed to load notification status:', error);
    }
  }

  async function requestNotificationPermission() {
    const granted = await notificationService.requestPermission();
    if (granted) {
      await loadNotificationStatus();
      alert('Notifications enabled! You\'ll receive reminders based on your preferences.');
    } else {
      alert('Notifications permission denied. Please enable in browser settings.');
    }
  }

  async function saveSettings() {
    try {
      const user = await db.getUser('default-user');
      if (user) {
        user.settings = settings;
        await db.saveUser(user);

        // Update reminder scheduler with new preferences
        await reminderScheduler.updatePreferences(settings);
        await loadNotificationStatus();

        alert('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  }

  async function handleExportData() {
    setExporting(true);
    try {
      const userId = 'default-user';

      // Gather all data
      const user = await db.getUser(userId);
      const moods = await db.getMoodHistory(userId, 365);
      const flows = await db.getFlowSessions(userId, 365);
      const circadian = await db.getCircadianData(userId, 365);
      const personality = await db.getPersonalityProfile(userId);
      const responses = await db.getPersonalityResponses(userId);
      const interventions = await db.getInterventions(userId, 365);

      // Export models
      const models = await predictionPipeline.exportModels();

      const exportData = {
        version: '0.1.0',
        exported_at: new Date().toISOString(),
        user,
        mood_entries: moods,
        flow_sessions: flows,
        circadian_data: circadian,
        personality_profile: personality,
        personality_responses: responses,
        interventions,
        ml_models: models
      };

      // Download as JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `greenblu-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('Data exported successfully!');
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      // Delete all user data
      await db.deleteAllUserData('default-user');
      await predictionPipeline.reset();

      alert('All data has been deleted. Redirecting to onboarding...');
      // In a real app, this would redirect to onboarding
      onNavigate('dashboard');
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  function updateNotificationPreference<K extends keyof UserSettings['notification_preferences']>(
    key: K,
    value: UserSettings['notification_preferences'][K]
  ) {
    setSettings({
      ...settings,
      notification_preferences: {
        ...settings.notification_preferences,
        [key]: value
      }
    });
  }

  function updatePrivacySetting<K extends keyof UserSettings['privacy']>(
    key: K,
    value: UserSettings['privacy'][K]
  ) {
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: value
      }
    });
  }

  function updateDisplaySetting<K extends keyof UserSettings['display']>(
    key: K,
    value: UserSettings['display'][K]
  ) {
    setSettings({
      ...settings,
      display: {
        ...settings.display,
        [key]: value
      }
    });
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Customize your GreenBlu.ai experience
          </p>
        </div>

        {/* Notification Status */}
        {notificationStatus && (
          <div className={`rounded-xl shadow-md border-2 p-6 mb-6 ${
            notificationStatus.enabled
              ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800'
              : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
          }`}>
            <div className="flex items-start gap-4">
              <div className="text-4xl">
                {notificationStatus.enabled ? '🔔' : '🔕'}
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-semibold mb-2 ${
                  notificationStatus.enabled
                    ? 'text-teal-900 dark:text-teal-100'
                    : 'text-orange-900 dark:text-orange-100'
                }`}>
                  {notificationStatus.enabled
                    ? 'Notifications Active'
                    : 'Notifications Disabled'}
                </h3>

                {!notificationStatus.enabled ? (
                  <div className="space-y-3">
                    <p className="text-sm text-orange-800 dark:text-orange-200">
                      Enable notifications to receive mood check-in reminders and intervention suggestions.
                    </p>
                    <button
                      onClick={requestNotificationPermission}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Enable Notifications
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm text-teal-800 dark:text-teal-200">
                    {notificationStatus.nextMoodReminder && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Next Mood Reminder:</span>
                        <span>{new Date(notificationStatus.nextMoodReminder).toLocaleTimeString()}</span>
                      </div>
                    )}
                    {notificationStatus.nextPersonalityReminder && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Next Personality Question:</span>
                        <span>{new Date(notificationStatus.nextPersonalityReminder).toLocaleString()}</span>
                      </div>
                    )}
                    {notificationStatus.deferredCount > 0 && (
                      <div className="flex items-center gap-2 mt-3 p-3 bg-teal-100 dark:bg-teal-800 rounded-lg">
                        <span className="font-medium">⏸️ Deferred Notifications:</span>
                        <span>{notificationStatus.deferredCount} (paused during flow)</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notification Preferences */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            🔔 Notification Preferences
          </h2>

          <div className="space-y-4">
            {/* Mood Check Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Mood Check Frequency
              </label>
              <select
                value={settings.notification_preferences.mood_check_frequency}
                onChange={(e) =>
                  updateNotificationPreference('mood_check_frequency', parseInt(e.target.value))
                }
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              >
                <option value={60}>Every hour</option>
                <option value={120}>Every 2 hours</option>
                <option value={180}>Every 3 hours</option>
                <option value={240}>Every 4 hours</option>
                <option value={0}>Disabled</option>
              </select>
            </div>

            {/* Intervention Suggestions */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Intervention Suggestions
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Get personalized intervention recommendations
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notification_preferences.intervention_suggestions}
                  onChange={(e) =>
                    updateNotificationPreference('intervention_suggestions', e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
              </label>
            </div>

            {/* Flow Mode Protection */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Flow Mode Protection
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Disable notifications during flow states
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notification_preferences.flow_mode_protection}
                  onChange={(e) =>
                    updateNotificationPreference('flow_mode_protection', e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
              </label>
            </div>

            {/* Daily Personality Question */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Daily Personality Question
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Build your profile with one question per day
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notification_preferences.daily_personality_question}
                  onChange={(e) =>
                    updateNotificationPreference('daily_personality_question', e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Weather API Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            🌦️ Weather API
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                OpenWeatherMap API Key
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Get a free API key from{' '}
                <a
                  href="https://openweathermap.org/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:underline"
                >
                  openweathermap.org
                </a>
                {' '}to enable real weather data for mood predictions.
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={weatherApiKey}
                  onChange={(e) => setWeatherApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                />
                <button
                  onClick={testWeatherApi}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Test
                </button>
                <button
                  onClick={saveWeatherApiKey}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Save
                </button>
              </div>
              {weatherTestResult && (
                <p className={`mt-2 text-sm ${
                  weatherTestResult.includes('✅') || weatherTestResult.includes('Success')
                    ? 'text-teal-600 dark:text-teal-400'
                    : weatherTestResult.includes('❌') || weatherTestResult.includes('Failed')
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {weatherTestResult}
                </p>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> Weather data improves mood predictions by accounting for temperature, pressure, and conditions that affect your wellbeing.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            🔒 Privacy Settings
          </h2>

          <div className="space-y-4">
            {/* Enable Sync */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Enable Cloud Sync
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Sync your data across devices (coming soon)
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.privacy.enable_sync}
                  onChange={(e) => updatePrivacySetting('enable_sync', e.target.checked)}
                  className="sr-only peer"
                  disabled
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600 opacity-50"></div>
              </label>
            </div>

            {/* Share Anonymous Data */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Share Anonymous Data
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Help improve GreenBlu with anonymous usage data
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.privacy.share_anonymous_data}
                  onChange={(e) => updatePrivacySetting('share_anonymous_data', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Share with Manager */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Share with Manager
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Allow manager to view your flow patterns (coming soon)
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.privacy.share_with_manager}
                  onChange={(e) => updatePrivacySetting('share_with_manager', e.target.checked)}
                  className="sr-only peer"
                  disabled
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600 opacity-50"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            🎨 Display Settings
          </h2>

          <div className="space-y-4">
            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['light', 'dark', 'auto'] as const).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => updateDisplaySetting('theme', theme)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      settings.display.theme === theme
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {theme === 'light' && '☀️ Light'}
                    {theme === 'dark' && '🌙 Dark'}
                    {theme === 'auto' && '🔄 Auto'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            💾 Data Management
          </h2>

          <div className="space-y-4">
            {/* Export Data */}
            <div>
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                Export All Data
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Download all your data including mood entries, personality profile, and ML models
              </div>
              <button
                onClick={handleExportData}
                disabled={exporting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
              >
                {exporting ? 'Exporting...' : 'Export Data'}
              </button>
            </div>

            {/* Delete Account */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="font-medium text-red-600 dark:text-red-400 mb-1">
                Delete Account
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Permanently delete all your data. This action cannot be undone.
              </div>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Delete Account
                </button>
              ) : (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg p-4">
                  <div className="font-semibold text-red-900 dark:text-red-200 mb-2">
                    Are you sure?
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300 mb-3">
                    This will permanently delete all your data, including mood entries, personality profile, and ML models. This action cannot be undone.
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors"
                    >
                      {deleting ? 'Deleting...' : 'Yes, Delete Everything'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deleting}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl shadow-lg p-6 text-white mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            ℹ️ About GreenBlu.ai
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="opacity-90">Version</span>
              <span className="font-semibold">0.1.0 Beta</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-90">Build Date</span>
              <span className="font-semibold">November 2025</span>
            </div>
            <div className="border-t border-white/20 pt-3 mt-3">
              <div className="font-semibold mb-2">Revolutionary Career Matching</div>
              <p className="text-sm opacity-90 leading-relaxed">
                GreenBlu.ai is pioneering personality-based career matching. Instead of matching based on resumes and skills, we match based on verified personality traits, flow triggers, and energy patterns. We believe the future of recruitment is about finding the perfect "key in lock" fit.
              </p>
            </div>
            <div className="border-t border-white/20 pt-3 mt-3">
              <div className="font-semibold mb-1">Credits</div>
              <p className="text-sm opacity-90">
                Built with advanced AI/ML models including KAN networks, LSTM, XGBoost, and ensemble learning for mood prediction and flow optimization.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={saveSettings}
            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg transition-all"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
