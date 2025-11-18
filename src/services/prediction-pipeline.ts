// Complete Prediction Pipeline Integration
// High-level API for using the entire AI/ML system

import type { MoodEntry } from '../types';
import { db } from './database';
import { ensemblePredictor, type EnsemblePrediction } from './ensemble-predictor';
import { onlineLearning } from './online-learning';
import { featureEngineering } from './features';

export interface PredictionPipelineConfig {
  enableOnlineLearning: boolean;
  enableDriftDetection: boolean;
  autoRetrain: boolean;
}

/**
 * Complete Prediction Pipeline
 * Orchestrates the entire AI/ML system for mood prediction
 */
export class PredictionPipeline {
  private config: PredictionPipelineConfig;
  private initialized: boolean = false;
  private userId: string = '';

  constructor(config?: Partial<PredictionPipelineConfig>) {
    this.config = {
      enableOnlineLearning: true,
      enableDriftDetection: true,
      autoRetrain: true,
      ...config
    };
  }

  /**
   * Initialize the complete prediction pipeline
   */
  async initialize(userId: string): Promise<void> {
    console.log('Initializing prediction pipeline...');

    this.userId = userId;

    try {
      // Initialize database
      await db.init();

      // Initialize ensemble predictor (loads/trains all models)
      await ensemblePredictor.initialize(userId);

      // Initialize online learning system
      if (this.config.enableOnlineLearning) {
        await onlineLearning.initialize(userId);
      }

      this.initialized = true;
      console.log('Prediction pipeline initialized successfully');
    } catch (error) {
      console.error('Error initializing prediction pipeline:', error);
      throw error;
    }
  }

  /**
   * Make a prediction for the current mood state
   */
  async predict(currentEntry: MoodEntry): Promise<EnsemblePrediction> {
    if (!this.initialized) {
      throw new Error('Pipeline not initialized. Call initialize() first.');
    }

    console.log('Making ensemble prediction...');

    try {
      // Get prediction from ensemble
      const prediction = await ensemblePredictor.predict(currentEntry);

      // Store predictions for later evaluation (if online learning enabled)
      if (this.config.enableOnlineLearning) {
        const futureTimestamps = {
          '1h': currentEntry.timestamp + 3600000,
          '4h': currentEntry.timestamp + 14400000,
          '8h': currentEntry.timestamp + 28800000
        };

        onlineLearning.storePrediction(prediction['1h'], futureTimestamps['1h']);
        onlineLearning.storePrediction(prediction['4h'], futureTimestamps['4h']);
        onlineLearning.storePrediction(prediction['8h'], futureTimestamps['8h']);
      }

      console.log('Prediction complete:', {
        '1h': `V:${prediction['1h'].valence.toFixed(2)} A:${prediction['1h'].arousal.toFixed(2)} D:${prediction['1h'].dominance.toFixed(2)}`,
        confidence: prediction['1h'].confidence.toFixed(2),
        contributions: prediction.modelContributions
      });

      return prediction;
    } catch (error) {
      console.error('Error making prediction:', error);
      throw error;
    }
  }

  /**
   * Process a new mood entry (stores and updates models)
   */
  async processNewMoodEntry(entry: MoodEntry): Promise<void> {
    if (!this.initialized) {
      throw new Error('Pipeline not initialized');
    }

    try {
      // Store in database
      await db.addMoodEntry(entry);

      // Update online learning
      if (this.config.enableOnlineLearning) {
        await onlineLearning.processNewEntry(entry);
      }

      console.log('New mood entry processed successfully');
    } catch (error) {
      console.error('Error processing mood entry:', error);
      throw error;
    }
  }

  /**
   * Get predictions and process entry in one call
   */
  async predictAndStore(entry: MoodEntry): Promise<EnsemblePrediction> {
    // First make prediction
    const prediction = await this.predict(entry);

    // Attach predictions to entry
    entry.predicted_next = {
      '1h': prediction['1h'],
      '4h': prediction['4h'],
      '8h': prediction['8h']
    };

    // Store entry with predictions
    await this.processNewMoodEntry(entry);

    return prediction;
  }

