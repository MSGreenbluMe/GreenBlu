// Mouse Movement Mood Detection Service
// Based on research correlating mouse dynamics with emotional state

import type { MouseMovement, MouseMetrics, VAD } from '../types';

// Configuration
const CONFIG = {
  // Sampling
  SAMPLE_RATE_MS: 16, // ~60fps
  WINDOW_SIZE_MS: 300000, // 5 minutes rolling window
  METRICS_INTERVAL_MS: 10000, // Calculate metrics every 10 seconds

  // Thresholds
  PAUSE_THRESHOLD_MS: 500, // Consider paused if no movement for 500ms
  VELOCITY_THRESHOLD: 5, // Minimum velocity to consider movement
  JERK_THRESHOLD: 1000, // Acceleration change threshold for jerk detection
  DOUBLE_CLICK_THRESHOLD_MS: 300,

  // VAD estimation weights (based on research)
  WEIGHTS: {
    valence: {
      velocity: 0.15,
      acceleration_smoothness: 0.2,
      path_efficiency: 0.25,
      hesitation: -0.2,
      jerk: -0.2
    },
    arousal: {
      velocity: 0.3,
      acceleration: 0.25,
      click_rate: 0.2,
      direction_changes: 0.15,
      movement_intensity: 0.1
    },
    dominance: {
      path_efficiency: 0.3,
      velocity_consistency: 0.25,
      pause_ratio: -0.2,
      overshoot: -0.15,
      precision: 0.1
    }
  }
};

/**
 * Mouse Tracker Service
 * Tracks mouse movements and estimates mood from behavioral patterns
 */
export class MouseTracker {
  private isTracking: boolean = false;
  private movements: MouseMovement[] = [];
  private clicks: { timestamp: number; x: number; y: number; target?: string }[] = [];
  private lastPosition: { x: number; y: number; timestamp: number } | null = null;
  private lastVelocity: number = 0;
  private metricsHistory: MouseMetrics[] = [];
  private currentMetrics: MouseMetrics | null = null;
  private metricsInterval: number | null = null;
  private userId: string = '';
  private listeners: ((metrics: MouseMetrics) => void)[] = [];

  // Event handlers bound to this
  private boundMouseMove: (e: MouseEvent) => void;
  private boundMouseClick: (e: MouseEvent) => void;

  constructor() {
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseClick = this.handleMouseClick.bind(this);
  }

  /**
   * Initialize tracker for a user
   */
  async initialize(userId: string): Promise<void> {
    this.userId = userId;

    // Load any persisted metrics history
    try {
      const result = await chrome.storage.local.get(`mouse_metrics_${userId}`);
      if (result[`mouse_metrics_${userId}`]) {
        this.metricsHistory = result[`mouse_metrics_${userId}`].slice(-100); // Keep last 100
      }
    } catch (error) {
      console.warn('Failed to load mouse metrics history:', error);
    }
  }

  /**
   * Start tracking mouse movements
   */
  start(): void {
    if (this.isTracking) return;

    this.isTracking = true;
    this.movements = [];
    this.clicks = [];
    this.lastPosition = null;

    // Add event listeners
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('click', this.boundMouseClick);

    // Start metrics calculation interval
    this.metricsInterval = window.setInterval(() => {
      this.calculateMetrics();
    }, CONFIG.METRICS_INTERVAL_MS);

    console.log('Mouse tracking started');
  }

  /**
   * Stop tracking
   */
  stop(): void {
    if (!this.isTracking) return;

    this.isTracking = false;

    // Remove event listeners
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('click', this.boundMouseClick);

    // Clear interval
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }

    // Save final metrics
    this.calculateMetrics();
    this.saveMetricsHistory();

