# GreenBlu.ai - Development Guide

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check
```

### Loading the Extension in Chrome

1. Build the project:
   ```bash
   npm run build
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" (toggle in top right)

4. Click "Load unpacked"

5. Select the `dist` folder from this project

6. The extension should now appear in your Chrome toolbar!

## Project Structure

```
src/
├── components/      # React components
│   └── MoodTracker.tsx   # VAD mood input interface
├── pages/          # Main application pages
│   ├── Dashboard.tsx     # Main dashboard
│   └── Onboarding.tsx    # First-time user experience
├── services/       # Core services
│   └── database.ts       # IndexedDB + Knowledge Graph
├── lib/            # Utilities
│   └── utils.ts          # Helper functions
├── types/          # TypeScript type definitions
│   └── index.ts          # All type definitions
├── App.tsx         # Main app component
├── main.tsx        # React entry point
├── service-worker.ts  # Chrome extension background script
└── index.css       # Global styles (Tailwind)
```

## Key Features Implemented

✅ **MVP Foundation (Week 1)**
- Chrome Extension (Manifest V3) setup
- React + TypeScript + Tailwind CSS
- IndexedDB database with Knowledge Graph support
- VAD mood tracking interface
- Basic dashboard with mood history
- Service worker with alarms and notifications
- Onboarding flow

## Next Steps

🚧 **In Progress**
- AI/ML mood prediction models
- Personality profiling system
- Flow state optimization
- Job crafting intelligence

See [DEVELOPMENT_ROADMAP.md](docs/DEVELOPMENT_ROADMAP.md) for detailed plan.

## Development Notes

### Database
- Uses IndexedDB via `idb` library
- Knowledge Graph stored alongside relational data
- 90-day data retention for mood entries
- Automatic cleanup of old data

### Service Worker
- Handles background alarms (mood check, flow detection, personality questions)
- Manages notifications
- Runs flow detection algorithm every 15 minutes
- Coordinates with popup UI via Chrome messages

### Styling
- Tailwind CSS with custom color palette
- Dark mode support
- Responsive design for 380px+ width
- Smooth animations (60fps target)

## Troubleshooting

**Extension doesn't load:**
- Check console for build errors
- Ensure `dist` folder exists
- Verify manifest.json is valid

**Database errors:**
- Clear Chrome extension storage
- Check IndexedDB in DevTools

**Build errors:**
- Delete `node_modules` and reinstall
- Check TypeScript version compatibility

## Contributing

See main [README.md](README.md) for contribution guidelines (coming soon).
