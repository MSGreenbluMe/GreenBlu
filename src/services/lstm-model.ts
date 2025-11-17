// LSTM Time Series Model for Mood Prediction
// Uses TensorFlow.js for deep learning-based forecasting

import * as tf from '@tensorflow/tfjs';
import type { VAD, MoodEntry, VADWithConfidence } from '../types';
import type { FeatureVector } from './features';

export interface LSTMConfig {
  sequenceLength: number;  // Number of past timesteps to look at
  lstmUnits1: number;      // First LSTM layer units
  lstmUnits2: number;      // Second LSTM layer units
  denseUnits: number;      // Dense layer units
  dropoutRate: number;     // Dropout for regularization
  learningRate: number;    // Adam optimizer learning rate
  epochs: number;          // Training epochs
  batchSize: number;       // Batch size for training
}

export interface LSTMPrediction {
  '1h': VADWithConfidence;
  '4h': VADWithConfidence;
  '8h': VADWithConfidence;
}

/**
 * LSTM-based time series predictor for mood forecasting
 * Architecture: Input → LSTM(128) → LSTM(64) → Dense(32) → Output(3 for VAD)
 */
export class LSTMPredictor {
  private model: tf.LayersModel | null = null;
  private config: LSTMConfig;
  private isReady: boolean = false;
  private trainingHistory: any[] = [];

  constructor(config?: Partial<LSTMConfig>) {
    this.config = {
      sequenceLength: 10,      // Look at last 10 mood entries
      lstmUnits1: 128,
      lstmUnits2: 64,
      denseUnits: 32,
      dropoutRate: 0.2,
      learningRate: 0.001,
      epochs: 50,
      batchSize: 32,
      ...config
    };
  }

  /**
   * Build LSTM model architecture
   */
  async buildModel(inputDim: number): Promise<void> {
    try {
      // Input shape: [sequenceLength, inputDim]
      const input = tf.input({ shape: [this.config.sequenceLength, inputDim] });

      // First LSTM layer (return sequences for stacking)
      let x = tf.layers.lstm({
        units: this.config.lstmUnits1,
        returnSequences: true,
        recurrentActivation: 'sigmoid',
        activation: 'tanh',
        kernelInitializer: 'glorotUniform',
        recurrentInitializer: 'orthogonal'
      }).apply(input) as tf.SymbolicTensor;

      // Dropout for regularization
      x = tf.layers.dropout({ rate: this.config.dropoutRate }).apply(x) as tf.SymbolicTensor;

      // Second LSTM layer (don't return sequences)
      x = tf.layers.lstm({
        units: this.config.lstmUnits2,
        returnSequences: false,
        recurrentActivation: 'sigmoid',
        activation: 'tanh',
        kernelInitializer: 'glorotUniform',
        recurrentInitializer: 'orthogonal'
      }).apply(x) as tf.SymbolicTensor;

      // Dropout
      x = tf.layers.dropout({ rate: this.config.dropoutRate }).apply(x) as tf.SymbolicTensor;

      // Dense layer for intermediate representation
      x = tf.layers.dense({
        units: this.config.denseUnits,
        activation: 'relu',
        kernelInitializer: 'heNormal'
      }).apply(x) as tf.SymbolicTensor;

      // Output layer: 9 outputs (3 VAD dimensions × 3 time horizons)
      // [V_1h, A_1h, D_1h, V_4h, A_4h, D_4h, V_8h, A_8h, D_8h]
      const output = tf.layers.dense({
        units: 9,
        activation: 'tanh',  // VAD values are in range [-1, 1]
        kernelInitializer: 'glorotUniform'
      }).apply(x) as tf.SymbolicTensor;

      // Create model
      this.model = tf.model({ inputs: input, outputs: output });

      // Compile with Adam optimizer and MSE loss
      this.model.compile({
        optimizer: tf.train.adam(this.config.learningRate),
        loss: 'meanSquaredError',
        metrics: ['mae']
      });

      this.isReady = true;
      console.log('LSTM model built successfully');
      this.model.summary();
    } catch (error) {
      console.error('Error building LSTM model:', error);
      throw error;
    }
  }

