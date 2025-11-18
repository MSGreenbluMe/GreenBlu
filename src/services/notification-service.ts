// Notification Service for GreenBlu.ai
// Handles Chrome notifications with smart timing

export interface NotificationConfig {
  title: string;
  message: string;
  icon?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  tag?: string;
  data?: any;
}

export interface NotificationSchedule {
  id: string;
  type: 'mood_check' | 'personality_question' | 'intervention' | 'flow_reminder';
  scheduledTime: number;
  config: NotificationConfig;
  enabled: boolean;
}

/**
 * Chrome Notification Service
 * Manages all notifications with smart timing and flow protection
 */
export class NotificationService {
  private readonly NOTIFICATION_ICONS = {
    mood: '/icons/icon-128.png',
    personality: '/icons/icon-128.png',
    intervention: '/icons/icon-128.png',
    flow: '/icons/icon-128.png'
  };

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    try {
      if (!('Notification' in window)) {
        console.warn('Notifications not supported');
        return false;
      }

      if (Notification.permission === 'granted') {
        return true;
      }

      if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }

      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Check if notifications are allowed
   */
  areNotificationsEnabled(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  /**
   * Show a notification
   */
  async show(config: NotificationConfig): Promise<boolean> {
    try {
      if (!this.areNotificationsEnabled()) {
        console.warn('Notifications not enabled');
        return false;
      }

      // Use Chrome extension API if available
      if (typeof chrome !== 'undefined' && chrome.notifications) {
        await chrome.notifications.create(config.tag || `greenblu-${Date.now()}`, {
          type: 'basic',
          iconUrl: config.icon || this.NOTIFICATION_ICONS.mood,
          title: config.title,
          message: config.message,
          requireInteraction: config.requireInteraction || false,
          silent: config.silent || false,
          priority: 2
        });
      } else {
        // Fallback to Web Notification API
        new Notification(config.title, {
          body: config.message,
          icon: config.icon || this.NOTIFICATION_ICONS.mood,
          requireInteraction: config.requireInteraction || false,
          silent: config.silent || false,
          tag: config.tag,
          data: config.data
        });
      }

      return true;
    } catch (error) {
      console.error('Error showing notification:', error);
      return false;
    }
  }

  /**
   * Schedule a notification
   */
  async schedule(schedule: NotificationSchedule): Promise<void> {
    try {
      // Store in chrome.storage for service worker to handle
      const schedules = await this.getSchedules();
      schedules.push(schedule);

      await chrome.storage.local.set({ notification_schedules: schedules });

      console.log('Notification scheduled:', schedule);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getSchedules(): Promise<NotificationSchedule[]> {
    try {
      const result = await chrome.storage.local.get('notification_schedules');
      return result.notification_schedules || [];
    } catch (error) {
      console.error('Error getting schedules:', error);
      return [];
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelSchedule(scheduleId: string): Promise<void> {
    try {
      const schedules = await this.getSchedules();
      const filtered = schedules.filter(s => s.id !== scheduleId);

      await chrome.storage.local.set({ notification_schedules: filtered });

      console.log('Notification cancelled:', scheduleId);
    } catch (error) {
      console.error('Error cancelling schedule:', error);
    }
  }

  /**
   * Clear all scheduled notifications
   */
  async clearAllSchedules(): Promise<void> {
    try {
      await chrome.storage.local.set({ notification_schedules: [] });
      console.log('All schedules cleared');
    } catch (error) {
      console.error('Error clearing schedules:', error);
    }
  }

  /**
   * Mood check-in reminder
   */
  async scheduleMoodReminder(frequencyMinutes: number): Promise<void> {
    if (frequencyMinutes === 0) {
      // Disabled
      return;
    }

    const schedule: NotificationSchedule = {
      id: `mood-reminder-${Date.now()}`,
      type: 'mood_check',
      scheduledTime: Date.now() + (frequencyMinutes * 60 * 1000),
      config: {
        title: '🐙 Time for a Mood Check-in',
        message: 'Quick 15-second check-in to track your wellbeing',
        icon: this.NOTIFICATION_ICONS.mood,
        tag: 'mood-reminder',
        requireInteraction: false
      },
      enabled: true
    };

    await this.schedule(schedule);
  }

  /**
   * Daily personality question reminder
   */
  async schedulePersonalityReminder(hour: number = 9): Promise<void> {
    const now = new Date();
    const scheduledTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hour,
      0,
      0
    );

    // If time has passed today, schedule for tomorrow
    if (scheduledTime.getTime() < now.getTime()) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const schedule: NotificationSchedule = {
      id: `personality-reminder-${Date.now()}`,
      type: 'personality_question',
      scheduledTime: scheduledTime.getTime(),
      config: {
        title: '🧠 Daily Personality Question',
        message: 'Answer 1-2 questions to build your profile',
        icon: this.NOTIFICATION_ICONS.personality,
        tag: 'personality-reminder',
        requireInteraction: false
      },
      enabled: true
    };

    await this.schedule(schedule);
  }

  /**
   * Intervention suggestion (when mood is predicted to drop)
   */
  async suggestIntervention(interventionName: string, reason: string): Promise<void> {
    await this.show({
      title: '✨ Intervention Suggestion',
      message: `${interventionName} - ${reason}`,
      icon: this.NOTIFICATION_ICONS.intervention,
      tag: 'intervention-suggestion',
      requireInteraction: true
    });
  }

  /**
   * Flow state notification
   */
  async notifyFlowState(entering: boolean): Promise<void> {
    if (entering) {
      await this.show({
        title: '🌊 Flow State Detected!',
        message: 'You\'re in the zone! Notifications will be minimized.',
        icon: this.NOTIFICATION_ICONS.flow,
        tag: 'flow-detected',
        silent: true,
        requireInteraction: false
      });
    } else {
      await this.show({
        title: '🎯 Flow Session Complete',
        message: 'Great work! Your flow session has been logged.',
        icon: this.NOTIFICATION_ICONS.flow,
        tag: 'flow-complete',
        requireInteraction: false
      });
    }
  }

  /**
   * Check if user is currently in flow (to avoid interrupting)
   */
  async isInFlowState(): Promise<boolean> {
    try {
      const result = await chrome.storage.local.get('current_flow_state');
      return result.current_flow_state?.inFlow || false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Smart notification that respects flow state
   */
  async showSmart(config: NotificationConfig): Promise<boolean> {
    const inFlow = await this.isInFlowState();

    if (inFlow) {
      console.log('User in flow state, notification deferred:', config.title);
      // Store for later (when flow ends)
      await this.storeDeferredNotification(config);
      return false;
    }

    return await this.show(config);
  }

  /**
   * Store notification to show later (public for external use)
   */
  async storeDeferredNotification(config: NotificationConfig): Promise<void> {
    try {
      const result = await chrome.storage.local.get('deferred_notifications');
      const deferred = result.deferred_notifications || [];

      deferred.push({
        config,
        deferredAt: Date.now()
      });

      await chrome.storage.local.set({ deferred_notifications: deferred });
    } catch (error) {
      console.error('Error storing deferred notification:', error);
    }
  }

  /**
   * Show all deferred notifications
   */
  async showDeferredNotifications(): Promise<void> {
    try {
      const result = await chrome.storage.local.get('deferred_notifications');
      const deferred = result.deferred_notifications || [];

      if (deferred.length === 0) return;

      // Show summary notification instead of spamming
      await this.show({
        title: `🔔 ${deferred.length} Notification${deferred.length > 1 ? 's' : ''}`,
        message: 'You have pending notifications from your flow session',
        tag: 'deferred-summary',
        requireInteraction: true
      });

      // Clear deferred
      await chrome.storage.local.set({ deferred_notifications: [] });
    } catch (error) {
      console.error('Error showing deferred notifications:', error);
    }
  }
}

// Export singleton
export const notificationService = new NotificationService();
