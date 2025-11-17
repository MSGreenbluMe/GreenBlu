# GreenBlu.ai - Product Requirements Document (PRD)

## Table of Contents
- [2.1 Product Overview](#21-product-overview)
- [2.2 User Personas](#22-user-personas)
- [2.3 Core Features](#23-core-features)
- [2.4 MVP Features vs. Future Enhancements](#24-mvp-features-vs-future-enhancements)
- [2.5 User Requirements](#25-user-requirements)
- [2.6 Success Metrics](#26-success-metrics)

## 2.1 Product Overview

GreenBlu.ai is an AI-powered wellbeing and productivity Chrome extension inspired by "Chobotničky z druhého poschodia" (a Czechoslovakian TV series). It helps employees improve their wellbeing through continuous monitoring of mood, personalized interventions, and data-driven insights while providing valuable team analytics for managers.

### 2.1.1 Ultimate Goal: Achieving Flow State

**Primary Objective**: Guide users into FLOW state—a mental state of complete immersion and energized focus—to maximize productivity while preventing exhaustion and burnout.

**Key Differentiators**:
1. **Predictive Mood Intelligence**: AI predicts mood trajectory using VAD model, circadian rhythms, personality traits, weather, and behavioral patterns
2. **Progressive Personality Profiling**: Non-intrusive daily micro-assessments (1-2 questions) build comprehensive personality profiles over 60-90 days
3. **Flow State Optimization**: Real-time flow detection and protection, personalized flow triggers, and intervention timing
4. **Job Crafting Intelligence**: Data-driven role-fit analysis and career recommendations based on genius personality types and flow patterns

### 2.1.2 How It Works

**Three-Phase Approach**:
1. **Flow Preparation**: Create optimal conditions for flow entry through personalized recommendations
2. **Flow Protection**: Detect and maintain flow states, suppress interruptions, adapt interventions
3. **Flow Recovery**: Guide users through post-flow recovery to prevent burnout

**Intelligence Loop**:
```
Mood Tracking → Personality Learning → Behavior Analysis →
Mood Prediction → Flow Detection → Smart Interventions →
Feedback Collection → Model Improvement → (repeat)
```

## 2.2 User Personas

### Individual Knowledge Worker
- Primary user working 6+ hours on computer
- Experiences stress, eye strain, and varying energy levels
- Values work-life balance and personal productivity
- Wants unobtrusive, helpful wellbeing support

### Team Manager
- Responsible for team wellbeing and productivity
- Seeks data-driven insights for team optimization
- Wants to optimize meeting schedules
- Values team harmony and preventing burnout

### HR Professional
- Oversees company-wide wellbeing initiatives
- Looks for aggregate data and trends
- Needs metrics to measure program effectiveness
- Values employee retention and satisfaction

## 2.3 Core Features

### 2.3.1 Mood Tracking & Prediction (VAD Model)

**Description:** Capture emotional state using Valence-Arousal-Dominance model and predict future mood trajectory

**User Value:** Science-backed mood tracking with AI-powered predictions to anticipate and prevent stress before it happens

**Requirements:**
- Simple, intuitive interface for mood selection
- Energy/arousal level slider
- Optional context input
- Visual character representation that reflects mood state
- Maximum 15 seconds completion time per check

**AI Prediction Features**:
- Predict mood at 1h, 4h, and 8h intervals
- Multi-model ensemble (LSTM, XGBoost, k-NN, baseline)
- Confidence scoring for all predictions
- Real-time adaptation to user patterns
- Proactive intervention suggestions based on predictions

**Flow State Mapping**:
- Flow zone: V[+0.6 to +0.9], A[+0.5 to +0.8], D[+0.7 to +1.0]
- Real-time flow probability calculation
- Flow level classification (Deep Flow, Flow, Near Flow, Not in Flow)
- Flow protection during detected flow states

### 2.3.2 Circadian Rhythm Tracking

**Description:** Daily input of wake-up time with weather correlation

**User Value:** Personalized productivity window recommendations

**Requirements:**
- Morning check-in notification
- Simple time input
- Integration with weather API
- Visualization of energy curve
- Optimal timing recommendations

### 2.3.3 Intervention Modules

**Description:** Curated wellbeing exercises and activities

**User Value:** Quick, effective tools to manage stress and energy

**Requirements:**
- Breathing exercises (3 patterns, 2-5 minutes)
- Eye exercises (palming, movement exercises, 1-3 minutes)
- Physical exercises (desk stretches, 2-4 minutes)
- Cognitive mini-games (1-3 minutes)
- Visual guides and timers
- Success tracking and statistics

### 2.3.4 Behavioral Analysis

**Description:** Non-intrusive monitoring of work patterns

**User Value:** Insight into stress and focus without manual input

**Requirements:**
- Mouse movement analysis
- Activity pattern monitoring
- Privacy controls and transparency
- Stress level indicators
- Actionable recommendations

### 2.3.5 Team Analytics Dashboard

**Description:** Visualization of team energy and optimal collaboration times

**User Value:** Data-driven team management decisions

**Requirements:**
- Team energy flow visualization
- Synchronization of circadian rhythms
- Optimal meeting time recommendations
- Anonymous data aggregation
- Early risk detection (burnout, etc.)

### 2.3.6 Personality Testing Framework

**Description:** Progressive personality profiling through daily micro-assessments

**User Value:** Deep self-understanding without overwhelming questionnaires, enabling personalized recommendations

**Requirements:**
- 1-2 questions per day (< 30 seconds)
- Multi-framework integration (Big Five, MBTI, DISC, Enneagram, StrengthsFinder)
- Adaptive question selection (information gain algorithm)
- Confidence scoring for each trait
- Profile visualization (radar charts, progress tracking)

**Genius Personality Types**:
- **Wonder**: Strategy, innovation, big-picture thinking
- **Invention**: Problem-solving, creation, technical excellence
- **Discernment**: Analysis, evaluation, pattern recognition
- **Galvanizing**: Leadership, motivation, people development
- **Enablement**: Service, support, facilitating others
- **Tenacity**: Persistence, execution, follow-through

**Progressive Timeline**:
- Week 1-2: Core personality (Big Five)
- Week 3-6: MBTI, DISC, stress responses
- Week 7-12: Enneagram, Genius types, cross-validation
- Ongoing: Refinement and life change adaptation

### 2.3.7 Job Crafting System

**Description:** Data-driven role-fit analysis and career development recommendations

**User Value:** Find optimal career path and role within team based on personality, flow patterns, and strengths

**Requirements:**
- Role-fit scoring for 10+ role archetypes
- Task energy analysis (what energizes vs. drains)
- Genius-type to role mapping
- Career path exploration and recommendations
- Skill gap analysis
- Transition planning tools

**Team Optimization Features**:
- Team genius balance analysis
- Collaboration pairing recommendations
- Optimal role allocation
- Meeting attendance optimization

**Career Development**:
- Multiple career path suggestions (technical, leadership, specialist)
- Growth trajectory predictions
- Skill development roadmap
- Transition timeline and milestones

### 2.3.8 Personalization System

**Description:** AI-powered adaptation to individual preferences and patterns

**User Value:** Increasingly relevant and effective recommendations

**Requirements:**
- Progressive preference learning
- Adaptation to feedback
- Personalized intervention timing based on personality
- Custom notification frequency
- Pattern-based recommendations
- Personality-informed flow triggers
- Role-based intervention strategies

## 2.4 MVP Features vs. Future Enhancements

### MVP (Minimum Viable Product) - Weeks 1-8:
**Core Tracking**:
- VAD mood tracking interface (< 15 sec per entry)
- Morning check-in with wake-up time
- Weather API integration
- Basic circadian rhythm tracking
- IndexedDB local storage

**Flow Detection**:
- Basic flow detection algorithm (VAD + time-based)
- Flow state indicator
- Flow mode (notification suppression)

**Personality**:
- Big Five + MBTI questions (50 questions)
- Daily 1-2 question system
- Basic personality profile visualization

**Interventions**:
- 3 breathing exercises
- 2 eye exercises
- Basic intervention tracking

**Dashboard**:
- Mood history (7-30 days)
- Flow session log
- Personality progress tracker
- Weekly summary

**Target**: 100 beta users, 70% daily active rate

### Phase 2: Intelligence - Weeks 9-16:
**AI/ML Predictions**:
- Baseline + k-NN prediction models
- LSTM time series forecasting
- XGBoost multi-factor model
- Ensemble predictions (1h, 4h, 8h)
- Online learning and adaptation

**Advanced Personality**:
- DISC assessment
- Genius personality types
- Adaptive question selection
- Cross-framework validation

**Smart Interventions**:
- 15+ intervention library
- Intelligent timing optimization
- Effectiveness tracking
- A/B testing framework

**Flow Optimization**:
- Advanced flow detection
- Personalized flow triggers
- Flow preparation checklists
- Post-flow recovery plans

**Target**: 500 active users, prediction MAE < 0.25

### Phase 3: Career & Team - Weeks 17-24:
**Job Crafting**:
- Role-fit analysis (10+ roles)
- Task energy mapping
- Career path recommendations
- Skill gap analysis

**Team Features** (Beta):
- Team genius balance analyzer
- Anonymous team analytics
- Collaboration recommendations
- Manager dashboard (opt-in)

**Advanced Analytics**:
- Weekly/monthly insight reports
- Trend and anomaly detection
- Goal setting and tracking
- Data export (PDF, JSON)

**Target**: 1,000 active users, 50%+ find job crafting helpful

### Phase 4: Scale - Weeks 25-32:
**Cloud & Mobile**:
- Cloud sync (Firebase/Supabase)
- Multi-device support
- Mobile companion app (React Native)
- Push notifications

**Enterprise**:
- Organization management
- SSO (SAML, OIDC)
- Admin dashboard
- Compliance features (GDPR, SOC 2)

**Integrations**:
- Public API (REST/GraphQL)
- Slack integration
- Microsoft Teams integration
- Calendar sync (Google, Outlook)
- Webhooks and developer tools

**Target**: 5,000 active users, 5+ enterprise customers

## 2.5 User Requirements

### Privacy and Data Security
- Clear consent for data collection
- Anonymous aggregation for team data
- Local storage of sensitive information
- Option to delete personal data

### Performance
- Minimal browser resource usage (<5% CPU)
- Quick startup time (<2 seconds)
- Smooth animations (60fps)
- Responsive interface

### Usability
- Non-intrusive notifications
- Minimal workflow disruption
- Quick access to key features
- Clear, simple UI with consistent patterns

### Accessibility
- Color schemes suitable for color blindness
- Screen reader compatibility
- Keyboard navigation
- Adjustable text sizes

## 2.6 Success Metrics

### User Engagement (MVP - Week 8)
- 70% adoption rate among target users
- 70% daily active users
- 3+ mood checks per day per user
- <20% abandonment rate after 30 days
- 4+ star average rating (1-5 scale)

### AI/ML Performance (Phase 2 - Week 16)
- **Prediction Accuracy**: MAE < 0.25 for 1h predictions, < 0.3 for 4h predictions
- **Flow Detection**: 80%+ accuracy (precision & recall)
- **Personality Confidence**: 0.7+ average confidence within 60 days
- **Intervention Completion**: 60%+ completion rate
- **Model Performance**: < 100ms prediction latency, < 5MB model size

### Flow State Optimization
- **Flow Frequency**: 20% increase in weekly flow hours
- **Flow Quality**: Average flow score > 0.7 (scale 0-1)
- **Flow Entry**: Reduce time to flow by 15%
- **Flow Protection**: 90%+ of detected flow states protected from interruptions
- **User Satisfaction**: 80%+ report flow features helpful

### Personality Profiling
- **Question Engagement**: 70%+ answer daily questions
- **Completion Time**: < 30 seconds per question
- **Profile Accuracy**: 75%+ users agree with personality profile
- **Confidence Growth**: Reach 0.7+ confidence on core traits within 60 days
- **Insight Value**: 60%+ find personality insights helpful

### Job Crafting & Career
- **Role Fit Validation**: 70%+ agree with role fit analysis
- **Career Recommendations**: 50%+ find career suggestions helpful
- **Action Rate**: 20%+ take action based on job crafting insights
- **Task Reallocation**: Users report 15% improvement in task satisfaction
- **Career Growth**: Track successful role transitions (qualitative)

### Wellbeing Impact
- **Stress Reduction**: 30% reduction in reported stress levels
- **Energy Levels**: 20% increase in reported energy
- **Work Satisfaction**: 15% improvement in job satisfaction
- **Burnout Prevention**: 25% reduction in burnout indicators
- **Overall Wellbeing**: 40% report improved wellbeing

### Team Performance (Phase 3 - Week 24)
- **Meeting Efficiency**: 20% reduction in meeting inefficiency
- **Team Synchronization**: 15% improvement in collaboration timing
- **Productivity**: 10% increase in reported productivity
- **Retention**: 15% reduction in employee turnover
- **Team Health**: 80%+ team health score (aggregate wellbeing)

### Business Metrics (Phase 4 - Week 32)
- **Active Users**: 5,000+ total, 75%+ daily active
- **Retention**: <10% monthly churn rate
- **NPS Score**: 50+ (Net Promoter Score)
- **Enterprise Customers**: 5+ organizations
- **Revenue**: $10K+ MRR (if monetized)
- **API Adoption**: 50+ developers using API
