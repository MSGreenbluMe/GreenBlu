// VAD Model Types
export interface VAD {
  valence: number;   // -1 to +1
  arousal: number;   // -1 to +1
  dominance: number; // -1 to +1
}

export interface VADWithConfidence extends VAD {
  confidence: number; // 0 to 1
}

// Mood Entry
export interface MoodEntry {
  entry_id: string;
  user_id: string;
  timestamp: number;
  vad: VAD;
  context?: {
    circadian_phase?: number;
    weather?: WeatherData;
    activity?: string;
    location?: string;
    energy_level?: number;
  };
  note?: string;
  tags?: string[];
  flow_probability: number;
  predicted_next?: {
    '1h': VADWithConfidence;
    '4h': VADWithConfidence;
    '8h': VADWithConfidence;
  };
}

// Weather Data
export interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'partly-cloudy' | 'stormy';
  pressure: number;
  humidity?: number;
}

// Circadian Data
export interface CircadianEntry {
  entry_id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  wake_time: string; // HH:MM
  sleep_time?: string;
  sleep_quality?: number; // 1-5
  chronotype?: 'lark' | 'owl' | 'intermediate';
  optimal_windows?: {
    peak_energy: TimeRange;
    creative_peak: TimeRange;
    analytical_peak: TimeRange;
  };
}

export interface TimeRange {
  start: string; // HH:MM
  end: string;   // HH:MM
}

