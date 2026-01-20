import { CodeIssue, IssueMetrics } from './issue';
import { ReviewType, ProgrammingLanguage } from './review';

/**
 * Grade scale for code quality
 */
export type QualityGrade = 'A' | 'B' | 'C' | 'D' | 'F';

/**
 * Overall analysis result
 */
export interface AnalysisResult {
  /** List of all issues found */
  issues: CodeIssue[];

  /** Summary metrics */
  metrics: IssueMetrics;

  /** Overall assessment/summary */
  summary: string;

  /** Quality score (0-100) */
  score: number;

  /** Quality grade (A-F) */
  grade: QualityGrade;

  /** Which review types were performed */
  reviewTypes: ReviewType[];

  /** Detected or specified language */
  language: ProgrammingLanguage;

  /** Timestamp of the analysis */
  timestamp: Date;
}

/**
 * Status of an analysis request
 */
export type AnalysisStatus = 'pending' | 'analyzing' | 'completed' | 'error';

/**
 * Analysis request state
 */
export interface AnalysisState {
  status: AnalysisStatus;
  result?: AnalysisResult;
  error?: string;
}

/**
 * AI response structure (raw from API)
 */
export interface AIAnalysisResponse {
  issues: CodeIssue[];
  summary: string;
  metrics: IssueMetrics;
}
