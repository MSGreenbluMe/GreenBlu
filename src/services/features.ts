// Feature Engineering Pipeline for GreenBlu.ai
// Extracts and normalizes features for ML prediction

import type {
  MoodEntry,
  PersonalityProfile,
  CircadianEntry,
  WeatherData,
  VAD
} from '../types';

export interface FeatureVector {
  features: number[];
  featureNames: string[];
  timestamp: number;
}

export interface MoodHistoryStats {
  mean_valence: number;
  mean_arousal: number;
  mean_dominance: number;
  std_valence: number;
  std_arousal: number;
  std_dominance: number;
  trend_valence: number;
  trend_arousal: number;
  trend_dominance: number;
  volatility: number;
  flow_rate: number;
}

/**
 * Feature Engineering Pipeline
 * Transforms raw data into ML-ready feature vectors
 */
export class FeatureEngineering {
  private featureMeans: Map<string, number> = new Map();
  private featureStds: Map<string, number> = new Map();
  private initialized: boolean = false;

  /**
   * Extract all features from mood entry and context
   */
  async extractFeatures(
    currentMood: MoodEntry,
    moodHistory: MoodEntry[],
    personality?: PersonalityProfile,
    circadianData?: CircadianEntry
  ): Promise<FeatureVector> {
    const features: number[] = [];
    const featureNames: string[] = [];

    // 1. Temporal features
    const temporalFeatures = this.extractTemporalFeatures(currentMood.timestamp);
    features.push(...temporalFeatures.values);
    featureNames.push(...temporalFeatures.names);

    // 2. Circadian phase
    const circadianFeatures = this.extractCircadianFeatures(
      currentMood.timestamp,
      circadianData
    );
    features.push(...circadianFeatures.values);
    featureNames.push(...circadianFeatures.names);

    // 3. Current mood VAD
    features.push(currentMood.vad.valence, currentMood.vad.arousal, currentMood.vad.dominance);
    featureNames.push('current_valence', 'current_arousal', 'current_dominance');

    // 4. Mood history features
    const historyFeatures = this.extractMoodHistoryFeatures(moodHistory);
    features.push(...historyFeatures.values);
    featureNames.push(...historyFeatures.names);

    // 5. Weather features
    if (currentMood.context?.weather) {
      const weatherFeatures = this.extractWeatherFeatures(currentMood.context.weather);
      features.push(...weatherFeatures.values);
      featureNames.push(...weatherFeatures.names);
    } else {
      // Default weather values
      features.push(0, 0, 0, 0, 0, 0);
      featureNames.push('temp_normalized', 'pressure_normalized', 'humidity_normalized',
                       'is_sunny', 'is_rainy', 'is_cloudy');
    }

    // 6. Personality features
    if (personality) {
      const personalityFeatures = this.extractPersonalityFeatures(personality);
      features.push(...personalityFeatures.values);
      featureNames.push(...personalityFeatures.names);
    } else {
      // Default personality values (neutral)
      const defaultPersonalityCount = 20; // Big Five (5) + MBTI (4) + Derived (6) + other (5)
      features.push(...Array(defaultPersonalityCount).fill(0.5));
      featureNames.push(...Array(defaultPersonalityCount).fill(0).map((_, i) => `personality_${i}`));
    }

    // 7. Context features
    const contextFeatures = this.extractContextFeatures(currentMood);
    features.push(...contextFeatures.values);
    featureNames.push(...contextFeatures.names);

    // 8. Flow probability
    features.push(currentMood.flow_probability);
    featureNames.push('flow_probability');

    return {
      features,
      featureNames,
      timestamp: currentMood.timestamp
    };
  }

  /**
   * Extract temporal features from timestamp
   */
  private extractTemporalFeatures(timestamp: number): { values: number[]; names: string[] } {
    const date = new Date(timestamp);
    const hour = date.getHours();
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();
    const month = date.getMonth();

    // Cyclical encoding for periodic features
    const hourSin = Math.sin(2 * Math.PI * hour / 24);
    const hourCos = Math.cos(2 * Math.PI * hour / 24);
    const dayOfWeekSin = Math.sin(2 * Math.PI * dayOfWeek / 7);
    const dayOfWeekCos = Math.cos(2 * Math.PI * dayOfWeek / 7);
    const monthSin = Math.sin(2 * Math.PI * month / 12);
    const monthCos = Math.cos(2 * Math.PI * month / 12);

    // Season (0-3: winter, spring, summer, fall)
    const season = Math.floor((month % 12) / 3);
    const seasonOneHot = [0, 0, 0, 0];
    seasonOneHot[season] = 1;

    // Weekend indicator
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0;

    return {
      values: [
        hourSin, hourCos,
        dayOfWeekSin, dayOfWeekCos,
        monthSin, monthCos,
        ...seasonOneHot,
        isWeekend
      ],
      names: [
        'hour_sin', 'hour_cos',
        'day_of_week_sin', 'day_of_week_cos',
        'month_sin', 'month_cos',
        'season_winter', 'season_spring', 'season_summer', 'season_fall',
        'is_weekend'
      ]
    };
  }

