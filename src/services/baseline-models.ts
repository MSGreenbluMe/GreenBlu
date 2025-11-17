// Baseline Models for Mood Prediction
// Simple yet effective approaches for comparison and fallback

import type { VAD, MoodEntry, VADWithConfidence, CircadianEntry } from '../types';

/**
 * Exponential Moving Average Predictor
 * Uses weighted average of recent moods with exponential decay
 */
export class EMAPredictor {
  private alpha: number;
  private currentEMA: VAD | null = null;

  constructor(alpha: number = 0.3) {
    this.alpha = alpha; // Smoothing factor (0-1)
  }

  /**
   * Update EMA with new mood entry
   */
  update(mood: VAD): void {
    if (!this.currentEMA) {
      this.currentEMA = { ...mood };
    } else {
      this.currentEMA = {
        valence: this.alpha * mood.valence + (1 - this.alpha) * this.currentEMA.valence,
        arousal: this.alpha * mood.arousal + (1 - this.alpha) * this.currentEMA.arousal,
        dominance: this.alpha * mood.dominance + (1 - this.alpha) * this.currentEMA.dominance
      };
    }
  }

  /**
   * Initialize from mood history
   */
  initFromHistory(moodHistory: MoodEntry[]): void {
    this.currentEMA = null;
    for (const entry of moodHistory) {
      this.update(entry.vad);
    }
  }

  /**
   * Predict future mood (assumes continuation of current trend)
   */
  predict(horizon: '1h' | '4h' | '8h' = '1h'): VADWithConfidence {
    if (!this.currentEMA) {
      return {
        valence: 0,
        arousal: 0,
        dominance: 0,
        confidence: 0.3
      };
    }

    // EMA assumes mean-reverting behavior, so predictions decay toward mean
    const decayFactors = { '1h': 0.95, '4h': 0.85, '8h': 0.75 };
    const decay = decayFactors[horizon];

    return {
      valence: this.currentEMA.valence * decay,
      arousal: this.currentEMA.arousal * decay,
      dominance: this.currentEMA.dominance * decay,
      confidence: 0.6 // Moderate confidence for simple model
    };
  }

  /**
   * Get current EMA state
   */
  getCurrentEMA(): VAD | null {
    return this.currentEMA;
  }
}

/**
 * Circadian Rhythm Baseline Predictor
 * Predicts mood based on time of day patterns
 */
export class CircadianPredictor {
  private hourlyPatterns: Map<number, VAD> = new Map();
  private hourCounts: Map<number, number> = new Map();

  /**
   * Learn circadian patterns from mood history
   */
  learnPatterns(moodHistory: MoodEntry[]): void {
    this.hourlyPatterns.clear();
    this.hourCounts.clear();

    // Aggregate moods by hour of day
    const hourlyAggregates = new Map<number, { sum: VAD; count: number }>();

    for (const entry of moodHistory) {
      const hour = new Date(entry.timestamp).getHours();

      if (!hourlyAggregates.has(hour)) {
        hourlyAggregates.set(hour, {
          sum: { valence: 0, arousal: 0, dominance: 0 },
          count: 0
        });
      }

      const aggregate = hourlyAggregates.get(hour)!;
      aggregate.sum.valence += entry.vad.valence;
      aggregate.sum.arousal += entry.vad.arousal;
      aggregate.sum.dominance += entry.vad.dominance;
      aggregate.count++;
    }

    // Calculate averages
    for (const [hour, aggregate] of hourlyAggregates) {
      this.hourlyPatterns.set(hour, {
        valence: aggregate.sum.valence / aggregate.count,
        arousal: aggregate.sum.arousal / aggregate.count,
        dominance: aggregate.sum.dominance / aggregate.count
      });
      this.hourCounts.set(hour, aggregate.count);
    }
  }

  /**
   * Predict mood for a future time
   */
  predict(targetTimestamp: number): VADWithConfidence {
    const targetHour = new Date(targetTimestamp).getHours();

    if (this.hourlyPatterns.has(targetHour)) {
      const pattern = this.hourlyPatterns.get(targetHour)!;
      const count = this.hourCounts.get(targetHour) || 0;

      // Confidence based on number of samples for this hour
      const confidence = Math.min(0.8, 0.3 + (count / 10) * 0.5);

      return {
        ...pattern,
        confidence
      };
    }

    // Interpolate from nearby hours
    const nearbyHours = [
      (targetHour - 1 + 24) % 24,
      targetHour,
      (targetHour + 1) % 24
    ];

    const nearbyPatterns = nearbyHours
      .map(h => this.hourlyPatterns.get(h))
      .filter(p => p !== undefined) as VAD[];

    if (nearbyPatterns.length > 0) {
      const interpolated = {
        valence: nearbyPatterns.reduce((sum, p) => sum + p.valence, 0) / nearbyPatterns.length,
        arousal: nearbyPatterns.reduce((sum, p) => sum + p.arousal, 0) / nearbyPatterns.length,
        dominance: nearbyPatterns.reduce((sum, p) => sum + p.dominance, 0) / nearbyPatterns.length
      };

      return {
        ...interpolated,
        confidence: 0.4 // Lower confidence for interpolated values
      };
    }

    // No data available
    return {
      valence: 0,
      arousal: 0,
      dominance: 0,
      confidence: 0.2
    };
  }

