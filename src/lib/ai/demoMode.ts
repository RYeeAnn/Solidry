import { AIAnalysisResponse, CodeIssue, ReviewType } from '@/types';

/**
 * Demo mode: Provides realistic sample analysis without calling the API
 * This allows testing and showcasing the app without API costs
 */
export function getDemoAnalysis(code: string, reviewTypes: ReviewType[]): AIAnalysisResponse {
  // Count lines to make it somewhat realistic
  const lines = code.split('\n');
  const lineCount = lines.length;

  // Generate some realistic sample issues
  const sampleIssues: CodeIssue[] = [];

  // Add hygiene issues (only if 'hygiene' is selected)
  if (reviewTypes.includes('hygiene')) {
    if (code.includes('console.log')) {
      const logLine = lines.findIndex(line => line.includes('console.log')) + 1;
      sampleIssues.push({
        line: logLine,
        severity: 'warning',
        category: 'hygiene',
        message: 'Console.log statement left in code',
        suggestion: 'Remove console.log statements before committing to production. Use a proper logging framework instead.',
      });
    }

    if (code.match(/function\s+\w+\s*\([^)]{50,}\)/)) {
      const funcLine = lines.findIndex(line => line.includes('function')) + 1;
      sampleIssues.push({
        line: funcLine,
        severity: 'warning',
        category: 'hygiene',
        message: 'Long parameter list detected',
        suggestion: 'Consider using an options object instead of multiple parameters to improve readability and maintainability.',
      });
    }

    if (code.includes('any')) {
      const anyLine = lines.findIndex(line => line.includes('any')) + 1;
      sampleIssues.push({
        line: anyLine,
        severity: 'suggestion',
        category: 'hygiene',
        message: 'Use of "any" type reduces type safety',
        suggestion: 'Replace "any" with a specific type or interface to improve type safety.',
      });
    }

    // Check for var usage (should use let/const)
    if (code.includes('var ')) {
      const varLine = lines.findIndex(line => line.includes('var ')) + 1;
      sampleIssues.push({
        line: varLine,
        severity: 'suggestion',
        category: 'hygiene',
        message: 'Use of "var" keyword',
        suggestion: 'Use "let" or "const" instead of "var" for better scoping and to avoid hoisting issues.',
      });
    }

    // Check for TODO comments
    if (code.includes('TODO')) {
      const todoLine = lines.findIndex(line => line.includes('TODO')) + 1;
      sampleIssues.push({
        line: todoLine,
        severity: 'suggestion',
        category: 'hygiene',
        message: 'TODO comment without context',
        suggestion: 'TODO comments should include context and be tracked in your issue tracker.',
      });
    }
  }

  // Add SOLID principle issues (only if 'solid' is selected)
  if (reviewTypes.includes('solid')) {
    if (lineCount > 20) {
      sampleIssues.push({
        line: Math.floor(lineCount / 2),
        severity: 'warning',
        category: 'solid',
        principle: 'SRP',
        message: 'Function appears to have multiple responsibilities',
        suggestion: 'Consider breaking this function into smaller, single-purpose functions.',
      });
    }

    if (code.includes('class ')) {
      const classLine = lines.findIndex(line => line.includes('class ')) + 1;
      sampleIssues.push({
        line: classLine,
        severity: 'suggestion',
        category: 'solid',
        principle: 'DIP',
        message: 'Consider dependency injection instead of direct instantiation',
        suggestion: 'Inject dependencies through the constructor to improve testability and follow the Dependency Inversion Principle.',
      });
    }

    // Check for large if-else chains (OCP violation)
    const ifElseMatches = code.match(/else\s+if/g);
    if (ifElseMatches && ifElseMatches.length >= 2) {
      const elseIfLine = lines.findIndex(line => line.includes('else if')) + 1;
      sampleIssues.push({
        line: elseIfLine,
        severity: 'warning',
        category: 'solid',
        principle: 'OCP',
        message: 'Large if-else chain violates Open/Closed Principle',
        suggestion: 'Consider using polymorphism or a strategy pattern instead of large if-else chains.',
      });
    }
  }

  // Add unnecessary/dead code issues (only if 'unnecessary' is selected)
  if (reviewTypes.includes('unnecessary')) {
    // Check for commented-out code
    const commentedCodeLines = lines.filter(line =>
      line.trim().startsWith('//') &&
      (line.includes('const ') || line.includes('function ') || line.includes('var '))
    );
    if (commentedCodeLines.length > 0) {
      const commentedLine = lines.findIndex(line =>
        line.trim().startsWith('//') &&
        (line.includes('const ') || line.includes('function ') || line.includes('var '))
      ) + 1;
      sampleIssues.push({
        line: commentedLine,
        severity: 'suggestion',
        category: 'unnecessary',
        message: 'Commented-out code detected',
        suggestion: 'Remove commented-out code. Use version control to track old code instead.',
      });
    }

    // Check for empty catch blocks
    if (code.match(/catch\s*\([^)]*\)\s*\{\s*\}/)) {
      const catchLine = lines.findIndex(line => line.includes('catch')) + 1;
      sampleIssues.push({
        line: catchLine,
        severity: 'warning',
        category: 'unnecessary',
        message: 'Empty catch block',
        suggestion: 'Either handle the error appropriately or remove the try-catch block.',
      });
    }
  }

  // Add complexity/simplicity issues (only if 'simplicity' is selected)
  if (reviewTypes.includes('simplicity')) {
    // Check for deep nesting
    let maxNesting = 0;
    let currentNesting = 0;
    let deepNestLine = 0;
    lines.forEach((line, index) => {
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      currentNesting += openBraces - closeBraces;
      if (currentNesting > maxNesting) {
        maxNesting = currentNesting;
        deepNestLine = index + 1;
      }
    });
    if (maxNesting > 3) {
      sampleIssues.push({
        line: deepNestLine,
        severity: 'warning',
        category: 'complexity',
        message: 'Deep nesting detected (complexity)',
        suggestion: 'Reduce nesting by extracting nested logic into separate functions or using early returns.',
      });
    }

    // Check for magic numbers
    const magicNumberPattern = /return\s+(\d{2,})|=\s*(\d{2,})/;
    const magicNumberLine = lines.findIndex(line => magicNumberPattern.test(line) && !line.includes('//'));
    if (magicNumberLine !== -1) {
      sampleIssues.push({
        line: magicNumberLine + 1,
        severity: 'suggestion',
        category: 'complexity',
        message: 'Magic number detected',
        suggestion: 'Replace magic numbers with named constants to improve code readability.',
      });
    }

    // Check for non-descriptive variable names
    const badVarNames = /\b(x|y|z|temp|data|obj|arr|a|b|c)\b/;
    const badVarLine = lines.findIndex(line =>
      (line.includes('var ') || line.includes('let ') || line.includes('const ')) && badVarNames.test(line)
    );
    if (badVarLine !== -1) {
      sampleIssues.push({
        line: badVarLine + 1,
        severity: 'suggestion',
        category: 'complexity',
        message: 'Non-descriptive variable name',
        suggestion: 'Use descriptive variable names that clearly convey the purpose of the variable.',
      });
    }
  }

  // Calculate metrics
  const criticalIssues = sampleIssues.filter(i => i.severity === 'critical').length;
  const warnings = sampleIssues.filter(i => i.severity === 'warning').length;
  const suggestions = sampleIssues.filter(i => i.severity === 'suggestion').length;

  return {
    issues: sampleIssues,
    summary: sampleIssues.length === 0
      ? 'Great job! No major issues detected in this code. The code appears to follow good practices.'
      : `Found ${sampleIssues.length} potential improvement${sampleIssues.length === 1 ? '' : 's'}. The code is functional but could benefit from some refactoring to improve maintainability and follow best practices more closely.`,
    metrics: {
      criticalIssues,
      warnings,
      suggestions,
      totalIssues: sampleIssues.length,
    },
  };
}

/**
 * Check if demo mode is enabled
 */
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !process.env.ANTHROPIC_API_KEY;
}