    console.log('Mouse tracking stopped');
  }

  /**
   * Handle mouse move event
   */
  private handleMouseMove(e: MouseEvent): void {
    const now = Date.now();
    const x = e.clientX;
    const y = e.clientY;

    let velocity = 0;
    let acceleration = 0;

    if (this.lastPosition) {
      const dx = x - this.lastPosition.x;
      const dy = y - this.lastPosition.y;
      const dt = now - this.lastPosition.timestamp;

      if (dt > 0) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        velocity = distance / dt * 1000; // pixels per second

        acceleration = (velocity - this.lastVelocity) / dt * 1000;
        this.lastVelocity = velocity;
      }
    }

    const movement: MouseMovement = {
      x,
      y,
      timestamp: now,
      velocity,
      acceleration
    };

    this.movements.push(movement);
    this.lastPosition = { x, y, timestamp: now };

    // Trim old movements (keep only within window)
    const cutoff = now - CONFIG.WINDOW_SIZE_MS;
    this.movements = this.movements.filter(m => m.timestamp > cutoff);
  }

  /**
   * Handle click event
   */
  private handleMouseClick(e: MouseEvent): void {
    const now = Date.now();

    this.clicks.push({
      timestamp: now,
      x: e.clientX,
      y: e.clientY,
      target: (e.target as HTMLElement)?.tagName
    });

    // Trim old clicks
    const cutoff = now - CONFIG.WINDOW_SIZE_MS;
    this.clicks = this.clicks.filter(c => c.timestamp > cutoff);
  }

  /**
   * Calculate comprehensive metrics from movement data
   */
  private calculateMetrics(): void {
    if (this.movements.length < 10) {
      return; // Not enough data
    }

    const now = Date.now();
    const windowStart = now - CONFIG.WINDOW_SIZE_MS;
    const recentMovements = this.movements.filter(m => m.timestamp > windowStart);
    const recentClicks = this.clicks.filter(c => c.timestamp > windowStart);

    if (recentMovements.length < 5) return;

    // Calculate velocity metrics
    const velocities = recentMovements.map(m => m.velocity).filter(v => v > 0);
    const avgVelocity = this.average(velocities);
    const maxVelocity = Math.max(...velocities, 0);
    const velocityVariance = this.variance(velocities);

    // Calculate acceleration metrics
    const accelerations = recentMovements.map(m => Math.abs(m.acceleration));
    const avgAcceleration = this.average(accelerations);

    // Count jerks (sudden acceleration changes)
    let jerkCount = 0;
    for (let i = 1; i < recentMovements.length; i++) {
      const accChange = Math.abs(recentMovements[i].acceleration - recentMovements[i - 1].acceleration);
      if (accChange > CONFIG.JERK_THRESHOLD) {
        jerkCount++;
      }
    }

    // Calculate hesitation metrics
    const { pauseCount, avgPauseDuration, hesitationRatio } = this.calculateHesitation(recentMovements);

    // Calculate trajectory metrics
    const { pathEfficiency, curvatureIndex, directionChanges } = this.calculateTrajectory(recentMovements);

    // Calculate click metrics
    const clickCount = recentClicks.length;
    const doubleClickCount = this.countDoubleClicks(recentClicks);
    const misclickRate = this.estimateMisclickRate(recentClicks);

    // Duration
    const duration = recentMovements.length > 0
      ? recentMovements[recentMovements.length - 1].timestamp - recentMovements[0].timestamp
      : 0;

    // Estimate VAD from metrics
    const estimatedVAD = this.estimateVAD({
      avgVelocity,
      maxVelocity,
      velocityVariance,
      avgAcceleration,
      jerkCount,
      pauseCount,
      avgPauseDuration,
      hesitationRatio,
      pathEfficiency,
      curvatureIndex,
      directionChanges,
      clickCount,
      doubleClickCount,
      duration
    });

    // Calculate confidence based on sample size
    const confidence = Math.min(1, recentMovements.length / 500);

    this.currentMetrics = {
      avg_velocity: avgVelocity,
      max_velocity: maxVelocity,
      velocity_variance: velocityVariance,
      avg_acceleration: avgAcceleration,
      jerk_count: jerkCount,
      pause_count: pauseCount,
      avg_pause_duration: avgPauseDuration,
      hesitation_ratio: hesitationRatio,
      path_efficiency: pathEfficiency,
      curvature_index: curvatureIndex,
      direction_changes: directionChanges,
      click_count: clickCount,
      double_click_count: doubleClickCount,
      misclick_rate: misclickRate,
      estimated_vad: estimatedVAD,
      confidence,
      sample_count: recentMovements.length,
      duration_ms: duration,
      timestamp: now
    };

    // Add to history
    this.metricsHistory.push(this.currentMetrics);

    // Keep history manageable
    if (this.metricsHistory.length > 1000) {
      this.metricsHistory = this.metricsHistory.slice(-500);
    }

    // Notify listeners
    this.notifyListeners();
  }

  /**
   * Calculate hesitation metrics
   */
  private calculateHesitation(movements: MouseMovement[]): {
    pauseCount: number;
    avgPauseDuration: number;
    hesitationRatio: number;
  } {
    let pauseCount = 0;
    let totalPauseDuration = 0;
    let inPause = false;
    let pauseStart = 0;

    for (let i = 1; i < movements.length; i++) {
      const dt = movements[i].timestamp - movements[i - 1].timestamp;

      if (dt > CONFIG.PAUSE_THRESHOLD_MS) {
        if (!inPause) {
          inPause = true;
          pauseStart = movements[i - 1].timestamp;
        }
      } else if (inPause) {
        pauseCount++;
        totalPauseDuration += movements[i].timestamp - pauseStart;
        inPause = false;
      }
    }

    const totalDuration = movements.length > 1
      ? movements[movements.length - 1].timestamp - movements[0].timestamp
      : 1;

    return {
      pauseCount,
      avgPauseDuration: pauseCount > 0 ? totalPauseDuration / pauseCount : 0,
      hesitationRatio: totalPauseDuration / totalDuration
    };
  }

  /**
   * Calculate trajectory metrics
   */
  private calculateTrajectory(movements: MouseMovement[]): {
    pathEfficiency: number;
    curvatureIndex: number;
    directionChanges: number;
  } {
    if (movements.length < 3) {
      return { pathEfficiency: 1, curvatureIndex: 0, directionChanges: 0 };
    }

    // Calculate total path length
    let pathLength = 0;
    for (let i = 1; i < movements.length; i++) {
      const dx = movements[i].x - movements[i - 1].x;
      const dy = movements[i].y - movements[i - 1].y;
      pathLength += Math.sqrt(dx * dx + dy * dy);
    }

    // Calculate direct distance
    const first = movements[0];
    const last = movements[movements.length - 1];
    const directDistance = Math.sqrt(
      Math.pow(last.x - first.x, 2) + Math.pow(last.y - first.y, 2)
    );

    // Path efficiency
    const pathEfficiency = pathLength > 0 ? directDistance / pathLength : 1;

    // Count direction changes
    let directionChanges = 0;
    let prevAngle = 0;

    for (let i = 2; i < movements.length; i++) {
      const dx1 = movements[i - 1].x - movements[i - 2].x;
      const dy1 = movements[i - 1].y - movements[i - 2].y;
      const dx2 = movements[i].x - movements[i - 1].x;
      const dy2 = movements[i].y - movements[i - 1].y;

      const angle1 = Math.atan2(dy1, dx1);
      const angle2 = Math.atan2(dy2, dx2);

      let angleDiff = Math.abs(angle2 - angle1);
      if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;

      if (angleDiff > Math.PI / 4) { // 45 degrees
        directionChanges++;
      }
    }

    // Curvature index (average angular change)
    const curvatureIndex = movements.length > 2
      ? directionChanges / (movements.length - 2)
      : 0;

    return {
      pathEfficiency: Math.min(1, pathEfficiency),
      curvatureIndex,
      directionChanges
    };
  }

  /**
   * Count double clicks
   */
  private countDoubleClicks(clicks: { timestamp: number }[]): number {
    let count = 0;
    for (let i = 1; i < clicks.length; i++) {
      if (clicks[i].timestamp - clicks[i - 1].timestamp < CONFIG.DOUBLE_CLICK_THRESHOLD_MS) {
        count++;
      }
    }
    return count;
  }

  /**
   * Estimate misclick rate (clicks that don't hit interactive elements)
   */
  private estimateMisclickRate(clicks: { target?: string }[]): number {
    if (clicks.length === 0) return 0;

    const interactiveElements = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
    const misclicks = clicks.filter(c => !interactiveElements.includes(c.target || ''));
    return misclicks.length / clicks.length;
  }

  /**
   * Estimate VAD from mouse metrics
   * Based on research correlations
   */
  private estimateVAD(metrics: {
    avgVelocity: number;
    maxVelocity: number;
    velocityVariance: number;
    avgAcceleration: number;
    jerkCount: number;
    pauseCount: number;
    avgPauseDuration: number;
    hesitationRatio: number;
    pathEfficiency: number;
    curvatureIndex: number;
    directionChanges: number;
    clickCount: number;
    doubleClickCount: number;
    duration: number;
  }): VAD {
    // Normalize metrics to 0-1 scale
    const normalizedVelocity = this.sigmoid(metrics.avgVelocity / 500);
    const normalizedAcceleration = this.sigmoid(metrics.avgAcceleration / 2000);
    const accelerationSmoothness = 1 - Math.min(1, metrics.jerkCount / 50);
    const velocityConsistency = 1 - Math.min(1, Math.sqrt(metrics.velocityVariance) / 200);
    const clickRate = metrics.duration > 0 ? metrics.clickCount / (metrics.duration / 60000) : 0;
    const normalizedClickRate = this.sigmoid(clickRate / 10);
    const movementIntensity = normalizedVelocity * (1 - metrics.hesitationRatio);

    // Calculate Valence (positive/negative mood)
    // Higher velocity + smoother movement + efficient paths = more positive
    // More hesitation + jerks = more negative
    let valence = 0;
    valence += CONFIG.WEIGHTS.valence.velocity * (normalizedVelocity - 0.5) * 2;
    valence += CONFIG.WEIGHTS.valence.acceleration_smoothness * (accelerationSmoothness - 0.5) * 2;
    valence += CONFIG.WEIGHTS.valence.path_efficiency * (metrics.pathEfficiency - 0.5) * 2;
    valence += CONFIG.WEIGHTS.valence.hesitation * metrics.hesitationRatio;
    valence += CONFIG.WEIGHTS.valence.jerk * Math.min(1, metrics.jerkCount / 30);

    // Calculate Arousal (energy level)
    // Higher velocity + acceleration + clicks = higher arousal
    let arousal = 0;
    arousal += CONFIG.WEIGHTS.arousal.velocity * (normalizedVelocity - 0.5) * 2;
    arousal += CONFIG.WEIGHTS.arousal.acceleration * (normalizedAcceleration - 0.5) * 2;
    arousal += CONFIG.WEIGHTS.arousal.click_rate * (normalizedClickRate - 0.5) * 2;
    arousal += CONFIG.WEIGHTS.arousal.direction_changes * Math.min(1, metrics.directionChanges / 100);
    arousal += CONFIG.WEIGHTS.arousal.movement_intensity * (movementIntensity - 0.5) * 2;

    // Calculate Dominance (control)
    // Efficient paths + consistent velocity = higher control
    // Pauses + overshoot = lower control
    let dominance = 0;
    dominance += CONFIG.WEIGHTS.dominance.path_efficiency * (metrics.pathEfficiency - 0.5) * 2;
    dominance += CONFIG.WEIGHTS.dominance.velocity_consistency * (velocityConsistency - 0.5) * 2;
    dominance += CONFIG.WEIGHTS.dominance.pause_ratio * metrics.hesitationRatio;
    dominance += CONFIG.WEIGHTS.dominance.precision * (1 - metrics.curvatureIndex);

    // Clamp to [-1, 1]
    return {
      valence: Math.max(-1, Math.min(1, valence)),
      arousal: Math.max(-1, Math.min(1, arousal)),
      dominance: Math.max(-1, Math.min(1, dominance))
    };
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics(): MouseMetrics | null {
    return this.currentMetrics;
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(): MouseMetrics[] {
    return this.metricsHistory;
  }

  /**
   * Get estimated VAD with smoothing
   */
  getSmoothedVAD(windowMinutes: number = 5): VAD | null {
    if (this.metricsHistory.length === 0) return null;

    const cutoff = Date.now() - windowMinutes * 60 * 1000;
    const recentMetrics = this.metricsHistory.filter(m => m.timestamp > cutoff);

    if (recentMetrics.length === 0) return null;

    // Weight recent metrics more heavily
    let totalWeight = 0;
    let valence = 0;
    let arousal = 0;
    let dominance = 0;

    recentMetrics.forEach((m, i) => {
      const weight = (i + 1) * m.confidence;
      totalWeight += weight;
      valence += m.estimated_vad.valence * weight;
      arousal += m.estimated_vad.arousal * weight;
      dominance += m.estimated_vad.dominance * weight;
    });

    if (totalWeight === 0) return null;

    return {
      valence: valence / totalWeight,
      arousal: arousal / totalWeight,
      dominance: dominance / totalWeight
    };
  }

  /**
   * Subscribe to metrics updates
   */
  onMetricsUpdate(callback: (metrics: MouseMetrics) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    if (!this.currentMetrics) return;
    this.listeners.forEach(listener => listener(this.currentMetrics!));
  }

  /**
   * Save metrics history to storage
   */
  private async saveMetricsHistory(): Promise<void> {
    try {
      await chrome.storage.local.set({
        [`mouse_metrics_${this.userId}`]: this.metricsHistory.slice(-100)
      });
    } catch (error) {
      console.warn('Failed to save mouse metrics:', error);
    }
  }

  /**
   * Check if tracking is active
   */
  isActive(): boolean {
    return this.isTracking;
  }

  /**
   * Get tracking status
   */
  getStatus(): {
    isTracking: boolean;
    sampleCount: number;
    duration: number;
    hasMetrics: boolean;
  } {
    const duration = this.movements.length > 1
      ? this.movements[this.movements.length - 1].timestamp - this.movements[0].timestamp
      : 0;

    return {
      isTracking: this.isTracking,
      sampleCount: this.movements.length,
      duration,
      hasMetrics: this.currentMetrics !== null
    };
  }

  // Utility functions
  private average(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  private variance(arr: number[]): number {
    if (arr.length === 0) return 0;
    const avg = this.average(arr);
    return arr.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / arr.length;
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }
}

// Export singleton
export const mouseTracker = new MouseTracker();
