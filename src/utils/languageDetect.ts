import { ProgrammingLanguage } from '@/types';

/**
 * Language detection patterns
 */
const LANGUAGE_PATTERNS: Record<string, RegExp[]> = {
  typescript: [
    /\.tsx?$/,
    /interface\s+\w+/,
    /type\s+\w+\s*=/,
    /:\s*(string|number|boolean|any)\b/,
    /import.*from\s+['"].*['"]/,
  ],
  javascript: [
    /\.jsx?$/,
    /import.*from\s+['"].*['"]/,
    /export\s+(default|const|function)/,
    /const\s+\w+\s*=/,
    /=>\s*{/,
  ],
  python: [
    /\.py$/,
    /def\s+\w+\s*\(/,
    /class\s+\w+:/,
    /import\s+\w+/,
    /from\s+\w+\s+import/,
    /__init__/,
  ],
  java: [
    /\.java$/,
    /public\s+(class|interface|enum)/,
    /private\s+(static\s+)?(\w+)\s+\w+/,
    /System\.out\.println/,
    /@Override/,
  ],
  csharp: [
    /\.cs$/,
    /namespace\s+\w+/,
    /using\s+System/,
    /public\s+(class|interface|struct)/,
    /Console\.WriteLine/,
  ],
  go: [
    /\.go$/,
    /package\s+\w+/,
    /func\s+\w+/,
    /import\s+\(/,
    /type\s+\w+\s+struct/,
  ],
  rust: [
    /\.rs$/,
    /fn\s+\w+/,
    /let\s+mut\s+/,
    /impl\s+\w+/,
    /pub\s+fn/,
  ],
  cpp: [
    /\.(cpp|cc|cxx|hpp|h)$/,
    /#include\s+[<"]/,
    /std::/,
    /namespace\s+\w+/,
    /template\s*</,
  ],
};

/**
 * Detects the programming language of the given code
 */
export function detectLanguage(code: string, filename?: string): ProgrammingLanguage {
  // First, try to detect from filename if provided
  if (filename) {
    for (const [lang, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
      if (patterns[0].test(filename)) {
        return lang as ProgrammingLanguage;
      }
    }
  }

  // Score each language based on pattern matches
  const scores: Record<string, number> = {};

  for (const [lang, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
    scores[lang] = 0;
    for (const pattern of patterns.slice(1)) { // Skip filename pattern
      if (pattern.test(code)) {
        scores[lang]++;
      }
    }
  }

  // Find the language with the highest score
  let maxScore = 0;
  let detectedLang: ProgrammingLanguage = 'auto';

  for (const [lang, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedLang = lang as ProgrammingLanguage;
    }
  }

  // If no clear winner, default to 'auto'
  return maxScore > 0 ? detectedLang : 'auto';
}

/**
 * Gets a human-readable language name
 */
export function getLanguageName(lang: ProgrammingLanguage): string {
  const names: Record<ProgrammingLanguage, string> = {
    typescript: 'TypeScript',
    javascript: 'JavaScript',
    python: 'Python',
    java: 'Java',
    csharp: 'C#',
    go: 'Go',
    rust: 'Rust',
    cpp: 'C++',
    auto: 'Auto-detect',
  };

  return names[lang] || lang;
}

/**
 * Checks if the code is a git diff
 */
export function isGitDiff(code: string): boolean {
  const diffPatterns = [
    /^diff --git/m,
    /^index [0-9a-f]{7}\.\.[0-9a-f]{7}/m,
    /^---\s+\w+/m,
    /^\+{3}\s+\w+/m,
    /^@@\s+-\d+,\d+\s+\+\d+,\d+\s+@@/m,
  ];

  return diffPatterns.some((pattern) => pattern.test(code));
}

/**
 * Extracts the actual code from a git diff
 */
export function extractCodeFromDiff(diff: string): string {
  const lines = diff.split('\n');
  const codeLines: string[] = [];

  for (const line of lines) {
    // Skip diff metadata lines
    if (
      line.startsWith('diff --git') ||
      line.startsWith('index ') ||
      line.startsWith('---') ||
      line.startsWith('+++') ||
      line.startsWith('@@')
    ) {
      continue;
    }

    // Include added and context lines, skip removed lines
    if (line.startsWith('+')) {
      codeLines.push(line.substring(1));
    } else if (!line.startsWith('-')) {
      codeLines.push(line);
    }
  }

  return codeLines.join('\n');
}
