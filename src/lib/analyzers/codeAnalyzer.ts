import { ReviewConfig, AnalysisResult, ReviewType } from '@/types';
import { analyzeCodeWithClaude } from '../ai/claude';
import { detectLanguage, isGitDiff, extractCodeFromDiff, isValidCode, checkLanguageMismatch } from '@/utils/languageDetect';
import { calculateScore, getGrade, calculateMetrics } from '@/utils/scoring';
import { getDemoAnalysis, isDemoMode } from '../ai/demoMode';
import { calculateConfidence } from '../confidence/confidenceCalculator';

/**
 * Main code analyzer that orchestrates the entire analysis process
 */
export async function analyzeCode(config: ReviewConfig): Promise<AnalysisResult> {
  const startTime = Date.now();

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
  const specifiedLanguage = config.language;
  let language = config.language;
  if (language === 'auto') {
    language = detectLanguage(codeToAnalyze);
    // If auto-detect fails, default to TypeScript as fallback
    if (language === 'auto') {
      language = 'typescript';
    }
  }

  // Step 3: Validate review types
  const reviewTypes = config.reviewTypes.length > 0
    ? config.reviewTypes
    : ['solid', 'hygiene'] as ReviewType[]; // Default review types

  // Step 4: Call AI for analysis (or use demo mode)
  const demoMode = isDemoMode();
  const aiResponse = demoMode
    ? getDemoAnalysis(codeToAnalyze, reviewTypes)
    : await analyzeCodeWithClaude(codeToAnalyze, language, reviewTypes);

  // Step 5: Calculate score and grade
  const score = calculateScore(aiResponse.issues);
  const grade = getGrade(score);

  // Step 6: Recalculate metrics to ensure accuracy
  const metrics = calculateMetrics(aiResponse.issues);

  // Step 7: Calculate confidence
  const confidence = calculateConfidence(
    codeToAnalyze,
    language,
    specifiedLanguage,
    aiResponse.issues,
    demoMode
  );

  // Step 8: Build metadata
  const analysisTimeMs = Date.now() - startTime;
  const linesAnalyzed = codeToAnalyze.split('\n').filter(l => l.trim().length > 0).length;

  // Step 9: Build final result
  const result: AnalysisResult = {
    issues: aiResponse.issues,
    metrics,
    summary: aiResponse.summary,
    score,
    grade,
    reviewTypes,
    language,
    timestamp: new Date(),
    confidence,
    metadata: {
      analysisTimeMs,
      modelVersion: demoMode ? 'Demo Mode (Pattern-Based)' : 'Claude 3.5 Sonnet',
      isDemoMode: demoMode,
      linesAnalyzed,
    },
  };

  return result;
}

/**
 * Validates a review configuration
 */
export function validateReviewConfig(config: Partial<ReviewConfig>): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config.code || config.code.trim().length === 0) {
    errors.push('Code is required');
  }

  if (config.code && config.code.length > 50000) {
    errors.push('Code is too long (maximum 50,000 characters)');
  }

  if (config.reviewTypes && config.reviewTypes.length === 0) {
    errors.push('At least one review type must be selected');
  }

  // Validate that input appears to be code
  if (config.code && config.code.trim().length > 0) {
    if (!isValidCode(config.code)) {
      errors.push('The input does not appear to be valid code. Please paste actual source code.');
    }

    // Check for language mismatch
    if (config.language && config.language !== 'auto') {
      const mismatchWarning = checkLanguageMismatch(config.language, config.code);
      if (mismatchWarning) {
        warnings.push(mismatchWarning);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
