// Reminder Scheduler for GreenBlu.ai
// Automatically schedules notifications based on user preferences and AI predictions

import { notificationService } from './notification-service';
import { db } from './database';
import type { UserSettings } from '../types';

export interface ReminderConfig {
  moodCheckEnabled: boolean;
  moodCheckFrequency: number; // minutes
  personalityQuestionEnabled: boolean;
  personalityQuestionTime: number; // hour (0-23)
  interventionSuggestionsEnabled: boolean;
  flowProtectionEnabled: boolean;
}

/**
 * Reminder Scheduler
 * Manages automatic reminders with smart timing
 */
export class ReminderScheduler {
  private intervalId: number | null = null;
  private userId: string = 'default-user';

  /**
   * Initialize scheduler with user preferences
   */
  async initialize(userId: string): Promise<void> {
    this.userId = userId;

    const user = await db.getUser(userId);
    if (!user) return;

    const config = this.getUserConfig(user.settings);

    // Request notification permission
    await notificationService.requestPermission();

    // Schedule initial reminders
    await this.scheduleAllReminders(config);

    // Start background check (every minute)
    this.start();

    console.log('Reminder scheduler initialized');
  }

  /**
   * Start background scheduler
   */
  start(): void {
    if (this.intervalId) return;

    // Check every minute for due notifications
    this.intervalId = window.setInterval(() => {
      this.checkDueNotifications();
    }, 60000); // 1 minute

    console.log('Reminder scheduler started');
  }

  /**
   * Stop scheduler
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('Reminder scheduler stopped');
  }

  /**
   * Extract config from user settings
   */
  private getUserConfig(settings: UserSettings): ReminderConfig {
    return {
      moodCheckEnabled: settings.notification_preferences.mood_check_frequency > 0,
      moodCheckFrequency: settings.notification_preferences.mood_check_frequency,
      personalityQuestionEnabled: settings.notification_preferences.daily_personality_question,
      personalityQuestionTime: 9, // 9 AM default
      interventionSuggestionsEnabled: settings.notification_preferences.intervention_suggestions,
      flowProtectionEnabled: settings.notification_preferences.flow_mode_protection
    };
  }

  /**
   * Schedule all reminders
   */
  private async scheduleAllReminders(config: ReminderConfig): Promise<void> {
    // Clear existing schedules first
    await notificationService.clearAllSchedules();

    // Mood check reminders
    if (config.moodCheckEnabled) {
      await this.scheduleMoodReminders(config.moodCheckFrequency);
    }

    // Personality question reminder
    if (config.personalityQuestionEnabled) {
      await notificationService.schedulePersonalityReminder(config.personalityQuestionTime);
    }

    console.log('All reminders scheduled');
  }

  /**
   * Schedule mood check reminders
   */
  private async scheduleMoodReminders(frequencyMinutes: number): Promise<void> {
    // Get last mood entry
    const lastMood = await db.getLastMoodEntry(this.userId);
    const lastCheckTime = lastMood ? lastMood.timestamp : 0;
    const timeSinceLastCheck = Date.now() - lastCheckTime;
    const frequencyMs = frequencyMinutes * 60 * 1000;

    // Calculate next reminder time
    let nextReminderTime: number;

    if (timeSinceLastCheck >= frequencyMs) {
      // Overdue - remind now
      nextReminderTime = Date.now() + 60000; // 1 minute from now
    } else {
      // Schedule for next interval
      nextReminderTime = lastCheckTime + frequencyMs;
    }

    // Schedule recurring reminders
    await this.scheduleRecurringMoodReminder(nextReminderTime, frequencyMinutes);
  }

  /**
   * Schedule recurring mood reminder
   */
  private async scheduleRecurringMoodReminder(
    nextTime: number,
    frequencyMinutes: number
  ): Promise<void> {
    // Schedule next 3 reminders (to cover a few hours)
    for (let i = 0; i < 3; i++) {
      const scheduledTime = nextTime + (i * frequencyMinutes * 60 * 1000);

      await notificationService.schedule({
        id: `mood-reminder-${scheduledTime}`,
        type: 'mood_check',
        scheduledTime,
        config: {
          title: '🐙 Mood Check-in Time',
          message: 'Quick 15-second check-in to track your wellbeing',
          tag: 'mood-reminder',
          requireInteraction: false
        },
        enabled: true
      });
    }
  }

  /**
   * Check for due notifications
   */
  private async checkDueNotifications(): Promise<void> {
    try {
      const schedules = await notificationService.getSchedules();
      const now = Date.now();

      for (const schedule of schedules) {
        if (!schedule.enabled) continue;

        // Check if due (within 1 minute tolerance)
        if (schedule.scheduledTime <= now && schedule.scheduledTime > now - 60000) {
          await this.handleDueNotification(schedule);
        }

        // Remove old schedules (more than 5 minutes past due)
        if (schedule.scheduledTime < now - 300000) {
          await notificationService.cancelSchedule(schedule.id);
        }
      }
    } catch (error) {
      console.error('Error checking due notifications:', error);
    }
  }