  /**
   * Extract circadian rhythm features
   */
  private extractCircadianFeatures(
    timestamp: number,
    circadianData?: CircadianEntry
  ): { values: number[]; names: string[] } {
    if (!circadianData) {
      return {
        values: [0, 0, 0, 0, 0],
        names: ['circadian_phase', 'hours_since_wake', 'sleep_quality', 'is_peak_energy', 'is_creative_peak']
      };
    }

    const date = new Date(timestamp);
    const currentTime = date.getHours() + date.getMinutes() / 60;

    // Parse wake time
    const [wakeHour, wakeMinute] = circadianData.wake_time.split(':').map(Number);
    const wakeTime = wakeHour + wakeMinute / 60;

    // Hours since wake
    let hoursSinceWake = currentTime - wakeTime;
    if (hoursSinceWake < 0) hoursSinceWake += 24;

    // Circadian phase (0-1, normalized by typical 16-hour wake period)
    const circadianPhase = Math.min(hoursSinceWake / 16, 1);

    // Sleep quality (normalized 0-1)
    const sleepQuality = (circadianData.sleep_quality || 3) / 5;

    // Check if in optimal windows
    let isPeakEnergy = 0;
    let isCreativePeak = 0;

    if (circadianData.optimal_windows) {
      isPeakEnergy = this.isInTimeRange(currentTime, circadianData.optimal_windows.peak_energy) ? 1 : 0;
      isCreativePeak = this.isInTimeRange(currentTime, circadianData.optimal_windows.creative_peak) ? 1 : 0;
    }

    // Chronotype encoding
    const chronotypeMap = { lark: 0, intermediate: 0.5, owl: 1 };
    const chronotype = chronotypeMap[circadianData.chronotype || 'intermediate'];

    return {
      values: [circadianPhase, hoursSinceWake / 16, sleepQuality, isPeakEnergy, isCreativePeak],
      names: ['circadian_phase', 'hours_since_wake_norm', 'sleep_quality', 'is_peak_energy', 'is_creative_peak']
    };
  }

  private isInTimeRange(currentTime: number, range: { start: string; end: string }): boolean {
    const [startHour, startMinute] = range.start.split(':').map(Number);
    const [endHour, endMinute] = range.end.split(':').map(Number);
    const startTime = startHour + startMinute / 60;
    const endTime = endHour + endMinute / 60;

    return currentTime >= startTime && currentTime <= endTime;
  }

  /**
   * Extract mood history features (moving averages, trends, volatility)
   */
  private extractMoodHistoryFeatures(
    moodHistory: MoodEntry[]
  ): { values: number[]; names: string[] } {
    if (moodHistory.length < 2) {
      // Not enough history
      return {
        values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        names: [
          'ma_1h_valence', 'ma_1h_arousal', 'ma_1h_dominance',
          'ma_4h_valence', 'ma_4h_arousal', 'ma_4h_dominance',
          'ma_24h_valence', 'ma_24h_arousal', 'ma_24h_dominance',
          'trend_valence', 'trend_arousal', 'trend_dominance',
          'volatility', 'flow_rate', 'entry_frequency'
        ]
      };
    }

    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const fourHours = 4 * oneHour;
    const oneDay = 24 * oneHour;

    // Filter by time windows
    const last1h = moodHistory.filter(m => (now - m.timestamp) <= oneHour);
    const last4h = moodHistory.filter(m => (now - m.timestamp) <= fourHours);
    const last24h = moodHistory.filter(m => (now - m.timestamp) <= oneDay);

    // Calculate moving averages
    const ma1h = this.calculateVADMean(last1h);
    const ma4h = this.calculateVADMean(last4h);
    const ma24h = this.calculateVADMean(last24h);

    // Calculate trends (linear regression slope)
    const trend = this.calculateVADTrend(last24h);

    // Calculate volatility (standard deviation)
    const volatility = this.calculateVolatility(last24h);

    // Flow rate (percentage of high flow probability entries)
    const flowRate = last24h.filter(m => m.flow_probability > 0.6).length / Math.max(last24h.length, 1);

    // Entry frequency (entries per hour)
    const entryFrequency = last24h.length / 24;

    return {
      values: [
        ma1h.valence, ma1h.arousal, ma1h.dominance,
        ma4h.valence, ma4h.arousal, ma4h.dominance,
        ma24h.valence, ma24h.arousal, ma24h.dominance,
        trend.valence, trend.arousal, trend.dominance,
        volatility,
        flowRate,
        entryFrequency
      ],
      names: [
        'ma_1h_valence', 'ma_1h_arousal', 'ma_1h_dominance',
        'ma_4h_valence', 'ma_4h_arousal', 'ma_4h_dominance',
        'ma_24h_valence', 'ma_24h_arousal', 'ma_24h_dominance',
        'trend_valence', 'trend_arousal', 'trend_dominance',
        'volatility', 'flow_rate', 'entry_frequency'
      ]
    };
  }

