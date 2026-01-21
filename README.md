# SOLIDify - AI Code Quality Review Assistant

An AI-powered code review assistant that automates code quality checks for SOLID principles, code hygiene, and simplicity.

## Features (Phase 1 MVP)

- ✅ **Demo Mode** - Test without API key or costs
- ✅ SOLID principles violation detection
- ✅ Code hygiene analysis
- ✅ Over-engineering detection (simplicity check)
- ✅ Unnecessary code detection
- ✅ Line-by-line annotations
- ✅ Quality scoring system

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **AI:** Anthropic Claude 3.5 Sonnet
- **Deployment:** Vercel

## Getting Started

### Quick Start (Demo Mode - No API Key Required!)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

**That's it!** The app runs in **Demo Mode** by default, providing realistic sample analysis without API costs.

### Using Real AI Analysis (Optional)

To switch from Demo Mode to real Claude AI analysis:

1. Get an API key from [Anthropic Console](https://console.anthropic.com/)
   - Note: Requires credit card, but includes $5 free credits

2. Update `.env.local`:
   ```bash
   ANTHROPIC_API_KEY=your_api_key_here
   NEXT_PUBLIC_DEMO_MODE=false
   ```

3. Restart the dev server

See [DEMO_MODE.md](DEMO_MODE.md) for more details.

## Usage

1. Paste your code or git diff into the input area
2. Select review types (SOLID, hygiene, simplicity, unnecessary code)
3. Click "Analyze Code"
4. Review the results with line-by-line annotations and overall score

## Project Structure

```
solidify/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/             # Core logic and utilities
│   │   ├── ai/          # AI integration
│   │   └── analyzers/   # Code analysis logic
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
└── tests/               # Test files
```

## Development

```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build
```

## Roadmap

- [x] Phase 1: MVP with core features
- [ ] Phase 2: GitHub integration, auth, history
- [ ] Phase 3: CLI tool and git hooks

## License

MIT