  /**
   * Handle a due notification
   */
  private async handleDueNotification(schedule: any): Promise<void> {
    try {
      // Check flow protection
      const user = await db.getUser(this.userId);
      if (user?.settings.notification_preferences.flow_mode_protection) {
        const inFlow = await notificationService.isInFlowState();

        if (inFlow && schedule.type !== 'flow_reminder') {
          console.log('User in flow, deferring notification:', schedule.config.title);
          await notificationService.storeDeferredNotification(schedule.config);
          await notificationService.cancelSchedule(schedule.id);
          return;
        }
      }

      // Show notification
      await notificationService.show(schedule.config);

      // Reschedule if recurring
      if (schedule.type === 'mood_check') {
        await this.rescheduleMoodReminder(schedule);
      } else if (schedule.type === 'personality_question') {
        await this.reschedulePersonalityReminder();
      }

      // Remove this schedule
      await notificationService.cancelSchedule(schedule.id);
    } catch (error) {
      console.error('Error handling due notification:', error);
    }
  }

  /**
   * Reschedule mood reminder after showing
   */
  private async rescheduleMoodReminder(oldSchedule: any): Promise<void> {
    const user = await db.getUser(this.userId);
    if (!user) return;

    const frequency = user.settings.notification_preferences.mood_check_frequency;
    if (frequency === 0) return;

    const nextTime = Date.now() + (frequency * 60 * 1000);

    await notificationService.schedule({
      id: `mood-reminder-${nextTime}`,
      type: 'mood_check',
      scheduledTime: nextTime,
      config: oldSchedule.config,
      enabled: true
    });
  }

  /**
   * Reschedule personality reminder for next day
   */
  private async reschedulePersonalityReminder(): Promise<void> {
    const user = await db.getUser(this.userId);
    if (!user || !user.settings.notification_preferences.daily_personality_question) {
      return;
    }

    await notificationService.schedulePersonalityReminder(9); // 9 AM tomorrow
  }

  /**
   * Update preferences on the fly
   */
  async updatePreferences(settings: UserSettings): Promise<void> {
    const config = this.getUserConfig(settings);
    await this.scheduleAllReminders(config);

    console.log('Preferences updated, reminders rescheduled');
  }

  /**
   * Schedule intervention based on AI prediction
   */
  async scheduleInterventionSuggestion(
    predictedMood: { valence: number; arousal: number; dominance: number },
    timeMinutes: number,
    interventionName: string
  ): Promise<void> {
    const user = await db.getUser(this.userId);
    if (!user?.settings.notification_preferences.intervention_suggestions) {
      return;
    }

    // Only suggest if predicted mood is negative
    if (predictedMood.valence > -0.2) return;

    const scheduledTime = Date.now() + (timeMinutes * 60 * 1000);

    await notificationService.schedule({
      id: `intervention-${scheduledTime}`,
      type: 'intervention',
      scheduledTime,
      config: {
        title: '✨ Intervention Suggestion',
        message: `Try ${interventionName} - your mood may dip soon`,
        tag: 'intervention-suggestion',
        requireInteraction: true
      },
      enabled: true
    });

    console.log(`Intervention scheduled for ${timeMinutes} minutes from now`);
  }

  /**
   * Notify when entering flow state
   */
  async notifyFlowStateChange(entering: boolean): Promise<void> {
    // Store flow state
    await chrome.storage.local.set({
      current_flow_state: {
        inFlow: entering,
        timestamp: Date.now()
      }
    });

    // Notify user
    await notificationService.notifyFlowState(entering);

    // If exiting flow, show deferred notifications
    if (!entering) {
      setTimeout(() => {
        notificationService.showDeferredNotifications();
      }, 2000); // Wait 2 seconds after flow ends
    }
  }

  /**
   * Get current reminder status
   */
  async getStatus(): Promise<{
    enabled: boolean;
    nextMoodReminder: number | null;
    nextPersonalityReminder: number | null;
    deferredCount: number;
  }> {
    const schedules = await notificationService.getSchedules();
    const deferred = await chrome.storage.local.get('deferred_notifications');

    const moodReminders = schedules.filter(s => s.type === 'mood_check');
    const personalityReminders = schedules.filter(s => s.type === 'personality_question');

    return {
      enabled: notificationService.areNotificationsEnabled(),
      nextMoodReminder: moodReminders.length > 0 ? moodReminders[0].scheduledTime : null,
      nextPersonalityReminder:
        personalityReminders.length > 0 ? personalityReminders[0].scheduledTime : null,
      deferredCount: (deferred.deferred_notifications || []).length
    };
  }
}

// Export singleton
export const reminderScheduler = new ReminderScheduler();
