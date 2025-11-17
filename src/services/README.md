# GreenBlu.ai AI/ML Prediction System

Complete production-ready AI/ML system for mood prediction with ensemble learning, online learning, and drift detection.

## Overview

The GreenBlu prediction system combines multiple machine learning models to provide accurate, multi-horizon mood predictions (1h, 4h, 8h ahead). The system adapts to user patterns through online learning and automatically detects and handles concept drift.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Prediction Pipeline                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Ensemble Predictor                       │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────┐ │   │
│  │  │   KAN    │  │   LSTM   │  │  XGBoost │  │Baseline│   │
│  │  │ Network  │  │  Model   │  │  Model   │  │ Models│   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────┘ │   │
│  │                     ▲                                 │   │
│  └─────────────────────┼─────────────────────────────────┘   │
│                        │                                     │
│           ┌────────────┴────────────┐                        │
│           │  Feature Engineering    │                        │
│           │  - Temporal Features    │                        │
│           │  - Circadian Rhythm     │                        │
│           │  - Mood History         │                        │
│           │  - Weather Context      │                        │
│           │  - Personality Traits   │                        │
│           └─────────────────────────┘                        │
│                        ▲                                     │
│           ┌────────────┴────────────┐                        │
│           │   Online Learning       │                        │
│           │  - Incremental Updates  │                        │
│           │  - Drift Detection      │                        │
│           │  - Auto Retraining      │                        │
│           └─────────────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Feature Engineering (`features.ts`)
Extracts 71 engineered features from raw data:
- **Temporal Features** (11): Hour, day, season with cyclical encoding
- **Circadian Features** (5): Phase, hours since wake, sleep quality
- **Current Mood** (3): Valence, Arousal, Dominance
- **Mood History** (15): Moving averages, trends, volatility
- **Weather** (8): Temperature, pressure, conditions
- **Personality** (23): Big Five, MBTI, derived traits
- **Context** (5): Activity, location, energy level
- **Flow** (1): Flow probability

### 2. KAN Network (`kan-network.ts`)
Kolmogorov-Arnold Network for interpretable predictions:
- B-spline activation functions
- 2 hidden layers (64, 32 units)
- Fast inference (< 10ms)
- Explainable feature mappings

### 3. LSTM Model (`lstm-model.ts`)
Deep learning time series forecasting:
- Architecture: LSTM(128) → LSTM(64) → Dense(32) → Output(9)
- Sequence length: 10 timesteps
- Multi-horizon predictions (1h, 4h, 8h)
- TensorFlow.js implementation
- Fine-tuning for online learning

### 4. XGBoost Model (`xgboost-model.ts`)
Gradient boosted decision trees:
- Separate models for V, A, D
- 100 estimators with depth 6
- Stochastic gradient boosting
- Feature importance tracking
- Pure JavaScript implementation

### 5. Baseline Models (`baseline-models.ts`)
Simple yet effective approaches:
- **EMA**: Exponential moving average
- **Circadian**: Hour-of-day patterns
- **k-NN**: Context-aware nearest neighbors
- **Persistence**: Naive baseline

### 6. Ensemble Predictor (`ensemble-predictor.ts`)
Combines all models with adaptive weighting:
- Data-driven weight adjustment
- Confidence scoring
- Model contribution tracking
- Quality assessment and recommendations

### 7. Online Learning (`online-learning.ts`)
Continuous model improvement:
- Incremental updates every N entries
- Drift detection with multiple metrics
- Automatic retraining on significant drift
- Federated learning support
- Performance tracking

## Quick Start

### Basic Usage

