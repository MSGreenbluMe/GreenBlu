import { useState, useEffect } from 'react';
import MoodTracker from './components/MoodTracker';
import PersonalityQuestion from './components/PersonalityQuestion';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import PersonalityProfile from './pages/PersonalityProfile';
import Interventions from './pages/Interventions';
import JobCrafting from './pages/JobCrafting';
import JobMatching from './pages/JobMatching';
import Analytics from './pages/Analytics';
import { db } from './services/database';
import { interventionTemplates } from './data/intervention-templates';
import { reminderScheduler } from './services/reminder-scheduler';
import type { User } from './types';

type View = 'onboarding' | 'mood' | 'dashboard' | 'personality' | 'personality-profile' | 'settings' | 'interventions' | 'job-crafting' | 'job-matching' | 'analytics';

function App() {
  const [currentView, setCurrentView] = useState<View>('onboarding');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  async function initializeApp() {
    try {
      // Initialize database
      await db.init();

      // Initialize intervention templates (only if not already loaded)
      const existingTemplates = await db.getInterventionTemplates();
      if (existingTemplates.length === 0) {
        console.log('Initializing intervention templates...');
        // Use direct DB access since templates table doesn't have add method
        const dbInstance = (db as any).db;
        if (dbInstance) {
          const tx = dbInstance.transaction('intervention_templates', 'readwrite');
          for (const template of interventionTemplates) {
            await tx.store.put(template);
          }
          await tx.done;
          console.log('Loaded', interventionTemplates.length, 'intervention templates');
        }
      }

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

      // Initialize reminder scheduler
      if (existingUser) {
        await reminderScheduler.initialize(existingUser.user_id);
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading GreenBlu.ai...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {currentView === 'onboarding' && (
        <Onboarding onComplete={completeOnboarding} />
      )}

      {currentView === 'dashboard' && (
        <Dashboard onNavigate={setCurrentView} />
      )}

      {currentView === 'mood' && user && (
        <MoodTracker
          userId={user.user_id}
          onComplete={() => setCurrentView('dashboard')}
          onBack={() => setCurrentView('dashboard')}
        />
      )}

      {currentView === 'personality' && user && (
        <div className="p-6">
          <div className="max-w-2xl mx-auto mb-6">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
          </div>
          <PersonalityQuestion
            userId={user.user_id}
            onComplete={() => setCurrentView('dashboard')}
          />
        </div>
      )}

      {currentView === 'personality-profile' && user && (
        <PersonalityProfile
          userId={user.user_id}
          onNavigate={setCurrentView}
        />
      )}

      {currentView === 'interventions' && user && (
        <Interventions
          userId={user.user_id}
          onNavigate={setCurrentView}
        />
      )}

      {currentView === 'job-crafting' && user && (
        <JobCrafting
          userId={user.user_id}
          onNavigate={setCurrentView}
        />
      )}

      {currentView === 'job-matching' && user && (
        <JobMatching
          userId={user.user_id}
          onNavigate={setCurrentView}
        />
      )}

      {currentView === 'analytics' && user && (
        <Analytics
          userId={user.user_id}
          onNavigate={setCurrentView}
        />
      )}
    </div>
  );
}

export default App;