  private calculateVADMean(entries: MoodEntry[]): VAD {
    if (entries.length === 0) {
      return { valence: 0, arousal: 0, dominance: 0 };
    }

    const sum = entries.reduce(
      (acc, entry) => ({
        valence: acc.valence + entry.vad.valence,
        arousal: acc.arousal + entry.vad.arousal,
        dominance: acc.dominance + entry.vad.dominance
      }),
      { valence: 0, arousal: 0, dominance: 0 }
    );

    return {
      valence: sum.valence / entries.length,
      arousal: sum.arousal / entries.length,
      dominance: sum.dominance / entries.length
    };
  }

  private calculateVADTrend(entries: MoodEntry[]): VAD {
    if (entries.length < 2) {
      return { valence: 0, arousal: 0, dominance: 0 };
    }

    // Simple linear regression slope
    const n = entries.length;
    const sumX = (n * (n - 1)) / 2;
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

    const calculateSlope = (values: number[]): number => {
      const sumY = values.reduce((a, b) => a + b, 0);
      const sumXY = values.reduce((sum, y, i) => sum + i * y, 0);
      return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    };

    return {
      valence: calculateSlope(entries.map(e => e.vad.valence)),
      arousal: calculateSlope(entries.map(e => e.vad.arousal)),
      dominance: calculateSlope(entries.map(e => e.vad.dominance))
    };
  }