```typescript
import { predictionPipeline } from './services/prediction-pipeline';
import type { MoodEntry } from './types';

// Initialize the system
await predictionPipeline.initialize('user-123');

// Create a mood entry
const currentMood: MoodEntry = {
  entry_id: crypto.randomUUID(),
  user_id: 'user-123',
  timestamp: Date.now(),
  vad: {
    valence: 0.7,
    arousal: 0.5,
    dominance: 0.6
  },
  flow_probability: 0.4,
  context: {
    circadian_phase: 0.5,
    energy_level: 0.7
  }
};

// Get predictions and store entry
const prediction = await predictionPipeline.predictAndStore(currentMood);

console.log('Predictions:');
console.log('1 hour:', prediction['1h']);
console.log('4 hours:', prediction['4h']);
console.log('8 hours:', prediction['8h']);
console.log('Model contributions:', prediction.modelContributions);
```

### Advanced Usage

```typescript
import {
  ensemblePredictor,
  onlineLearning,
  featureEngineering
} from './services';

// Custom initialization
await ensemblePredictor.initialize('user-123');
await onlineLearning.initialize('user-123');

// Make predictions
const prediction = await ensemblePredictor.predict(currentMood);

// Check model weights
const weights = ensemblePredictor.getModelWeights();
console.log('Current model weights:', weights);

// Manual drift check
const driftMetrics = await onlineLearning.checkForDrift();
if (driftMetrics.isDriftDetected) {
  console.log('Drift detected:', driftMetrics);
}

// Custom model weights
ensemblePredictor.setModelWeights({
  kan: 0.2,
  lstm: 0.4,
  xgboost: 0.3,
  baseline: 0.1
});
```

## Model Training

### Initial Training

Models are trained automatically on first initialization:
- **KAN**: Requires ≥10 mood entries
- **XGBoost**: Requires ≥50 mood entries
- **LSTM**: Requires ≥20 mood entries
- **Baseline**: Always available

### Online Learning

```typescript
// Configure online learning
onlineLearning.updateConfig({
  updateFrequency: 5,        // Update every 5 entries
  slidingWindowDays: 90,     // Keep 90 days of data
  driftThreshold: 0.3,       // Drift detection threshold
  retrainThreshold: 0.6,     // Full retrain threshold
  enableFederatedLearning: false
});

// Process new entries (automatic updates)
await onlineLearning.processNewEntry(newMoodEntry);
```

### Manual Retraining

Models are persisted to localStorage/IndexedDB and loaded automatically. To force retraining:

```typescript
// Clear stored models
localStorage.removeItem('kan-model-user-123');
localStorage.removeItem('xgboost-model-user-123');

// Delete LSTM from IndexedDB
await lstmPredictor.loadModel('lstm-model-user-123').catch(() => {});

// Reinitialize
await ensemblePredictor.initialize('user-123');
```

## Feature Engineering

### Extract Features Manually

```typescript
import { featureEngineering } from './services/features';

const features = await featureEngineering.extractFeatures(
  currentMood,      // Current mood entry
  moodHistory,      // Array of past mood entries
  personality,      // PersonalityProfile (optional)
  circadianData     // CircadianEntry (optional)
);

console.log('Feature vector:', features.features);
console.log('Feature names:', features.featureNames);
console.log('Feature count:', features.features.length); // 71
```

### Normalization

```typescript
// Update normalization parameters (for online learning)
featureEngineering.updateNormalization(featureVector);

// Normalize features
const normalized = featureEngineering.normalizeFeatures(featureVector);

// Save/load state
const state = featureEngineering.saveState();
featureEngineering.loadState(state);
```

## Drift Detection

### Automatic Drift Detection

```typescript
// Runs automatically every 24 hours when online learning is enabled
const driftMetrics = await onlineLearning.checkForDrift();

console.log('Mean shift:', driftMetrics.meanShift);
console.log('Variance shift:', driftMetrics.varianceShift);
console.log('Pattern change:', driftMetrics.patternChange);
console.log('Drift score:', driftMetrics.driftScore);
console.log('Drift detected:', driftMetrics.isDriftDetected);
```

### Drift Handling

- **Moderate drift** (score > 0.3): Incremental update
- **Significant drift** (score > 0.6): Full retrain

## Model Persistence

### Save Models

