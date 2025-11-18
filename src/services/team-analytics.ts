// Team Analytics Service for Manager Dashboard
// Provides team insights, risk detection, and intervention management

import type {
  TeamMember,
  TeamAlert,
  TeamAnalytics,
  ManagerIntervention,
  TeamSettings,
  VAD,
  RiskLevel,
  AlertType
} from '../types';
import { generateId } from '../lib/utils';

// Mock team member names for demo
const MOCK_NAMES = [
  'Alex Thompson', 'Jordan Chen', 'Sam Williams', 'Taylor Kim',
  'Morgan Davis', 'Casey Johnson', 'Riley Martinez', 'Quinn Anderson'
];

const MOCK_ROLES = [
  'Senior Developer', 'UX Designer', 'Product Manager', 'Data Analyst',
  'Frontend Engineer', 'Backend Engineer', 'DevOps Engineer', 'QA Engineer'
];

/**
 * Team Analytics Service
 * Manages team data, risk detection, and manager interventions
 */
export class TeamAnalyticsService {
  private teamId: string = 'default-team';
  private managerId: string = '';
  private teamMembers: TeamMember[] = [];
  private alerts: TeamAlert[] = [];
  private interventions: ManagerIntervention[] = [];
  private settings: TeamSettings | null = null;

  /**
   * Initialize service for a manager
   */
  async initialize(managerId: string): Promise<void> {
    this.managerId = managerId;

    // Load or create team settings
    try {
      const result = await chrome.storage.local.get(`team_settings_${managerId}`);
      if (result[`team_settings_${managerId}`]) {
        this.settings = result[`team_settings_${managerId}`];
      } else {
        this.settings = this.createDefaultSettings();
        await this.saveSettings();
      }
    } catch (error) {
      console.warn('Failed to load team settings:', error);
      this.settings = this.createDefaultSettings();
    }

    // Generate mock team for demo
    this.generateMockTeam();
  }

  /**
   * Create default team settings
   */
  private createDefaultSettings(): TeamSettings {
    return {
      team_id: this.teamId,
      manager_id: this.managerId,
      alert_thresholds: {
        burnout_threshold: 0.7,
        stress_threshold: 0.6,
        low_mood_threshold: -0.3,
        inactivity_days: 3
      },
      notification_preferences: {
        email_alerts: true,
        in_app_alerts: true,
        daily_summary: true,
        weekly_report: true
      },
      privacy_settings: {
        show_individual_data: true,
        anonymize_alerts: false,
        require_consent: true
      }
    };
  }

  /**
   * Generate mock team members with realistic data
   */
  private generateMockTeam(): void {
    this.teamMembers = MOCK_NAMES.map((name, index) => {
      // Generate realistic mood patterns
      const baseValence = Math.random() * 1.2 - 0.3; // -0.3 to 0.9
      const baseArousal = Math.random() * 1.4 - 0.4; // -0.4 to 1.0
      const baseDominance = Math.random() * 1.2 - 0.2; // -0.2 to 1.0

      const mood: VAD = {
        valence: Math.max(-1, Math.min(1, baseValence + (Math.random() * 0.2 - 0.1))),
        arousal: Math.max(-1, Math.min(1, baseArousal + (Math.random() * 0.2 - 0.1))),
        dominance: Math.max(-1, Math.min(1, baseDominance + (Math.random() * 0.2 - 0.1)))
      };

      // Determine flow status
      const flowProb = this.calculateFlowProbability(mood);
      let flowStatus: TeamMember['flow_status'] = 'not_in_flow';
      if (flowProb >= 0.7) flowStatus = 'in_flow';
      else if (flowProb >= 0.5) flowStatus = 'near_flow';

      // Calculate risk level
      const riskLevel = this.calculateRiskLevel(mood, index);

      // Generate alerts if needed
      const alerts = this.generateAlertsForMember(
        `member_${index}`,
        name,
        mood,
        riskLevel
      );

      return {
        user_id: `member_${index}`,
        name,
        email: `${name.toLowerCase().replace(' ', '.')}@company.com`,
        role: MOCK_ROLES[index % MOCK_ROLES.length],
        department: 'Engineering',
        current_mood: mood,
        mood_confidence: 0.6 + Math.random() * 0.3,
        last_checkin: Date.now() - Math.floor(Math.random() * 4 * 60 * 60 * 1000), // Last 4 hours
        flow_status: flowStatus,
        risk_level: riskLevel,
        active_alerts: alerts,
        privacy_consent: true,
        manager_view_enabled: true
      };
    });

    // Sort by risk level (critical first)
    const riskOrder: Record<RiskLevel, number> = {
      critical: 0,
      high: 1,
      moderate: 2,
      low: 3
    };
    this.teamMembers.sort((a, b) => riskOrder[a.risk_level] - riskOrder[b.risk_level]);
  }

