'use client';

import { useState } from 'react';
import { CodeIssue, IssueMetrics, IssueSeverity } from '@/types';
import { getSeverityColor, getSeverityBgColor } from '@/utils/scoring';
import { capitalize } from '@/utils/formatting';

interface ResultsSummaryProps {
  issues: CodeIssue[];
  metrics: IssueMetrics;
  summary: string;
}

type FilterSeverity = IssueSeverity | 'all';

export default function ResultsSummary({ issues, metrics, summary }: ResultsSummaryProps) {
  const [filter, setFilter] = useState<FilterSeverity>('all');
  const [expandedIssues, setExpandedIssues] = useState<Set<number>>(new Set());

  const filteredIssues =
    filter === 'all' ? issues : issues.filter((issue) => issue.severity === filter);

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
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <div className="bg-foreground/5 rounded-lg p-4 border border-foreground/10">
        <h3 className="font-semibold text-foreground mb-2">Analysis Summary</h3>
        <p className="text-sm text-foreground/80">{summary}</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-critical/10 rounded-lg p-3 border border-critical/20">
          <div className="text-2xl font-bold text-critical">{metrics.criticalIssues}</div>
          <div className="text-xs text-foreground/70">Critical</div>
        </div>
        <div className="bg-warning/10 rounded-lg p-3 border border-warning/20">
          <div className="text-2xl font-bold text-warning">{metrics.warnings}</div>
          <div className="text-xs text-foreground/70">Warnings</div>
        </div>
        <div className="bg-suggestion/10 rounded-lg p-3 border border-suggestion/20">
          <div className="text-2xl font-bold text-suggestion">{metrics.suggestions}</div>
          <div className="text-xs text-foreground/70">Suggestions</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            filter === 'all'
              ? 'bg-foreground text-background'
              : 'bg-foreground/10 text-foreground hover:bg-foreground/20'
          }`}
        >
          All ({issues.length})
        </button>
        <button
          onClick={() => setFilter('critical')}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            filter === 'critical'
              ? 'bg-critical text-white'
              : 'bg-critical/10 text-critical hover:bg-critical/20'
          }`}
        >
          Critical ({metrics.criticalIssues})
        </button>
        <button
          onClick={() => setFilter('warning')}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            filter === 'warning'
              ? 'bg-warning text-white'
              : 'bg-warning/10 text-warning hover:bg-warning/20'
          }`}
        >
          Warnings ({metrics.warnings})
        </button>
        <button
          onClick={() => setFilter('suggestion')}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            filter === 'suggestion'
              ? 'bg-suggestion text-white'
              : 'bg-suggestion/10 text-suggestion hover:bg-suggestion/20'
          }`}
        >
          Suggestions ({metrics.suggestions})
        </button>
      </div>

      {/* Issues List */}
      <div className="flex flex-col gap-2">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-8 text-foreground/50">
            {filter === 'all' ? 'No issues found!' : `No ${filter} issues found.`}
          </div>
        ) : (
          filteredIssues.map((issue, index) => {
            const isExpanded = expandedIssues.has(index);
            return (
              <div
                key={index}
                className={`rounded-lg border-2 overflow-hidden transition-all ${getSeverityBgColor(
                  issue.severity
                )}`}
              >
                <button
                  onClick={() => toggleIssue(index)}
                  className="w-full text-left p-4 hover:bg-foreground/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold uppercase ${getSeverityColor(issue.severity)}`}>
                          {issue.severity}
                        </span>
                        <span className="text-xs text-foreground/50">Line {issue.line}</span>
                        {issue.principle && issue.principle !== 'other' && (
                          <span className="text-xs bg-foreground/10 px-2 py-0.5 rounded">
                            {issue.principle}
                          </span>
                        )}
                        <span className="text-xs bg-foreground/10 px-2 py-0.5 rounded">
                          {capitalize(issue.category)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">{issue.message}</p>
                    </div>
                    <svg
                      className={`w-5 h-5 text-foreground/50 transition-transform ${
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
                  <div className="px-4 pb-4 border-t border-foreground/10">
                    {issue.explanation && (
                      <div className="mt-3 mb-3">
                        <p className="text-xs font-semibold text-foreground/70 mb-1">Explanation</p>
                        <p className="text-sm text-foreground/80">{issue.explanation}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-foreground/70 mb-1">Suggestion</p>
                      <p className="text-sm text-foreground/80">{issue.suggestion}</p>
                    </div>
                    {issue.codeSnippet && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-foreground/70 mb-1">Code Snippet</p>
                        <pre className="text-xs bg-foreground/5 p-2 rounded overflow-x-auto">
                          <code>{issue.codeSnippet}</code>
                        </pre>
                      </div>
                    )}
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
