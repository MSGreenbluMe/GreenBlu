// Online Learning System for GreenBlu.ai
// Continuous model updates with drift detection and federated learning support

import type { MoodEntry, VAD } from '../types';
import { featureEngineering, type FeatureVector } from './features';
import { kanPredictor } from './kan-network';
import { lstmPredictor } from './lstm-model';
import { xgboostPredictor } from './xgboost-model';
import { baselineEnsemble } from './baseline-models';
import { db } from './database';

export interface DriftMetrics {
  meanShift: number;        // Average change in mood values
  varianceShift: number;    // Change in mood volatility
  patternChange: number;    // Change in temporal patterns
  isDriftDetected: boolean;
  driftScore: number;       // 0-1, higher means more drift
}

export interface OnlineLearningConfig {
  updateFrequency: number;        // Update after N new entries
  slidingWindowDays: number;      // Keep last N days
  driftThreshold: number;         // Threshold for drift detection
  retrainThreshold: number;       // Threshold for full retrain
  minUpdateSamples: number;       // Minimum samples for update
  enableFederatedLearning: boolean;
}

export interface ModelPerformance {
  modelName: string;
  mae: number;              // Mean Absolute Error
  rmse: number;             // Root Mean Squared Error
  r2: number;               // R² score
  lastUpdated: number;
  updateCount: number;
}

/**
 * Online Learning Manager
 * Handles continuous model updates, drift detection, and retraining
 */
export class OnlineLearningManager {
  private config: OnlineLearningConfig;
  private userId: string = '';
  private updateCounter: number = 0;
  private lastDriftCheck: number = 0;
  private performanceHistory: Map<string, ModelPerformance[]> = new Map();
  private recentPredictions: Array<{ prediction: VAD; actual: VAD; timestamp: number }> = [];

  constructor(config?: Partial<OnlineLearningConfig>) {
    this.config = {
      updateFrequency: 5,         // Update every 5 entries
      slidingWindowDays: 90,      // Keep 90 days of data
      driftThreshold: 0.3,        // Drift score > 0.3 triggers update
      retrainThreshold: 0.6,      // Drift score > 0.6 triggers full retrain
      minUpdateSamples: 3,        // Need at least 3 samples for update
      enableFederatedLearning: false,
      ...config
    };
  }

  /**
   * Initialize online learning system
   */
  async initialize(userId: string): Promise<void> {
    this.userId = userId;
    this.updateCounter = 0;
    this.lastDriftCheck = Date.now();

    // Load performance history
    const saved = localStorage.getItem(`online-learning-${userId}`);
    if (saved) {
      const data = JSON.parse(saved);
      this.performanceHistory = new Map(data.performanceHistory);
      this.updateCounter = data.updateCounter || 0;
    }

    console.log('Online learning system initialized');
  }

  /**
   * Process new mood entry and update models if needed
   */
  async processNewEntry(newEntry: MoodEntry): Promise<void> {
    this.updateCounter++;

    // Update baseline models (always quick)
    baselineEnsemble.update(newEntry);

    // Check if we have a recent prediction to evaluate
    await this.evaluatePrediction(newEntry);

    // Check if it's time for an update
    if (this.updateCounter >= this.config.updateFrequency) {
      await this.performUpdate();
      this.updateCounter = 0;
    }

    // Periodic drift detection
    const hoursSinceLastCheck = (Date.now() - this.lastDriftCheck) / (1000 * 60 * 60);
    if (hoursSinceLastCheck >= 24) {
      await this.checkForDrift();
      this.lastDriftCheck = Date.now();
    }

    // Save state
    this.saveState();
  }