  /**
   * Get hourly pattern data
   */
  getHourlyPatterns(): Map<number, VAD> {
    return this.hourlyPatterns;
  }
}

/**
 * K-Nearest Neighbors Predictor
 * Finds similar historical contexts and predicts based on their outcomes
 */
export class KNNPredictor {
  private moodHistory: MoodEntry[] = [];
  private k: number;

  constructor(k: number = 5) {
    this.k = k;
  }

  /**
   * Set mood history for KNN search
   */
  setHistory(moodHistory: MoodEntry[]): void {
    this.moodHistory = [...moodHistory];
  }

  /**
   * Calculate distance between two mood states
   */
  private calculateDistance(vad1: VAD, vad2: VAD): number {
    const dv = vad1.valence - vad2.valence;
    const da = vad1.arousal - vad2.arousal;
    const dd = vad1.dominance - vad2.dominance;
    return Math.sqrt(dv * dv + da * da + dd * dd);
  }

  /**
   * Calculate context similarity score
   */
  private calculateContextSimilarity(
    entry1: MoodEntry,
    entry2: MoodEntry
  ): number {
    let similarity = 0;
    let factors = 0;

    // Time of day similarity (hour)
    const hour1 = new Date(entry1.timestamp).getHours();
    const hour2 = new Date(entry2.timestamp).getHours();
    const hourDiff = Math.abs(hour1 - hour2);
    const hourSim = 1 - Math.min(hourDiff, 24 - hourDiff) / 12;
    similarity += hourSim;
    factors++;

    // Day of week similarity
    const day1 = new Date(entry1.timestamp).getDay();
    const day2 = new Date(entry2.timestamp).getDay();
    const daySim = day1 === day2 ? 1 : (Math.abs(day1 - day2) <= 1 ? 0.5 : 0);
    similarity += daySim;
    factors++;

    // Weather similarity (if available)
    if (entry1.context?.weather && entry2.context?.weather) {
      const weatherSim = entry1.context.weather.condition === entry2.context.weather.condition ? 1 : 0.3;
      similarity += weatherSim;
      factors++;
    }

    // Activity similarity (if available)
    if (entry1.context?.activity && entry2.context?.activity) {
      const activitySim = entry1.context.activity === entry2.context.activity ? 1 : 0;
      similarity += activitySim;
      factors++;
    }

    return factors > 0 ? similarity / factors : 0.5;
  }

  /**
   * Find K nearest neighbors to current state
   */
  private findNearest(
    currentMood: VAD,
    currentEntry: MoodEntry,
    excludeRecent: number = 3600000 // Exclude entries from last hour
  ): MoodEntry[] {
    const now = Date.now();

    // Calculate distances for all historical entries
    const distances = this.moodHistory
      .filter(entry => now - entry.timestamp > excludeRecent)
      .map(entry => ({
        entry,
        distance: this.calculateDistance(currentMood, entry.vad),
        contextSim: this.calculateContextSimilarity(currentEntry, entry)
      }))
      .map(item => ({
        entry: item.entry,
        combinedDistance: item.distance * 0.7 + (1 - item.contextSim) * 0.3
      }))
      .sort((a, b) => a.combinedDistance - b.combinedDistance);

    // Return k nearest
    return distances.slice(0, this.k).map(item => item.entry);
  }

  /**
   * Predict based on what happened after similar states
   */
  predict(
    currentMood: VAD,
    currentEntry: MoodEntry,
    horizon: '1h' | '4h' | '8h' = '1h'
  ): VADWithConfidence {
    if (this.moodHistory.length < this.k + 1) {
      return {
        valence: 0,
        arousal: 0,
        dominance: 0,
        confidence: 0.2
      };
    }

    // Find nearest neighbors
    const neighbors = this.findNearest(currentMood, currentEntry);

    // Find what happened after each neighbor
    const horizonMs = { '1h': 3600000, '4h': 14400000, '8h': 28800000 }[horizon];
    const futureStates: VAD[] = [];

    for (const neighbor of neighbors) {
      // Find entry that occurred ~horizon time after this neighbor
      const targetTime = neighbor.timestamp + horizonMs;
      const tolerance = horizonMs * 0.3; // 30% tolerance

      const futureEntry = this.moodHistory.find(
        entry =>
          Math.abs(entry.timestamp - targetTime) < tolerance &&
          entry.timestamp > neighbor.timestamp
      );

      if (futureEntry) {
        futureStates.push(futureEntry.vad);
      }
    }

    if (futureStates.length === 0) {
      // No future states found, fall back to neighbor average
      const avgNeighbor = {
        valence: neighbors.reduce((sum, n) => sum + n.vad.valence, 0) / neighbors.length,
        arousal: neighbors.reduce((sum, n) => sum + n.vad.arousal, 0) / neighbors.length,
        dominance: neighbors.reduce((sum, n) => sum + n.vad.dominance, 0) / neighbors.length
      };

      return {
        ...avgNeighbor,
        confidence: 0.4
      };
    }

    // Average future states
    const prediction = {
      valence: futureStates.reduce((sum, s) => sum + s.valence, 0) / futureStates.length,
      arousal: futureStates.reduce((sum, s) => sum + s.arousal, 0) / futureStates.length,
      dominance: futureStates.reduce((sum, s) => sum + s.dominance, 0) / futureStates.length
    };

    // Confidence based on number of successful matches
    const confidence = Math.min(0.85, 0.4 + (futureStates.length / this.k) * 0.45);

    return {
      ...prediction,
      confidence
    };
  }

