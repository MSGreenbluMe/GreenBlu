import { useState, useEffect } from 'react';
import MoodTracker from './components/MoodTracker';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import { db } from './services/database';
import type { User } from './types';

type View = 'onboarding' | 'mood' | 'dashboard' | 'personality' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<View>('onboarding');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  async function initializeApp() {
    try {
      // Check if user exists
      const existingUser = await db.getUser('default-user');

      if (existingUser) {
        setUser(existingUser);

        if (existingUser.onboarding_completed) {
          setCurrentView('dashboard');
        } else {
          setCurrentView('onboarding');
        }
      } else {
        // Create new user
        const newUser: User = {
          user_id: 'default-user',
          created_at: Date.now(),
          last_active: Date.now(),
          settings: {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            notification_preferences: {
              mood_check_frequency: 60,
              intervention_suggestions: true,
              flow_mode_protection: true,
              daily_personality_question: true
            },
            privacy: {
              enable_sync: false,
              share_anonymous_data: false,
              share_with_manager: false
            },
            display: {
              theme: 'light',
              character_design: 'default',
              dashboard_layout: 'default'
            }
          },
          onboarding_completed: false,
          onboarding_step: 0,
          days_active: 0
        };

        await db.saveUser(newUser);
        setUser(newUser);
        setCurrentView('onboarding');
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setLoading(false);
    }
  }

  async function completeOnboarding() {
    if (user) {
      const updatedUser = { ...user, onboarding_completed: true };
      await db.saveUser(updatedUser);
      setUser(updatedUser);
      setCurrentView('dashboard');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading GreenBlu.ai...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {currentView === 'onboarding' && (
        <Onboarding onComplete={completeOnboarding} />
      )}

      {currentView === 'dashboard' && (
        <Dashboard onNavigate={setCurrentView} />
      )}

      {currentView === 'mood' && user && (
        <div className="p-6">
          <MoodTracker
            userId={user.user_id}
            onComplete={() => setCurrentView('dashboard')}
          />
        </div>
      )}
    </div>
  );
}

export default App;
