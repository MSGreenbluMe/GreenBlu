// Gradient Boosting Model (XGBoost-style) for Mood Prediction
// Browser-compatible implementation of gradient boosted decision trees

import type { VAD, VADWithConfidence } from '../types';
import type { FeatureVector } from './features';

export interface GBMConfig {
  nEstimators: number;      // Number of boosting rounds
  maxDepth: number;         // Maximum tree depth
  learningRate: number;     // Shrinkage parameter
  subsampleRatio: number;   // Row sampling ratio
  colsampleRatio: number;   // Column sampling ratio
  minSamplesSplit: number;  // Minimum samples to split a node
  lambda: number;           // L2 regularization
  gamma: number;            // Minimum loss reduction for split
}

interface TreeNode {
  featureIndex?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  value?: number;
  samples?: number;
}

interface DecisionTree {
  root: TreeNode;
  featureImportances: Map<number, number>;
}

/**
 * Gradient Boosting Machine for regression
 * Implements XGBoost-style boosting for each VAD dimension separately
 */
export class GradientBoostingRegressor {
  private config: GBMConfig;
  private trees: DecisionTree[] = [];
  private baseValue: number = 0;
  private featureImportances: Map<number, number> = new Map();

  constructor(config?: Partial<GBMConfig>) {
    this.config = {
      nEstimators: 100,
      maxDepth: 6,
      learningRate: 0.1,
      subsampleRatio: 0.8,
      colsampleRatio: 0.8,
      minSamplesSplit: 5,
      lambda: 1.0,
      gamma: 0.0,
      ...config
    };
  }

  /**
   * Train gradient boosting model
   */
  train(X: number[][], y: number[]): void {
    if (X.length !== y.length || X.length === 0) {
      throw new Error('Invalid training data');
    }

    // Initialize with mean of target values
    this.baseValue = y.reduce((a, b) => a + b, 0) / y.length;

    // Initialize predictions with base value
    let predictions = new Array(y.length).fill(this.baseValue);

    // Reset trees and feature importances
    this.trees = [];
    this.featureImportances = new Map();

    console.log(`Training GBM with ${this.config.nEstimators} estimators...`);

    // Boosting iterations
    for (let i = 0; i < this.config.nEstimators; i++) {
      // Calculate residuals (negative gradients for MSE loss)
      const residuals = y.map((target, idx) => target - predictions[idx]);

      // Sample data (stochastic gradient boosting)
      const { sampledX, sampledY, sampleIndices } = this.sampleData(X, residuals);

      // Sample features
      const sampledFeatures = this.sampleFeatures(X[0].length);

      // Build tree on residuals
      const tree = this.buildTree(sampledX, sampledY, sampledFeatures, 0);
      this.trees.push(tree);

      // Update predictions
      for (let j = 0; j < X.length; j++) {
        const treePrediction = this.predictTree(tree.root, X[j]);
        predictions[j] += this.config.learningRate * treePrediction;
      }

      // Update global feature importances
      tree.featureImportances.forEach((importance, featureIdx) => {
        const current = this.featureImportances.get(featureIdx) || 0;
        this.featureImportances.set(featureIdx, current + importance);
      });

      // Log progress
      if ((i + 1) % 20 === 0) {
        const mse = this.calculateMSE(y, predictions);
        console.log(`Iteration ${i + 1}/${this.config.nEstimators}, MSE: ${mse.toFixed(4)}`);
      }
    }

    // Normalize feature importances
    const totalImportance = Array.from(this.featureImportances.values()).reduce((a, b) => a + b, 0);
    if (totalImportance > 0) {
      this.featureImportances.forEach((importance, idx) => {
        this.featureImportances.set(idx, importance / totalImportance);
      });
    }

    console.log('GBM training complete');
  }