  /**
   * Calculate flow probability from VAD
   */
  private calculateFlowProbability(vad: VAD): number {
    const valenceScore = (vad.valence + 1) / 2;
    const arousalScore = Math.abs(vad.arousal) < 0.5 ? 1 - Math.abs(vad.arousal) : 0.5;
    const dominanceScore = (vad.dominance + 1) / 2;

    return (valenceScore * 0.4 + arousalScore * 0.3 + dominanceScore * 0.3);
  }

  /**
   * Calculate risk level based on mood patterns
   */
  private calculateRiskLevel(mood: VAD, index: number): RiskLevel {
    // Simulate some members having issues for demo
    if (index === 2) return 'critical'; // One critical for demo
    if (index === 5) return 'high';
    if (index === 1 || index === 7) return 'moderate';

    // Calculate based on mood
    const stressScore = (-mood.valence + mood.arousal) / 2;
    const burnoutScore = (-mood.valence - mood.arousal - mood.dominance) / 3;

    if (burnoutScore > 0.5 || stressScore > 0.6) return 'critical';
    if (burnoutScore > 0.3 || stressScore > 0.4) return 'high';
    if (burnoutScore > 0.1 || stressScore > 0.2) return 'moderate';
    return 'low';
  }

  /**
   * Generate alerts for a team member
   */
  private generateAlertsForMember(
    userId: string,
    name: string,
    mood: VAD,
    riskLevel: RiskLevel
  ): TeamAlert[] {
    const alerts: TeamAlert[] = [];

    if (riskLevel === 'critical') {
      // Burnout alert
      alerts.push({
        alert_id: generateId(),
        user_id: userId,
        type: 'burnout',
        severity: 'critical',
        message: `${name.split(' ')[0]} shows signs of burnout`,
        details: 'Consistently low mood and energy over the past 3 days. Immediate attention recommended.',
        created_at: Date.now() - 2 * 60 * 60 * 1000,
        acknowledged: false,
        resolved: false,
        suggested_actions: [
          'Schedule 1-on-1 wellness check',
          'Suggest immediate break',
          'Review workload and deadlines',
          'Consider temporary task redistribution'
        ]
      });
    }

    if (riskLevel === 'high' || (mood.arousal > 0.5 && mood.valence < -0.2)) {
      // Stress alert
      alerts.push({
        alert_id: generateId(),
        user_id: userId,
        type: 'stress',
        severity: 'high',
        message: `${name.split(' ')[0]} experiencing high stress`,
        details: 'Elevated arousal with negative mood detected. May benefit from stress relief intervention.',
        created_at: Date.now() - 1 * 60 * 60 * 1000,
        acknowledged: false,
        resolved: false,
        suggested_actions: [
          'Send breathing exercise reminder',
          'Suggest short break',
          'Check for blockers or issues'
        ]
      });
    }

    if (mood.valence < -0.4) {
      // Low mood alert
      alerts.push({
        alert_id: generateId(),
        user_id: userId,
        type: 'low_mood',
        severity: riskLevel === 'critical' ? 'high' : 'moderate',
        message: `${name.split(' ')[0]} has low mood`,
        details: 'Negative valence detected. Consider supportive intervention.',
        created_at: Date.now() - 30 * 60 * 1000,
        acknowledged: false,
        resolved: false,
        suggested_actions: [
          'Send encouragement or kudos',
          'Check in casually',
          'Offer support'
        ]
      });
    }

    return alerts;
  }

  /**
   * Get all team members
   */
  getTeamMembers(): TeamMember[] {
    return this.teamMembers;
  }