  /**
   * Check for concept drift manually
   */
  async checkDrift(): Promise<any> {
    if (!this.initialized || !this.config.enableDriftDetection) {
      throw new Error('Drift detection not available');
    }

    return await onlineLearning.checkForDrift();
  }

  /**
   * Get current model performance metrics
   */
  getModelWeights(): any {
    if (!this.initialized) {
      throw new Error('Pipeline not initialized');
    }

    return ensemblePredictor.getModelWeights();
  }

  /**
   * Get system status and health
   */
  async getSystemStatus(): Promise<{
    initialized: boolean;
    userId: string;
    modelWeights: any;
    dataPoints: number;
    lastUpdate: number;
    onlineLearningEnabled: boolean;
    driftDetectionEnabled: boolean;
  }> {
    if (!this.initialized) {
      return {
        initialized: false,
        userId: '',
        modelWeights: {},
        dataPoints: 0,
        lastUpdate: 0,
        onlineLearningEnabled: false,
        driftDetectionEnabled: false
      };
    }

    const moodHistory = await db.getMoodHistory(this.userId, 90);

    return {
      initialized: true,
      userId: this.userId,
      modelWeights: ensemblePredictor.getModelWeights(),
      dataPoints: moodHistory.length,
      lastUpdate: moodHistory[moodHistory.length - 1]?.timestamp || 0,
      onlineLearningEnabled: this.config.enableOnlineLearning,
      driftDetectionEnabled: this.config.enableDriftDetection
    };
  }

  /**
   * Export all models (for backup or transfer)
   */
  async exportModels(): Promise<string> {
    if (!this.initialized) {
      throw new Error('Pipeline not initialized');
    }

    const exports = {
      userId: this.userId,
      timestamp: Date.now(),
      featureEngineering: featureEngineering.saveState(),
      modelWeights: ensemblePredictor.getModelWeights(),
      onlineLearningConfig: onlineLearning.getConfig()
    };

    return JSON.stringify(exports);
  }

  /**
   * Import models (for restore or transfer)
   */
  async importModels(data: string): Promise<void> {
    const imports = JSON.parse(data);

    // Restore feature engineering state
    featureEngineering.loadState(imports.featureEngineering);

    // Restore model weights
    if (imports.modelWeights) {
      ensemblePredictor.setModelWeights(imports.modelWeights);
    }

    // Restore online learning config
    if (imports.onlineLearningConfig) {
      onlineLearning.updateConfig(imports.onlineLearningConfig);
    }

    console.log('Models imported successfully');
  }

  /**
   * Reset pipeline (for testing or user data deletion)
   */
  async reset(): Promise<void> {
    this.initialized = false;
    this.userId = '';

    // Clear localStorage
    if (typeof localStorage !== 'undefined') {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.includes('kan-model-') ||
            key.includes('xgboost-model-') ||
            key.includes('lstm-model-') ||
            key.includes('feature-engineering-') ||
            key.includes('online-learning-')) {
          localStorage.removeItem(key);
        }
      }
    }

    console.log('Pipeline reset complete');
  }
}

// Export singleton instance
export const predictionPipeline = new PredictionPipeline();

/**
 * Quick start helper function
 */
export async function initializePredictionSystem(userId: string): Promise<PredictionPipeline> {
  const pipeline = new PredictionPipeline({
    enableOnlineLearning: true,
    enableDriftDetection: true,
    autoRetrain: true
  });

  await pipeline.initialize(userId);
  return pipeline;
}

/**
 * Simple prediction helper
 */
export async function predictMood(
  userId: string,
  currentMood: MoodEntry
): Promise<EnsemblePrediction> {
  const pipeline = await initializePredictionSystem(userId);
  return await pipeline.predict(currentMood);
}
