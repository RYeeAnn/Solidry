# Solidry - AI Code Quality Review Assistant

An AI-powered code review assistant that automates code quality checks for SOLID and DRY principles, code hygiene, complexity, and dead code detection. Built with a clean, professional interface inspired by modern developer tools.

## Features

### Core Analysis Features

- **SOLID Principles** - Detects violations of Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion principles
- **Code Hygiene** - Identifies quality issues like console.log statements, var usage, TODO comments without context, and type safety problems
- **Dead Code Detection** - Finds commented-out code, empty catch blocks, and unused code
- **Complexity Analysis** - Analyzes deep nesting, magic numbers, and unclear variable names

### User Experience Features

- **Demo Mode** - Test the app without API key or costs using intelligent pattern-based analysis
- **Example Code Selector** - Pre-loaded examples for quick testing (perfect for recruiters and non-technical users)
- **Real-time Analysis** - Get instant feedback on your code quality
- **Line-by-line Annotations** - See issues highlighted directly in your code
- **Quality Scoring** - Get an overall score (0-100) and grade (A-F) for your code
- **Selective Reviews** - Choose which types of analysis to run (SOLID, hygiene, complexity, dead code)
- **Git Diff Support** - Analyze only the changes in a git diff

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **AI:** Anthropic Claude 3.5 Sonnet (200K context window)
- **Deployment:** Vercel-ready
- **Design:** Minimal, professional UI inspired by Cursor and Notion

## Getting Started

### Quick Start (Demo Mode - No API Key Required!)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/solidry.git
   cd solidry
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)**

**That's it!** The app runs in **Demo Mode** by default, providing realistic pattern-based analysis without API costs.

### Using Real AI Analysis (Optional)

For production-grade SOLID principle analysis with Claude AI:

1. **Get an API key from [Anthropic Console](https://console.anthropic.com/)**
   - Note: Requires credit card, but includes $5 free credits

2. **Create a `.env.local` file:**
   ```bash
   ANTHROPIC_API_KEY=your_api_key_here
   NEXT_PUBLIC_DEMO_MODE=false
   ```

3. **Restart the dev server**

See [DEMO_MODE.md](DEMO_MODE.md) for differences between demo mode and real AI analysis.

## How to Use

### For Developers

1. **Paste your code** into the code input area
2. **Select language** (or use auto-detect)
3. **Choose review types:**
   - SOLID Principles - Check for design principle violations
   - Code Hygiene - Check code quality and cleanliness
   - Dead Code - Find unnecessary or commented code
   - Complexity - Analyze code complexity and readability
4. **Click "Analyze"** to get instant feedback
5. **Review results:**
   - Overall quality score and grade
   - Categorized issues (critical, warnings, suggestions)
   - Line-by-line annotations in your code

### For Recruiters & Non-Technical Users

1. **Click on any example** in the "Test with Example Code" section
2. The code will automatically load into the analyzer
3. **Click "Analyze"** to see the results
4. Review the quality score and detailed feedback

**Available Examples:**
- **Multiple Issues** - Good for demo, contains various violations
- **SOLID Violations** - Focuses on design principle violations
- **Clean Code** - Well-written code that should score high
- **Hygiene Issues** - Code quality and hygiene problems

## Understanding the Review Types

The checkboxes actually control what gets analyzed! Here's what each does:

### SOLID Principles
Checks for violations of:
- **SRP (Single Responsibility)** - Classes/functions doing too many things
- **OCP (Open/Closed)** - Code not extensible without modification
- **LSP (Liskov Substitution)** - Inheritance issues
- **ISP (Interface Segregation)** - Overly broad interfaces
- **DIP (Dependency Inversion)** - Tight coupling to concrete implementations

### Code Hygiene
Identifies:
- Console.log statements left in code
- Use of `var` instead of `let`/`const`
- Use of `any` type (TypeScript)
- TODO comments without context
- Long parameter lists
- Non-descriptive variable names

### Dead Code
Finds:
- Commented-out code
- Empty catch blocks
- Unused variables or functions

### Complexity
Analyzes:
- Deep nesting (3+ levels)
- Magic numbers
- Non-descriptive variable names (x, temp, data)
- Long functions

**Pro Tip:** Check only the review types you care about! For example:
- New feature? Check **SOLID + Hygiene**
- Bug fix? Check **Hygiene + Complexity**
- Refactoring? Check **all four**

## Project Structure

```
solidry/
├── src/
│   ├── app/              # Next.js app router
│   │   ├── page.tsx      # Main application page
│   │   └── api/          # API routes
│   ├── components/       # React components
│   │   ├── CodeInput.tsx           # Code input with language selector
│   │   ├── ReviewOptions.tsx       # Review type checkboxes
│   │   ├── ExampleCodeSelector.tsx # Example code buttons
│   │   ├── ScoreCard.tsx           # Quality score display
│   │   ├── ResultsSummary.tsx      # Issues summary
│   │   └── CodeViewer.tsx          # Annotated code view
│   ├── lib/             # Core logic
│   │   ├── ai/          # AI integration (Claude + demo mode)
│   │   └── analyzers/   # Code analysis orchestration
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── public/              # Static assets
├── DESIGN_PHILOSOPHY.md # UI/UX design principles
└── SAMPLE_CODE.md       # Example code for testing
```

## Development

```bash
# Development server with hot reload
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## Design Philosophy

Solidry follows a **tool-first** design approach inspired by Cursor and Notion:

- Clean, minimal interface with neutral colors
- Typography-driven hierarchy
- No marketing fluff - opens directly to the application
- Professional developer tool aesthetic
- Generous whitespace and subtle interactions

See [DESIGN_PHILOSOPHY.md](DESIGN_PHILOSOPHY.md) for detailed design principles.

## Demo Mode vs Real AI

**Demo Mode** (default):
- ✅ No API key required
- ✅ No costs
- ✅ Instant results
- ⚠️ Pattern-based detection (not comprehensive)
- ⚠️ Limited to common issues

**Real AI Mode** (with API key):
- ✅ Deep SOLID principle analysis
- ✅ Context-aware suggestions
- ✅ Comprehensive code review
- ✅ Better accuracy
- ⚠️ Requires API key and costs

Both modes **respect your review type selections** - only the checked categories will be analyzed.

## Roadmap

- [x] Phase 1: MVP with core features
  - [x] SOLID, hygiene, complexity, dead code analysis
  - [x] Demo mode for testing
  - [x] Example code selector
  - [x] Selective review types
  - [x] Professional UI/UX
- [ ] Phase 2: GitHub Integration
  - [ ] GitHub OAuth
  - [ ] Pull request reviews
  - [ ] Analysis history
  - [ ] Team features
- [ ] Phase 3: Developer Tools
  - [ ] CLI tool
  - [ ] Git hooks
  - [ ] IDE extensions
  - [ ] Custom rule configuration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

If you find Solidry helpful, please consider:
- Starring the repository
- Sharing with your team
- Contributing improvements
- Reporting issues

---

Built with care for developers who care about code quality.