  /**
   * Get team member by ID
   */
  getTeamMember(userId: string): TeamMember | undefined {
    return this.teamMembers.find(m => m.user_id === userId);
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts(): TeamAlert[] {
    return this.teamMembers
      .flatMap(m => m.active_alerts)
      .filter(a => !a.resolved)
      .sort((a, b) => {
        const severityOrder: Record<RiskLevel, number> = {
          critical: 0, high: 1, moderate: 2, low: 3
        };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string): Promise<void> {
    for (const member of this.teamMembers) {
      const alert = member.active_alerts.find(a => a.alert_id === alertId);
      if (alert) {
        alert.acknowledged = true;
        alert.acknowledged_at = Date.now();
        break;
      }
    }
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string): Promise<void> {
    for (const member of this.teamMembers) {
      const alert = member.active_alerts.find(a => a.alert_id === alertId);
      if (alert) {
        alert.resolved = true;
        alert.resolved_at = Date.now();
        break;
      }
    }
  }

  /**
   * Send intervention to team member
   */
  async sendIntervention(
    targetUserId: string,
    type: ManagerIntervention['type'],
    message?: string
  ): Promise<ManagerIntervention> {
    const intervention: ManagerIntervention = {
      intervention_id: generateId(),
      manager_id: this.managerId,
      target_user_id: targetUserId,
      type,
      message,
      sent_at: Date.now(),
      delivered: true // Simulate delivery
    };

    this.interventions.push(intervention);

    // Save to storage
    try {
      await chrome.storage.local.set({
        [`interventions_${this.managerId}`]: this.interventions.slice(-100)
      });
    } catch (error) {
      console.warn('Failed to save intervention:', error);
    }

    return intervention;
  }

  /**
   * Get team analytics
   */
  getTeamAnalytics(): TeamAnalytics {
    const now = Date.now();
    const dayStart = new Date().setHours(0, 0, 0, 0);

    // Calculate aggregated mood
    const moods = this.teamMembers
      .filter(m => m.current_mood)
      .map(m => m.current_mood!);

    const avgValence = moods.reduce((sum, m) => sum + m.valence, 0) / moods.length || 0;
    const avgArousal = moods.reduce((sum, m) => sum + m.arousal, 0) / moods.length || 0;
    const avgDominance = moods.reduce((sum, m) => sum + m.dominance, 0) / moods.length || 0;

    // Simulate trend
    const moodTrend = avgValence > 0.2 ? 'improving' : avgValence < -0.2 ? 'declining' : 'stable';

    // Flow metrics
    const inFlow = this.teamMembers.filter(m => m.flow_status === 'in_flow').length;
    const flowParticipation = inFlow / this.teamMembers.length;

    // Risk metrics
    const atRisk = this.teamMembers.filter(
      m => m.risk_level === 'high' || m.risk_level === 'critical'
    ).length;
    const activeAlerts = this.getActiveAlerts().length;
    const burnoutScore = this.teamMembers.reduce((sum, m) => {
      if (m.risk_level === 'critical') return sum + 1;
      if (m.risk_level === 'high') return sum + 0.5;
      return sum;
    }, 0) / this.teamMembers.length;

    // Generate energy pattern (mock)
    const energyPattern = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      energy: this.getHourlyEnergy(hour)
    }));

    // Find peak hours
    const sortedHours = [...energyPattern].sort((a, b) => b.energy - a.energy);
    const peakHours = sortedHours.slice(0, 3).map(h => `${h.hour}:00`);

    // Optimal meeting times (avoid peak flow times)
    const meetingHours = sortedHours.slice(-6, -3).map(h => `${h.hour}:00`);

    return {
      team_id: this.teamId,
      period_start: dayStart,
      period_end: now,

      avg_valence: avgValence,
      avg_arousal: avgArousal,
      avg_dominance: avgDominance,
      mood_trend: moodTrend,

      total_flow_hours: inFlow * 2.5, // Simulate hours
      avg_flow_hours_per_member: 2.5,
      flow_participation_rate: flowParticipation,

      members_at_risk: atRisk,
      active_alerts_count: activeAlerts,
      burnout_risk_score: burnoutScore,

      checkin_rate: 0.85,
      avg_checkins_per_day: 4.2,
      intervention_usage_rate: 0.65,

      peak_productivity_hours: peakHours,
      optimal_meeting_times: meetingHours,
      team_energy_pattern: energyPattern
    };
  }

  /**
   * Get hourly energy pattern (mock)
   */
  private getHourlyEnergy(hour: number): number {
    // Typical energy pattern with morning and afternoon peaks
    if (hour >= 9 && hour <= 11) return 0.8 + Math.random() * 0.15;
    if (hour >= 14 && hour <= 16) return 0.7 + Math.random() * 0.15;
    if (hour >= 6 && hour <= 8) return 0.5 + Math.random() * 0.2;
    if (hour >= 12 && hour <= 13) return 0.4 + Math.random() * 0.2; // Lunch dip
    if (hour >= 17 && hour <= 18) return 0.5 + Math.random() * 0.2;
    return 0.2 + Math.random() * 0.2;
  }

  /**
   * Get team settings
   */
  getSettings(): TeamSettings | null {
    return this.settings;
  }

  /**
   * Update team settings
   */
  async updateSettings(settings: Partial<TeamSettings>): Promise<void> {
    if (this.settings) {
      this.settings = { ...this.settings, ...settings };
      await this.saveSettings();
    }
  }

  /**
   * Save settings to storage
   */
  private async saveSettings(): Promise<void> {
    try {
      await chrome.storage.local.set({
        [`team_settings_${this.managerId}`]: this.settings
      });
    } catch (error) {
      console.warn('Failed to save team settings:', error);
    }
  }

  /**
   * Get intervention history
   */
  getInterventionHistory(): ManagerIntervention[] {
    return this.interventions;
  }

  /**
   * Get risk color
   */
  getRiskColor(level: RiskLevel): string {
    switch (level) {
      case 'critical': return '#EF4444'; // red
      case 'high': return '#F97316'; // orange
      case 'moderate': return '#F59E0B'; // amber
      case 'low': return '#22C55E'; // green
    }
  }

  /**
   * Get alert type icon
   */
  getAlertIcon(type: AlertType): string {
    switch (type) {
      case 'burnout': return '🔥';
      case 'stress': return '⚡';
      case 'disengagement': return '💤';
      case 'fatigue': return '😴';
      case 'low_mood': return '😔';
    }
  }
}

// Export singleton
export const teamAnalytics = new TeamAnalyticsService();
