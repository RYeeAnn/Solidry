import { AIAnalysisResponse, CodeIssue } from '@/types';

/**
 * Demo mode: Provides realistic sample analysis without calling the API
 * This allows testing and showcasing the app without API costs
 */
export function getDemoAnalysis(code: string): AIAnalysisResponse {
  // Count lines to make it somewhat realistic
  const lines = code.split('\n');
  const lineCount = lines.length;

  // Generate some realistic sample issues
  const sampleIssues: CodeIssue[] = [];

  // Add a few issues based on common patterns
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

  // Add some generic SOLID principle issues if the code is long enough
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
