'use client';

import { useState } from 'react';
import { CodeIssue, IssueMetrics } from '@/types';

interface ResultsSummaryProps {
  issues: CodeIssue[];
  metrics: IssueMetrics;
  summary: string;
}

function getSeverityColor(severity: string): { dot: string; bg: string; text: string; border: string } {
  switch (severity) {
    case 'critical':
    case 'error':
      return { dot: 'bg-red-500', bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-500/20' };
    case 'warning':
      return { dot: 'bg-yellow-500', bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-500/20' };
    case 'suggestion':
    case 'info':
      return { dot: 'bg-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' };
    default:
      return { dot: 'bg-foreground/30', bg: 'bg-foreground/5', text: 'text-foreground/60', border: 'border-foreground/10' };
  }
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
      <div className="panel p-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="text-sm font-medium mb-2">Summary</div>
        <p className="text-sm text-foreground/70 leading-relaxed">{summary}</p>
      </div>

      {/* Metrics */}
      <div className="panel p-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="text-sm font-medium mb-3">Issues Found</div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center">
            <div className="text-xl font-bold text-red-500">{metrics.criticalIssues}</div>
            <div className="text-xs text-red-600/70 dark:text-red-400/70 mt-0.5">Critical</div>
          </div>
          <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 text-center">
            <div className="text-xl font-bold text-yellow-500">{metrics.warnings}</div>
            <div className="text-xs text-yellow-600/70 dark:text-yellow-400/70 mt-0.5">Warnings</div>
          </div>
          <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-center">
            <div className="text-xl font-bold text-blue-500">{metrics.suggestions}</div>
            <div className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-0.5">Suggestions</div>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="panel divide-y divide-border overflow-hidden animate-fade-in" style={{ animationDelay: '0.3s' }}>
        {issues.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-500/10 mb-3">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-sm text-foreground/40">No issues found</div>
          </div>
        ) : (
          issues.map((issue, index) => {
            const isExpanded = expandedIssues.has(index);
            const severity = getSeverityColor(issue.severity);
            return (
              <div key={index}>
                <button
                  onClick={() => toggleIssue(index)}
                  className="w-full text-left p-4 hover:bg-foreground/[0.03] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-foreground/40">Line {issue.line}</span>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full ${severity.bg} ${severity.text} text-[10px] font-medium`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${severity.dot}`} />
                          {issue.severity}
                        </span>
                        {issue.principle && issue.principle !== 'other' && (
                          <span className="px-1.5 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-medium">
                            {issue.principle}
                          </span>
                        )}
                      </div>
                      <div className="text-sm">{issue.message}</div>
                    </div>
                    <svg
                      className={`w-4 h-4 flex-shrink-0 text-foreground/30 transition-transform duration-200 ${
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
                  <div className="px-4 pb-4 space-y-3 text-sm animate-fade-in">
                    {issue.explanation && (
                      <div className="pl-3 border-l-2 border-foreground/10">
                        <div className="text-xs font-medium text-foreground/50 mb-1">Why</div>
                        <div className="text-foreground/70 leading-relaxed">{issue.explanation}</div>
                      </div>
                    )}
                    <div className="pl-3 border-l-2 border-accent/30">
                      <div className="text-xs font-medium text-accent mb-1">Fix</div>
                      <div className="text-foreground/70 leading-relaxed">{issue.suggestion}</div>
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
