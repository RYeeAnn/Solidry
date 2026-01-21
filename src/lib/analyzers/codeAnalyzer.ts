import { ReviewConfig, AnalysisResult, ReviewType } from '@/types';
import { analyzeCodeWithClaude } from '../ai/claude';
import { detectLanguage, isGitDiff, extractCodeFromDiff } from '@/utils/languageDetect';
import { calculateScore, getGrade, calculateMetrics } from '@/utils/scoring';
import { getDemoAnalysis, isDemoMode } from '../ai/demoMode';

/**
 * Main code analyzer that orchestrates the entire analysis process
 */
export async function analyzeCode(config: ReviewConfig): Promise<AnalysisResult> {
  // Step 1: Determine the actual code to analyze
  let codeToAnalyze = config.code;
  let inputType = config.inputType;

  // Auto-detect if it's a git diff
  if (inputType === 'code' && isGitDiff(config.code)) {
    inputType = 'diff';
  }

  // If it's a diff, extract the actual code
  if (inputType === 'diff') {
    codeToAnalyze = extractCodeFromDiff(config.code);
  }

  // Step 2: Detect or use specified language
  let language = config.language;
  if (language === 'auto') {
    language = detectLanguage(codeToAnalyze);
  }

  // Step 3: Validate review types
  const reviewTypes = config.reviewTypes.length > 0
    ? config.reviewTypes
    : ['solid', 'hygiene'] as ReviewType[]; // Default review types

  // Step 4: Call AI for analysis (or use demo mode)
  const aiResponse = isDemoMode()
    ? getDemoAnalysis(codeToAnalyze)
    : await analyzeCodeWithClaude(codeToAnalyze, language, reviewTypes);

  // Step 5: Calculate score and grade
  const score = calculateScore(aiResponse.issues);
  const grade = getGrade(score);

  // Step 6: Recalculate metrics to ensure accuracy
  const metrics = calculateMetrics(aiResponse.issues);

  // Step 7: Build final result
  const result: AnalysisResult = {
    issues: aiResponse.issues,
    metrics,
    summary: aiResponse.summary,
    score,
    grade,
    reviewTypes,
    language,
    timestamp: new Date(),
  };

  return result;
}

/**
 * Validates a review configuration
 */
export function validateReviewConfig(config: Partial<ReviewConfig>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.code || config.code.trim().length === 0) {
    errors.push('Code is required');
  }

  if (config.code && config.code.length > 50000) {
    errors.push('Code is too long (maximum 50,000 characters)');
  }

  if (config.reviewTypes && config.reviewTypes.length === 0) {
    errors.push('At least one review type must be selected');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