  /**
   * Get number of historical entries
   */
  getHistorySize(): number {
    return this.moodHistory.length;
  }
}

/**
 * Persistence Model (Naive Baseline)
 * Assumes future mood will be the same as current mood
 */
export class PersistencePredictor {
  /**
   * Predict future mood (same as current)
   */
  predict(currentMood: VAD, horizon: '1h' | '4h' | '8h' = '1h'): VADWithConfidence {
    // Confidence decreases with longer horizons
    const confidenceMap = { '1h': 0.7, '4h': 0.5, '8h': 0.4 };

    return {
      ...currentMood,
      confidence: confidenceMap[horizon]
    };
  }
}

/**
 * Baseline Ensemble
 * Combines multiple baseline models
 */
export class BaselineEnsemble {
  private emaPredictor = new EMAPredictor(0.3);
  private circadianPredictor = new CircadianPredictor();
  private knnPredictor = new KNNPredictor(5);
  private persistencePredictor = new PersistencePredictor();
  private isReady = false;

  /**
   * Initialize all baseline models
   */
  async initialize(moodHistory: MoodEntry[]): Promise<void> {
    if (moodHistory.length < 5) {
      console.warn('Not enough data for baseline models');
      return;
    }

    // Initialize EMA
    this.emaPredictor.initFromHistory(moodHistory);

    // Learn circadian patterns
    this.circadianPredictor.learnPatterns(moodHistory);

    // Set KNN history
    this.knnPredictor.setHistory(moodHistory);

    this.isReady = true;
    console.log('Baseline models initialized');
  }

  /**
   * Predict using ensemble of baseline models
   */
  predict(
    currentMood: VAD,
    currentEntry: MoodEntry,
    targetTimestamp: number
  ): {
    '1h': VADWithConfidence;
    '4h': VADWithConfidence;
    '8h': VADWithConfidence;
  } {
    if (!this.isReady) {
      const defaultPred: VADWithConfidence = {
        valence: 0,
        arousal: 0,
        dominance: 0,
        confidence: 0.2
      };
      return { '1h': defaultPred, '4h': defaultPred, '8h': defaultPred };
    }

    const horizons: ('1h' | '4h' | '8h')[] = ['1h', '4h', '8h'];
    const predictions: any = {};

    for (const horizon of horizons) {
      const horizonMs = { '1h': 3600000, '4h': 14400000, '8h': 28800000 }[horizon];
      const targetTime = targetTimestamp + horizonMs;

      // Get predictions from each model
      const emaPred = this.emaPredictor.predict(horizon);
      const circadianPred = this.circadianPredictor.predict(targetTime);
      const knnPred = this.knnPredictor.predict(currentMood, currentEntry, horizon);
      const persistencePred = this.persistencePredictor.predict(currentMood, horizon);

      // Weighted ensemble based on confidence
      const preds = [emaPred, circadianPred, knnPred, persistencePred];
      const totalConfidence = preds.reduce((sum, p) => sum + p.confidence, 0);

      const ensemble: VADWithConfidence = {
        valence: preds.reduce((sum, p) => sum + p.valence * p.confidence, 0) / totalConfidence,
        arousal: preds.reduce((sum, p) => sum + p.arousal * p.confidence, 0) / totalConfidence,
        dominance: preds.reduce((sum, p) => sum + p.dominance * p.confidence, 0) / totalConfidence,
        confidence: totalConfidence / preds.length // Average confidence
      };

      predictions[horizon] = ensemble;
    }

    return predictions;
  }

  /**
   * Update models with new mood entry
   */
  update(newEntry: MoodEntry): void {
    this.emaPredictor.update(newEntry.vad);
  }

  /**
   * Check if models are ready
   */
  isModelReady(): boolean {
    return this.isReady;
  }
}

// Export singleton instance
export const baselineEnsemble = new BaselineEnsemble();
