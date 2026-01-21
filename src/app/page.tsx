import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl" />
          <div className="absolute top-40 -left-40 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-primary-300/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          {/* Header */}
          <header className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full glass text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              AI-Powered Code Review
            </div>

            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-6">
              <span className="text-gradient">SOLID</span>
              <span className="text-foreground/80">ify</span>
            </h1>

            <p className="text-xl sm:text-2xl text-foreground/70 max-w-3xl mx-auto mb-10 leading-relaxed">
              Automated code quality analysis for{' '}
              <span className="text-primary-600 font-semibold">SOLID principles</span>,{' '}
              <span className="text-primary-600 font-semibold">code hygiene</span>, and{' '}
              <span className="text-primary-600 font-semibold">architectural best practices</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
              <Link
                href="/review"
                className="group relative px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-glow hover:scale-105 active:scale-95 transition-all duration-200 overflow-hidden"
              >
                <span className="relative z-10">Start Analyzing Code</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>

              <a
                href="#features"
                className="px-8 py-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-foreground border-2 border-slate-300 dark:border-slate-700 rounded-xl font-semibold text-lg hover:border-primary-500 hover:text-primary-600 transition-all duration-200"
              >
                Learn More
              </a>
            </div>
          </header>

          {/* Features Grid */}
          <div id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {[
              {
                icon: '🎯',
                title: 'SOLID Principles',
                description: 'Detect violations of SRP, OCP, LSP, ISP, and DIP with detailed explanations',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                icon: '✨',
                title: 'Code Hygiene',
                description: 'Check naming conventions, magic numbers, error handling, and code cleanliness',
                color: 'from-purple-500 to-pink-500',
              },
              {
                icon: '🔍',
                title: 'Dead Code Detection',
                description: 'Find unused variables, redundant logic, and unnecessary abstractions',
                color: 'from-orange-500 to-red-500',
              },
              {
                icon: '⚡',
                title: 'Simplicity Check',
                description: 'Identify over-engineering and unnecessary complexity in your codebase',
                color: 'from-green-500 to-emerald-500',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative card p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity`} />
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-foreground/60 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* How It Works */}
          <div className="max-w-4xl mx-auto mb-20">
            <h2 className="text-4xl font-bold text-center mb-12 animate-fade-in">
              How It <span className="text-gradient">Works</span>
            </h2>

            <div className="space-y-8">
              {[
                {
                  step: '1',
                  title: 'Paste Your Code',
                  description: 'Enter raw code or git diff from your commits. Supports TypeScript, JavaScript, Python, Java, and more.',
                },
                {
                  step: '2',
                  title: 'Select Review Types',
                  description: 'Choose which aspects to analyze: SOLID principles, hygiene, unnecessary code, or simplicity.',
                },
                {
                  step: '3',
                  title: 'Get AI-Powered Insights',
                  description: 'Receive detailed, line-by-line feedback with actionable suggestions and a quality score (A-F).',
                },
                {
                  step: '4',
                  title: 'Improve and Ship',
                  description: 'Apply the suggestions, improve your code quality, and submit PRs with confidence.',
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex gap-6 items-start group animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-500 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg group-hover:shadow-glow group-hover:scale-110 transition-all duration-200">
                    {item.step}
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-foreground/70 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats/Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[
              { label: 'Languages Supported', value: '8+', icon: '🌐' },
              { label: 'Analysis Types', value: '4', icon: '🔬' },
              { label: 'Demo Mode Available', value: '✓', icon: '🎭' },
            ].map((stat, index) => (
              <div
                key={index}
                className="card p-8 text-center hover:shadow-xl transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-4xl font-bold text-gradient mb-2">{stat.value}</div>
                <div className="text-sm text-foreground/60 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center glass rounded-2xl p-12 mb-20 animate-fade-in">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Improve Your Code Quality?
            </h2>
            <p className="text-foreground/70 mb-8 max-w-2xl mx-auto">
              Start analyzing your code for SOLID principles violations, code hygiene issues, and more.
              Get professional-grade feedback in seconds.
            </p>
            <Link
              href="/review"
              className="inline-block px-10 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-glow hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Get Started for Free
            </Link>
          </div>

          {/* Footer */}
          <footer className="text-center text-foreground/50 text-sm space-y-2">
            <p>Built with Next.js, TypeScript, Tailwind CSS, and Claude AI</p>
            <p>Powered by Anthropic Claude 3.5 Sonnet for intelligent code analysis</p>
            <p className="pt-4 text-xs">
              © 2025 SOLIDify. Open source and free to use.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
