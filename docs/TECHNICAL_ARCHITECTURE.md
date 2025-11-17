# GreenBlu.ai - Technical Architecture

## Table of Contents
- [1. System Overview](#1-system-overview)
- [2. Architecture Diagram](#2-architecture-diagram)
- [3. Core Components](#3-core-components)
- [4. Data Flow](#4-data-flow)
- [5. Technology Stack](#5-technology-stack)
- [6. Security & Privacy](#6-security--privacy)

## 1. System Overview

GreenBlu.ai is a Chrome extension that uses AI/ML to guide users into FLOW state by:
- Tracking and predicting mood using VAD model
- Analyzing circadian rhythms and external factors (weather, etc.)
- Progressive personality profiling through daily micro-assessments
- Job crafting recommendations based on personality and performance data
- Real-time interventions to maintain optimal cognitive state

**Ultimate Goal**: Keep users in FLOW state for maximum productivity without exhaustion.

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Extension (Frontend)               │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Mood Tracker │  │  Personality │  │ Intervention │      │
│  │   UI (VAD)   │  │  Quiz UI     │  │   Modules    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Dashboard  │  │ Flow Monitor │  │ Job Crafting │      │
│  │   Analytics  │  │   Indicator  │  │  Suggestions │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Background Service Worker (Brain)               │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │          AI/ML Prediction Engine                      │  │
│  │  • Mood prediction (time series + multi-factor)      │  │
│  │  • Flow state detection                              │  │
│  │  • Optimal intervention timing                       │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Personality Analysis Engine                  │  │
│  │  • Daily question selector (adaptive)                │  │
│  │  • Multi-framework integration (MBTI, Big5, etc.)    │  │
│  │  • Personality vector calculation                    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Job Crafting Engine                          │  │
│  │  • Role-fit analysis                                 │  │
│  │  • Team optimization suggestions                     │  │
│  │  • Genius-type categorization                        │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Data Collection & Pattern Analysis           │  │
│  │  • Circadian rhythm tracking                         │  │
│  │  • Behavioral pattern monitoring                     │  │
│  │  • Context aggregation                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Integrations                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Weather    │  │   Calendar   │  │   Storage    │      │
│  │     API      │  │     API      │  │ (IndexedDB/  │      │
│  │              │  │   (Google)   │  │  Firestore)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## 3. Core Components

### 3.1 Frontend Layer (Popup & Dashboard)

**Popup Interface**
- Quick mood check-in (VAD model - 15 seconds max)
- Morning check-in (wake-up time + energy level)
- Daily personality question (1-2 questions)
- Flow state indicator
- Quick intervention access

**Dashboard**
- Mood history visualization
- Flow state timeline
- Personality profile progress
- Job crafting insights
- Team analytics (for managers)

### 3.2 Background Service Worker (Core Intelligence)

**AI/ML Prediction Engine**
- **Input Features**:
  - Historical mood data (VAD vectors)
  - Time of day + circadian phase
  - Weather conditions (temperature, brightness, pressure)
  - Personality traits (progressive)
  - Activity patterns
  - Calendar events
  - Day of week, season, holidays

- **Output**:
  - Predicted mood (next 1h, 4h, 8h)
  - Flow state probability
  - Risk indicators (stress, burnout)
  - Optimal intervention timing

- **Models**:
  - Time series forecasting (LSTM/GRU)
  - Multi-factor regression
  - Anomaly detection
  - Reinforcement learning for intervention optimization

**Personality Analysis Engine**
- Adaptive question selection algorithm
- Multi-framework integration:
  - MBTI (Myers-Briggs)
  - Big Five (OCEAN)
  - DISC
  - Enneagram
  - StrengthsFinder themes
  - Genius personality types
- Progressive profiling (1-2 questions/day)
- Confidence scoring for each trait
- Cross-validation between frameworks

**Job Crafting Engine**
- Role-fit scoring based on:
  - Personality vector
  - Flow state frequency in different tasks
  - Energy patterns
  - Collaboration preferences
- Team position optimization
- Genius-type role mapping
- Growth trajectory suggestions

**Flow State Monitor**
- Real-time flow detection indicators:
  - Time between mood checks (long = deep work)
  - Activity intensity patterns
  - Positive arousal + high dominance
  - Task engagement signals
- Flow preservation interventions
- Post-flow recovery recommendations

### 3.3 Data Collection & Pattern Analysis

**Circadian Rhythm Tracker**
- Daily wake-up time
- Sleep quality (optional input)
- Energy curve throughout day
- Optimal productivity windows
- Chronotype detection

**Behavioral Pattern Monitor**
- Work session duration
- Break frequency
- Task switching patterns
- Stress indicators
- Recovery effectiveness

**Context Aggregation**
- Weather correlation
- Calendar event impact
- Day type patterns (meeting-heavy, focus days)
- Social interaction levels
- Environmental factors

### 3.4 Intervention System

**Intervention Types**
- Breathing exercises (calm/energize)
- Eye exercises (screen fatigue)
- Physical movement (posture, blood flow)
- Cognitive reframes (mood regulation)
- Micro-breaks (prevent burnout)
- Focus music/sounds

**Adaptive Delivery**
- Timing optimization based on:
  - Current mood state
  - Predicted mood trajectory
  - Flow state status
  - Calendar availability
  - Past effectiveness
- Personalized intervention recommendations
- Non-intrusive notification strategy

## 4. Data Flow

### 4.1 Mood Prediction Flow
```
User Input (VAD) → Storage → Feature Engineering → ML Model →
Prediction → Flow State Analysis → Intervention Recommendation →
User Notification → User Action → Feedback Loop
```

### 4.2 Personality Profiling Flow
```
Daily Login → Question Selection Algorithm → Present 1-2 Questions →
User Response → Update Personality Vector → Recalculate Confidence →
Update Job Crafting Analysis → Store Results
```

### 4.3 Job Crafting Flow
```
Personality Vector + Mood Patterns + Flow Frequency →
Role-Fit Analysis → Compare Team Positions →
Generate Recommendations → Present Insights → User Feedback
```

### 4.4 Flow State Optimization Flow
```
Continuous Monitoring → Flow Detection → Protect Flow State OR
Predict Mood Drop → Suggest Intervention → Execute →
Measure Effectiveness → Update Model
```

## 5. Technology Stack

### 5.1 Frontend
- **Framework**: React 18+ with TypeScript
- **UI Library**: Tailwind CSS + shadcn/ui components
- **Charts**: D3.js or Recharts for visualizations
- **State Management**: Zustand or Redux Toolkit
- **Animation**: Framer Motion (smooth, 60fps)

### 5.2 Chrome Extension
- **Manifest**: V3 (latest standard)
- **Service Worker**: Background processing
- **Storage**: Chrome Storage API + IndexedDB
- **Permissions**:
  - `storage`
  - `alarms` (for notifications)
  - `geolocation` (optional, for weather)
  - `activeTab` (for context)

### 5.3 AI/ML
- **Framework**: TensorFlow.js (runs in browser)
- **Models**:
  - LSTM for time series prediction
  - Random Forest for multi-factor analysis
  - k-NN for pattern matching
- **Training**:
  - Federated learning (privacy-preserving)
  - Transfer learning from aggregate patterns
  - Personalized fine-tuning

### 5.4 Backend (Future - MVP uses local storage)
- **Database**: Firebase Firestore or Supabase
- **Authentication**: Google OAuth 2.0
- **API**: REST/GraphQL for team analytics
- **ML Pipeline**: Python (scikit-learn, TensorFlow) for model training

### 5.5 External APIs
- **Weather**: OpenWeatherMap API or WeatherAPI.com
- **Calendar**: Google Calendar API
- **Time**: Moment.js or date-fns for timezone handling

## 6. Security & Privacy

### 6.1 Data Protection
- **Local-First**: All sensitive data stored locally (IndexedDB)
- **Encryption**: AES-256 for local storage
- **Anonymization**: Team data aggregated with no PII
- **Consent**: Explicit opt-in for each data type
- **Right to Delete**: One-click data purge

### 6.2 Privacy Principles
- **Minimal Collection**: Only essential data points
- **Transparency**: Clear documentation of what's collected
- **User Control**: Granular privacy settings
- **No Third-Party Sharing**: Data never sold or shared
- **Federated Learning**: Models improve without sharing raw data

### 6.3 Compliance
- GDPR compliant (EU users)
- CCPA compliant (California users)
- SOC 2 considerations for team features
- Regular security audits

### 6.4 Security Measures
- Content Security Policy (CSP)
- Input validation and sanitization
- Secure communication (HTTPS only)
- Regular dependency updates
- Vulnerability scanning

## 7. Scalability Considerations

### 7.1 Performance
- Lazy loading for dashboard components
- Web Workers for ML computations
- Efficient data structures (sparse matrices)
- Caching strategies
- Debouncing/throttling for real-time features

### 7.2 Growth Path
- **Phase 1**: MVP - Local storage, basic prediction
- **Phase 2**: Cloud sync, team features
- **Phase 3**: Advanced ML, job crafting
- **Phase 4**: Mobile app, integrations
- **Phase 5**: Enterprise features, API platform

### 7.3 Infrastructure
- CDN for static assets
- Edge computing for low-latency predictions
- Horizontal scaling for team analytics
- Microservices architecture (future)