// Personality Types
export interface BigFive {
  openness: number;           // 0-100
  conscientiousness: number;  // 0-100
  extraversion: number;       // 0-100
  agreeableness: number;      // 0-100
  neuroticism: number;        // 0-100
  confidence: {
    openness: number;         // 0-1
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
}

export interface MBTI {
  EI: number; // -100 (I) to +100 (E)
  SN: number; // -100 (S) to +100 (N)
  TF: number; // -100 (T) to +100 (F)
  JP: number; // -100 (J) to +100 (P)
  type?: string; // 'INTJ', 'ENFP', etc.
  confidence: number; // 0-1
}

export interface DISC {
  dominance: number;        // 0-100
  influence: number;        // 0-100
  steadiness: number;       // 0-100
  conscientiousness: number;// 0-100
  confidence: number;       // 0-1
}

export interface Enneagram {
  type_scores: number[]; // [type1, type2, ..., type9]
  primary_type?: number; // 1-9
  wing?: number;         // 1-9
  confidence: number;    // 0-1
}

export type GeniusType = 'wonder' | 'invention' | 'discernment' | 'galvanizing' | 'enablement' | 'tenacity';

export interface GeniusProfile {
  wonder: number;       // 0-100
  invention: number;    // 0-100
  discernment: number;  // 0-100
  galvanizing: number;  // 0-100
  enablement: number;   // 0-100
  tenacity: number;     // 0-100
  primary: GeniusType;
  secondary: GeniusType;
  confidence: number;   // 0-1
}

export interface Strength {
  name: string;
  score: number; // 0-100
  rank: number;  // 1-5
}

export interface DerivedTraits {
  stress_resilience: number;    // 0-100
  optimism: number;             // 0-100
  flow_tendency: number;        // 0-100
  collaboration_preference: number; // 0-100
  structure_need: number;       // 0-100
  energy_baseline: number;      // 0-100
  recovery_speed: number;       // 0-100
  risk_tolerance: number;       // 0-100
}

export interface PersonalityProfile {
  user_id: string;
  last_updated: number;
  big_five: BigFive;
  mbti: MBTI;
  disc: DISC;
  enneagram: Enneagram;
  genius: GeniusProfile;
  strengths: Strength[];
  derived: DerivedTraits;
  questions_answered: number;
  assessment_progress: number; // 0-100
  last_question_date?: string;
}

// Personality Question
export type QuestionFramework = 'big_five' | 'mbti' | 'disc' | 'enneagram' | 'genius' | 'strengths';
export type QuestionType = 'direct_assessment' | 'situational' | 'forced_choice' | 'contextual' | 'self_perception';
export type ResponseType = 'likert_5' | 'likert_7' | 'multiple_choice' | 'ranking';

export interface PersonalityQuestion {
  question_id: string;
  framework: QuestionFramework;
  dimension: string;
  question_text: string;
  question_type: QuestionType;
  response_type: ResponseType;
  options?: string[];
  scoring?: Record<string, number>;
  reverse_scored: boolean;
  related_questions?: string[];
  minimum_confidence_threshold?: number;
  priority_level: 'low' | 'medium' | 'high';
}

export interface PersonalityResponse {
  response_id: string;
  user_id: string;
  timestamp: number;
  question_id: string;
  framework: QuestionFramework;
  dimension: string;
  question_text: string;
  response: any;
  response_time_seconds: number;
  confidence_change: number;
  profile_change: Partial<PersonalityProfile>;
}

// Flow State
export type FlowLevel = 'deep_flow' | 'flow' | 'near_flow' | 'not_in_flow';

export interface FlowSession {
  session_id: string;
  user_id: string;
  start_time: number;
  end_time?: number;
  duration_minutes?: number;
  flow_level: FlowLevel;
  flow_quality: number; // 0-1
  peak_flow_score: number; // 0-1
  activity_type?: string;
  task_description?: string;
  task_complexity?: 'low' | 'medium' | 'high';
  mood_start: VAD;
  mood_end?: VAD;
  mood_samples: Array<{
    timestamp: number;
    vad: VAD;
    flow_score: number;
  }>;
  interruptions: Array<{
    timestamp: number;
    type: string;
    impact: 'minor' | 'moderate' | 'severe';
  }>;
  completed: boolean;
  satisfaction_rating?: number; // 1-5
  productivity_rating?: number; // 1-5
  energy_change: number; // -1 to +1
  environment?: {
    location?: string;
    noise_level?: string;
    temperature?: number;
    time_of_day: 'morning' | 'midday' | 'afternoon' | 'evening';
  };
}

// Interventions
export type InterventionType = 'breathing' | 'eye_exercise' | 'physical' | 'cognitive' | 'break';

export interface Intervention {
  intervention_id: string;
  user_id: string;
  timestamp: number;
  type: InterventionType;
  subtype?: string;
  triggered_by: 'user' | 'auto' | 'scheduled';
  reason?: string;
  mood_before: VAD;
  started: boolean;
  started_at?: number;
  completed: boolean;
  completed_at?: number;
  duration_seconds?: number;
  mood_after?: VAD;
  effectiveness?: number; // -1 to +1
  user_rating?: number; // 1-5
  user_feedback?: string;
  flow_achieved_after?: boolean;
  next_intervention_delay?: number;
}

export interface InterventionTemplate {
  template_id: string;
  name: string;
  type: InterventionType;
  description: string;
  instructions: string[];
  duration_seconds: number;
  difficulty: 'easy' | 'moderate' | 'advanced';
  avg_effectiveness: number;
  usage_count: number;
  completion_rate: number;
  best_for_personality?: {
    big_five?: Partial<BigFive>;
    mbti?: Partial<MBTI>;
    disc?: Partial<DISC>;
    derived?: Partial<DerivedTraits>;
  };
  best_for_mood?: Partial<VAD>;
  contraindications?: string[];
}

// Scored intervention for recommendations
export interface ScoredIntervention {
  template: InterventionTemplate;
  score: number;
  reasons: string[];
}

// User
export interface User {
  user_id: string;
  email?: string;
  created_at: number;
  last_active: number;
  settings: UserSettings;
  onboarding_completed: boolean;
  onboarding_step: number;
  days_active: number;
}

export interface UserSettings {
  timezone: string;
  notification_preferences: {
    mood_check_frequency: number; // minutes
    intervention_suggestions: boolean;
    flow_mode_protection: boolean;
    daily_personality_question: boolean;
  };
  privacy: {
    enable_sync: boolean;
    share_anonymous_data: boolean;
    share_with_manager: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'auto';
    character_design: string;
    dashboard_layout: string;
  };
}

// Knowledge Graph Types
export interface GraphNode {
  id: string;
  type: 'mood' | 'personality_trait' | 'flow_state' | 'intervention' | 'context' | 'skill' | 'role';
  label: string;
  properties: Record<string, any>;
  created_at: number;
  updated_at: number;
}

export interface GraphEdge {
  id: string;
  source: string; // node id
  target: string; // node id
  type: 'causes' | 'correlates_with' | 'leads_to' | 'triggers' | 'requires' | 'improves' | 'belongs_to';
  weight: number; // 0-1 (strength of relationship)
  properties: Record<string, any>;
  created_at: number;
  updated_at: number;
}

export interface KnowledgeGraph {
  user_id: string;
  nodes: Map<string, GraphNode>;
  edges: Map<string, GraphEdge>;
  last_updated: number;
}

// Revolutionary Personality CV Types
export interface PersonalityCV {
  cv_id: string;
  user_id: string;
  created_at: number;
  last_updated: number;

  // Core personality data
  personality_profile: PersonalityProfile;

  // Flow patterns (what triggers flow)
  flow_triggers: FlowTrigger[];