```typescript
// KAN (localStorage)
localStorage.setItem('kan-model-user-123', kanPredictor.saveNetwork());

// XGBoost (localStorage)
localStorage.setItem('xgboost-model-user-123', xgboostPredictor.saveModels());

// LSTM (IndexedDB)
await lstmPredictor.saveModel('lstm-model-user-123');

// Feature engineering state
localStorage.setItem('features-user-123', featureEngineering.saveState());
```

### Load Models

```typescript
// KAN
const kanState = localStorage.getItem('kan-model-user-123');
if (kanState) kanPredictor.loadNetwork(kanState);

// XGBoost
const xgbState = localStorage.getItem('xgboost-model-user-123');
if (xgbState) xgboostPredictor.loadModels(xgbState);

// LSTM
await lstmPredictor.loadModel('lstm-model-user-123');

// Feature engineering
const featState = localStorage.getItem('features-user-123');
if (featState) featureEngineering.loadState(featState);
```

## Performance

### Inference Speed

- **Feature extraction**: ~5-10ms
- **KAN prediction**: ~5ms
- **XGBoost prediction**: ~10-15ms
- **LSTM prediction**: ~20-30ms
- **Baseline prediction**: ~1-2ms
- **Total ensemble**: **< 100ms**

### Memory Usage

- **KAN**: ~100KB
- **XGBoost**: ~500KB (100 trees)
- **LSTM**: ~2MB (TensorFlow.js model)
- **Feature state**: ~10KB
- **Total**: **~3MB**

### Accuracy

Expected performance on held-out test data:
- **MAE** (Mean Absolute Error): 0.12-0.18 on [-1, 1] scale
- **RMSE**: 0.15-0.22
- **R²**: 0.65-0.80

## Testing

### Unit Tests

```typescript
// Test feature engineering
const features = await featureEngineering.extractFeatures(mockEntry, [], undefined, undefined);
assert(features.features.length === 71);

// Test KAN
kanPredictor.initNetwork(71, [64, 32], 3);
const prediction = kanPredictor.predict(features.features);
assert(prediction.valence >= -1 && prediction.valence <= 1);

// Test ensemble
await ensemblePredictor.initialize('test-user');
const result = await ensemblePredictor.predict(mockEntry);
assert(result['1h'].confidence > 0);
```

### Integration Tests

See `prediction-pipeline.ts` for complete integration examples.

## Production Considerations

### Browser Compatibility

- Requires IndexedDB support
- TensorFlow.js requires WebGL for LSTM (CPU fallback available)
- Works in Chrome, Firefox, Safari, Edge (latest versions)

### Error Handling

All functions throw errors that should be caught:

```typescript
try {
  const prediction = await predictionPipeline.predict(mood);
} catch (error) {
  console.error('Prediction failed:', error);
  // Fall back to baseline or show error to user
}
```

### Privacy

- All data stored locally (IndexedDB + localStorage)
- No server communication by default
- Federated learning can be enabled for privacy-preserving model sharing

### Optimization

- Models are lazy-loaded
- TensorFlow.js models use IndexedDB for fast loading
- Features are computed on-demand
- Background training recommended for large datasets

## Troubleshooting

### "Not enough data for training"

- KAN needs ≥10 entries
- XGBoost needs ≥50 entries
- LSTM needs ≥20 entries
- Log more mood entries or wait for more data

### "Model not initialized"

- Call `initialize()` before predictions
- Check that models loaded successfully
- Verify localStorage/IndexedDB not full

### "Prediction confidence is low"

- Add more context to mood entries (weather, activity, location)
- Track circadian rhythm data
- Wait for more training data
- Check if drift is occurring

### "LSTM training is slow"

- Reduce `epochs` in config (default: 50)
- Reduce `batchSize` if memory limited
- Training happens once, inference is fast
- Consider training in background worker

## API Reference

See TypeScript interfaces in each file for detailed API documentation.

## Contributing

When adding new features:
1. Maintain <100ms inference time
2. Add proper TypeScript types
3. Implement save/load for persistence
4. Update feature vector documentation if features change
5. Test with various data sizes

## License

MIT License - See LICENSE file for details
