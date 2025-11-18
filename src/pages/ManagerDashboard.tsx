import { useState, useEffect } from 'react';
import { teamAnalytics } from '../services/team-analytics';
import Octopus from '../components/Octopus';
import type {
  TeamMember,
  TeamAlert,
  TeamAnalytics,
  RiskLevel,
  ManagerIntervention
} from '../types';

interface ManagerDashboardProps {
  userId: string;
  onNavigate: (view: 'mood' | 'dashboard' | 'personality' | 'personality-profile' | 'settings' | 'interventions' | 'job-crafting' | 'job-matching' | 'analytics' | 'manager') => void;
}

export default function ManagerDashboard({ userId, onNavigate }: ManagerDashboardProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [alerts, setAlerts] = useState<TeamAlert[]>([]);
  const [analytics, setAnalytics] = useState<TeamAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showInterventionModal, setShowInterventionModal] = useState(false);
  const [interventionTarget, setInterventionTarget] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [userId]);

  async function loadData() {
    try {
      await teamAnalytics.initialize(userId);
      setTeamMembers(teamAnalytics.getTeamMembers());
      setAlerts(teamAnalytics.getActiveAlerts());
      setAnalytics(teamAnalytics.getTeamAnalytics());
    } catch (error) {
      console.error('Failed to load team data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAcknowledgeAlert(alertId: string) {
    await teamAnalytics.acknowledgeAlert(alertId);
    setAlerts(teamAnalytics.getActiveAlerts());
  }

  async function handleResolveAlert(alertId: string) {
    await teamAnalytics.resolveAlert(alertId);
    setAlerts(teamAnalytics.getActiveAlerts());
  }

  async function handleSendIntervention(
    targetId: string,
    type: ManagerIntervention['type'],
    message?: string
  ) {
    await teamAnalytics.sendIntervention(targetId, type, message);
    setShowInterventionModal(false);
    // Show success feedback
  }

  function openInterventionModal(memberId: string) {
    setInterventionTarget(memberId);
    setShowInterventionModal(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading team data...</p>
        </div>
      </div>
    );
  }

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const membersInFlow = teamMembers.filter(m => m.flow_status === 'in_flow').length;
  const membersAtRisk = teamMembers.filter(
    m => m.risk_level === 'high' || m.risk_level === 'critical'
  ).length;

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Team Wellness Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor your team's wellbeing and take action when needed
              </p>
            </div>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Critical Alerts Banner */}
        {criticalAlerts.length > 0 && (
          <div className="bg-red-500 rounded-xl p-4 mb-6 text-white">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-bold">Critical Alerts Require Attention</h3>
                <p className="text-red-100">
                  {criticalAlerts.length} team member{criticalAlerts.length > 1 ? 's' : ''} need immediate support
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Team Size"
            value={teamMembers.length}
            icon="👥"
            color="bg-blue-500"
          />
          <StatCard
            label="In Flow"
            value={membersInFlow}
            subtitle={`${Math.round((membersInFlow / teamMembers.length) * 100)}%`}
            icon="🌊"
            color="bg-teal-500"
          />
          <StatCard
            label="At Risk"
            value={membersAtRisk}
            icon="⚠️"
            color={membersAtRisk > 0 ? 'bg-orange-500' : 'bg-green-500'}
          />
          <StatCard
            label="Active Alerts"
            value={alerts.length}
            icon="🔔"
            color={alerts.length > 0 ? 'bg-red-500' : 'bg-gray-500'}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Team Members */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Team Members
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamMembers.map(member => (
                <TeamMemberCard
                  key={member.user_id}
                  member={member}
                  onSelect={() => setSelectedMember(member)}
                  onIntervene={() => openInterventionModal(member.user_id)}
                />
              ))}
            </div>
          </div>

          {/* Alerts Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Active Alerts
            </h2>
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">✅</span>
                No active alerts
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {alerts.map(alert => (
                  <AlertCard
                    key={alert.alert_id}
                    alert={alert}
                    onAcknowledge={() => handleAcknowledgeAlert(alert.alert_id)}
                    onResolve={() => handleResolveAlert(alert.alert_id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Analytics Section */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Team Mood */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Team Mood Overview
              </h2>
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  <Octopus
                    vad={{
                      valence: analytics.avg_valence,
                      arousal: analytics.avg_arousal,
                      dominance: analytics.avg_dominance
                    }}
                    size={100}
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <MoodBar label="Valence" value={analytics.avg_valence} />
                  <MoodBar label="Arousal" value={analytics.avg_arousal} />
                  <MoodBar label="Dominance" value={analytics.avg_dominance} />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${
                    analytics.mood_trend === 'improving' ? 'text-green-600' :
                    analytics.mood_trend === 'declining' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {analytics.mood_trend === 'improving' ? '📈 Improving' :
                     analytics.mood_trend === 'declining' ? '📉 Declining' :
                     '➡️ Stable'}
                  </span>
                  <span className="text-sm text-gray-500">this week</span>
                </div>
              </div>
            </div>

            {/* Energy Pattern */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Team Energy Pattern
              </h2>
              <div className="h-32 flex items-end gap-1">
                {analytics.team_energy_pattern.slice(6, 20).map((point, i) => (
                  <div
                    key={point.hour}
                    className="flex-1 bg-teal-500 rounded-t opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                    style={{ height: `${point.energy * 100}%` }}
                    title={`${point.hour}:00 - ${Math.round(point.energy * 100)}%`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>6am</span>
                <span>12pm</span>
                <span>6pm</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Peak Hours</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {analytics.peak_productivity_hours.join(', ')}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Best Meeting Time</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {analytics.optimal_meeting_times[0]}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-6 text-white">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ActionButton
              icon="☕"
              label="Team Break"
              description="Send break reminder to all"
              onClick={() => {/* Send to all */}}
            />
            <ActionButton
              icon="🧘"
              label="Wellness Activity"
              description="Suggest group exercise"
              onClick={() => {/* Suggest wellness */}}
            />
            <ActionButton
              icon="📊"
              label="Weekly Report"
              description="Generate team report"
              onClick={() => {/* Generate report */}}
            />
            <ActionButton
              icon="⚙️"
              label="Settings"
              description="Configure alerts"
              onClick={() => {/* Open settings */}}
            />
          </div>
        </div>
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onIntervene={() => {
            setSelectedMember(null);
            openInterventionModal(selectedMember.user_id);
          }}
        />
      )}

      {/* Intervention Modal */}
      {showInterventionModal && (
        <InterventionModal
          targetId={interventionTarget}
          targetName={teamMembers.find(m => m.user_id === interventionTarget)?.name || ''}
          onSend={handleSendIntervention}
          onClose={() => setShowInterventionModal(false)}
        />
      )}
    </div>
  );
}

// Sub-components

function StatCard({
  label,
  value,
  subtitle,
  icon,
  color
}: {
  label: string;
  value: number;
  subtitle?: string;
  icon: string;
  color: string;
}) {
  return (
    <div className={`${color} rounded-xl p-4 text-white`}>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <div className="text-right">
          <div className="text-3xl font-bold">{value}</div>
          {subtitle && <div className="text-sm opacity-80">{subtitle}</div>}
        </div>
      </div>
      <div className="text-sm mt-2 opacity-90">{label}</div>
    </div>
  );
}

function TeamMemberCard({
  member,
  onSelect,
  onIntervene
}: {
  member: TeamMember;
  onSelect: () => void;
  onIntervene: () => void;
}) {
  const riskColors: Record<RiskLevel, string> = {
    critical: 'border-red-500 bg-red-50 dark:bg-red-900/20',
    high: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
    moderate: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20',
    low: 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
  };

  return (
    <div
      className={`rounded-lg border-2 p-4 cursor-pointer hover:shadow-md transition-shadow ${riskColors[member.risk_level]}`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        {/* Avatar/Octopus */}
        <div className="flex-shrink-0">
          {member.current_mood ? (
            <Octopus vad={member.current_mood} size={50} />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600">?</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 dark:text-white truncate">
            {member.name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {member.role}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {member.flow_status === 'in_flow' && (
              <span className="text-xs bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full">
                In Flow
              </span>
            )}
            {member.active_alerts.length > 0 && (
              <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full">
                {member.active_alerts.length} alert{member.active_alerts.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Quick Action */}
        {(member.risk_level === 'high' || member.risk_level === 'critical') && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onIntervene();
            }}
            className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            title="Send intervention"
          >
            <span className="text-lg">💬</span>
          </button>
        )}
      </div>
    </div>
  );
}

function AlertCard({
  alert,
  onAcknowledge,
  onResolve
}: {
  alert: TeamAlert;
  onAcknowledge: () => void;
  onResolve: () => void;
}) {
  const severityColors: Record<RiskLevel, string> = {
    critical: 'border-l-red-500 bg-red-50 dark:bg-red-900/20',
    high: 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20',
    moderate: 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/20',
    low: 'border-l-gray-500 bg-gray-50 dark:bg-gray-700'
  };

  return (
    <div className={`border-l-4 rounded-r-lg p-3 ${severityColors[alert.severity]}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span>{teamAnalytics.getAlertIcon(alert.type)}</span>
          <span className="font-medium text-gray-900 dark:text-white text-sm">
            {alert.message}
          </span>
        </div>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
        {alert.details}
      </p>
      <div className="flex gap-2 mt-2">
        {!alert.acknowledged && (
          <button
            onClick={onAcknowledge}
            className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            Acknowledge
          </button>
        )}
        <button
          onClick={onResolve}
          className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Resolve
        </button>
      </div>
    </div>
  );
}

function MoodBar({ label, value }: { label: string; value: number }) {
  const percentage = ((value + 1) / 2) * 100;
  const color = value > 0.3 ? 'bg-green-500' : value < -0.3 ? 'bg-red-500' : 'bg-yellow-500';

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="text-gray-900 dark:text-white font-medium">{value.toFixed(2)}</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  description,
  onClick
}: {
  icon: string;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-left transition-colors"
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-semibold">{label}</div>
      <div className="text-sm opacity-80">{description}</div>
    </button>
  );
}

function MemberDetailModal({
  member,
  onClose,
  onIntervene
}: {
  member: TeamMember;
  onClose: () => void;
  onIntervene: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {member.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center gap-4 mb-4">
          {member.current_mood && (
            <Octopus vad={member.current_mood} size={80} />
          )}
          <div>
            <div className="text-sm text-gray-500">{member.role}</div>
            <div className="text-sm text-gray-500">{member.email}</div>
          </div>
        </div>

        {member.current_mood && (
          <div className="space-y-2 mb-4">
            <MoodBar label="Valence" value={member.current_mood.valence} />
            <MoodBar label="Arousal" value={member.current_mood.arousal} />
            <MoodBar label="Dominance" value={member.current_mood.dominance} />
          </div>
        )}

        {member.active_alerts.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Active Alerts
            </h4>
            {member.active_alerts.map(alert => (
              <div key={alert.alert_id} className="text-sm text-red-600 dark:text-red-400">
                • {alert.message}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onIntervene}
            className="flex-1 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Send Intervention
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function InterventionModal({
  targetId,
  targetName,
  onSend,
  onClose
}: {
  targetId: string;
  targetName: string;
  onSend: (targetId: string, type: ManagerIntervention['type'], message?: string) => void;
  onClose: () => void;
}) {
  const [selectedType, setSelectedType] = useState<ManagerIntervention['type']>('break_reminder');
  const [message, setMessage] = useState('');

  const interventionTypes = [
    { type: 'break_reminder' as const, icon: '☕', label: 'Break Reminder', desc: 'Suggest taking a short break' },
    { type: 'wellness_check' as const, icon: '💚', label: 'Wellness Check', desc: 'Schedule a quick check-in' },
    { type: 'intervention_suggestion' as const, icon: '🧘', label: 'Suggest Exercise', desc: 'Recommend breathing/stretch' },
    { type: 'kudos' as const, icon: '🌟', label: 'Send Kudos', desc: 'Recognize great work' },
    { type: 'schedule_chat' as const, icon: '📅', label: 'Schedule Chat', desc: 'Set up 1-on-1 meeting' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Send to {targetName}
        </h3>

        <div className="space-y-2 mb-4">
          {interventionTypes.map(({ type, icon, label, desc }) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                selectedType === type
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{icon}</span>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{label}</div>
                  <div className="text-xs text-gray-500">{desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Personal Message (optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a personal note..."
            className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            rows={3}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onSend(targetId, selectedType, message || undefined)}
            className="flex-1 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Send
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
