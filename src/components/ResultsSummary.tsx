'use client';

import { useState } from 'react';
import { CodeIssue, IssueMetrics } from '@/types';

interface ResultsSummaryProps {
  issues: CodeIssue[];
  metrics: IssueMetrics;
  summary: string;
}

export default function ResultsSummary({ issues, metrics, summary }: ResultsSummaryProps) {
  const [expandedIssues, setExpandedIssues] = useState<Set<number>>(new Set());

  const toggleIssue = (index: number) => {
    const newExpanded = new Set(expandedIssues);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedIssues(newExpanded);
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="panel p-4">
        <div className="text-sm font-medium mb-2">Summary</div>
        <p className="text-sm text-foreground/70">{summary}</p>
      </div>

      {/* Metrics */}
      <div className="panel p-4 space-y-3">
        <div className="text-sm font-medium">Issues Found</div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-semibold">{metrics.criticalIssues}</div>
            <div className="text-xs text-foreground/50">Critical</div>
          </div>
          <div>
            <div className="text-xl font-semibold">{metrics.warnings}</div>
            <div className="text-xs text-foreground/50">Warnings</div>
          </div>
          <div>
            <div className="text-xl font-semibold">{metrics.suggestions}</div>
            <div className="text-xs text-foreground/50">Suggestions</div>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="panel divide-y divide-border">
        {issues.length === 0 ? (
          <div className="p-8 text-center text-sm text-foreground/40">No issues found</div>
        ) : (
          issues.map((issue, index) => {
            const isExpanded = expandedIssues.has(index);
            return (
              <div key={index}>
                <button
                  onClick={() => toggleIssue(index)}
                  className="w-full text-left p-4 hover:bg-foreground/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 text-xs text-foreground/50">
                        <span>Line {issue.line}</span>
                        <span>·</span>
                        <span className="capitalize">{issue.severity}</span>
                        {issue.principle && issue.principle !== 'other' && (
                          <>
                            <span>·</span>
                            <span>{issue.principle}</span>
                          </>
                        )}
                      </div>
                      <div className="text-sm">{issue.message}</div>
                    </div>
                    <svg
                      className={`w-4 h-4 flex-shrink-0 text-foreground/30 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 text-sm">
                    {issue.explanation && (
                      <div>
                        <div className="text-xs font-medium text-foreground/50 mb-1">Why</div>
                        <div className="text-foreground/70">{issue.explanation}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-medium text-foreground/50 mb-1">Fix</div>
                      <div className="text-foreground/70">{issue.suggestion}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