  /**
   * Sample data for stochastic gradient boosting
   */
  private sampleData(
    X: number[][],
    y: number[]
  ): { sampledX: number[][]; sampledY: number[]; sampleIndices: number[] } {
    const n = Math.floor(X.length * this.config.subsampleRatio);
    const indices = Array.from({ length: X.length }, (_, i) => i);

    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const sampleIndices = indices.slice(0, n);
    const sampledX = sampleIndices.map(i => X[i]);
    const sampledY = sampleIndices.map(i => y[i]);

    return { sampledX, sampledY, sampleIndices };
  }

  /**
   * Sample features for each tree
   */
  private sampleFeatures(nFeatures: number): Set<number> {
    const n = Math.floor(nFeatures * this.config.colsampleRatio);
    const features = Array.from({ length: nFeatures }, (_, i) => i);

    // Shuffle and take first n
    for (let i = features.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [features[i], features[j]] = [features[j], features[i]];
    }

    return new Set(features.slice(0, n));
  }

  /**
   * Build a single decision tree
   */
  private buildTree(
    X: number[][],
    y: number[],
    availableFeatures: Set<number>,
    depth: number
  ): DecisionTree {
    const featureImportances = new Map<number, number>();

    const root = this.buildNode(X, y, availableFeatures, depth, featureImportances);

    return { root, featureImportances };
  }

  /**
   * Recursively build tree nodes
   */
  private buildNode(
    X: number[][],
    y: number[],
    availableFeatures: Set<number>,
    depth: number,
    featureImportances: Map<number, number>
  ): TreeNode {
    const n = X.length;

    // Stopping criteria
    if (
      depth >= this.config.maxDepth ||
      n < this.config.minSamplesSplit ||
      this.isHomogeneous(y)
    ) {
      return {
        value: this.calculateLeafValue(y),
        samples: n
      };
    }

    // Find best split
    const bestSplit = this.findBestSplit(X, y, availableFeatures);

    if (!bestSplit || bestSplit.gain <= this.config.gamma) {
      // No beneficial split found
      return {
        value: this.calculateLeafValue(y),
        samples: n
      };
    }

    // Update feature importance
    const currentImportance = featureImportances.get(bestSplit.featureIndex) || 0;
    featureImportances.set(bestSplit.featureIndex, currentImportance + bestSplit.gain * n);

    // Split data
    const { leftX, leftY, rightX, rightY } = this.splitData(
      X,
      y,
      bestSplit.featureIndex,
      bestSplit.threshold
    );

    // Recursively build child nodes
    const left = this.buildNode(leftX, leftY, availableFeatures, depth + 1, featureImportances);
    const right = this.buildNode(rightX, rightY, availableFeatures, depth + 1, featureImportances);

    return {
      featureIndex: bestSplit.featureIndex,
      threshold: bestSplit.threshold,
      left,
      right,
      samples: n
    };
  }

  /**
   * Find best split for a node
   */
  private findBestSplit(
    X: number[][],
    y: number[],
    availableFeatures: Set<number>
  ): { featureIndex: number; threshold: number; gain: number } | null {
    let bestGain = -Infinity;
    let bestFeatureIndex = -1;
    let bestThreshold = 0;

    const baseVariance = this.calculateVariance(y);

    // Try each available feature
    for (const featureIdx of availableFeatures) {
      // Get unique values for this feature
      const values = X.map(row => row[featureIdx]);
      const uniqueValues = Array.from(new Set(values)).sort((a, b) => a - b);

      // Try splits between consecutive unique values
      for (let i = 0; i < uniqueValues.length - 1; i++) {
        const threshold = (uniqueValues[i] + uniqueValues[i + 1]) / 2;

        // Split data
        const { leftY, rightY } = this.splitData(X, y, featureIdx, threshold);

        if (leftY.length === 0 || rightY.length === 0) continue;

        // Calculate gain (reduction in variance)
        const leftVariance = this.calculateVariance(leftY);
        const rightVariance = this.calculateVariance(rightY);

        const weightedVariance =
          (leftY.length * leftVariance + rightY.length * rightVariance) / y.length;

        const gain = baseVariance - weightedVariance;

        if (gain > bestGain) {
          bestGain = gain;
          bestFeatureIndex = featureIdx;
          bestThreshold = threshold;
        }
      }
    }

    if (bestFeatureIndex === -1) {
      return null;
    }

    return { featureIndex: bestFeatureIndex, threshold: bestThreshold, gain: bestGain };
  }