  // Energy map (what energizes vs drains)
  energy_map: {
    energizing_activities: EnergyActivity[];
    draining_activities: EnergyActivity[];
  };

  // Role fit scores
  role_fit_history: RoleFitScore[];

  // Verification
  data_verified: boolean;
  verification_days: number; // Days of actual data collected
  confidence_score: number; // 0-100

  // Summary
  summary: {
    top_genius_types: GeniusType[];
    ideal_work_style: string;
    optimal_team_size: 'solo' | 'small' | 'medium' | 'large';
    autonomy_preference: 'high' | 'medium' | 'low';
    structure_preference: 'high' | 'medium' | 'low';
  };
}

export interface FlowTrigger {
  activity_type: string;
  task_description: string;
  complexity_level: 'low' | 'medium' | 'high';
  avg_flow_score: number; // 0-1
  frequency: number; // How often this triggers flow
  conditions: {
    time_of_day?: 'morning' | 'midday' | 'afternoon' | 'evening';
    team_size?: number;
    autonomy_level?: 'high' | 'medium' | 'low';
    environment?: string;
  };
}

export interface EnergyActivity {
  activity: string;
  energy_impact: number; // -1 (draining) to +1 (energizing)
  frequency: number; // How often encountered
  duration_preference: string; // e.g., "15-30 min", "1-2 hours"
  ideal_time_of_day?: 'morning' | 'midday' | 'afternoon' | 'evening';
}

export interface RoleFitScore {
  role_id: string;
  role_title: string;
  overall_score: number; // 0-100
  component_scores: {
    personality_fit: number; // 0-100
    genius_fit: number; // 0-100
    flow_fit: number; // 0-100
    energy_fit: number; // 0-100
    skills_fit: number; // 0-100
  };
  match_quality: 'perfect' | 'excellent' | 'good' | 'moderate' | 'poor';
  calculated_at: number;
}

// Job Role Archetype
export interface RoleArchetype {
  role_id: string;
  title: string;
  category: 'engineering' | 'design' | 'product' | 'data' | 'marketing' | 'sales' | 'operations' | 'leadership';
  description: string;

  // Personality requirements
  required_genius: {
    primary: GeniusType[];
    secondary: GeniusType[];
  };

  ideal_big_five: {
    openness: { min: number; max: number; weight: number };
    conscientiousness: { min: number; max: number; weight: number };
    extraversion: { min: number; max: number; weight: number };
    agreeableness: { min: number; max: number; weight: number };
    neuroticism: { min: number; max: number; weight: number };
  };

  mbti_preferences: {
    EI?: 'E' | 'I' | 'neutral';
    SN?: 'S' | 'N' | 'neutral';
    TF?: 'T' | 'F' | 'neutral';
    JP?: 'J' | 'P' | 'neutral';
  };

  // Flow requirements
  flow_triggers_needed: string[];

  // Energy requirements
  energy_profile: {
    high_energy_tasks: string[];
    low_energy_tasks: string[];
    autonomy_level: 'high' | 'medium' | 'low';
    collaboration_level: 'high' | 'medium' | 'low';
  };

  // Task breakdown
  typical_tasks: {
    task: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    complexity: 'low' | 'medium' | 'high';
    energy_requirement: 'low' | 'medium' | 'high';
  }[];

  // Derived traits importance
  derived_traits_weight: {
    stress_resilience: number; // 0-1
    optimism: number;
    flow_tendency: number;
    collaboration_preference: number;
    structure_need: number;
    energy_baseline: number;
    recovery_speed: number;
    risk_tolerance: number;
  };
}

// Job Requirement (for matching)
export interface JobRequirement {
  job_id: string;
  title: string;
  company?: string;
  role_archetype_id: string;

  // Customizations to the archetype
  custom_personality_weights?: Partial<RoleArchetype['ideal_big_five']>;
  custom_genius_weights?: { primary: number; secondary: number };

  // Team context
  team_size: number;
  team_personality_balance?: {
    current_team_profile: Partial<PersonalityProfile>;
    needed_balance: string[];
  };

  // Additional requirements
  min_confidence_score?: number;
  min_verification_days?: number;
}

// Job Match Result
export interface JobMatchResult {
  job_id: string;
  cv_id: string;
  match_score: number; // 0-100
  match_quality: 'perfect' | 'excellent' | 'good' | 'moderate' | 'poor';

  component_scores: {
    personality_match: number;
    genius_match: number;
    flow_match: number;
    energy_match: number;
    team_fit: number;
  };

  // Explanation
  strengths: string[];
  concerns: string[];
  growth_areas: string[];

  // Compatibility insights
  compatibility_explanation: string;
  team_balance_impact?: string;

  calculated_at: number;
}
