/**
 * Severity levels for code issues
 */
export type IssueSeverity = 'critical' | 'warning' | 'suggestion';

/**
 * Categories of code issues
 */
export type IssueCategory = 'solid' | 'hygiene' | 'unnecessary' | 'complexity';

/**
 * SOLID principles
 */
export type SOLIDPrinciple =
  | 'SRP'  // Single Responsibility Principle
  | 'OCP'  // Open/Closed Principle
  | 'LSP'  // Liskov Substitution Principle
  | 'ISP'  // Interface Segregation Principle
  | 'DIP'  // Dependency Inversion Principle
  | 'other';

/**
 * Represents a single code issue found during analysis
 */
export interface CodeIssue {
  /** Line number where the issue occurs (1-indexed) */
  line: number;

  /** Severity level of the issue */
  severity: IssueSeverity;

  /** Category of the issue */
  category: IssueCategory;

  /** Specific SOLID principle violated (if applicable) */
  principle?: SOLIDPrinciple;

  /** Brief description of the issue */
  message: string;

  /** Detailed explanation of why this is an issue */
  explanation?: string;

  /** Concrete suggestion on how to fix */
  suggestion: string;

  /** Code snippet showing the issue (optional) */
  codeSnippet?: string;
}

/**
 * Summary metrics for analysis results
 */
export interface IssueMetrics {
  /** Number of critical issues found */
  criticalIssues: number;

  /** Number of warnings found */
  warnings: number;

  /** Number of suggestions made */
  suggestions: number;

  /** Total number of issues */
  totalIssues: number;
}
