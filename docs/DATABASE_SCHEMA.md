# GreenBlu.ai - Database Schema

## Table of Contents
- [1. Storage Strategy](#1-storage-strategy)
- [2. Core Schemas](#2-core-schemas)
- [3. Relationships](#3-relationships)
- [4. Data Retention](#4-data-retention)
- [5. Privacy & Security](#5-privacy--security)
- [6. Migration Strategy](#6-migration-strategy)

## 1. Storage Strategy

### 1.1 MVP Storage (Phase 1)

**Chrome Extension Local Storage**:
- **Chrome Storage API**: Settings, lightweight data
- **IndexedDB**: Structured data, mood history, personality
- **Google Sheets API** (optional sync): Backup, team analytics

**Rationale**:
- Privacy-first (data stays local)
- No backend required initially
- Fast development
- Offline-capable

### 1.2 Production Storage (Phase 2+)

**Hybrid Approach**:
- **Local (IndexedDB)**: Real-time data, predictions, sensitive info
- **Cloud (Firestore/Supabase)**: Sync, backup, team features
- **Analytics (BigQuery)**: Aggregate insights, ML training

**Benefits**:
- Best of both worlds (privacy + sync)
- Scalable for team features
- Federated learning support

## 2. Core Schemas

### 2.1 User Profile

**users**
```typescript
interface User {
  // Identity
  user_id: string;              // UUID
  email?: string;               // Optional (for sync)
  created_at: timestamp;
  last_active: timestamp;

  // Settings
  settings: {
    timezone: string;
    notification_preferences: {
      mood_check_frequency: number;     // minutes
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
  };

  // Onboarding
  onboarding_completed: boolean;
  onboarding_step: number;
  days_active: number;
}
```

### 2.2 Mood Tracking

**mood_entries**
```typescript
interface MoodEntry {
  // Identity
  entry_id: string;             // UUID
  user_id: string;              // FK to users
  timestamp: timestamp;

  // VAD Model
  vad: {
    valence: number;            // -1 to +1
    arousal: number;            // -1 to +1
    dominance: number;          // -1 to +1
  };

  // Context
  context: {
    circadian_phase: number;    // Hours since wake-up
    weather?: {
      temperature: number;
      condition: string;        // 'sunny', 'cloudy', 'rainy'
      pressure: number;
    };
    activity?: string;          // 'coding', 'meeting', 'break'
    location?: string;          // 'office', 'home', 'cafe'
    energy_level: number;       // 1-5 scale
  };

  // Optional inputs
  note?: string;                // User comment
  tags?: string[];              // User-defined tags

  // Derived
  flow_probability: number;     // 0-1, calculated
  predicted_next: {             // AI predictions
    '1h': VAD;
    '4h': VAD;
    '8h': VAD;
  };
}

type VAD = {
  valence: number;
  arousal: number;
  dominance: number;
  confidence: number;
};
```

**circadian_data**
```typescript
interface CircadianEntry {
  entry_id: string;
  user_id: string;
  date: date;                   // YYYY-MM-DD

  wake_time: time;              // HH:MM
  sleep_time?: time;            // Optional
  sleep_quality?: number;       // 1-5 scale

  // Derived
  chronotype?: 'lark' | 'owl' | 'intermediate';
  optimal_windows: {
    peak_energy: TimeRange;
    creative_peak: TimeRange;
    analytical_peak: TimeRange;
  };
}

type TimeRange = {
  start: time;
  end: time;
};
```

### 2.3 Personality Profile

**personality_profiles**
```typescript
interface PersonalityProfile {
  user_id: string;              // PK, FK to users
  last_updated: timestamp;

  // Big Five (OCEAN)
  big_five: {
    openness: number;           // 0-100
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
    confidence: {               // Confidence scores
      openness: number;         // 0-1
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    };
  };

  // MBTI
  mbti: {
    EI: number;                 // -100 (I) to +100 (E)
    SN: number;                 // -100 (S) to +100 (N)
    TF: number;                 // -100 (T) to +100 (F)
    JP: number;                 // -100 (J) to +100 (P)
    type?: string;              // 'INTJ', 'ENFP', etc.
    confidence: number;         // 0-1
  };

  // DISC
  disc: {
    dominance: number;          // 0-100
    influence: number;
    steadiness: number;
    conscientiousness: number;
    confidence: number;
  };

  // Enneagram
  enneagram: {
    type_scores: number[];      // [type1, type2, ..., type9]
    primary_type?: number;      // 1-9
    wing?: number;              // 1-9
    confidence: number;
  };

  // Genius Types
  genius: {
    wonder: number;             // 0-100
    invention: number;
    discernment: number;
    galvanizing: number;
    enablement: number;
    tenacity: number;
    primary: string;            // 'wonder', 'invention', etc.
    secondary: string;
    confidence: number;
  };

  // StrengthsFinder (top 5)
  strengths: Array<{
    name: string;               // 'Strategic', 'Achiever', etc.
    score: number;              // 0-100
    rank: number;               // 1-5
  }>;

  // Derived Traits
  derived: {
    stress_resilience: number;  // 0-100
    optimism: number;
    flow_tendency: number;
    collaboration_preference: number;
    structure_need: number;
    energy_baseline: number;
    recovery_speed: number;
    risk_tolerance: number;
  };

  // Metadata
  questions_answered: number;
  assessment_progress: number;  // 0-100%
  last_question_date: date;
}
```

**personality_responses**
```typescript
interface PersonalityResponse {
  response_id: string;
  user_id: string;
  timestamp: timestamp;

  question_id: string;
  framework: 'big_five' | 'mbti' | 'disc' | 'enneagram' | 'genius';
  dimension: string;            // e.g., 'openness', 'EI'

  question_text: string;
  response: any;                // Could be number, string, or object
  response_time_seconds: number;

  // Impact
  confidence_change: number;    // How much confidence increased
  profile_change: object;       // What changed in profile
}
```

### 2.4 Flow State Tracking

**flow_sessions**
```typescript
interface FlowSession {
  session_id: string;
  user_id: string;

  // Timing
  start_time: timestamp;
  end_time?: timestamp;
  duration_minutes?: number;

  // Flow metrics
  flow_level: 'micro' | 'standard' | 'deep';
  flow_quality: number;         // 0-1 average during session
  peak_flow_score: number;      // 0-1 maximum

  // Context
  activity_type?: string;       // 'coding', 'design', 'writing'
  task_description?: string;
  task_complexity?: 'low' | 'medium' | 'high';

  // Mood during flow
  mood_start: VAD;
  mood_end: VAD;
  mood_samples: Array<{
    timestamp: timestamp;
    vad: VAD;
    flow_score: number;
  }>;

  // Interruptions
  interruptions: Array<{
    timestamp: timestamp;
    type: string;               // 'notification', 'meeting', 'break'
    impact: 'minor' | 'moderate' | 'severe';
  }>;

  // Outcome
  completed: boolean;
  satisfaction_rating?: number; // 1-5
  productivity_rating?: number; // 1-5
  energy_change: number;        // -1 to +1

  // Environment
  environment: {
    location?: string;
    noise_level?: string;
    temperature?: number;
    time_of_day: 'morning' | 'midday' | 'afternoon' | 'evening';
  };
}
```

**flow_triggers**
```typescript
interface FlowTrigger {
  trigger_id: string;
  user_id: string;

  trigger_name: string;         // 'technical_challenge', 'quiet_environment'
  trigger_type: 'activity' | 'environment' | 'psychological' | 'social';

  effectiveness: number;        // 0-1 (how often it leads to flow)
  frequency_used: number;       // Times encountered
  last_used: timestamp;

  // Personalization
  personality_correlation: number; // How well it matches personality
  optimal_conditions: string[];    // When this trigger works best
}
```

### 2.5 Interventions

**interventions**
```typescript
interface Intervention {
  intervention_id: string;
  user_id: string;
  timestamp: timestamp;

  // Type
  type: 'breathing' | 'eye_exercise' | 'physical' | 'cognitive' | 'break';
  subtype?: string;             // e.g., '4-7-8 breathing', 'palming'

  // Context
  triggered_by: 'user' | 'auto' | 'scheduled';
  reason?: string;              // Why suggested: 'low_energy', 'stress_detected'
  mood_before: VAD;

  // Execution
  started: boolean;
  started_at?: timestamp;
  completed: boolean;
  completed_at?: timestamp;
  duration_seconds?: number;

  // Outcome
  mood_after?: VAD;
  effectiveness?: number;       // -1 to +1 mood improvement
  user_rating?: number;         // 1-5 stars
  user_feedback?: string;

  // Follow-up
  flow_achieved_after?: boolean;
  next_intervention_delay?: number; // Minutes until next suggestion
}
```

**intervention_templates**
```typescript
interface InterventionTemplate {
  template_id: string;
  name: string;
  type: string;
  description: string;

  // Content
  instructions: string[];       // Step-by-step
  duration_seconds: number;
  difficulty: 'easy' | 'moderate' | 'advanced';

  // Effectiveness (aggregate)
  avg_effectiveness: number;
  usage_count: number;
  completion_rate: number;

  // Personalization
  best_for_personality: object; // Which traits benefit most
  best_for_mood: object;        // Which moods it helps
  contraindications?: string[]; // When not to use
}
```

### 2.6 Job Crafting

**role_fit_analyses**
```typescript
interface RoleFitAnalysis {
  analysis_id: string;
  user_id: string;
  timestamp: timestamp;

  current_role: string;
  analyzed_roles: Array<{
    role_name: string;
    fit_score: number;          // 0-100
    component_scores: {
      personality: number;
      genius: number;
      flow: number;
      energy: number;
      skills: number;
    };
    reasoning: string;
    recommendations: string[];
  }>;

  // Career paths
  suggested_paths: Array<{
    path_name: string;
    fit_score: number;
    timeline: string;
    next_steps: string[];
  }>;

  // Task analysis
  task_energy_map: {
    energizing: Activity[];
    neutral: Activity[];
    manageable: Activity[];
    draining: Activity[];
  };
}

type Activity = {
  name: string;
  energy_delta: number;
  flow_frequency: number;
  time_spent_percentage: number;
};
```

**team_analytics** (future feature)
```typescript
interface TeamAnalytics {
  team_id: string;
  team_name: string;
  manager_id: string;
  timestamp: timestamp;

  // Members (anonymized)
  members: Array<{
    member_id: string;          // Anonymized
    role: string;
    genius_primary: string;
    personality_archetype: string;
  }>;

  // Balance analysis
  genius_distribution: {
    wonder: number;
    invention: number;
    discernment: number;
    galvanizing: number;
    enablement: number;
    tenacity: number;
  };

  // Energy & flow
  team_energy_curve: Array<{
    hour: number;
    avg_energy: number;
    flow_probability: number;
  }>;

  optimal_meeting_times: TimeRange[];
  collaboration_pairs: Array<{
    member_a_id: string;
    member_b_id: string;
    synergy_score: number;
    recommended_projects: string[];
  }>;

  // Health metrics
  burnout_risk: number;         // 0-1
  satisfaction_score: number;   // 0-100
  flow_frequency: number;       // Weekly avg
  retention_risk: number;       // 0-1
}
```

### 2.7 ML Models & Predictions

**model_metadata**
```typescript
interface ModelMetadata {
  user_id: string;
  model_type: 'lstm' | 'xgboost' | 'knn' | 'baseline';

  // Version
  version: string;
  trained_at: timestamp;
  last_updated: timestamp;

  // Performance
  metrics: {
    mae: number;                // Mean absolute error
    rmse: number;               // Root mean squared error
    r2_score: number;           // R-squared
    confidence: number;         // 0-1
  };

  // Training data
  training_samples: number;
  days_of_data: number;
  last_training_data_date: date;

  // Model file
  model_blob?: Blob;            // Serialized model (local only)
  model_url?: string;           // Cloud storage URL
}
```

**prediction_logs**
```typescript
interface PredictionLog {
  log_id: string;
  user_id: string;
  prediction_timestamp: timestamp;

  // Input features
  features: object;             // All features used

  // Predictions
  predictions: {
    '1h': VAD;
    '4h': VAD;
    '8h': VAD;
  };

  model_versions: {
    lstm: string;
    xgboost: string;
    knn: string;
    baseline: string;
  };

  ensemble_weights: number[];

  // Validation (after time passes)
  actual_values?: {
    '1h': VAD;
    '4h': VAD;
    '8h': VAD;
  };
  prediction_errors?: {
    '1h': number;
    '4h': number;
    '8h': number;
  };
}
```

### 2.8 Analytics & Insights

**user_insights**
```typescript
interface UserInsights {
  user_id: string;
  insight_type: string;
  generated_at: timestamp;

  // Insight content
  title: string;
  description: string;
  importance: 'low' | 'medium' | 'high';
  category: 'mood' | 'flow' | 'personality' | 'career' | 'productivity';

  // Data
  supporting_data: object;
  visualizations?: string[];    // Chart config or URLs

  // Actions
  recommendations: string[];
  action_items: Array<{
    action: string;
    estimated_impact: number;   // 0-1
    difficulty: 'easy' | 'moderate' | 'hard';
  }>;

  // Engagement
  viewed: boolean;
  viewed_at?: timestamp;
  dismissed: boolean;
  acted_upon: boolean;
  user_feedback?: string;
}
```

**weekly_summaries**
```typescript
interface WeeklySummary {
  user_id: string;
  week_start: date;
  week_end: date;

  // Mood trends
  mood_stats: {
    avg_valence: number;
    avg_arousal: number;
    avg_dominance: number;
    mood_volatility: number;
    trend: 'improving' | 'declining' | 'stable';
  };

  // Flow
  flow_stats: {
    total_flow_hours: number;
    flow_sessions: number;
    avg_flow_quality: number;
    best_flow_day: date;
    best_flow_time: string;
  };

  // Productivity
  productivity_stats: {
    total_work_hours: number;
    deep_work_hours: number;
    meetings_hours: number;
    break_quality: number;
  };

  // Personality progress
  personality_progress: {
    questions_answered: number;
    confidence_improvement: number;
    new_insights: string[];
  };

  // Recommendations
  next_week_suggestions: string[];
  habits_to_try: string[];
}
```

## 3. Relationships

### 3.1 Entity Relationship Diagram

```
users (1) ──< (many) mood_entries
users (1) ──< (many) circadian_data
users (1) ──── (1) personality_profiles
users (1) ──< (many) personality_responses
users (1) ──< (many) flow_sessions
users (1) ──< (many) flow_triggers
users (1) ──< (many) interventions
users (1) ──< (many) role_fit_analyses
users (1) ──< (many) user_insights
users (1) ──< (many) weekly_summaries

personality_profiles (1) ──< (many) personality_responses
flow_sessions (1) ──< (many) mood_entries (during session)
interventions (many) ──> (1) intervention_templates

team_analytics (1) ──< (many) users (team members)
```

### 3.2 Indexes

**Critical Indexes**:
```sql
-- mood_entries
CREATE INDEX idx_mood_user_timestamp ON mood_entries(user_id, timestamp DESC);
CREATE INDEX idx_mood_flow ON mood_entries(user_id, flow_probability DESC);

-- flow_sessions
CREATE INDEX idx_flow_user_date ON flow_sessions(user_id, start_time DESC);
CREATE INDEX idx_flow_quality ON flow_sessions(user_id, flow_quality DESC);

-- personality_responses
CREATE INDEX idx_personality_user_date ON personality_responses(user_id, timestamp DESC);

-- interventions
CREATE INDEX idx_interventions_user_date ON interventions(user_id, timestamp DESC);
CREATE INDEX idx_interventions_effectiveness ON interventions(user_id, effectiveness DESC);

-- predictions
CREATE INDEX idx_predictions_timestamp ON prediction_logs(user_id, prediction_timestamp DESC);
```

## 4. Data Retention

### 4.1 Retention Policies

**Local Storage (IndexedDB)**:
- **Mood entries**: 90 days (rolling window)
- **Flow sessions**: 90 days
- **Personality data**: Permanent (until user deletes)
- **Predictions**: 30 days
- **Interventions**: 90 days
- **Insights**: 30 days (archived after)

**Cloud Storage** (if enabled):
- **All data**: Indefinite (user-controlled)
- **Backups**: Daily for 30 days, weekly for 1 year
- **Exports**: On-demand, stored 7 days

### 4.2 Archival Strategy

**Old Data Management**:
```typescript
// Archive data older than 90 days to compressed format
interface ArchivedData {
  user_id: string;
  archive_date: date;
  date_range: {
    start: date;
    end: date;
  };

  // Compressed data
  mood_summary: {
    daily_averages: Array<{date: date, vad: VAD}>;
    weekly_stats: object;
  };

  flow_summary: {
    total_hours: number;
    avg_quality: number;
    best_times: string[];
  };

  // Full data (compressed)
  full_data_blob?: Blob;        // Gzipped JSON
}
```

## 5. Privacy & Security

### 5.1 Encryption

**Local Storage**:
```typescript
// Encrypt sensitive data before storing
interface EncryptedData {
  encrypted: string;            // AES-256 encrypted
  iv: string;                   // Initialization vector
  version: number;              // Encryption version
}

// Key management
// - Derived from user's Google account (if signed in)
// - Or stored in Chrome's secure storage
// - Never transmitted to server
```

**Cloud Storage**:
- **At rest**: AES-256 encryption
- **In transit**: TLS 1.3
- **Keys**: Managed by cloud provider (Google KMS, AWS KMS)

### 5.2 Anonymization

**Team Analytics**:
```typescript
// Anonymize user data for team insights
interface AnonymizedUser {
  anonymous_id: string;         // One-way hash
  role: string;
  genius_primary: string;
  personality_archetype: string; // Simplified

  // NO personal identifiers
  // NO specific mood values
  // ONLY aggregate patterns
}
```

### 5.3 Access Control

**Permissions**:
```typescript
interface DataPermissions {
  user_id: string;

  // Who can see what
  permissions: {
    self: ['all'];              // User sees everything
    manager: string[];          // Requires opt-in
    hr: string[];               // Aggregate only
    team: string[];             // Anonymized patterns
  };

  // Audit log
  access_log: Array<{
    accessor_id: string;
    access_type: string;
    timestamp: timestamp;
    data_accessed: string[];
  }>;
}
```

## 6. Migration Strategy

### 6.1 MVP to Production Migration

**Phase 1: Local Only (Weeks 1-8)**
- IndexedDB for all data
- No sync, no cloud

**Phase 2: Optional Sync (Weeks 9-16)**
- Add cloud storage option
- Migrate local data to cloud (user initiated)
- Bidirectional sync

**Phase 3: Team Features (Weeks 17-24)**
- Team analytics schema
- Manager dashboard
- Anonymized sharing

### 6.2 Schema Versioning

**Version Control**:
```typescript
interface SchemaVersion {
  version: number;
  applied_at: timestamp;
  migrations: Array<{
    name: string;
    description: string;
    up: Function;               // Migration function
    down: Function;             // Rollback function
  }>;
}

// Example migration
const migrations = [
  {
    version: 2,
    name: 'add_genius_types',
    description: 'Add genius personality types to profile',
    up: async (db) => {
      // Add genius field to personality_profiles
      const profiles = await db.personality_profiles.getAll();
      for (const profile of profiles) {
        profile.genius = {
          wonder: 0, invention: 0, discernment: 0,
          galvanizing: 0, enablement: 0, tenacity: 0,
          primary: null, secondary: null, confidence: 0
        };
        await db.personality_profiles.put(profile);
      }
    },
    down: async (db) => {
      // Remove genius field
      const profiles = await db.personality_profiles.getAll();
      for (const profile of profiles) {
        delete profile.genius;
        await db.personality_profiles.put(profile);
      }
    }
  }
];
```

### 6.3 Data Export/Import

**Export Format** (JSON):
```typescript
interface DataExport {
  export_version: string;
  export_date: timestamp;
  user_id: string;

  data: {
    profile: User;
    personality: PersonalityProfile;
    mood_history: MoodEntry[];
    flow_sessions: FlowSession[];
    interventions: Intervention[];
    // ... all user data
  };

  metadata: {
    total_records: number;
    date_range: {start: date, end: date};
    data_types: string[];
  };
}
```

## 7. Implementation with IndexedDB

### 7.1 Database Setup

```typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface GreenBluDB extends DBSchema {
  users: {
    key: string;
    value: User;
  };
  mood_entries: {
    key: string;
    value: MoodEntry;
    indexes: {
      'by-user-date': [string, number];
      'by-flow': [string, number];
    };
  };
  personality_profiles: {
    key: string;
    value: PersonalityProfile;
  };
  flow_sessions: {
    key: string;
    value: FlowSession;
    indexes: {
      'by-user-date': [string, number];
    };
  };
  interventions: {
    key: string;
    value: Intervention;
    indexes: {
      'by-user-date': [string, number];
    };
  };
  // ... other stores
}

async function initDB(): Promise<IDBPDatabase<GreenBluDB>> {
  return openDB<GreenBluDB>('greenblu-db', 1, {
    upgrade(db) {
      // Create object stores
      db.createObjectStore('users', { keyPath: 'user_id' });

      const moodStore = db.createObjectStore('mood_entries', {
        keyPath: 'entry_id'
      });
      moodStore.createIndex('by-user-date', ['user_id', 'timestamp']);
      moodStore.createIndex('by-flow', ['user_id', 'flow_probability']);

      const flowStore = db.createObjectStore('flow_sessions', {
        keyPath: 'session_id'
      });
      flowStore.createIndex('by-user-date', ['user_id', 'start_time']);

      // ... create other stores
    }
  });
}
```

### 7.2 CRUD Operations

```typescript
class DataService {
  private db: IDBPDatabase<GreenBluDB>;

  async addMoodEntry(entry: MoodEntry): Promise<void> {
    await this.db.add('mood_entries', entry);

    // Clean up old entries (>90 days)
    await this.cleanupOldMoodEntries(entry.user_id);
  }

  async getMoodHistory(
    userId: string,
    days: number = 30
  ): Promise<MoodEntry[]> {
    const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);

    const entries = await this.db.getAllFromIndex(
      'mood_entries',
      'by-user-date',
      IDBKeyRange.bound([userId, cutoffDate], [userId, Date.now()])
    );

    return entries;
  }

  async updatePersonalityProfile(
    userId: string,
    updates: Partial<PersonalityProfile>
  ): Promise<void> {
    const profile = await this.db.get('personality_profiles', userId);
    if (profile) {
      Object.assign(profile, updates);
      profile.last_updated = Date.now();
      await this.db.put('personality_profiles', profile);
    }
  }

  private async cleanupOldMoodEntries(userId: string): Promise<void> {
    const cutoffDate = Date.now() - (90 * 24 * 60 * 60 * 1000);
    const tx = this.db.transaction('mood_entries', 'readwrite');
    const index = tx.store.index('by-user-date');

    let cursor = await index.openCursor(
      IDBKeyRange.bound([userId, 0], [userId, cutoffDate])
    );

    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }

    await tx.done;
  }
}
```

---

**Implementation Priority**:
1. **Phase 1**: Users, MoodEntries, PersonalityProfiles
2. **Phase 2**: FlowSessions, Interventions
3. **Phase 3**: JobCrafting, Analytics
4. **Phase 4**: TeamAnalytics, Cloud Sync
