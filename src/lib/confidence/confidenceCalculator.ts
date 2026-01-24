import { ProgrammingLanguage, CodeIssue } from '@/types';

/**
 * Confidence metadata for analysis results
 */
export interface ConfidenceScore {
  /** Overall confidence (0-100) */
  overall: number;

  /** Language detection confidence (0-100) */
  languageDetection: number;

  /** Confidence in issue detection accuracy (0-100) */
  issueAccuracy: number;

  /** Factors affecting confidence */
  factors: string[];

  /** Confidence level label */
  level: 'high' | 'medium' | 'low';
}

/**
 * Calculate confidence score for analysis results
 */
export function calculateConfidence(
  code: string,
  detectedLanguage: ProgrammingLanguage,
  specifiedLanguage: ProgrammingLanguage,
  issues: CodeIssue[],
  isDemoMode: boolean
): ConfidenceScore {
  const factors: string[] = [];
  let languageDetectionScore = 100;
  let issueAccuracyScore = 100;

  // 1. Language Detection Confidence
  if (specifiedLanguage === 'auto') {
    if (detectedLanguage === 'auto') {
      languageDetectionScore = 30;
      factors.push('Unable to detect programming language');
    } else {
      languageDetectionScore = 75;
      factors.push('Auto-detected language');
    }
  } else {
    languageDetectionScore = 100;
  }

  // 2. Code Characteristics
  const lines = code.split('\n');
  const lineCount = lines.filter(l => l.trim().length > 0).length;

  if (lineCount < 10) {
    issueAccuracyScore -= 10;
    factors.push('Very short code snippet');
  }

  if (lineCount > 300) {
    issueAccuracyScore -= 10;
    factors.push('Large code size may affect completeness');
  }

  // 3. Code Quality Indicators
  const hasStructure = /class |function |interface |type |const |let /.test(code);
  if (!hasStructure) {
    issueAccuracyScore -= 15;
    factors.push('Code lacks clear structure');
  }

  // 4. Demo Mode vs AI Mode
  if (isDemoMode) {
    issueAccuracyScore -= 20;
    factors.push('Demo mode (pattern-based detection only)');
  }

  // 5. Issue Detection Patterns
  const hasConsoleLog = /console\.log/.test(code);
  const hasVarKeyword = /\bvar\b/.test(code);
  const hasAnyType = /:\s*any\b/.test(code);

  // If obvious issues exist and were detected, increase confidence
  const obviousIssuesExist = hasConsoleLog || hasVarKeyword || hasAnyType;
  const obviousIssuesDetected = issues.some(
    i => i.message.toLowerCase().includes('console.log') ||
         i.message.toLowerCase().includes('var') ||
         i.message.toLowerCase().includes('any')
  );

  if (obviousIssuesExist && obviousIssuesDetected && !isDemoMode) {
    issueAccuracyScore = Math.min(100, issueAccuracyScore + 10);
  }

  // 6. Calculate Overall Confidence
  const overall = Math.round(
    (languageDetectionScore * 0.3) + (issueAccuracyScore * 0.7)
  );

  // 7. Determine Confidence Level
  let level: 'high' | 'medium' | 'low';
  if (overall >= 75) {
    level = 'high';
  } else if (overall >= 50) {
    level = 'medium';
  } else {
    level = 'low';
  }

  // 8. Add positive factors for high confidence
  if (level === 'high' && !isDemoMode) {
    factors.unshift('AI-powered analysis with Claude 4 Sonnet');
  }

  if (lineCount >= 10 && lineCount <= 300 && hasStructure) {
    if (!factors.some(f => f.includes('short') || f.includes('Large'))) {
      factors.unshift('Well-structured code of appropriate length');
    }
  }

  return {
    overall: Math.max(0, Math.min(100, overall)),
    languageDetection: Math.max(0, Math.min(100, languageDetectionScore)),
    issueAccuracy: Math.max(0, Math.min(100, issueAccuracyScore)),
    factors,
    level,
  };
}

/**
 * Get confidence level label
 */
export function getConfidenceLabel(level: 'high' | 'medium' | 'low'): string {
  const labels = {
    high: 'High Confidence',
    medium: 'Medium Confidence',
    low: 'Low Confidence',
  };
  return labels[level];
}

/**
 * Get user-friendly confidence level description
 */
export function getConfidenceDescription(level: 'high' | 'medium' | 'low'): string {
  const descriptions = {
    high: 'Analysis results are reliable for professional use',
    medium: 'Review suggestions carefully before applying',
    low: 'Use as rough guidance only, verify manually',
  };
  return descriptions[level];
}

/**
 * Get combined confidence color classes for UI (text + background + border)
 */
export function getConfidenceColorClasses(level: 'high' | 'medium' | 'low'): string {
  const colors = {
    high: 'text-green-600 bg-green-50 border-green-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    low: 'text-orange-600 bg-orange-50 border-orange-200',
  };
  return colors[level];
}
