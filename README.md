# GreenBlu.ai

An AI-powered Chrome extension that guides you into **FLOW state**—maximizing productivity while preventing burnout through mood prediction, personality profiling, and intelligent job crafting.

## Vision

**Ultimate Goal**: Help knowledge workers achieve and maintain flow state—a mental state of complete immersion and energized focus—for peak productivity without exhaustion.

**Revolutionary Career Matching**: We're pioneering personality-based career matching. Instead of matching based on resumes and skills, we match based on verified personality traits, flow triggers, and energy patterns. We believe the future of recruitment is about finding the perfect "key in lock" fit—where the person's genuine characteristics align with the role's requirements, leading to sustained flow states and mutual satisfaction.

Inspired by "Chobotničky z druhého poschodia" (a Czechoslovakian TV series), GreenBlu.ai combines:
- 🧠 **AI mood prediction** (VAD model + advanced ML ensemble)
- 🌊 **Flow state optimization** (detection, protection, recovery)
- 👤 **Progressive personality profiling** (1-2 questions/day, multi-framework)
- 🎯 **Revolutionary job matching** (personality CV, role-fit analysis, career optimization)
- 📊 **Advanced AI/ML** (KAN networks, LSTM, XGBoost, online learning)

## How It Works

```
Daily Mood Tracking → AI Predicts Future Mood → Detect Flow States →
Smart Interventions → Personality Learning → Job Crafting Insights →
Optimal Team Roles → Maximum Flow, Minimum Burnout
```

## Key Features

### 🎯 Flow State Optimization ✅ IMPLEMENTED
- Real-time flow detection and protection
- Flow streak tracking with motivational feedback
- Flow preparation and recovery guidance
- 20% increase in weekly flow hours (target)
- Flow session recording and analysis

### 🧠 AI Mood Prediction ✅ IMPLEMENTED
- VAD model (Valence-Arousal-Dominance)
- Predict mood at 1h, 4h, 8h intervals with confidence scores
- **Advanced ensemble system**: KAN networks, LSTM, XGBoost, baseline models
- Online learning with concept drift detection
- Proactive stress prevention with AI-powered notifications
- Model weight adaptation based on performance

### 👤 Personality Intelligence ✅ IMPLEMENTED
- Progressive profiling (1-2 questions/day)
- Multi-framework: Big Five, MBTI, DISC, Enneagram, StrengthsFinder
- **Genius Types**: Wonder, Invention, Discernment, Galvanizing, Enablement, Tenacity
- Adaptive question selection using Bayesian updating
- Personality CV generation with verified data
- 60-90 day timeline for complete profile

### 💼 Revolutionary Job Crafting System ✅ IMPLEMENTED
- Personality-based CV (NOT resume-based!)
- Role-fit analysis (10+ role archetypes across all categories)
- Task energy mapping (what energizes vs. drains you)
- Flow trigger identification and optimization
- Career path recommendations based on genuine fit
- Team genius balance optimization
- "Key in lock" matching for perfect alignment

