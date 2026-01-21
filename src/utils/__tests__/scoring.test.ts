import { describe, it, expect } from 'vitest';
import { calculateScore, getGrade, calculateMetrics, getGradeMessage } from '../scoring';
import { CodeIssue } from '@/types';

describe('calculateScore', () => {
  it('should return 100 for no issues', () => {
    const score = calculateScore([]);
    expect(score).toBe(100);
  });

  it('should deduct 10 points per critical issue', () => {
    const issues: CodeIssue[] = [
      {
        line: 1,
        severity: 'critical',
        category: 'solid',
        message: 'Critical issue',
        suggestion: 'Fix it',
      },
    ];
    const score = calculateScore(issues);
    expect(score).toBe(90); // 100 - 10
  });

  it('should deduct 3 points per warning', () => {
    const issues: CodeIssue[] = [
      {
        line: 1,
        severity: 'warning',
        category: 'hygiene',
        message: 'Warning issue',
        suggestion: 'Fix it',
      },
    ];
    const score = calculateScore(issues);
    expect(score).toBe(97); // 100 - 3
  });

  it('should deduct 1 point per suggestion', () => {
    const issues: CodeIssue[] = [
      {
        line: 1,
        severity: 'suggestion',
        category: 'complexity',
        message: 'Suggestion',
        suggestion: 'Consider this',
      },
    ];
    const score = calculateScore(issues);
    expect(score).toBe(99); // 100 - 1
  });

  it('should handle mixed severity levels correctly', () => {
    const issues: CodeIssue[] = [
      { line: 1, severity: 'critical', category: 'solid', message: '', suggestion: '' },
      { line: 2, severity: 'critical', category: 'solid', message: '', suggestion: '' },
      { line: 3, severity: 'warning', category: 'hygiene', message: '', suggestion: '' },
      { line: 4, severity: 'warning', category: 'hygiene', message: '', suggestion: '' },
      { line: 5, severity: 'suggestion', category: 'complexity', message: '', suggestion: '' },
    ];
    const score = calculateScore(issues);
    // 2 critical (-20) + 2 warnings (-6) + 1 suggestion (-1) = -27
    expect(score).toBe(73);
  });

  it('should not go below 0', () => {
    const issues: CodeIssue[] = Array(20).fill({
      line: 1,
      severity: 'critical',
      category: 'solid',
      message: '',
      suggestion: '',
    });
    const score = calculateScore(issues);
    expect(score).toBe(0); // Should bottom out at 0, not negative
  });

  it('should not exceed 100', () => {
    const score = calculateScore([]);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('getGrade', () => {
  it('should return A for scores 90-100', () => {
    expect(getGrade(100)).toBe('A');
    expect(getGrade(95)).toBe('A');
    expect(getGrade(90)).toBe('A');
  });

  it('should return B for scores 80-89', () => {
    expect(getGrade(89)).toBe('B');
    expect(getGrade(85)).toBe('B');
    expect(getGrade(80)).toBe('B');
  });

  it('should return C for scores 70-79', () => {
    expect(getGrade(79)).toBe('C');
    expect(getGrade(75)).toBe('C');
    expect(getGrade(70)).toBe('C');
  });

  it('should return D for scores 60-69', () => {
    expect(getGrade(69)).toBe('D');
    expect(getGrade(65)).toBe('D');
    expect(getGrade(60)).toBe('D');
  });

  it('should return F for scores below 60', () => {
    expect(getGrade(59)).toBe('F');
    expect(getGrade(30)).toBe('F');
    expect(getGrade(0)).toBe('F');
  });
});

describe('calculateMetrics', () => {
  it('should return zero metrics for empty issues', () => {
    const metrics = calculateMetrics([]);
    expect(metrics).toEqual({
      criticalIssues: 0,
      warnings: 0,
      suggestions: 0,
      totalIssues: 0,
    });
  });

  it('should count critical issues correctly', () => {
    const issues: CodeIssue[] = [
      { line: 1, severity: 'critical', category: 'solid', message: '', suggestion: '' },
      { line: 2, severity: 'critical', category: 'solid', message: '', suggestion: '' },
    ];
    const metrics = calculateMetrics(issues);
    expect(metrics.criticalIssues).toBe(2);
    expect(metrics.totalIssues).toBe(2);
  });

  it('should count warnings correctly', () => {
    const issues: CodeIssue[] = [
      { line: 1, severity: 'warning', category: 'hygiene', message: '', suggestion: '' },
      { line: 2, severity: 'warning', category: 'hygiene', message: '', suggestion: '' },
      { line: 3, severity: 'warning', category: 'hygiene', message: '', suggestion: '' },
    ];
    const metrics = calculateMetrics(issues);
    expect(metrics.warnings).toBe(3);
    expect(metrics.totalIssues).toBe(3);
  });

  it('should count suggestions correctly', () => {
    const issues: CodeIssue[] = [
      { line: 1, severity: 'suggestion', category: 'complexity', message: '', suggestion: '' },
    ];
    const metrics = calculateMetrics(issues);
    expect(metrics.suggestions).toBe(1);
    expect(metrics.totalIssues).toBe(1);
  });

  it('should handle mixed severities', () => {
    const issues: CodeIssue[] = [
      { line: 1, severity: 'critical', category: 'solid', message: '', suggestion: '' },
      { line: 2, severity: 'warning', category: 'hygiene', message: '', suggestion: '' },
      { line: 3, severity: 'warning', category: 'hygiene', message: '', suggestion: '' },
      { line: 4, severity: 'suggestion', category: 'complexity', message: '', suggestion: '' },
      { line: 5, severity: 'suggestion', category: 'complexity', message: '', suggestion: '' },
      { line: 6, severity: 'suggestion', category: 'complexity', message: '', suggestion: '' },
    ];
    const metrics = calculateMetrics(issues);
    expect(metrics.criticalIssues).toBe(1);
    expect(metrics.warnings).toBe(2);
    expect(metrics.suggestions).toBe(3);
    expect(metrics.totalIssues).toBe(6);
  });
});

describe('getGradeMessage', () => {
  it('should return appropriate message for each grade', () => {
    expect(getGradeMessage('A')).toContain('Excellent');
    expect(getGradeMessage('B')).toContain('Good');
    expect(getGradeMessage('C')).toContain('Decent');
    expect(getGradeMessage('D')).toContain('needs improvement');
    expect(getGradeMessage('F')).toContain('Significant');
  });
});

describe('Scoring Integration', () => {
  it('should produce consistent score -> grade mapping', () => {
    const testCases = [
      { critical: 0, warnings: 0, suggestions: 0, expectedGrade: 'A' },
      { critical: 1, warnings: 0, suggestions: 0, expectedGrade: 'A' }, // 90
      { critical: 2, warnings: 0, suggestions: 0, expectedGrade: 'B' }, // 80
      { critical: 3, warnings: 0, suggestions: 0, expectedGrade: 'C' }, // 70
      { critical: 4, warnings: 0, suggestions: 0, expectedGrade: 'D' }, // 60
      { critical: 5, warnings: 0, suggestions: 0, expectedGrade: 'F' }, // 50
    ];

    testCases.forEach(({ critical, warnings, suggestions, expectedGrade }) => {
      const issues: CodeIssue[] = [
        ...Array(critical).fill({ line: 1, severity: 'critical', category: 'solid', message: '', suggestion: '' }),
        ...Array(warnings).fill({ line: 1, severity: 'warning', category: 'hygiene', message: '', suggestion: '' }),
        ...Array(suggestions).fill({ line: 1, severity: 'suggestion', category: 'complexity', message: '', suggestion: '' }),
      ];

      const score = calculateScore(issues);
      const grade = getGrade(score);

      expect(grade).toBe(expectedGrade);
    });
  });
});