  private calculateVolatility(entries: MoodEntry[]): number {
    if (entries.length < 2) return 0;

    const values = entries.map(e =>
      Math.sqrt(e.vad.valence ** 2 + e.vad.arousal ** 2 + e.vad.dominance ** 2)
    );
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Extract weather features
   */
  private extractWeatherFeatures(weather: WeatherData): { values: number[]; names: string[] } {
    // Normalize temperature to 0-1 range (assuming -20 to 40°C range)
    const tempNorm = (weather.temperature + 20) / 60;

    // Normalize pressure to 0-1 range (980-1040 hPa typical range)
    const pressureNorm = (weather.pressure - 980) / 60;

    // Humidity (already 0-100, normalize to 0-1)
    const humidityNorm = (weather.humidity || 50) / 100;

    // One-hot encoding for conditions
    const conditions = ['sunny', 'cloudy', 'rainy', 'snowy', 'partly-cloudy'];
    const conditionEncoding = conditions.map(c => c === weather.condition ? 1 : 0);

    return {
      values: [
        Math.max(0, Math.min(1, tempNorm)),
        Math.max(0, Math.min(1, pressureNorm)),
        humidityNorm,
        ...conditionEncoding
      ],
      names: [
        'temp_normalized',
        'pressure_normalized',
        'humidity_normalized',
        'is_sunny',
        'is_cloudy',
        'is_rainy',
        'is_snowy',
        'is_partly_cloudy'
      ]
    };
  }

  /**
   * Extract personality features
   */
  private extractPersonalityFeatures(
    personality: PersonalityProfile
  ): { values: number[]; names: string[] } {
    const values: number[] = [];
    const names: string[] = [];

    // Big Five (normalized 0-1)
    values.push(
      personality.big_five.openness / 100,
      personality.big_five.conscientiousness / 100,
      personality.big_five.extraversion / 100,
      personality.big_five.agreeableness / 100,
      personality.big_five.neuroticism / 100
    );
    names.push('big5_openness', 'big5_conscientiousness', 'big5_extraversion',
               'big5_agreeableness', 'big5_neuroticism');

    // MBTI (normalized -1 to 1, then to 0-1)
    values.push(
      (personality.mbti.EI + 100) / 200,
      (personality.mbti.SN + 100) / 200,
      (personality.mbti.TF + 100) / 200,
      (personality.mbti.JP + 100) / 200
    );
    names.push('mbti_EI', 'mbti_SN', 'mbti_TF', 'mbti_JP');

    // Derived traits (already 0-100, normalize to 0-1)
    values.push(
      personality.derived.stress_resilience / 100,
      personality.derived.optimism / 100,
      personality.derived.flow_tendency / 100,
      personality.derived.collaboration_preference / 100,
      personality.derived.structure_need / 100,
      personality.derived.energy_baseline / 100,
      personality.derived.recovery_speed / 100,
      personality.derived.risk_tolerance / 100
    );
    names.push(
      'stress_resilience', 'optimism', 'flow_tendency',
      'collaboration_preference', 'structure_need', 'energy_baseline',
      'recovery_speed', 'risk_tolerance'
    );

    // Top 3 genius types (one-hot encoding)
    const geniusTypes = ['wonder', 'invention', 'discernment', 'galvanizing', 'enablement', 'tenacity'];
    const primaryGenius = geniusTypes.indexOf(personality.genius.primary);
    const geniusEncoding = geniusTypes.map((_, i) => i === primaryGenius ? 1 : 0);
    values.push(...geniusEncoding);
    names.push(...geniusTypes.map(t => `genius_${t}`));

    return { values, names };
  }

  /**
   * Extract context features
   */
  private extractContextFeatures(mood: MoodEntry): { values: number[]; names: string[] } {
    const values: number[] = [];
    const names: string[] = [];

    // Energy level (if available)
    const energyLevel = (mood.context?.energy_level || 0.5);
    values.push(energyLevel);
    names.push('energy_level');

    // Activity type (simple encoding - in production, use learned embeddings)
    const hasActivity = mood.context?.activity ? 1 : 0;
    values.push(hasActivity);
    names.push('has_activity');

    // Location
    const hasLocation = mood.context?.location ? 1 : 0;
    values.push(hasLocation);
    names.push('has_location');

    // Tags count
    const tagCount = (mood.tags?.length || 0) / 10; // Normalize assuming max 10 tags
    values.push(Math.min(tagCount, 1));
    names.push('tag_count');

    // Has note
    const hasNote = mood.note ? 1 : 0;
    values.push(hasNote);
    names.push('has_note');

    return { values, names };
  }

  /**
   * Normalize features using z-score normalization
   */
  normalizeFeatures(featureVector: FeatureVector): number[] {
    if (!this.initialized) {
      // First time - return as is
      return featureVector.features;
    }

    return featureVector.features.map((value, i) => {
      const name = featureVector.featureNames[i];
      const mean = this.featureMeans.get(name) || 0;
      const std = this.featureStds.get(name) || 1;
      return (value - mean) / std;
    });
  }

  /**
   * Update normalization parameters (for online learning)
   */
  updateNormalization(featureVector: FeatureVector): void {
    const alpha = 0.1; // Exponential moving average weight

    featureVector.features.forEach((value, i) => {
      const name = featureVector.featureNames[i];

      if (!this.featureMeans.has(name)) {
        this.featureMeans.set(name, value);
        this.featureStds.set(name, 1);
      } else {
        const oldMean = this.featureMeans.get(name)!;
        const newMean = alpha * value + (1 - alpha) * oldMean;
        this.featureMeans.set(name, newMean);

        const oldStd = this.featureStds.get(name)!;
        const variance = alpha * (value - oldMean) ** 2 + (1 - alpha) * oldStd ** 2;
        this.featureStds.set(name, Math.sqrt(variance));
      }
    });

    this.initialized = true;
  }

  /**
   * Get feature dimension
   */
  getFeatureDimension(): number {
    // Calculate total feature dimension
    // Temporal: 11, Circadian: 5, Current VAD: 3, History: 15
    // Weather: 8, Personality: 23, Context: 5, Flow: 1
    return 11 + 5 + 3 + 15 + 8 + 23 + 5 + 1; // = 71 features
  }

  /**
   * Save feature engineering state
   */
  saveState(): string {
    return JSON.stringify({
      featureMeans: Array.from(this.featureMeans.entries()),
      featureStds: Array.from(this.featureStds.entries()),
      initialized: this.initialized
    });
  }

  /**
   * Load feature engineering state
   */
  loadState(serialized: string): void {
    const state = JSON.parse(serialized);
    this.featureMeans = new Map(state.featureMeans);
    this.featureStds = new Map(state.featureStds);
    this.initialized = state.initialized;
  }
}

// Export singleton instance
export const featureEngineering = new FeatureEngineering();
