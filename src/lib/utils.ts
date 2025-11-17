import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { VAD } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(timestamp));
}

export function getMoodEmoji(vad: VAD): string {
  const { valence, arousal } = vad;

  if (valence > 0.5 && arousal > 0.5) return '😄'; // Happy & Energized
  if (valence > 0.5 && arousal < -0.5) return '😌'; // Happy & Calm
  if (valence < -0.5 && arousal > 0.5) return '😰'; // Anxious
  if (valence < -0.5 && arousal < -0.5) return '😢'; // Sad & Low energy
  if (Math.abs(valence) < 0.2 && arousal > 0.5) return '😐'; // Neutral & Alert
  if (Math.abs(valence) < 0.2 && arousal < -0.5) return '😴'; // Neutral & Tired

  return '😊'; // Default
}

export function getMoodLabel(vad: VAD): string {
  const { valence, arousal, dominance } = vad;

  // Flow state check
  if (
    valence >= 0.6 &&
    valence <= 0.9 &&
    arousal >= 0.5 &&
    arousal <= 0.8 &&
    dominance >= 0.7
  ) {
    return 'In Flow 🌊';
  }

  if (valence > 0.5 && arousal > 0.5) return 'Energized & Happy';
  if (valence > 0.5 && arousal < -0.5) return 'Calm & Content';
  if (valence < -0.5 && arousal > 0.5) return 'Stressed';
  if (valence < -0.5 && arousal < -0.5) return 'Low Energy';
  if (Math.abs(valence) < 0.2) return 'Neutral';

  return 'Mixed Feelings';
}

export function calculateFlowProbability(vad: VAD, timeSinceLastCheck?: number): number {
  const { valence, arousal, dominance } = vad;

  // Flow zone: V[0.6-0.9], A[0.5-0.8], D[0.7-1.0]
  const vInRange = valence >= 0.6 && valence <= 0.9;
  const aInRange = arousal >= 0.5 && arousal <= 0.8;
  const dInRange = dominance >= 0.7 && dominance <= 1.0;

  if (!vInRange || !aInRange || !dInRange) {
    return 0;
  }

  // Calculate distance from optimal
  const optimalV = 0.75;
  const optimalA = 0.65;
  const optimalD = 0.85;

  const vScore = 1 - Math.abs(valence - optimalV) / 0.3;
  const aScore = 1 - Math.abs(arousal - optimalA) / 0.3;
  const dScore = 1 - Math.abs(dominance - optimalD) / 0.3;

  let flowScore = (vScore + aScore + dScore) / 3;

  // Time factor (longer since last check = deeper engagement)
  if (timeSinceLastCheck && timeSinceLastCheck > 30 * 60 * 1000) {
    flowScore = Math.min(1, flowScore * 1.2);
  }

  return flowScore;
}

export function getFlowLevel(flowProbability: number): 'deep_flow' | 'flow' | 'near_flow' | 'not_in_flow' {
  if (flowProbability >= 0.8) return 'deep_flow';
  if (flowProbability >= 0.6) return 'flow';
  if (flowProbability >= 0.4) return 'near_flow';
  return 'not_in_flow';
}

export function vadToHSL(vad: VAD): string {
  const { valence, arousal } = vad;

  // Map valence to hue (negative = cool colors, positive = warm colors)
  const hue = Math.round(((valence + 1) / 2) * 120 + 180); // 180-300 range

  // Map arousal to saturation and lightness
  const saturation = Math.round(((arousal + 1) / 2) * 50 + 40); // 40-90%
  const lightness = Math.round(60 - (arousal * 20)); // 40-80%

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
