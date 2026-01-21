# Demo Mode Guide

## What is Demo Mode?

Demo Mode allows you to test and showcase SOLIDify **without needing an Anthropic API key** or paying for API access. It provides realistic sample analysis based on common code patterns.

## How It Works

When Demo Mode is enabled:
- ✅ All UI features work normally
- ✅ Code analysis runs instantly (no API calls)
- ✅ Results are generated based on pattern matching
- ✅ You can test with any code
- ✅ Perfect for portfolio demonstrations

## Enabling Demo Mode

Demo Mode is **already enabled** by default in `.env.local`:

```bash
NEXT_PUBLIC_DEMO_MODE=true
```

Just run `npm run dev` and start using the app!

## Sample Code to Test

Try pasting this code to see Demo Mode in action:

```typescript
function getUserData(id: any, name: string, email: string) {
  console.log('Fetching user:', id);
  const data = fetch('api/users/' + id);
  if (data) {
    return data;
  }
}

class UserService {
  constructor() {
    this.db = new Database();
  }
}
```

Demo Mode will detect:
- Console.log statements
- Use of 'any' type
- Long parameter lists
- SOLID principle violations

## Switching to Real AI Analysis

When you're ready to use real Claude AI:

1. **Get an Anthropic API key** from https://console.anthropic.com/
   - Note: Requires credit card (but comes with $5 free credits)

2. **Update `.env.local`:**
   ```bash
   ANTHROPIC_API_KEY=your_api_key_here
   NEXT_PUBLIC_DEMO_MODE=false
   ```

3. **Restart the dev server:**
   ```bash
   npm run dev
   ```

## Demo Mode vs Real AI

| Feature | Demo Mode | Real AI |
|---------|-----------|---------|
| Cost | Free | ~$0.01-0.05 per review |
| Speed | Instant | 2-5 seconds |
| Accuracy | Pattern-based | Advanced AI analysis |
| Issues Detected | Common patterns only | Comprehensive analysis |
| Good For | Testing, demos, portfolio | Actual code reviews |

## For Portfolio/Recruiters

Demo Mode is **perfect for showcasing** this project:
- No API costs while demonstrating
- Fast, consistent results
- Shows all UI features
- Proves the concept works

You can honestly say: "Built with Claude AI integration, currently in demo mode for portfolio purposes. Ready to switch to production API."
