// GreenBlu.ai Service Worker (Background Script)
// Handles alarms, notifications, and background AI processing

import type { MoodEntry, FlowSession } from './types';

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('GreenBlu.ai installed! Welcome to flow state optimization.');

    // Set up initial alarms
    setupAlarms();

    // Open onboarding
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
  } else if (details.reason === 'update') {
    console.log('GreenBlu.ai updated!');
  }
});

// Set up periodic alarms
function setupAlarms() {
  // Morning check-in (7 AM)
  chrome.alarms.create('morning-checkin', {
    when: getNextMorningTime(7, 0),
    periodInMinutes: 24 * 60 // Daily
  });

  // Mood check reminder (every 60 minutes during work hours)
  chrome.alarms.create('mood-check', {
    periodInMinutes: 60
  });

  // Flow state check (every 15 minutes)
  chrome.alarms.create('flow-check', {
    periodInMinutes: 15
  });

  // Personality question (once per day, random time)
  schedulePersonalityQuestion();
}

function getNextMorningTime(hour: number, minute: number): number {
  const now = new Date();
  const next = new Date(now);
  next.setHours(hour, minute, 0, 0);

  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  return next.getTime();
}

function schedulePersonalityQuestion() {
  // Random time between 9 AM and 6 PM
  const hour = 9 + Math.floor(Math.random() * 9);
  const minute = Math.floor(Math.random() * 60);

  chrome.alarms.create('personality-question', {
    when: getNextMorningTime(hour, minute),
    periodInMinutes: 24 * 60
  });
}

// Handle alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  console.log('Alarm triggered:', alarm.name);

  switch (alarm.name) {
    case 'morning-checkin':
      await handleMorningCheckin();
      break;
    case 'mood-check':
      await handleMoodCheck();
      break;
    case 'flow-check':
      await handleFlowCheck();
      break;
    case 'personality-question':
      await handlePersonalityQuestion();
      schedulePersonalityQuestion(); // Schedule next one
      break;
  }
});

async function handleMorningCheckin() {
  const settings = await getUserSettings();
  if (!settings?.notification_preferences?.morning_checkin_enabled) return;

  chrome.notifications.create('morning-checkin', {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/icon-48.png'),
    title: 'Good Morning! 🌅',
    message: 'Start your day with a quick check-in. When did you wake up today?',
    priority: 2
  });
}

async function handleMoodCheck() {
  const settings = await getUserSettings();
  if (!settings?.notification_preferences?.mood_check_frequency) return;

  // Check if user is in flow state - don't interrupt!
  const currentFlowSession = await getCurrentFlowSession();
  if (currentFlowSession && currentFlowSession.flow_quality > 0.6) {
    console.log('User in flow state - skipping mood check notification');
    return;
  }

  // Check time since last mood entry
  const lastMoodEntry = await getLastMoodEntry();
  const timeSinceLastCheck = Date.now() - (lastMoodEntry?.timestamp || 0);
  const checkInterval = settings.notification_preferences.mood_check_frequency * 60 * 1000;

  if (timeSinceLastCheck >= checkInterval) {
    chrome.notifications.create('mood-check', {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon-48.png'),
      title: 'Quick Mood Check-in 😊',
      message: 'How are you feeling right now? (Takes < 15 sec)',
      priority: 1
    });
  }
}

async function handleFlowCheck() {
  // Run flow detection algorithm in background
  const lastMoodEntry = await getLastMoodEntry();
  if (!lastMoodEntry) return;

  const flowProbability = calculateFlowProbability(lastMoodEntry);

  if (flowProbability > 0.6) {
    // User might be in flow - enable protection mode
    console.log('Flow state detected! Enabling protection mode.');
    await chrome.storage.local.set({ flowModeActive: true });

    // Update badge
    chrome.action.setBadgeText({ text: '🌊' });
    chrome.action.setBadgeBackgroundColor({ color: '#2dd4bf' });
  } else {
    await chrome.storage.local.set({ flowModeActive: false });
    chrome.action.setBadgeText({ text: '' });
  }
}

async function handlePersonalityQuestion() {
  const settings = await getUserSettings();
  if (!settings?.notification_preferences?.daily_personality_question) return;

  chrome.notifications.create('personality-question', {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/icon-48.png'),
    title: 'Quick Personality Question ✨',
    message: 'Help us understand you better (1 question, < 30 sec)',
    priority: 1
  });
}

// Helper functions
async function getUserSettings() {
  const result = await chrome.storage.local.get('user_settings');
  return result.user_settings;
}

async function getLastMoodEntry(): Promise<MoodEntry | null> {
  const result = await chrome.storage.local.get('last_mood_entry');
  return result.last_mood_entry || null;
}

async function getCurrentFlowSession(): Promise<FlowSession | null> {
  const result = await chrome.storage.local.get('current_flow_session');
  return result.current_flow_session || null;
}

function calculateFlowProbability(moodEntry: MoodEntry): number {
  // Simple flow detection based on VAD
  const { valence, arousal, dominance } = moodEntry.vad;

  // Flow zone: V[0.6-0.9], A[0.5-0.8], D[0.7-1.0]
  const vInRange = valence >= 0.6 && valence <= 0.9;
  const aInRange = arousal >= 0.5 && arousal <= 0.8;
  const dInRange = dominance >= 0.7 && dominance <= 1.0;

  if (vInRange && aInRange && dInRange) {
    // Calculate distance from optimal
    const optimalV = 0.75;
    const optimalA = 0.65;
    const optimalD = 0.85;

    const vScore = 1 - Math.abs(valence - optimalV) / 0.3;
    const aScore = 1 - Math.abs(arousal - optimalA) / 0.3;
    const dScore = 1 - Math.abs(dominance - optimalD) / 0.3;

    return (vScore + aScore + dScore) / 3;
  }

  return 0;
}

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  chrome.action.openPopup();
  chrome.notifications.clear(notificationId);
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ENABLE_FLOW_MODE') {
    chrome.storage.local.set({ flowModeActive: true });
    chrome.action.setBadgeText({ text: '🌊' });
    sendResponse({ success: true });
  } else if (message.type === 'DISABLE_FLOW_MODE') {
    chrome.storage.local.set({ flowModeActive: false });
    chrome.action.setBadgeText({ text: '' });
    sendResponse({ success: true });
  }

  return true; // Keep message channel open for async response
});

console.log('GreenBlu.ai service worker initialized!');