  /**
   * Split data based on feature and threshold
   */
  private splitData(
    X: number[][],
    y: number[],
    featureIndex: number,
    threshold: number
  ): { leftX: number[][]; leftY: number[]; rightX: number[][]; rightY: number[] } {
    const leftX: number[][] = [];
    const leftY: number[] = [];
    const rightX: number[][] = [];
    const rightY: number[] = [];

    for (let i = 0; i < X.length; i++) {
      if (X[i][featureIndex] <= threshold) {
        leftX.push(X[i]);
        leftY.push(y[i]);
      } else {
        rightX.push(X[i]);
        rightY.push(y[i]);
      }
    }

    return { leftX, leftY, rightX, rightY };
  }

  /**
   * Calculate leaf value with L2 regularization
   */
  private calculateLeafValue(y: number[]): number {
    if (y.length === 0) return 0;

    // With L2 regularization: mean / (1 + lambda)
    const mean = y.reduce((a, b) => a + b, 0) / y.length;
    return mean / (1 + this.config.lambda);
  }

  /**
   * Check if values are homogeneous (all same)
   */
  private isHomogeneous(y: number[]): boolean {
    if (y.length <= 1) return true;
    const first = y[0];
    return y.every(val => Math.abs(val - first) < 1e-6);
  }

  /**
   * Calculate variance
   */
  private calculateVariance(y: number[]): number {
    if (y.length === 0) return 0;
    const mean = y.reduce((a, b) => a + b, 0) / y.length;
    const variance = y.reduce((sum, val) => sum + (val - mean) ** 2, 0) / y.length;
    return variance;
  }

  /**
   * Calculate MSE
   */
  private calculateMSE(yTrue: number[], yPred: number[]): number {
    if (yTrue.length !== yPred.length) return Infinity;
    const mse = yTrue.reduce((sum, val, i) => sum + (val - yPred[i]) ** 2, 0) / yTrue.length;
    return mse;
  }

  /**
   * Predict using single tree
   */
  private predictTree(node: TreeNode, x: number[]): number {
    if (node.value !== undefined) {
      return node.value;
    }

    if (node.featureIndex === undefined || node.threshold === undefined) {
      return 0;
    }

    if (x[node.featureIndex] <= node.threshold) {
      return node.left ? this.predictTree(node.left, x) : 0;
    } else {
      return node.right ? this.predictTree(node.right, x) : 0;
    }
  }

  /**
   * Predict using ensemble of trees
   */
  predict(x: number[]): number {
    let prediction = this.baseValue;

    for (const tree of this.trees) {
      prediction += this.config.learningRate * this.predictTree(tree.root, x);
    }

    return prediction;
  }

  /**
   * Batch prediction
   */
  predictBatch(X: number[][]): number[] {
    return X.map(x => this.predict(x));
  }

  /**
   * Get feature importances
   */
  getFeatureImportances(): Map<number, number> {
    return this.featureImportances;
  }

  /**
   * Save model
   */
  save(): string {
    return JSON.stringify({
      config: this.config,
      trees: this.trees,
      baseValue: this.baseValue,
      featureImportances: Array.from(this.featureImportances.entries())
    });
  }

  /**
   * Load model
   */
  load(serialized: string): void {
    const data = JSON.parse(serialized);
    this.config = data.config;
    this.trees = data.trees;
    this.baseValue = data.baseValue;
    this.featureImportances = new Map(data.featureImportances);
  }
}

/**
 * XGBoost-style predictor for VAD mood prediction
 * Maintains separate models for Valence, Arousal, and Dominance
 */
export class XGBoostPredictor {
  private valenceModel: GradientBoostingRegressor;
  private arousalModel: GradientBoostingRegressor;
  private dominanceModel: GradientBoostingRegressor;
  private isReady: boolean = false;

