// Ensemble Predictor for GreenBlu.ai
// Combines KAN, LSTM, XGBoost, and Baseline models for robust predictions

import type { VAD, MoodEntry, VADWithConfidence } from '../types';
import { featureEngineering, type FeatureVector } from './features';
import { kanPredictor } from './kan-network';
import { lstmPredictor, type LSTMPrediction } from './lstm-model';
import { xgboostPredictor } from './xgboost-model';
import { baselineEnsemble } from './baseline-models';
import { db } from './database';

export interface EnsemblePrediction {
  '1h': VADWithConfidence;
  '4h': VADWithConfidence;
  '8h': VADWithConfidence;
  modelContributions: {
    kan: number;
    lstm: number;
    xgboost: number;
    baseline: number;
  };
  metadata: {
    dataQuality: number;
    predictionQuality: number;
    recommendedActions: string[];
  };
}

export interface ModelWeights {
  kan: number;
  lstm: number;
  xgboost: number;
  baseline: number;
}

/**
 * Ensemble Predictor
 * Intelligently combines multiple models based on data availability and quality
 */
export class EnsemblePredictor {
  private modelWeights: ModelWeights;
  private minDataPoints: { lstm: number; xgboost: number; kan: number };
  private userId: string = '';

  constructor() {
    // Default weights (will be adapted based on performance)
    this.modelWeights = {
      kan: 0.25,
      lstm: 0.35,
      xgboost: 0.25,
      baseline: 0.15
    };

    this.minDataPoints = {
      lstm: 20,      // Need sequence data
      xgboost: 50,   // Need enough for tree building
      kan: 10        // Can work with less data
    };
  }

  /**
   * Initialize ensemble with user data
   */
  async initialize(userId: string): Promise<void> {
    this.userId = userId;

    try {
      // Load mood history
      const moodHistory = await db.getMoodHistory(userId, 90);

      console.log(`Initializing ensemble with ${moodHistory.length} mood entries`);

      // Initialize baseline models (always available)
      await baselineEnsemble.initialize(moodHistory);

      // Initialize KAN if enough data
      if (moodHistory.length >= this.minDataPoints.kan) {
        await this.initializeKAN(moodHistory, userId);
      }

      // Initialize XGBoost if enough data
      if (moodHistory.length >= this.minDataPoints.xgboost) {
        await this.initializeXGBoost(moodHistory, userId);
      }

      // Initialize LSTM if enough data
      if (moodHistory.length >= this.minDataPoints.lstm) {
        await this.initializeLSTM(moodHistory, userId);
      }

      // Adapt weights based on available models
      this.adaptWeights(moodHistory.length);

      console.log('Ensemble initialized successfully');
      console.log('Model weights:', this.modelWeights);
    } catch (error) {
      console.error('Error initializing ensemble:', error);
      throw error;
    }
  }

  /**
   * Initialize KAN network
   */
  private async initializeKAN(moodHistory: MoodEntry[], userId: string): Promise<void> {
    try {
      // Try to load existing model
      const savedModel = localStorage.getItem(`kan-model-${userId}`);
      if (savedModel) {
        kanPredictor.loadNetwork(savedModel);
        console.log('KAN model loaded from storage');
        return;
      }

      // Train new model
      console.log('Training KAN network...');

      // Extract features and prepare training data
      const personality = await db.getPersonalityProfile(userId);
      const circadianData = await db.getCircadianData(userId, 30);
      const latestCircadian = circadianData[circadianData.length - 1];

      const featureVectors: number[][] = [];
      const targets: number[][] = [];

      for (let i = 0; i < moodHistory.length - 1; i++) {
        const features = await featureEngineering.extractFeatures(
          moodHistory[i],
          moodHistory.slice(Math.max(0, i - 10), i),
          personality,
          latestCircadian
        );

        featureVectors.push(features.features);
        const nextMood = moodHistory[i + 1].vad;
        targets.push([nextMood.valence, nextMood.arousal, nextMood.dominance]);

        featureEngineering.updateNormalization(features);
      }

      // Initialize and train
      const inputSize = featureVectors[0].length;
      kanPredictor.initNetwork(inputSize, [64, 32], 3);
      kanPredictor.train(featureVectors, targets, 100, 0.01);

      // Save model
      localStorage.setItem(`kan-model-${userId}`, kanPredictor.saveNetwork());
      localStorage.setItem(
        `feature-engineering-${userId}`,
        featureEngineering.saveState()
      );

      console.log('KAN training complete');
    } catch (error) {
      console.error('Error initializing KAN:', error);
    }
  }

