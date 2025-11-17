# GreenBlu.ai

An AI-powered Chrome extension that guides you into **FLOW state**—maximizing productivity while preventing burnout through mood prediction, personality profiling, and intelligent job crafting.

## Vision

**Ultimate Goal**: Help knowledge workers achieve and maintain flow state—a mental state of complete immersion and energized focus—for peak productivity without exhaustion.

Inspired by "Chobotničky z druhého poschodia" (a Czechoslovakian TV series), GreenBlu.ai combines:
- 🧠 **AI mood prediction** (VAD model + ML)
- 🌊 **Flow state optimization** (detection, protection, recovery)
- 👤 **Progressive personality profiling** (1-2 questions/day, multi-framework)
- 🎯 **Job crafting intelligence** (role-fit analysis, career recommendations)

## How It Works

```
Daily Mood Tracking → AI Predicts Future Mood → Detect Flow States →
Smart Interventions → Personality Learning → Job Crafting Insights →
Optimal Team Roles → Maximum Flow, Minimum Burnout
```

## Key Features

### 🎯 Flow State Optimization
- Real-time flow detection and protection
- Personalized flow triggers based on personality
- Flow preparation and recovery guidance
- 20% increase in weekly flow hours (target)

### 🧠 AI Mood Prediction
- VAD model (Valence-Arousal-Dominance)
- Predict mood at 1h, 4h, 8h intervals
- Multi-model ensemble (LSTM, XGBoost, k-NN)
- Proactive stress prevention

### 👤 Personality Intelligence
- Progressive profiling (1-2 questions/day)
- Multi-framework: Big Five, MBTI, DISC, Enneagram, StrengthsFinder
- **Genius Types**: Wonder, Invention, Discernment, Galvanizing, Enablement, Tenacity
- 60-90 day timeline for complete profile

### 💼 Job Crafting System
- Role-fit analysis (10+ role archetypes)
- Task energy mapping (what energizes vs. drains you)
- Career path recommendations
- Team genius balance optimization

### 🧘 Smart Interventions
- Breathing, eye, physical, and cognitive exercises
- Personality-based recommendations
- Intelligent timing (won't interrupt flow!)
- Effectiveness tracking and optimization

### 📊 Team Analytics
- Anonymous team genius distribution
- Optimal meeting times
- Collaboration pairing recommendations
- Burnout risk detection

## Documentation

### Core Documents
- **[Product Requirements Document (PRD)](docs/PRD.md)** - Product vision, features, success metrics
- **[Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md)** - System design, components, tech stack
- **[Development Roadmap](docs/DEVELOPMENT_ROADMAP.md)** - 32-week implementation plan

### Deep Dives
- **[AI/ML Specifications](docs/AI_ML_SPECIFICATIONS.md)** - Mood prediction models, algorithms, evaluation
- **[Personality Testing Framework](docs/PERSONALITY_TESTING_FRAMEWORK.md)** - Multi-framework profiling, genius types
- **[Flow State Guide](docs/FLOW_STATE_GUIDE.md)** - Flow theory, detection, optimization strategies
- **[Job Crafting System](docs/JOB_CRAFTING_SYSTEM.md)** - Role-fit analysis, career development, team optimization
- **[Database Schema](docs/DATABASE_SCHEMA.md)** - Data models, storage strategy, privacy

## Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **UI**: Tailwind CSS + shadcn/ui components
- **Charts**: D3.js or Recharts
- **State**: Zustand or Redux Toolkit
- **Platform**: Chrome Extension (Manifest V3)

### AI/ML
- **Framework**: TensorFlow.js (browser-based)
- **Models**: LSTM, XGBoost, k-NN, ensemble methods
- **Training**: Federated learning (privacy-preserving)

### Storage
- **Local**: IndexedDB (primary, encrypted)
- **Cloud** (optional): Firebase Firestore or Supabase
- **Sync**: Multi-device support with conflict resolution

### APIs & Integrations
- Weather API (OpenWeatherMap)
- Google Calendar API
- Slack, Microsoft Teams (future)

## Development Timeline

- **Week 1-8**: MVP (mood tracking, basic flow detection, personality framework)
- **Week 9-16**: AI/ML predictions, advanced personality, smart interventions
- **Week 17-24**: Job crafting system, team analytics, advanced insights
- **Week 25-32**: Cloud sync, mobile app, enterprise features, integrations

## Getting Started

### For Users
_(Chrome Web Store link coming after MVP launch - Week 8)_

### For Developers
```bash
# Clone the repository
git clone https://github.com/MSGreenbluMe/GreenBlu.git
cd GreenBlu

# Install dependencies (coming soon)
npm install

# Build extension (coming soon)
npm run build

# Load in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the `dist` folder
```

## Project Status

**Current Phase**: Documentation & Planning Complete ✅

**Next Steps**:
- [ ] Set up project structure (React + TypeScript + Tailwind)
- [ ] Implement IndexedDB schema
- [ ] Build VAD mood tracking interface
- [ ] Create morning check-in flow
- [ ] Develop personality question system

See [Development Roadmap](docs/DEVELOPMENT_ROADMAP.md) for detailed plan.

## Contributing

_(Contribution guidelines coming soon)_

## License

_(To be determined)_

---

**Built with ❤️ to help people achieve flow state and find their genius.**
