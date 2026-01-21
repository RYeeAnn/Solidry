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
 * Checks if the input appears to be valid code
 * Returns true if it looks like code, false otherwise
 */
export function isValidCode(code: string): boolean {
  const trimmed = code.trim();

  // Minimum length check - very lenient for snippets
  if (trimmed.length < 5) {
    return false;
  }

  // For small snippets (< 50 chars), be more lenient
  const isSmallSnippet = trimmed.length < 50;

  // Check for common code patterns
  const codeIndicators = [
    /function\s+\w+/i,
    /class\s+\w+/i,
    /def\s+\w+/i,
    /const\s+\w+/i,
    /let\s+\w+/i,
    /var\s+\w+/i,
    /import\s+/i,
    /from\s+\w+\s+import/i,
    /public\s+(class|void|static)/i,
    /private\s+\w+/i,
    /\w+\s*\([^)]*\)\s*{/,  // Function with braces
    /=>\s*{/,              // Arrow function
    /if\s*\(/,             // Conditional
    /for\s*\(/,            // Loop
    /while\s*\(/,          // Loop
    /#include\s*[<"]/,     // C/C++ include
    /package\s+\w+/,       // Go/Java package
    /namespace\s+\w+/,     // C#/C++ namespace
    /interface\s+\w+/i,    // Interface definition
    /struct\s+\w+/i,       // Struct definition
    /fn\s+\w+/,            // Rust function
    /impl\s+\w+/,          // Rust impl
    /return\s+/i,          // Return statement
  ];

  // Check for code structure indicators
  const structureIndicators = [
    /[{}\[\]();]/,         // Brackets and parentheses
    /==/,                  // Comparison
    /\+\+|--/,            // Increment/decrement
    /->/,                  // Arrow operator
    /::/,                  // Scope resolution
    /\w+\.\w+/,           // Property access
    /[+\-*/%]=?/,         // Arithmetic operators
  ];

  // Count matches
  let indicatorMatches = 0;
  for (const pattern of codeIndicators) {
    if (pattern.test(trimmed)) {
      indicatorMatches++;
    }
  }

  // Check for structure
  let structureMatches = 0;
  for (const pattern of structureIndicators) {
    if (pattern.test(trimmed)) {
      structureMatches++;
    }
  }

  // For small snippets, be more lenient (1 indicator OR 1 structure match)
  if (isSmallSnippet) {
    return indicatorMatches >= 1 || structureMatches >= 1;
  }

  // For larger code, require at least 1 code indicator OR 2 structure indicators
  return indicatorMatches >= 1 || structureMatches >= 2;
}

/**
 * Checks if there's a language mismatch between user selection and detected language
 * Returns warning message if mismatch detected, null otherwise
 */
export function checkLanguageMismatch(
  userSelectedLanguage: ProgrammingLanguage,
  code: string
): string | null {
  // Skip if auto-detect is selected
  if (userSelectedLanguage === 'auto') {
    return null;
  }

  // Detect the actual language
  const detectedLanguage = detectLanguage(code);

  // If we can't detect any language, the code might be invalid
  if (detectedLanguage === 'auto') {
    return `Selected ${getLanguageName(userSelectedLanguage)} but couldn't detect valid code patterns`;
  }

  // Handle JavaScript/TypeScript ambiguity
  // Don't warn if code is ambiguous between JS and TS
  if (
    (userSelectedLanguage === 'javascript' && detectedLanguage === 'typescript') ||
    (userSelectedLanguage === 'typescript' && detectedLanguage === 'javascript')
  ) {
    // Check if there are actual TypeScript-specific features
    const hasTypeScriptFeatures = /:\s*(string|number|boolean|any|void|never)\b|interface\s+\w+|type\s+\w+\s*=|<\w+>/.test(code);

    // Only warn if TS features are detected but JS is selected
    if (detectedLanguage === 'typescript' && userSelectedLanguage === 'javascript' && hasTypeScriptFeatures) {
      return `Selected ${getLanguageName(userSelectedLanguage)} but the code appears to be ${getLanguageName(detectedLanguage)}`;
    }

    // Otherwise, don't warn (code is ambiguous)
    return null;
  }

  // Check for mismatch
  if (detectedLanguage !== userSelectedLanguage) {
    return `Selected ${getLanguageName(userSelectedLanguage)} but the code appears to be ${getLanguageName(detectedLanguage)}`;
  }

  return null;
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
