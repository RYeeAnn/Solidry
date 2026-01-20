import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-foreground/5">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold text-foreground mb-4">
            SOLID<span className="text-foreground/60">ify</span>
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            AI-powered code review assistant that checks for SOLID principles, code hygiene,
            and quality issues before you submit PRs
          </p>
        </header>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-foreground/5 rounded-xl p-6 border border-foreground/10 hover:border-foreground/30 transition-colors">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold text-foreground mb-2">SOLID Principles</h3>
            <p className="text-sm text-foreground/70">
              Detect violations of SRP, OCP, LSP, ISP, and DIP in your code
            </p>
          </div>

          <div className="bg-foreground/5 rounded-xl p-6 border border-foreground/10 hover:border-foreground/30 transition-colors">
            <div className="text-3xl mb-3">✨</div>
            <h3 className="font-semibold text-foreground mb-2">Code Hygiene</h3>
            <p className="text-sm text-foreground/70">
              Check naming conventions, magic numbers, error handling, and cleanliness
            </p>
          </div>

          <div className="bg-foreground/5 rounded-xl p-6 border border-foreground/10 hover:border-foreground/30 transition-colors">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="font-semibold text-foreground mb-2">Dead Code Detection</h3>
            <p className="text-sm text-foreground/70">
              Find unused variables, redundant logic, and unnecessary abstractions
            </p>
          </div>

          <div className="bg-foreground/5 rounded-xl p-6 border border-foreground/10 hover:border-foreground/30 transition-colors">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-foreground mb-2">Simplicity Check</h3>
            <p className="text-sm text-foreground/70">
              Identify over-engineering and unnecessary complexity in your codebase
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mb-16">
          <Link
            href="/review"
            className="inline-block px-8 py-4 bg-foreground text-background rounded-lg font-semibold text-lg hover:bg-foreground/90 transition-colors shadow-lg hover:shadow-xl"
          >
            Start Reviewing Code
          </Link>
        </div>

        {/* How it works */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">How It Works</h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Paste Your Code</h3>
                <p className="text-foreground/70">
                  Enter raw code or git diff from your commits. Supports multiple programming languages.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Select Review Types</h3>
                <p className="text-foreground/70">
                  Choose which aspects to analyze: SOLID principles, hygiene, unnecessary code, or simplicity.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Get AI-Powered Insights</h3>
                <p className="text-foreground/70">
                  Receive detailed, line-by-line feedback with actionable suggestions and a quality score.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Improve and Ship</h3>
                <p className="text-foreground/70">
                  Apply the suggestions, improve your code quality, and submit PRs with confidence.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center text-foreground/50 text-sm">
          <p>Built with Next.js, TypeScript, and Claude AI</p>
          <p className="mt-2">
            Powered by Anthropic Claude 3.5 Sonnet for intelligent code analysis
          </p>
        </footer>
      </div>
    </div>
  );
}
