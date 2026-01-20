import { CodeIssue, IssueMetrics, QualityGrade } from '@/types';

/**
 * Weights for different severity levels
 */
const SEVERITY_WEIGHTS = {
  critical: -10,
  warning: -3,
  suggestion: -1,
} as const;

/**
 * Calculates the quality score from issues (0-100 scale)
 */
export function calculateScore(issues: CodeIssue[]): number {
  const baseScore = 100;

  const totalDeductions = issues.reduce((sum, issue) => {
    return sum + SEVERITY_WEIGHTS[issue.severity];
  }, 0);

  // Ensure score stays within 0-100 range
  return Math.max(0, Math.min(100, baseScore + totalDeductions));
}

/**
 * Converts a numeric score to a letter grade
 */
export function getGrade(score: number): QualityGrade {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Calculates issue metrics from a list of issues
 */
export function calculateMetrics(issues: CodeIssue[]): IssueMetrics {
  const metrics: IssueMetrics = {
    criticalIssues: 0,
    warnings: 0,
    suggestions: 0,
    totalIssues: issues.length,
  };

  for (const issue of issues) {
    switch (issue.severity) {
      case 'critical':
        metrics.criticalIssues++;
        break;
      case 'warning':
        metrics.warnings++;
        break;
      case 'suggestion':
        metrics.suggestions++;
        break;
    }
  }

  return metrics;
}

/**
 * Gets a color class for a severity level (Tailwind)
 */
export function getSeverityColor(severity: CodeIssue['severity']): string {
  const colors = {
    critical: 'text-critical',
    warning: 'text-warning',
    suggestion: 'text-suggestion',
  };

  return colors[severity];
}

/**
 * Gets a background color class for a severity level (Tailwind)
 */
export function getSeverityBgColor(severity: CodeIssue['severity']): string {
  const colors = {
    critical: 'bg-critical/10 border-critical',
    warning: 'bg-warning/10 border-warning',
    suggestion: 'bg-suggestion/10 border-suggestion',
  };

  return colors[severity];
}

/**
 * Gets a color class for a grade (Tailwind)
 */
export function getGradeColor(grade: QualityGrade): string {
  const colors = {
    A: 'text-green-500',
    B: 'text-blue-500',
    C: 'text-yellow-500',
    D: 'text-orange-500',
    F: 'text-red-500',
  };

  return colors[grade];
}

/**
 * Gets an encouraging message based on the grade
 */
export function getGradeMessage(grade: QualityGrade): string {
  const messages = {
    A: 'Excellent code quality!',
    B: 'Good code quality with minor improvements needed.',
    C: 'Decent code quality, but several issues to address.',
    D: 'Code quality needs improvement.',
    F: 'Significant code quality issues detected.',
  };

  return messages[grade];
}