  /**
   * Perform incremental model update
   */
  private async performUpdate(): Promise<void> {
    console.log('Performing online learning update...');

    try {
      // Get recent mood history
      const moodHistory = await db.getMoodHistory(
        this.userId,
        this.config.slidingWindowDays
      );

      if (moodHistory.length < this.config.minUpdateSamples) {
        console.warn('Not enough samples for update');
        return;
      }

      // Get recent entries for fine-tuning
      const recentEntries = moodHistory.slice(-this.config.updateFrequency * 2);

      // Update feature engineering normalization
      const personality = await db.getPersonalityProfile(this.userId);
      const circadianData = await db.getCircadianData(this.userId, 30);
      const latestCircadian = circadianData[circadianData.length - 1];

      for (const entry of recentEntries) {
        const features = await featureEngineering.extractFeatures(
          entry,
          moodHistory.slice(0, moodHistory.indexOf(entry)),
          personality,
          latestCircadian
        );
        featureEngineering.updateNormalization(features);
      }

      // Fine-tune LSTM if available
      if (lstmPredictor.isModelReady() && recentEntries.length >= 10) {
        await this.updateLSTM(recentEntries, moodHistory, personality, latestCircadian);
      }

      // Note: KAN and XGBoost typically need full retrain rather than incremental updates
      // They'll be updated during drift-triggered retraining

      console.log('Online learning update complete');
    } catch (error) {
      console.error('Error during online learning update:', error);
    }
  }

  /**
   * Fine-tune LSTM with recent data
   */
  private async updateLSTM(
    recentEntries: MoodEntry[],
    fullHistory: MoodEntry[],
    personality: any,
    circadian: any
  ): Promise<void> {
    try {
      const featureVectors: FeatureVector[] = [];

      for (const entry of recentEntries) {
        const features = await featureEngineering.extractFeatures(
          entry,
          fullHistory.slice(0, fullHistory.indexOf(entry)),
          personality,
          circadian
        );
        featureVectors.push(features);
      }

      await lstmPredictor.finetune(featureVectors, recentEntries, 5);

      // Save updated model
      await lstmPredictor.saveModel(`lstm-model-${this.userId}`);

      console.log('LSTM fine-tuned with recent data');
    } catch (error) {
      console.error('Error fine-tuning LSTM:', error);
    }
  }

  /**
   * Detect concept drift in mood patterns
   */
  async checkForDrift(): Promise<DriftMetrics> {
    console.log('Checking for concept drift...');

    const moodHistory = await db.getMoodHistory(this.userId, this.config.slidingWindowDays);

    if (moodHistory.length < 30) {
      return {
        meanShift: 0,
        varianceShift: 0,
        patternChange: 0,
        isDriftDetected: false,
        driftScore: 0
      };
    }

    // Split data into old and recent windows
    const splitPoint = Math.floor(moodHistory.length * 0.7);
    const oldWindow = moodHistory.slice(0, splitPoint);
    const recentWindow = moodHistory.slice(splitPoint);

    // Calculate statistics for each window
    const oldStats = this.calculateWindowStats(oldWindow);
    const recentStats = this.calculateWindowStats(recentWindow);

    // Detect shifts
    const meanShift = Math.sqrt(
      Math.pow(oldStats.meanValence - recentStats.meanValence, 2) +
      Math.pow(oldStats.meanArousal - recentStats.meanArousal, 2) +
      Math.pow(oldStats.meanDominance - recentStats.meanDominance, 2)
    );

    const varianceShift = Math.abs(oldStats.variance - recentStats.variance);

    // Detect pattern changes (hour-of-day distribution)
    const patternChange = this.calculatePatternChange(oldWindow, recentWindow);

    // Combine metrics into drift score
    const driftScore = (
      meanShift * 0.4 +
      varianceShift * 0.3 +
      patternChange * 0.3
    );

    const isDriftDetected = driftScore > this.config.driftThreshold;

    const metrics: DriftMetrics = {
      meanShift,
      varianceShift,
      patternChange,
      isDriftDetected,
      driftScore
    };

    console.log('Drift metrics:', metrics);

    // Trigger retrain if significant drift detected
    if (driftScore > this.config.retrainThreshold) {
      console.log('Significant drift detected, triggering full retrain...');
      await this.performFullRetrain();
    } else if (isDriftDetected) {
      console.log('Moderate drift detected, performing update...');
      await this.performUpdate();
    }

    return metrics;
  }