  /**
   * Prepare sequences from mood history
   */
  private prepareSequences(
    featureVectors: FeatureVector[],
    targets: VAD[]
  ): { X: tf.Tensor3D; y: tf.Tensor2D } | null {
    if (featureVectors.length < this.config.sequenceLength + 1) {
      console.warn('Not enough data for sequence creation');
      return null;
    }

    const sequences: number[][][] = [];
    const labels: number[][] = [];

    // Create sequences with sliding window
    for (let i = 0; i <= featureVectors.length - this.config.sequenceLength - 1; i++) {
      // Input: sequence of feature vectors
      const sequence = featureVectors
        .slice(i, i + this.config.sequenceLength)
        .map(fv => fv.features);

      sequences.push(sequence);

      // Output: next mood VAD values at 3 time horizons
      // For simplicity, we'll use the immediate next value for all horizons
      // In production, you'd want actual future values at 1h, 4h, 8h
      const nextVAD = targets[i + this.config.sequenceLength];
      labels.push([
        nextVAD.valence, nextVAD.arousal, nextVAD.dominance,  // 1h
        nextVAD.valence, nextVAD.arousal, nextVAD.dominance,  // 4h (approximation)
        nextVAD.valence, nextVAD.arousal, nextVAD.dominance   // 8h (approximation)
      ]);
    }

    // Convert to tensors
    const X = tf.tensor3d(sequences);
    const y = tf.tensor2d(labels);

    return { X, y };
  }

  /**
   * Train LSTM model on historical mood data
   */
  async train(
    featureVectors: FeatureVector[],
    moodHistory: MoodEntry[],
    validationSplit: number = 0.2
  ): Promise<void> {
    if (!this.model) {
      // Build model if not already built
      const inputDim = featureVectors[0]?.features.length || 71;
      await this.buildModel(inputDim);
    }

    if (!this.model) {
      throw new Error('Failed to build model');
    }

    // Extract VAD targets from mood history
    const targets = moodHistory.map(m => m.vad);

    // Prepare sequences
    const data = this.prepareSequences(featureVectors, targets);
    if (!data) {
      throw new Error('Insufficient data for training');
    }

    const { X, y } = data;

    try {
      console.log(`Training LSTM on ${X.shape[0]} sequences...`);

      // Train the model
      const history = await this.model.fit(X, y, {
        epochs: this.config.epochs,
        batchSize: this.config.batchSize,
        validationSplit: validationSplit,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (epoch % 10 === 0) {
              console.log(
                `Epoch ${epoch}: loss=${logs?.loss.toFixed(4)}, ` +
                `val_loss=${logs?.val_loss?.toFixed(4)}`
              );
            }
          }
        }
      });

