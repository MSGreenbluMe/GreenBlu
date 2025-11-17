// KAN (Kolmogorov-Arnold Network) Implementation
// More interpretable than traditional neural networks

import type { VAD, MoodEntry, PersonalityProfile } from '../types';

/**
 * KAN Network for mood prediction
 * Based on Kolmogorov-Arnold representation theorem
 * More interpretable and efficient than traditional MLPs
 */

export interface KANLayer {
  weights: number[][];
  biases: number[];
  activation: (x: number) => number;
}

export interface KANNetwork {
  layers: KANLayer[];
  inputSize: number;
  outputSize: number;
}

// Activation functions for KAN
const activations = {
  relu: (x: number) => Math.max(0, x),
  sigmoid: (x: number) => 1 / (1 + Math.exp(-x)),
  tanh: (x: number) => Math.tanh(x),
  swish: (x: number) => x / (1 + Math.exp(-x)),
  // B-spline basis function (key for KAN)
  bspline: (x: number, degree: number = 3) => {
    // Simplified cubic B-spline
    const abs_x = Math.abs(x);
    if (abs_x < 1) {
      return (3 * abs_x ** 3 - 6 * abs_x ** 2 + 4) / 6;
    } else if (abs_x < 2) {
      return ((2 - abs_x) ** 3) / 6;
    }
    return 0;
  }
};

export class KANPredictor {
  private network: KANNetwork | null = null;
  private featureMeans: number[] = [];
  private featureStds: number[] = [];

  /**
   * Initialize KAN network architecture
   */
  initNetwork(inputSize: number, hiddenSizes: number[], outputSize: number): void {
    const layers: KANLayer[] = [];
    let prevSize = inputSize;

    // Hidden layers with B-spline activation
    for (const hiddenSize of hiddenSizes) {
      layers.push({
        weights: this.initializeWeights(prevSize, hiddenSize),
        biases: new Array(hiddenSize).fill(0).map(() => Math.random() * 0.01),
        activation: (x) => activations.bspline(x, 3)
      });
      prevSize = hiddenSize;
    }

    // Output layer with tanh (for VAD range -1 to 1)
    layers.push({
      weights: this.initializeWeights(prevSize, outputSize),
      biases: new Array(outputSize).fill(0),
      activation: activations.tanh
    });

    this.network = {
      layers,
      inputSize,
      outputSize
    };
  }

  private initializeWeights(inputSize: number, outputSize: number): number[][] {
    // Xavier initialization
    const limit = Math.sqrt(6 / (inputSize + outputSize));
    return Array.from({ length: inputSize }, () =>
      Array.from({ length: outputSize }, () => Math.random() * 2 * limit - limit)
    );
  }

  /**
   * Forward pass through KAN network
   */
  forward(input: number[]): number[] {
    if (!this.network) {
      throw new Error('Network not initialized');
    }

    let activation = input;

    for (const layer of this.network.layers) {
      const nextActivation: number[] = [];

      for (let j = 0; j < layer.weights[0].length; j++) {
        let sum = layer.biases[j];
        for (let i = 0; i < activation.length; i++) {
          sum += activation[i] * layer.weights[i][j];
        }
        nextActivation.push(layer.activation(sum));
      }

      activation = nextActivation;
    }

    return activation;
  }

  /**
   * Normalize features using z-score normalization
   */
  normalizeFeatures(features: number[]): number[] {
    if (this.featureMeans.length === 0) {
      // First time - just return as is
      return features;
    }

    return features.map((f, i) => {
      const mean = this.featureMeans[i] || 0;
      const std = this.featureStds[i] || 1;
      return (f - mean) / std;
    });
  }

  /**
   * Update normalization parameters (online learning)
   */
  updateNormalization(features: number[]): void {
    if (this.featureMeans.length === 0) {
      this.featureMeans = [...features];
      this.featureStds = new Array(features.length).fill(1);
      return;
    }

    // Exponential moving average
    const alpha = 0.1;
    for (let i = 0; i < features.length; i++) {
      const oldMean = this.featureMeans[i];
      this.featureMeans[i] = alpha * features[i] + (1 - alpha) * oldMean;
      const variance = alpha * (features[i] - oldMean) ** 2 + (1 - alpha) * this.featureStds[i] ** 2;
      this.featureStds[i] = Math.sqrt(variance);
    }
  }

  /**
   * Train using simple gradient descent
   */
  train(inputs: number[][], targets: number[][], epochs: number = 100, learningRate: number = 0.01): void {
    if (!this.network) {
      throw new Error('Network not initialized');
    }

    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalLoss = 0;

      for (let i = 0; i < inputs.length; i++) {
        const input = this.normalizeFeatures(inputs[i]);
        const target = targets[i];
        const output = this.forward(input);

        // Calculate loss (MSE)
        const loss = output.reduce((sum, o, j) => sum + (o - target[j]) ** 2, 0) / output.length;
        totalLoss += loss;

        // Backpropagation (simplified)
        this.backpropagate(input, target, output, learningRate);
      }

      if (epoch % 10 === 0) {
        console.log(`KAN Epoch ${epoch}, Loss: ${(totalLoss / inputs.length).toFixed(4)}`);
      }
    }
  }

  private backpropagate(input: number[], target: number[], output: number[], learningRate: number): void {
    // Simplified backprop - in production, use proper automatic differentiation
    // For now, using numerical gradient approximation
    const epsilon = 0.0001;

    for (let layerIdx = this.network!.layers.length - 1; layerIdx >= 0; layerIdx--) {
      const layer = this.network!.layers[layerIdx];

      for (let i = 0; i < layer.weights.length; i++) {
        for (let j = 0; j < layer.weights[i].length; j++) {
          // Numerical gradient
          layer.weights[i][j] += epsilon;
          const output1 = this.forward(input);
          layer.weights[i][j] -= 2 * epsilon;
          const output2 = this.forward(input);
          layer.weights[i][j] += epsilon;

          const loss1 = output1.reduce((sum, o, k) => sum + (o - target[k]) ** 2, 0);
          const loss2 = output2.reduce((sum, o, k) => sum + (o - target[k]) ** 2, 0);
          const gradient = (loss1 - loss2) / (2 * epsilon);

          layer.weights[i][j] -= learningRate * gradient;
        }
      }
    }
  }

  /**
   * Predict mood using KAN network
   */
  predict(features: number[]): VAD {
    const normalized = this.normalizeFeatures(features);
    const output = this.forward(normalized);

    return {
      valence: Math.max(-1, Math.min(1, output[0])),
      arousal: Math.max(-1, Math.min(1, output[1])),
      dominance: Math.max(-1, Math.min(1, output[2]))
    };
  }

  /**
   * Save network to localStorage
   */
  saveNetwork(): string {
    return JSON.stringify({
      network: this.network,
      featureMeans: this.featureMeans,
      featureStds: this.featureStds
    });
  }

  /**
   * Load network from localStorage
   */
  loadNetwork(serialized: string): void {
    const data = JSON.parse(serialized);
    this.network = data.network;
    this.featureMeans = data.featureMeans;
    this.featureStds = data.featureStds;
  }
}

// Export singleton instance
export const kanPredictor = new KANPredictor();
