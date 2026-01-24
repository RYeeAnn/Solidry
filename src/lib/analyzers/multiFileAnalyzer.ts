import {
  ReviewType,
  ProgrammingLanguage,
  FileAnalysisResult,
  MultiFileAnalysisResult,
  IssueMetrics,
  CodeIssue,
} from '@/types';
import { analyzeCode } from './codeAnalyzer';
import { getGrade } from '@/utils/scoring';

export interface FileInput {
  name: string;
  content: string;
  language: ProgrammingLanguage;
}

export interface MultiFileConfig {
  files: FileInput[];
  reviewTypes: ReviewType[];
}

/**
 * Analyzes multiple files and aggregates results
 */
export async function analyzeMultipleFiles(
  config: MultiFileConfig
): Promise<MultiFileAnalysisResult> {
  const startTime = Date.now();
  const fileResults: FileAnalysisResult[] = [];

  // Analyze each file
  for (const file of config.files) {
    const result = await analyzeCode({
      code: file.content,
      language: file.language,
      reviewTypes: config.reviewTypes,
      inputType: 'code',
    });

    fileResults.push({
      fileName: file.name,
      result,
    });
  }

  // Aggregate metrics
  const aggregateMetrics = aggregateFileMetrics(fileResults);

  // Calculate aggregate score (weighted average by lines)
  const aggregateScore = calculateAggregateScore(fileResults);

  // Get aggregate grade
  const aggregateGrade = getGrade(aggregateScore);

  // Detect cross-file issues
  const crossFileIssues = detectCrossFileIssues(config.files);

  // Generate overall summary
  const overallSummary = generateOverallSummary(fileResults, aggregateScore, crossFileIssues);

  // Calculate total lines
  const totalLinesAnalyzed = fileResults.reduce(
    (sum, fr) => sum + (fr.result.metadata.linesAnalyzed || 0),
    0
  );

  const totalAnalysisTimeMs = Date.now() - startTime;

  return {
    files: fileResults,
    aggregateScore,
    aggregateGrade,
    aggregateMetrics,
    overallSummary,
    crossFileIssues,
    totalAnalysisTimeMs,
    totalFiles: config.files.length,
    totalLinesAnalyzed,
  };
}

/**
 * Aggregate metrics from multiple file results
 */
function aggregateFileMetrics(fileResults: FileAnalysisResult[]): IssueMetrics {
  return fileResults.reduce(
    (acc, fr) => ({
      totalIssues: acc.totalIssues + fr.result.metrics.totalIssues,
      criticalIssues: acc.criticalIssues + fr.result.metrics.criticalIssues,
      warnings: acc.warnings + fr.result.metrics.warnings,
      suggestions: acc.suggestions + fr.result.metrics.suggestions,
    }),
    { totalIssues: 0, criticalIssues: 0, warnings: 0, suggestions: 0 }
  );
}

/**
 * Calculate weighted average score based on lines analyzed
 */
function calculateAggregateScore(fileResults: FileAnalysisResult[]): number {
  if (fileResults.length === 0) return 100;

  const totalLines = fileResults.reduce(
    (sum, fr) => sum + (fr.result.metadata.linesAnalyzed || 1),
    0
  );

  if (totalLines === 0) {
    // Fallback to simple average
    const total = fileResults.reduce((sum, fr) => sum + fr.result.score, 0);
    return Math.round(total / fileResults.length);
  }

  const weightedSum = fileResults.reduce(
    (sum, fr) => sum + fr.result.score * (fr.result.metadata.linesAnalyzed || 1),
    0
  );

  return Math.round(weightedSum / totalLines);
}

/**
 * Detect potential cross-file issues like duplicated code
 */
function detectCrossFileIssues(files: FileInput[]): CodeIssue[] {
  const issues: CodeIssue[] = [];

  // Simple duplicate detection: check for identical function signatures or large code blocks
  const codeBlocks = new Map<string, string[]>();

  for (const file of files) {
    const lines = file.content.split('\n');

    // Extract meaningful code blocks (functions, classes)
    const functionMatches = file.content.match(
      /(?:function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?(?:function|\([^)]*\)\s*=>))/g
    );

    if (functionMatches) {
      for (const match of functionMatches) {
        const normalized = match.replace(/\s+/g, ' ').trim();
        const existing = codeBlocks.get(normalized) || [];
        existing.push(file.name);
        codeBlocks.set(normalized, existing);
      }
    }

    // Check for very similar multi-line blocks (5+ identical consecutive lines)
    const blockSize = 5;
    for (let i = 0; i <= lines.length - blockSize; i++) {
      const block = lines
        .slice(i, i + blockSize)
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .join('\n');

      if (block.length > 50) {
        // Only consider meaningful blocks
        const existing = codeBlocks.get(block) || [];
        if (!existing.includes(file.name)) {
          existing.push(file.name);
          codeBlocks.set(block, existing);
        }
      }
    }
  }

  // Report duplicates
  for (const [block, fileNames] of codeBlocks.entries()) {
    if (fileNames.length > 1) {
      issues.push({
        line: 0,
        severity: 'warning',
        category: 'unnecessary',
        message: `Potential code duplication detected across files: ${fileNames.join(', ')}`,
        suggestion: 'Consider extracting shared code into a common module or utility.',
        codeSnippet: block.substring(0, 100) + (block.length > 100 ? '...' : ''),
      });
    }
  }

  return issues;
}

/**
 * Generate an overall summary for multi-file analysis
 */
function generateOverallSummary(
  fileResults: FileAnalysisResult[],
  aggregateScore: number,
  crossFileIssues: CodeIssue[]
): string {
  const parts: string[] = [];

  // Overall assessment
  if (aggregateScore >= 90) {
    parts.push('Excellent code quality across all files.');
  } else if (aggregateScore >= 80) {
    parts.push('Good code quality with minor issues to address.');
  } else if (aggregateScore >= 70) {
    parts.push('Moderate code quality. Several improvements recommended.');
  } else if (aggregateScore >= 60) {
    parts.push('Code quality needs attention. Multiple issues detected.');
  } else {
    parts.push('Significant code quality concerns across the codebase.');
  }

  // File breakdown
  const criticalFiles = fileResults.filter((fr) => fr.result.score < 70);
  if (criticalFiles.length > 0) {
    parts.push(
      `Files needing attention: ${criticalFiles.map((f) => f.fileName).join(', ')}.`
    );
  }

  // Cross-file issues
  if (crossFileIssues.length > 0) {
    parts.push(`${crossFileIssues.length} potential cross-file issue(s) detected.`);
  }

  return parts.join(' ');
}

/**
 * Validates multi-file configuration
 */
export function validateMultiFileConfig(config: Partial<MultiFileConfig>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.files || config.files.length === 0) {
    errors.push('At least one file is required');
  }

  if (config.files && config.files.length > 20) {
    errors.push('Maximum 20 files allowed');
  }

  if (config.files) {
    const totalSize = config.files.reduce((sum, f) => sum + f.content.length, 0);
    if (totalSize > 500000) {
      errors.push('Total code size exceeds 500KB limit');
    }

    for (const file of config.files) {
      if (!file.content || file.content.trim().length === 0) {
        errors.push(`File "${file.name}" is empty`);
      }
      if (file.content && file.content.length > 50000) {
        errors.push(`File "${file.name}" exceeds 50KB limit`);
      }
    }
  }

  if (!config.reviewTypes || config.reviewTypes.length === 0) {
    errors.push('At least one review type must be selected');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