      this.trainingHistory.push(history);
      console.log('LSTM training complete');
    } catch (error) {
      console.error('Error during LSTM training:', error);
      throw error;
    } finally {
      // Clean up tensors to prevent memory leaks
      X.dispose();
      y.dispose();
    }
  }

  /**
   * Fine-tune model with new data (online learning)
   */
  async finetune(
    newFeatureVectors: FeatureVector[],
    newMoodHistory: MoodEntry[],
    epochs: number = 5
  ): Promise<void> {
    if (!this.model || !this.isReady) {
      throw new Error('Model not initialized. Train the model first.');
    }

    const targets = newMoodHistory.map(m => m.vad);
    const data = this.prepareSequences(newFeatureVectors, targets);
    if (!data) {
      console.warn('Not enough new data for fine-tuning');
      return;
    }

    const { X, y } = data;

    try {
      await this.model.fit(X, y, {
        epochs: epochs,
        batchSize: this.config.batchSize,
        shuffle: true,
        verbose: 0
      });

      console.log('LSTM fine-tuning complete');
    } catch (error) {
      console.error('Error during fine-tuning:', error);
      throw error;
    } finally {
      X.dispose();
      y.dispose();
    }
  }

  /**
   * Predict future mood states
   */
  async predict(recentFeatureVectors: FeatureVector[]): Promise<LSTMPrediction> {
    if (!this.model || !this.isReady) {
      throw new Error('Model not initialized');
    }

    if (recentFeatureVectors.length < this.config.sequenceLength) {
      throw new Error(
        `Need at least ${this.config.sequenceLength} recent feature vectors for prediction`
      );
    }

    // Take last sequenceLength feature vectors
    const sequence = recentFeatureVectors
      .slice(-this.config.sequenceLength)
      .map(fv => fv.features);

    // Convert to tensor
    const input = tf.tensor3d([sequence]); // Shape: [1, sequenceLength, inputDim]

    try {
      // Make prediction
      const prediction = this.model.predict(input) as tf.Tensor;
      const values = await prediction.data();

      // Extract predictions for each time horizon
      // Output format: [V_1h, A_1h, D_1h, V_4h, A_4h, D_4h, V_8h, A_8h, D_8h]
      const predictions: LSTMPrediction = {
        '1h': {
          valence: Math.max(-1, Math.min(1, values[0])),
          arousal: Math.max(-1, Math.min(1, values[1])),
          dominance: Math.max(-1, Math.min(1, values[2])),
          confidence: this.calculateConfidence(values.slice(0, 3))
        },
        '4h': {
          valence: Math.max(-1, Math.min(1, values[3])),
          arousal: Math.max(-1, Math.min(1, values[4])),
          dominance: Math.max(-1, Math.min(1, values[5])),
          confidence: this.calculateConfidence(values.slice(3, 6))
        },
        '8h': {
          valence: Math.max(-1, Math.min(1, values[6])),
          arousal: Math.max(-1, Math.min(1, values[7])),
          dominance: Math.max(-1, Math.min(1, values[8])),
          confidence: this.calculateConfidence(values.slice(6, 9))
        }
      };

      // Clean up
      prediction.dispose();

      return predictions;
    } catch (error) {
      console.error('Error during LSTM prediction:', error);
      throw error;
    } finally {
      input.dispose();
    }
  }

  /**
   * Calculate prediction confidence based on output values
   */
  private calculateConfidence(vadValues: ArrayLike<number>): number {
    // Confidence based on how far from extremes (-1, 1) the predictions are
    // More extreme predictions might indicate more certainty
    // But for now, use a simple heuristic based on variance
    const values = Array.from(vadValues);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;

    // Higher variance might indicate less confidence
    // Normalize variance (max variance for range [-1,1] is 1)
    const confidence = 1 - Math.min(variance, 1);

    return Math.max(0.3, Math.min(0.95, confidence));
  }

  /**
   * Save model to IndexedDB
   */
  async saveModel(modelName: string = 'lstm-mood-predictor'): Promise<void> {
    if (!this.model) {
      throw new Error('No model to save');
    }

    try {
      await this.model.save(`indexeddb://${modelName}`);
      console.log(`LSTM model saved as ${modelName}`);

      // Save config separately
      localStorage.setItem(
        `${modelName}-config`,
        JSON.stringify({
          config: this.config,
          trainingHistory: this.trainingHistory
        })
      );
    } catch (error) {
      console.error('Error saving LSTM model:', error);
      throw error;
    }
  }

  /**
   * Load model from IndexedDB
   */
  async loadModel(modelName: string = 'lstm-mood-predictor'): Promise<void> {
    try {
      this.model = await tf.loadLayersModel(`indexeddb://${modelName}`);
      this.isReady = true;
      console.log(`LSTM model loaded from ${modelName}`);

      // Load config
      const savedConfig = localStorage.getItem(`${modelName}-config`);
      if (savedConfig) {
        const { config, trainingHistory } = JSON.parse(savedConfig);
        this.config = config;
        this.trainingHistory = trainingHistory;
      }
    } catch (error) {
      console.error('Error loading LSTM model:', error);
      this.isReady = false;
      throw error;
    }
  }

  /**
   * Check if model is ready for predictions
   */
  isModelReady(): boolean {
    return this.isReady && this.model !== null;
  }

  /**
   * Get model summary
   */
  getSummary(): string {
    if (!this.model) {
      return 'Model not built';
    }

    let summary = 'LSTM Model Summary:\n';
    summary += `- Sequence Length: ${this.config.sequenceLength}\n`;
    summary += `- LSTM Layer 1: ${this.config.lstmUnits1} units\n`;
    summary += `- LSTM Layer 2: ${this.config.lstmUnits2} units\n`;
    summary += `- Dense Layer: ${this.config.denseUnits} units\n`;
    summary += `- Dropout Rate: ${this.config.dropoutRate}\n`;
    summary += `- Total Trainable Parameters: ${this.model.countParams()}\n`;
    summary += `- Training History: ${this.trainingHistory.length} sessions\n`;

    return summary;
  }

  /**
   * Dispose model and free memory
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      this.isReady = false;
      console.log('LSTM model disposed');
    }
  }
}

// Export singleton instance
export const lstmPredictor = new LSTMPredictor();