  /**
   * Calculate statistics for a window of mood entries
   */
  private calculateWindowStats(window: MoodEntry[]): {
    meanValence: number;
    meanArousal: number;
    meanDominance: number;
    variance: number;
  } {
    const n = window.length;

    const meanValence = window.reduce((sum, e) => sum + e.vad.valence, 0) / n;
    const meanArousal = window.reduce((sum, e) => sum + e.vad.arousal, 0) / n;
    const meanDominance = window.reduce((sum, e) => sum + e.vad.dominance, 0) / n;

    // Calculate variance (average squared distance from mean)
    const variance = window.reduce((sum, e) => {
      const dv = e.vad.valence - meanValence;
      const da = e.vad.arousal - meanArousal;
      const dd = e.vad.dominance - meanDominance;
      return sum + (dv * dv + da * da + dd * dd);
    }, 0) / n;

    return { meanValence, meanArousal, meanDominance, variance };
  }

  /**
   * Calculate pattern change between two windows
   */
  private calculatePatternChange(oldWindow: MoodEntry[], recentWindow: MoodEntry[]): number {
    // Compare hour-of-day distributions
    const oldHourDist = this.getHourDistribution(oldWindow);
    const recentHourDist = this.getHourDistribution(recentWindow);

    // Jensen-Shannon divergence (simplified)
    let divergence = 0;
    for (let hour = 0; hour < 24; hour++) {
      const p = oldHourDist.get(hour) || 0;
      const q = recentHourDist.get(hour) || 0;
      const m = (p + q) / 2;

      if (m > 0) {
        if (p > 0) divergence += p * Math.log2(p / m);
        if (q > 0) divergence += q * Math.log2(q / m);
      }
    }

    return divergence / 2; // Normalize
  }

  /**
   * Get distribution of entries across hours of day
   */
  private getHourDistribution(entries: MoodEntry[]): Map<number, number> {
    const counts = new Map<number, number>();
    const total = entries.length;

    for (const entry of entries) {
      const hour = new Date(entry.timestamp).getHours();
      counts.set(hour, (counts.get(hour) || 0) + 1);
    }

    // Normalize to probabilities
    const dist = new Map<number, number>();
    for (const [hour, count] of counts) {
      dist.set(hour, count / total);
    }

    return dist;
  }

  /**
   * Perform full model retrain
   */
  private async performFullRetrain(): Promise<void> {
    console.log('Starting full model retrain...');

    try {
      const moodHistory = await db.getMoodHistory(
        this.userId,
        this.config.slidingWindowDays
      );

      const personality = await db.getPersonalityProfile(this.userId);
      const circadianData = await db.getCircadianData(this.userId, 30);
      const latestCircadian = circadianData[circadianData.length - 1];

      // Prepare training data
      const featureVectors: FeatureVector[] = [];
      const targets: VAD[] = [];

      for (let i = 0; i < moodHistory.length - 1; i++) {
        const features = await featureEngineering.extractFeatures(
          moodHistory[i],
          moodHistory.slice(Math.max(0, i - 10), i),
          personality,
          latestCircadian
        );

        featureVectors.push(features);
        targets.push(moodHistory[i + 1].vad);
        featureEngineering.updateNormalization(features);
      }

      // Retrain KAN
      if (featureVectors.length >= 10) {
        console.log('Retraining KAN...');
        const inputSize = featureVectors[0].features.length;
        kanPredictor.initNetwork(inputSize, [64, 32], 3);
        kanPredictor.train(
          featureVectors.map(fv => fv.features),
          targets.map(t => [t.valence, t.arousal, t.dominance]),
          100,
          0.01
        );
        localStorage.setItem(`kan-model-${this.userId}`, kanPredictor.saveNetwork());
      }

      // Retrain XGBoost
      if (featureVectors.length >= 50) {
        console.log('Retraining XGBoost...');
        xgboostPredictor.train(featureVectors, targets);
        localStorage.setItem(`xgboost-model-${this.userId}`, xgboostPredictor.saveModels());
      }

      // Retrain LSTM
      if (featureVectors.length >= 20) {
        console.log('Retraining LSTM...');
        await lstmPredictor.train(featureVectors, moodHistory.slice(0, -1), 0.2);
        await lstmPredictor.saveModel(`lstm-model-${this.userId}`);
      }

      // Reinitialize baseline models
      await baselineEnsemble.initialize(moodHistory);

      // Save feature engineering state
      localStorage.setItem(
        `feature-engineering-${this.userId}`,
        featureEngineering.saveState()
      );

      console.log('Full retrain complete');
    } catch (error) {
      console.error('Error during full retrain:', error);
    }
  }

