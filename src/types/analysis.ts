import { CodeIssue, IssueMetrics } from './issue';
import { ReviewType, ProgrammingLanguage } from './review';

/**
 * Grade scale for code quality
 */
export type QualityGrade = 'A' | 'B' | 'C' | 'D' | 'F';

/**
 * Confidence metadata for analysis
 */
export interface ConfidenceMetadata {
  /** Overall confidence (0-100) */
  overall: number;

  /** Language detection confidence (0-100) */
  languageDetection: number;

  /** Issue accuracy confidence (0-100) */
  issueAccuracy: number;

  /** Factors affecting confidence */
  factors: string[];

  /** Confidence level */
  level: 'high' | 'medium' | 'low';
}

/**
 * Analysis performance and metadata
 */
export interface AnalysisMetadata {
  /** Analysis duration in milliseconds */
  analysisTimeMs: number;

  /** Model used for analysis */
  modelVersion: string;

  /** Whether demo mode was used */
  isDemoMode: boolean;

  /** Number of lines analyzed */
  linesAnalyzed: number;
}

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

  /** Confidence in analysis results */
  confidence: ConfidenceMetadata;

  /** Analysis metadata */
  metadata: AnalysisMetadata;
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