  constructor(config?: Partial<GBMConfig>) {
    this.valenceModel = new GradientBoostingRegressor(config);
    this.arousalModel = new GradientBoostingRegressor(config);
    this.dominanceModel = new GradientBoostingRegressor(config);
  }

  /**
   * Train all three models
   */
  train(featureVectors: FeatureVector[], targets: VAD[]): void {
    if (featureVectors.length !== targets.length || featureVectors.length === 0) {
      throw new Error('Invalid training data');
    }

    const X = featureVectors.map(fv => fv.features);
    const yValence = targets.map(t => t.valence);
    const yArousal = targets.map(t => t.arousal);
    const yDominance = targets.map(t => t.dominance);

    console.log('Training Valence model...');
    this.valenceModel.train(X, yValence);

    console.log('Training Arousal model...');
    this.arousalModel.train(X, yArousal);

    console.log('Training Dominance model...');
    this.dominanceModel.train(X, yDominance);

    this.isReady = true;
    console.log('XGBoost training complete for all dimensions');
  }

  /**
   * Predict VAD values
   */
  predict(featureVector: FeatureVector): VADWithConfidence {
    if (!this.isReady) {
      throw new Error('Models not trained');
    }

    const valence = this.valenceModel.predict(featureVector.features);
    const arousal = this.arousalModel.predict(featureVector.features);
    const dominance = this.dominanceModel.predict(featureVector.features);

    // Clamp values to [-1, 1]
    const clamp = (val: number) => Math.max(-1, Math.min(1, val));

    // Simple confidence based on consistency across models
    const confidence = this.calculateConfidence(featureVector.features);

    return {
      valence: clamp(valence),
      arousal: clamp(arousal),
      dominance: clamp(dominance),
      confidence
    };
  }

  /**
   * Calculate prediction confidence
   */
  private calculateConfidence(_features: number[]): number {
    // Use feature importance and tree depth as confidence proxy
    // More important features being present -> higher confidence
    // This is a simplified heuristic

    const avgImportance = (
      this.getAverageFeatureImportance(this.valenceModel) +
      this.getAverageFeatureImportance(this.arousalModel) +
      this.getAverageFeatureImportance(this.dominanceModel)
    ) / 3;

    return Math.max(0.4, Math.min(0.9, avgImportance * 2));
  }

  private getAverageFeatureImportance(model: GradientBoostingRegressor): number {
    const importances = Array.from(model.getFeatureImportances().values());
    if (importances.length === 0) return 0.5;
    return importances.reduce((a, b) => a + b, 0) / importances.length;
  }

  /**
   * Get combined feature importances
   */
  getFeatureImportances(): {
    valence: Map<number, number>;
    arousal: Map<number, number>;
    dominance: Map<number, number>;
  } {
    return {
      valence: this.valenceModel.getFeatureImportances(),
      arousal: this.arousalModel.getFeatureImportances(),
      dominance: this.dominanceModel.getFeatureImportances()
    };
  }

  /**
   * Check if models are ready
   */
  isModelReady(): boolean {
    return this.isReady;
  }

  /**
   * Save all models
   */
  saveModels(): string {
    return JSON.stringify({
      valenceModel: this.valenceModel.save(),
      arousalModel: this.arousalModel.save(),
      dominanceModel: this.dominanceModel.save(),
      isReady: this.isReady
    });
  }

  /**
   * Load all models
   */
  loadModels(serialized: string): void {
    const data = JSON.parse(serialized);
    this.valenceModel.load(data.valenceModel);
    this.arousalModel.load(data.arousalModel);
    this.dominanceModel.load(data.dominanceModel);
    this.isReady = data.isReady;
  }
}

// Export singleton instance
export const xgboostPredictor = new XGBoostPredictor({
  nEstimators: 100,
  maxDepth: 6,
  learningRate: 0.1,
  subsampleRatio: 0.8,
  colsampleRatio: 0.8
});