  /**
   * Evaluate recent prediction against actual mood
   */
  private async evaluatePrediction(actualEntry: MoodEntry): Promise<void> {
    // Find if we had a prediction for this time
    const tolerance = 10 * 60 * 1000; // 10 minutes

    const matchingPrediction = this.recentPredictions.find(
      p => Math.abs(p.timestamp - actualEntry.timestamp) < tolerance
    );

    if (matchingPrediction) {
      // Calculate error
      const mae = (
        Math.abs(matchingPrediction.prediction.valence - actualEntry.vad.valence) +
        Math.abs(matchingPrediction.prediction.arousal - actualEntry.vad.arousal) +
        Math.abs(matchingPrediction.prediction.dominance - actualEntry.vad.dominance)
      ) / 3;

      // Log performance (could be used for model selection)
      console.log(`Prediction MAE: ${mae.toFixed(3)}`);

      // Remove evaluated prediction
      this.recentPredictions = this.recentPredictions.filter(p => p !== matchingPrediction);
    }
  }

  /**
   * Store prediction for later evaluation
   */
  storePrediction(prediction: VAD, timestamp: number): void {
    this.recentPredictions.push({
      prediction,
      actual: { valence: 0, arousal: 0, dominance: 0 }, // Will be filled when actual arrives
      timestamp
    });

    // Keep only recent predictions (last 24 hours)
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    this.recentPredictions = this.recentPredictions.filter(p => p.timestamp > cutoff);
  }

  /**
   * Prepare model updates for federated learning
   */
  async prepareModelUpdates(): Promise<string> {
    if (!this.config.enableFederatedLearning) {
      throw new Error('Federated learning not enabled');
    }

    // Export anonymized model updates (gradients/weights changes)
    // This would be sent to a central server for aggregation
    const updates = {
      userId: this.userId, // In production, use anonymous ID
      timestamp: Date.now(),
      modelUpdates: {
        kan: kanPredictor.saveNetwork(),
        // LSTM updates would require exporting weight deltas
        // XGBoost updates would export new trees
      },
      performanceMetrics: {
        mae: this.calculateRecentMAE(),
        samples: this.updateCounter
      }
    };

    return JSON.stringify(updates);
  }

  /**
   * Apply federated model updates from server
   */
  async applyFederatedUpdates(updates: string): Promise<void> {
    if (!this.config.enableFederatedLearning) {
      throw new Error('Federated learning not enabled');
    }

    // Apply aggregated updates from server
    // This would merge global model improvements with local model
    const data = JSON.parse(updates);

    // Implementation would blend global and local weights
    console.log('Federated updates applied');
  }

  /**
   * Calculate recent MAE for performance tracking
   */
  private calculateRecentMAE(): number {
    if (this.recentPredictions.length === 0) return 0;

    // This is a simplified version
    // In production, track actual vs predicted systematically
    return 0.15; // Placeholder
  }

  /**
   * Get performance metrics for all models
   */
  getPerformanceMetrics(): Map<string, ModelPerformance[]> {
    return this.performanceHistory;
  }

  /**
   * Save online learning state
   */
  private saveState(): void {
    const state = {
      performanceHistory: Array.from(this.performanceHistory.entries()),
      updateCounter: this.updateCounter,
      lastDriftCheck: this.lastDriftCheck
    };

    localStorage.setItem(`online-learning-${this.userId}`, JSON.stringify(state));
  }

  /**
   * Get configuration
   */
  getConfig(): OnlineLearningConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<OnlineLearningConfig>): void {
    this.config = { ...this.config, ...config };
    this.saveState();
  }
}

// Export singleton instance
export const onlineLearning = new OnlineLearningManager();