  /**
   * Initialize XGBoost models
   */
  private async initializeXGBoost(moodHistory: MoodEntry[], userId: string): Promise<void> {
    try {
      // Try to load existing model
      const savedModel = localStorage.getItem(`xgboost-model-${userId}`);
      if (savedModel) {
        xgboostPredictor.loadModels(savedModel);
        console.log('XGBoost models loaded from storage');
        return;
      }

      // Train new models
      console.log('Training XGBoost models...');

      const personality = await db.getPersonalityProfile(userId);
      const circadianData = await db.getCircadianData(userId, 30);
      const latestCircadian = circadianData[circadianData.length - 1];

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
      }

      xgboostPredictor.train(featureVectors, targets);

      // Save model
      localStorage.setItem(`xgboost-model-${userId}`, xgboostPredictor.saveModels());

      console.log('XGBoost training complete');
    } catch (error) {
      console.error('Error initializing XGBoost:', error);
    }
  }

  /**
   * Initialize LSTM model
   */
  private async initializeLSTM(moodHistory: MoodEntry[], userId: string): Promise<void> {
    try {
      // Try to load existing model
      try {
        await lstmPredictor.loadModel(`lstm-model-${userId}`);
        console.log('LSTM model loaded from IndexedDB');
        return;
      } catch {
        // Model doesn't exist, train new one
      }

      // Train new model
      console.log('Training LSTM model...');

      const personality = await db.getPersonalityProfile(userId);
      const circadianData = await db.getCircadianData(userId, 30);
      const latestCircadian = circadianData[circadianData.length - 1];

      const featureVectors: FeatureVector[] = [];

      for (const entry of moodHistory) {
        const features = await featureEngineering.extractFeatures(
          entry,
          moodHistory.slice(0, moodHistory.indexOf(entry)),
          personality,
          latestCircadian
        );

        featureVectors.push(features);
      }

      await lstmPredictor.train(featureVectors, moodHistory, 0.2);

      // Save model
      await lstmPredictor.saveModel(`lstm-model-${userId}`);

      console.log('LSTM training complete');
    } catch (error) {
      console.error('Error initializing LSTM:', error);
    }
  }

  /**
   * Adapt model weights based on data availability
   */
  private adaptWeights(dataPoints: number): void {
    const weights: ModelWeights = { kan: 0, lstm: 0, xgboost: 0, baseline: 1.0 };

    // KAN available
    if (dataPoints >= this.minDataPoints.kan) {
      weights.kan = 0.2 + Math.min(0.1, (dataPoints - this.minDataPoints.kan) / 100);
    }

    // XGBoost available
    if (dataPoints >= this.minDataPoints.xgboost) {
      weights.xgboost = 0.25 + Math.min(0.15, (dataPoints - this.minDataPoints.xgboost) / 200);
    }

    // LSTM available (requires most data)
    if (dataPoints >= this.minDataPoints.lstm) {
      weights.lstm = 0.3 + Math.min(0.2, (dataPoints - this.minDataPoints.lstm) / 150);
    }

    // Normalize weights to sum to 1
    const total = weights.kan + weights.lstm + weights.xgboost + weights.baseline;
    weights.kan /= total;
    weights.lstm /= total;
    weights.xgboost /= total;
    weights.baseline /= total;

    this.modelWeights = weights;
  }

  /**
   * Make ensemble prediction
   */
  async predict(currentEntry: MoodEntry): Promise<EnsemblePrediction> {
    // Get mood history
    const moodHistory = await db.getMoodHistory(this.userId, 90);
    const personality = await db.getPersonalityProfile(this.userId);
    const circadianData = await db.getCircadianData(this.userId, 30);
    const latestCircadian = circadianData[circadianData.length - 1];

    // Extract features
    const currentFeatures = await featureEngineering.extractFeatures(
      currentEntry,
      moodHistory,
      personality,
      latestCircadian
    );

    // Collect predictions from each model
    const predictions: {
      kan?: VAD;
      lstm?: LSTMPrediction;
      xgboost?: VADWithConfidence;
      baseline?: { '1h': VADWithConfidence; '4h': VADWithConfidence; '8h': VADWithConfidence };
    } = {};

    // KAN prediction
    if (this.modelWeights.kan > 0) {
      try {
        predictions.kan = kanPredictor.predict(currentFeatures.features);
      } catch (error) {
        console.warn('KAN prediction failed:', error);
      }
    }

    // LSTM prediction
    if (this.modelWeights.lstm > 0 && lstmPredictor.isModelReady()) {
      try {
        // Prepare recent feature vectors for LSTM
        const recentFeatures: FeatureVector[] = [];
        const recent = moodHistory.slice(-10);
        for (const entry of recent) {
          const features = await featureEngineering.extractFeatures(
            entry,
            moodHistory.slice(0, moodHistory.indexOf(entry)),
            personality,
            latestCircadian
          );
          recentFeatures.push(features);
        }
        recentFeatures.push(currentFeatures);

        predictions.lstm = await lstmPredictor.predict(recentFeatures);
      } catch (error) {
        console.warn('LSTM prediction failed:', error);
      }
    }

    // XGBoost prediction
    if (this.modelWeights.xgboost > 0 && xgboostPredictor.isModelReady()) {
      try {
        predictions.xgboost = xgboostPredictor.predict(currentFeatures);
      } catch (error) {
        console.warn('XGBoost prediction failed:', error);
      }
    }

    // Baseline prediction
    if (this.modelWeights.baseline > 0 && baselineEnsemble.isModelReady()) {
      try {
        predictions.baseline = baselineEnsemble.predict(
          currentEntry.vad,
          currentEntry,
          currentEntry.timestamp
        );
      } catch (error) {
        console.warn('Baseline prediction failed:', error);
      }
    }

    // Combine predictions for each horizon
    const ensemble = this.combinePredictions(predictions, currentEntry.vad);

    return ensemble;
  }

  /**
   * Combine predictions from multiple models
   */
  private combinePredictions(
    predictions: {
      kan?: VAD;
      lstm?: LSTMPrediction;
      xgboost?: VADWithConfidence;
      baseline?: { '1h': VADWithConfidence; '4h': VADWithConfidence; '8h': VADWithConfidence };
    },
    currentMood: VAD
  ): EnsemblePrediction {
    const horizons: ('1h' | '4h' | '8h')[] = ['1h', '4h', '8h'];
    const result: any = {};

    // Track actual contributions
    const actualContributions = { kan: 0, lstm: 0, xgboost: 0, baseline: 0 };

    for (const horizon of horizons) {
      const vadPredictions: Array<{ vad: VAD; weight: number; confidence: number }> = [];

      // KAN (single prediction, apply to all horizons with decay)
      if (predictions.kan) {
        const decayFactors = { '1h': 0.95, '4h': 0.85, '8h': 0.75 };
        vadPredictions.push({
          vad: predictions.kan,
          weight: this.modelWeights.kan * decayFactors[horizon],
          confidence: 0.7
        });
        actualContributions.kan += this.modelWeights.kan * decayFactors[horizon];
      }

      // LSTM (horizon-specific predictions)
      if (predictions.lstm && predictions.lstm[horizon]) {
        vadPredictions.push({
          vad: predictions.lstm[horizon],
          weight: this.modelWeights.lstm,
          confidence: predictions.lstm[horizon].confidence
        });
        actualContributions.lstm += this.modelWeights.lstm;
      }

      // XGBoost (single prediction, apply to all horizons)
      if (predictions.xgboost) {
        vadPredictions.push({
          vad: predictions.xgboost,
          weight: this.modelWeights.xgboost,
          confidence: predictions.xgboost.confidence
        });
        actualContributions.xgboost += this.modelWeights.xgboost;
      }

      // Baseline (horizon-specific predictions)
      if (predictions.baseline && predictions.baseline[horizon]) {
        vadPredictions.push({
          vad: predictions.baseline[horizon],
          weight: this.modelWeights.baseline,
          confidence: predictions.baseline[horizon].confidence
        });
        actualContributions.baseline += this.modelWeights.baseline;
      }

      // Weighted combination
      if (vadPredictions.length === 0) {
        result[horizon] = {
          ...currentMood,
          confidence: 0.3
        };
      } else {
        const totalWeight = vadPredictions.reduce((sum, p) => sum + p.weight, 0);

        result[horizon] = {
          valence: vadPredictions.reduce((sum, p) => sum + p.vad.valence * p.weight, 0) / totalWeight,
          arousal: vadPredictions.reduce((sum, p) => sum + p.vad.arousal * p.weight, 0) / totalWeight,
          dominance: vadPredictions.reduce((sum, p) => sum + p.vad.dominance * p.weight, 0) / totalWeight,
          confidence: vadPredictions.reduce((sum, p) => sum + p.confidence * p.weight, 0) / totalWeight
        };
      }
    }

    // Normalize contributions
    const totalContrib = Object.values(actualContributions).reduce((a, b) => a + b, 0);
    if (totalContrib > 0) {
      Object.keys(actualContributions).forEach(key => {
        actualContributions[key as keyof typeof actualContributions] /= totalContrib;
      });
    }

    // Calculate metadata
    const dataQuality = this.assessDataQuality();
    const predictionQuality = (result['1h'].confidence + result['4h'].confidence + result['8h'].confidence) / 3;

    return {
      '1h': result['1h'],
      '4h': result['4h'],
      '8h': result['8h'],
      modelContributions: actualContributions,
      metadata: {
        dataQuality,
        predictionQuality,
        recommendedActions: this.generateRecommendations(dataQuality, predictionQuality)
      }
    };
  }

  /**
   * Assess data quality for predictions
   */
  private assessDataQuality(): number {
    let quality = 0;
    let factors = 0;

    if (this.modelWeights.kan > 0) {
      quality += 0.6;
      factors++;
    }
    if (this.modelWeights.xgboost > 0) {
      quality += 0.8;
      factors++;
    }
    if (this.modelWeights.lstm > 0) {
      quality += 1.0;
      factors++;
    }
    if (this.modelWeights.baseline > 0) {
      quality += 0.5;
      factors++;
    }

    return factors > 0 ? quality / factors : 0.3;
  }

  /**
   * Generate recommendations based on prediction quality
   */
  private generateRecommendations(dataQuality: number, predictionQuality: number): string[] {
    const recommendations: string[] = [];

    if (dataQuality < 0.5) {
      recommendations.push('Log more mood entries to improve predictions');
    }

    if (predictionQuality < 0.6) {
      recommendations.push('Include context (activity, location) for better predictions');
      recommendations.push('Track circadian rhythm (sleep/wake times)');
    }

    if (this.modelWeights.lstm === 0) {
      recommendations.push(`Need ${this.minDataPoints.lstm - this.getCurrentDataPoints()} more entries to enable LSTM predictions`);
    }

    if (this.modelWeights.xgboost === 0) {
      recommendations.push(`Need ${this.minDataPoints.xgboost - this.getCurrentDataPoints()} more entries to enable XGBoost predictions`);
    }

    return recommendations;
  }

  private getCurrentDataPoints(): number {
    // This would be tracked separately in production
    return 0;
  }

  /**
   * Get current model weights
   */
  getModelWeights(): ModelWeights {
    return { ...this.modelWeights };
  }

  /**
   * Set custom model weights
   */
  setModelWeights(weights: Partial<ModelWeights>): void {
    this.modelWeights = { ...this.modelWeights, ...weights };

    // Normalize
    const total = Object.values(this.modelWeights).reduce((a, b) => a + b, 0);
    Object.keys(this.modelWeights).forEach(key => {
      this.modelWeights[key as keyof ModelWeights] /= total;
    });
  }
}

// Export singleton instance
export const ensemblePredictor = new EnsemblePredictor();
