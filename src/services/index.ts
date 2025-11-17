// GreenBlu.ai Services - Main Export File
// Centralized export for all AI/ML prediction services

// Database
export { db, type GreenBluDB } from './database';

// Feature Engineering
export {
  featureEngineering,
  FeatureEngineering,
  type FeatureVector,
  type MoodHistoryStats
} from './features';

// KAN Network
export {
  kanPredictor,
  KANPredictor,
  type KANLayer,
  type KANNetwork
} from './kan-network';

// LSTM Model
export {
  lstmPredictor,
  LSTMPredictor,
  type LSTMConfig,
  type LSTMPrediction
} from './lstm-model';

// XGBoost Model
export {
  xgboostPredictor,
  XGBoostPredictor,
  GradientBoostingRegressor,
  type GBMConfig
} from './xgboost-model';

// Baseline Models
export {
  baselineEnsemble,
  BaselineEnsemble,
  EMAPredictor,
  CircadianPredictor,
  KNNPredictor,
  PersistencePredictor
} from './baseline-models';

// Ensemble Predictor
export {
  ensemblePredictor,
  EnsemblePredictor,
  type EnsemblePrediction,
  type ModelWeights
} from './ensemble-predictor';

// Online Learning
export {
  onlineLearning,
  OnlineLearningManager,
  type DriftMetrics,
  type OnlineLearningConfig,
  type ModelPerformance
} from './online-learning';
