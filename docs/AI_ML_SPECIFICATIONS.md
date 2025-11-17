# GreenBlu.ai - AI/ML Specifications

## Table of Contents
- [1. Overview](#1-overview)
- [2. Mood Prediction System](#2-mood-prediction-system)
- [3. Flow State Detection](#3-flow-state-detection)
- [4. Feature Engineering](#4-feature-engineering)
- [5. Model Architecture](#5-model-architecture)
- [6. Training Strategy](#6-training-strategy)
- [7. Evaluation Metrics](#7-evaluation-metrics)

## 1. Overview

The AI/ML system in GreenBlu.ai predicts user mood states and optimizes interventions to guide users toward FLOW state. The system learns from:
- User mood inputs (VAD model)
- Circadian rhythms
- Personality traits
- Weather and environmental factors
- Behavioral patterns
- Context (calendar, time, location)

**Primary Goal**: Predict mood trajectory and proactively intervene to maintain FLOW state.

## 2. Mood Prediction System

### 2.1 VAD Model (Valence-Arousal-Dominance)

**Input Vector** (3 dimensions):
- **Valence** (V): -1 (negative) to +1 (positive)
- **Arousal** (A): -1 (calm/sleepy) to +1 (excited/alert)
- **Dominance** (D): -1 (submissive/controlled) to +1 (dominant/in-control)

**Flow State Target**:
- V: +0.6 to +0.9 (positive but not manic)
- A: +0.5 to +0.8 (alert and engaged)
- D: +0.7 to +1.0 (in control, autonomous)

### 2.2 Prediction Objectives

1. **Short-term (1 hour)**: High accuracy, immediate intervention
2. **Medium-term (4 hours)**: Work session planning
3. **Long-term (8 hours / next day)**: Scheduling optimization

**Output Format**:
```json
{
  "timestamp": "2025-11-17T14:30:00Z",
  "predictions": {
    "1h": {"v": 0.7, "a": 0.6, "d": 0.8, "confidence": 0.85},
    "4h": {"v": 0.5, "a": 0.4, "d": 0.6, "confidence": 0.72},
    "8h": {"v": 0.6, "a": 0.5, "d": 0.7, "confidence": 0.65}
  },
  "flow_probability": 0.78,
  "risk_factors": ["energy_dip_expected", "meeting_overload"],
  "recommendations": ["intervention_breathing_15min", "suggest_break_2pm"]
}
```

### 2.3 Prediction Approach

**Multi-Model Ensemble**:
1. **Time Series Model** (LSTM/GRU): Captures temporal patterns
2. **Regression Model** (XGBoost): Multi-factor correlation
3. **Pattern Matching** (k-NN): Similar historical situations
4. **Baseline Model** (Moving Average): Robust fallback

**Ensemble Weighting**:
- Early days: Heavy weight on baseline and pattern matching
- After 30 days: Increase LSTM weight as patterns emerge
- After 90 days: Full ensemble with personalized weights

## 3. Flow State Detection

### 3.1 Flow State Characteristics

**Csikszentmihalyi's Flow Dimensions**:
1. Clear goals
2. Immediate feedback
3. Balance between challenge and skill
4. Merging of action and awareness
5. Absence of distractions
6. No worry of failure
7. Loss of self-consciousness
8. Time distortion
9. Autotelic experience (intrinsically rewarding)

**Measurable Proxies in GreenBlu**:
- **VAD Profile**: V: +0.6-0.9, A: +0.5-0.8, D: +0.7-1.0
- **Time Perception**: Long gaps between mood checks (deep engagement)
- **Activity Consistency**: Low task switching
- **Post-Session Mood**: High satisfaction + low exhaustion
- **Self-Reported**: Direct "in flow" indicator (optional check-in)

### 3.2 Flow Detection Algorithm

```python
def detect_flow_state(mood_vad, time_since_last_check, activity_pattern, personality):
    # VAD scoring (40% weight)
    vad_score = calculate_vad_flow_match(mood_vad)

    # Time engagement (30% weight)
    time_score = sigmoid(time_since_last_check / 60)  # Longer = better

    # Activity consistency (20% weight)
    consistency_score = 1 - activity_pattern.switch_rate

    # Personality adjustment (10% weight)
    personality_factor = get_flow_tendency(personality)

    flow_probability = (
        0.4 * vad_score +
        0.3 * time_score +
        0.2 * consistency_score +
        0.1 * personality_factor
    )

    return flow_probability
```

### 3.3 Flow State Levels

- **Deep Flow**: 0.8-1.0 → Protect at all costs, no interruptions
- **Flow**: 0.6-0.8 → Monitor, gentle interventions if needed
- **Near Flow**: 0.4-0.6 → Encourage, remove obstacles
- **Not in Flow**: 0.0-0.4 → Diagnose barriers, suggest interventions

## 4. Feature Engineering

### 4.1 Temporal Features

**Time-based**:
- Hour of day (0-23)
- Day of week (0-6)
- Week of year (1-52)
- Is weekend / holiday
- Season (0-3)

**Circadian**:
- Hours since wake-up
- Circadian phase (based on chronotype)
- Expected energy level (circadian prediction)
- Sleep debt estimate

**Cyclical Encoding**:
```python
# Encode hour as sin/cos to capture cyclical nature
hour_sin = sin(2 * π * hour / 24)
hour_cos = cos(2 * π * hour / 24)
```

### 4.2 Mood History Features

**Recent History**:
- Current VAD (v, a, d)
- VAD 1 hour ago
- VAD 4 hours ago
- VAD same time yesterday
- VAD same time last week

**Statistical Features**:
- Moving average (4h, 8h, 24h)
- Standard deviation (mood volatility)
- Trend (improving/declining)
- Min/max in last 24h

**Derived Features**:
- Mood momentum (rate of change)
- Recovery speed (after stress)
- Baseline mood (personalized)
- Mood range (individual variability)

### 4.3 External Features

**Weather**:
- Temperature (normalized)
- Sky condition (sunny/cloudy/rainy)
- Barometric pressure
- UV index
- Change from yesterday

**Calendar**:
- Upcoming meeting in 1h (boolean)
- Meeting density (meetings/hour)
- Free time until next commitment
- Is deep work block

**Environmental**:
- Day length (seasonal affective)
- Air quality index (if available)
- Time zone (for travelers)

### 4.4 Personality Features

**Stable Traits** (from personality engine):
- Big Five scores (O, C, E, A, N)
- MBTI dimensions (E-I, S-N, T-F, J-P)
- Stress resilience score
- Optimism level
- Energy baseline

**Behavioral Patterns**:
- Average flow frequency
- Stress triggers (learned)
- Recovery preferences
- Intervention effectiveness

### 4.5 Context Features

**Work Patterns**:
- Task type (if tracked)
- Collaboration level
- Decision fatigue index
- Screen time today

**Behavioral Signals**:
- Time since last break
- Activity intensity
- Task switching frequency
- Response to interventions

## 5. Model Architecture

### 5.1 LSTM Time Series Model

**Purpose**: Capture temporal dependencies in mood trajectory

**Architecture**:
```
Input Layer (sequence of features)
    ↓
LSTM Layer 1 (128 units, return sequences)
    ↓
Dropout (0.2)
    ↓
LSTM Layer 2 (64 units)
    ↓
Dropout (0.2)
    ↓
Dense Layer (32 units, ReLU)
    ↓
Output Layer (3 units for V, A, D)
    ↓
Activation (tanh, range -1 to 1)
```

**Input Sequence**: Last 24 mood check-ins (with temporal features)

**Training**:
- Loss: Mean Squared Error (MSE)
- Optimizer: Adam (learning rate: 0.001)
- Batch size: 32
- Epochs: 50 (with early stopping)

### 5.2 XGBoost Multi-Factor Model

**Purpose**: Capture non-linear relationships between features

**Configuration**:
```python
xgb_params = {
    'max_depth': 6,
    'learning_rate': 0.1,
    'n_estimators': 100,
    'objective': 'reg:squarederror',
    'colsample_bytree': 0.8,
    'subsample': 0.8
}
```

**Features**: All engineered features (~50-100 features)

**Targets**: Separate models for V, A, D predictions

### 5.3 k-NN Pattern Matching

**Purpose**: Find similar historical situations

**Similarity Metric**:
```python
def situation_similarity(current, historical):
    # Weighted Euclidean distance
    weights = {
        'time_of_day': 2.0,
        'circadian_phase': 3.0,
        'weather': 1.0,
        'recent_mood': 2.5,
        'personality': 1.5
    }

    distance = sqrt(sum(
        w * (current[f] - historical[f])**2
        for f, w in weights.items()
    ))

    return distance
```

**k value**: 5 (take 5 most similar situations)

**Prediction**: Weighted average of outcomes from similar situations

### 5.4 Baseline Model

**Purpose**: Simple, interpretable, robust fallback

**Method**: Exponential smoothing with circadian adjustment

```python
def baseline_prediction(history, circadian_phase):
    # Exponential moving average
    ema = exponential_moving_average(history, alpha=0.3)

    # Circadian adjustment
    energy_factor = circadian_energy_curve(circadian_phase)

    # Apply circadian modulation
    predicted_arousal = ema['a'] * energy_factor

    return {'v': ema['v'], 'a': predicted_arousal, 'd': ema['d']}
```

### 5.5 Ensemble Combination

**Adaptive Weighting**:
```python
def ensemble_prediction(lstm_pred, xgb_pred, knn_pred, baseline_pred,
                        days_of_data, confidence_scores):
    if days_of_data < 7:
        # Not enough data for complex models
        weights = [0.1, 0.2, 0.3, 0.4]  # Heavy on baseline & kNN
    elif days_of_data < 30:
        weights = [0.3, 0.3, 0.2, 0.2]
    else:
        # Mature model - trust complex models more
        weights = [0.4, 0.35, 0.15, 0.1]

    # Adjust based on individual model confidence
    adjusted_weights = normalize(weights * confidence_scores)

    prediction = (
        adjusted_weights[0] * lstm_pred +
        adjusted_weights[1] * xgb_pred +
        adjusted_weights[2] * knn_pred +
        adjusted_weights[3] * baseline_pred
    )

    return prediction
```

## 6. Training Strategy

### 6.1 Initial Training (Cold Start)

**Phase 1: First 7 Days**
- Use only baseline and simple patterns
- Collect data without predictions
- Focus on data quality and user habit formation

**Phase 2: Days 8-30**
- Begin training personalized models
- Use transfer learning from aggregate patterns
- Gradual introduction of predictions
- High confidence threshold for interventions

**Phase 3: After 30 Days**
- Full model activation
- Continuous online learning
- Personalized intervention optimization

### 6.2 Transfer Learning

**Population-Level Patterns** (pre-trained):
- Typical circadian rhythms by chronotype
- Common weather impact patterns
- Personality-mood correlations
- Standard intervention effectiveness

**Fine-Tuning**:
- Start with population model
- Gradually adapt to individual patterns
- Preserve robust priors, learn exceptions

### 6.3 Federated Learning (Future)

**Privacy-Preserving Training**:
1. Each user trains local model
2. Only model updates shared (not raw data)
3. Aggregate updates to improve population model
4. Download improved model for local use

**Benefits**:
- No raw data leaves user's device
- Everyone benefits from collective learning
- Individual privacy maintained

### 6.4 Online Learning

**Continuous Adaptation**:
- Update model after each mood check-in
- Sliding window (keep last 90 days)
- Decay old patterns gradually
- Detect and adapt to life changes

**Trigger for Retraining**:
- Prediction error exceeds threshold
- User reports major life change
- Seasonal transitions
- Every 30 days (scheduled)

## 7. Evaluation Metrics

### 7.1 Prediction Accuracy

**Primary Metrics**:
- **MAE** (Mean Absolute Error): Average |predicted - actual|
  - Target: MAE < 0.2 for 1h prediction
  - Target: MAE < 0.3 for 4h prediction

- **RMSE** (Root Mean Squared Error): Penalize large errors
  - Target: RMSE < 0.25 for 1h prediction

- **R² Score**: Explained variance
  - Target: R² > 0.7 for 1h prediction

**Per-Dimension Accuracy**:
- Separate evaluation for V, A, D
- Identify which dimensions are hardest to predict

### 7.2 Flow State Prediction

**Binary Classification Metrics**:
- **Precision**: When predicting flow, how often correct?
  - Target: > 0.8

- **Recall**: Of actual flow states, how many caught?
  - Target: > 0.75

- **F1 Score**: Harmonic mean of precision and recall
  - Target: > 0.77

### 7.3 Intervention Effectiveness

**A/B Testing Framework**:
- Randomly assign intervention vs. control
- Measure mood improvement after 15-30 min
- Track flow state maintenance

**Metrics**:
- **Mood Delta**: Change in VAD after intervention
- **Flow Maintenance Rate**: % of flow states preserved
- **User Satisfaction**: Star rating after intervention
- **Adherence Rate**: % of suggested interventions taken

### 7.4 Long-Term Success

**User Engagement**:
- Daily active rate
- Mood check-in frequency
- Intervention completion rate
- Retention after 30/60/90 days

**Wellbeing Outcomes**:
- Average mood trend (improving?)
- Flow state frequency (increasing?)
- Stress episodes (decreasing?)
- Self-reported productivity (improving?)

### 7.5 Model Monitoring

**Data Drift Detection**:
- Monitor feature distributions
- Alert when patterns shift significantly
- Trigger retraining if needed

**Prediction Confidence**:
- Track confidence scores over time
- Identify situations with low confidence
- Collect more data for weak areas

**Error Analysis**:
- Categorize prediction errors by context
- Identify systematic biases
- Prioritize model improvements

## 8. Implementation Roadmap

### Phase 1: MVP (Weeks 1-4)
- Baseline model (exponential smoothing + circadian)
- Simple pattern matching
- Basic feature engineering
- Manual intervention suggestions

### Phase 2: Core ML (Weeks 5-8)
- LSTM time series model
- XGBoost multi-factor model
- Ensemble combination
- Automated intervention timing

### Phase 3: Advanced (Weeks 9-12)
- Flow state detection algorithm
- Personality integration
- Adaptive intervention optimization
- Transfer learning implementation

### Phase 4: Optimization (Weeks 13-16)
- Federated learning setup
- Online learning optimization
- Advanced feature engineering
- Model compression for performance

## 9. Technical Requirements

### 9.1 Performance
- Prediction latency: < 100ms
- Model size: < 5MB (for browser)
- Memory usage: < 50MB
- CPU usage: < 5% (background)

### 9.2 Libraries
- **TensorFlow.js**: LSTM/neural networks
- **XGBoost.js** or **LightGBM**: Gradient boosting
- **ml.js**: k-NN and utilities
- **mathjs**: Linear algebra operations

### 9.3 Data Storage
- IndexedDB: Store 90 days of history
- Efficient serialization (Protocol Buffers)
- Automatic cleanup of old data
- Export functionality for analysis