### 🧘 Smart Interventions ✅ IMPLEMENTED
- Breathing, eye, physical, and cognitive exercises
- Personality-based recommendations
- Intelligent timing (won't interrupt flow!)
- Effectiveness tracking and optimization
- Mood-aware intervention selection

### 🌅 Morning Check-in ✅ IMPLEMENTED
- Wake-up time tracking for circadian optimization
- Sleep quality assessment (1-5 scale)
- Weather integration for context awareness
- Beautiful sunrise-themed UI

### ⚙️ Settings & Privacy ✅ IMPLEMENTED
- Customizable notification preferences
- Privacy controls (data sharing, anonymous analytics)
- Theme toggle (light/dark/auto)
- Complete data export (JSON format with all data + ML models)
- Account deletion with full data cleanup

### 📊 Dashboard & Analytics ✅ IMPLEMENTED
- Weekly summary with key metrics
- Personality assessment progress tracking
- Flow streak counter with achievements
- Recent mood history visualization
- AI predictions display with confidence scores
- Recommended actions from ML models

## Screenshots

### Dashboard with AI Predictions
The main dashboard displays your weekly summary, personality assessment progress, flow streak, and AI-powered mood predictions for the next 1, 4, and 8 hours with confidence scores.

### Job Crafting & Career Matching
Revolutionary personality-based job matching system that analyzes your verified personality traits, flow triggers, and energy patterns to find roles where you'll thrive—not just roles you're qualified for.

### Personality Profile
Build your comprehensive personality profile gradually (1-2 questions per day) across multiple frameworks: Big Five, MBTI, DISC, Enneagram, StrengthsFinder, and Genius Types.

### Morning Check-in
Beautiful sunrise-themed interface for tracking wake-up time, sleep quality, and weather conditions to optimize your circadian rhythm and improve flow readiness.

### Settings & Privacy
Complete control over your data with notification preferences, privacy settings, theme customization, full data export, and secure account deletion.

_Note: Actual screenshots will be added soon. The extension is fully functional and ready for use!_

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

### Frontend ✅ IMPLEMENTED
- **Framework**: React 18+ with TypeScript
- **UI**: Tailwind CSS with custom components
- **Build**: Vite for fast development and optimized builds
- **Platform**: Chrome Extension (Manifest V3)
- **Storage**: IndexedDB via idb library

### AI/ML ✅ IMPLEMENTED
- **Custom Models**: KAN networks, LSTM, XGBoost implementations
- **Ensemble System**: Adaptive model weighting based on performance
- **Online Learning**: Concept drift detection and incremental training
- **Feature Engineering**: 20+ features including temporal, circadian, weather, personality
- **Baseline Models**: Moving average, exponential smoothing, seasonal decomposition, circadian rhythm
- **All client-side**: Privacy-preserving, no data leaves your device

### Storage ✅ IMPLEMENTED
- **Local**: IndexedDB with structured schema
- **Stores**: Users, mood entries, circadian data, personality profiles, flow sessions, interventions, knowledge graph
- **Data Management**: Full export to JSON, complete deletion capabilities
- **Privacy-First**: All data stays local unless explicitly shared

### Services ✅ IMPLEMENTED
- **Database Service**: Comprehensive IndexedDB abstraction
- **Prediction Pipeline**: High-level API for AI/ML system
- **Feature Engineering**: Automated feature extraction
- **Model Training**: Ensemble predictor with multiple models
- **Online Learning**: Adaptive learning with drift detection
- **Personality Scoring**: Multi-framework assessment
- **Question Selection**: Bayesian information gain optimization
- **Intervention Recommender**: Personality-aware suggestions
- **Role Fit Analyzer**: Career matching algorithms
- **Job Matcher**: "Key in lock" personality-role alignment
- **CV Generator**: Personality CV creation

### Integrations
- **Weather API**: OpenWeatherMap (mock data ready, API key configurable)
- **Future**: Google Calendar, Slack, Microsoft Teams

## Development Timeline

- **Week 1-8**: MVP (mood tracking, basic flow detection, personality framework)
- **Week 9-16**: AI/ML predictions, advanced personality, smart interventions
- **Week 17-24**: Job crafting system, team analytics, advanced insights
- **Week 25-32**: Cloud sync, mobile app, enterprise features, integrations

## Getting Started

### For Users
The Chrome Web Store listing is coming soon! For now, you can install the extension manually (see Developer Installation below).

### For Developers

#### Installation
```bash
# Clone the repository
git clone https://github.com/MSGreenbluMe/GreenBlu.git
cd GreenBlu

# Install dependencies
npm install

# Development mode (with hot reload)
npm run dev

# Build extension for production
npm run build
```

#### Load Extension in Chrome
1. Open `chrome://extensions/` in Chrome
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder from the build output
5. The GreenBlu.ai extension icon should appear in your toolbar!

#### Development Commands
```bash
# Development with hot reload
npm run dev

# Production build
npm run build

# Type checking
npm run type-check

# Lint code
npm run lint
```

#### Project Structure
```
GreenBlu/
├── src/
│   ├── components/      # React components
│   ├── pages/          # Main application pages
│   ├── services/       # Business logic & AI/ML services
│   ├── data/           # Static data (questions, role archetypes, interventions)
│   ├── types/          # TypeScript type definitions
│   ├── lib/            # Utility functions
│   ├── App.tsx         # Main application component
│   ├── main.tsx        # React entry point
│   └── service-worker.ts  # Background script
├── public/
│   ├── icons/          # Extension icons
│   ├── assets/         # Static assets
│   └── manifest.json   # Chrome extension manifest
├── docs/               # Comprehensive documentation
└── dist/               # Build output (generated)
```

## Project Status

**Current Phase**: ✅ MVP COMPLETE + Advanced AI/ML Integration

**Completed Features**:
- ✅ Full React + TypeScript + Tailwind setup
- ✅ IndexedDB schema and database service
- ✅ VAD mood tracking interface
- ✅ Morning check-in flow with circadian tracking
- ✅ Personality question system with adaptive selection
- ✅ Flow state detection and tracking
- ✅ AI predictions (KAN, LSTM, XGBoost, ensemble)
- ✅ Online learning with drift detection
- ✅ Job crafting and role-fit analysis
- ✅ Personality CV generation
- ✅ Job matching system ("key in lock")
- ✅ Smart interventions with mood awareness
- ✅ Comprehensive settings page
- ✅ Service worker with AI-powered notifications
- ✅ Dashboard with predictions and analytics
- ✅ Data export and privacy controls

**What's Working**:
- Complete mood tracking with VAD model
- AI predictions at 1h, 4h, 8h intervals with confidence scores
- Personality profiling across multiple frameworks
- Flow state optimization and streak tracking
- Revolutionary personality-based job matching
- Morning check-ins for circadian optimization
- Privacy-first data management

**Next Steps**:
- [ ] User testing and feedback collection
- [ ] Chrome Web Store submission
- [ ] Team analytics features
- [ ] Calendar integration
- [ ] Mobile companion app
- [ ] Cloud sync (optional)

See [Development Roadmap](docs/DEVELOPMENT_ROADMAP.md) for detailed plan.

## Contributing

_(Contribution guidelines coming soon)_

## License

_(To be determined)_

---

**Built with ❤️ to help people achieve flow state and find their genius.**
