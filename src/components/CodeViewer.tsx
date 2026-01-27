'use client';

import { CodeIssue } from '@/types';
import { useMemo } from 'react';

interface CodeViewerProps {
  code: string;
  issues: CodeIssue[];
}

function getIssueBorderColor(severity: string): string {
  switch (severity) {
    case 'critical':
    case 'error':
      return 'border-red-500';
    case 'warning':
      return 'border-yellow-500';
    case 'suggestion':
    case 'info':
      return 'border-blue-500';
    default:
      return 'border-accent';
  }
}

function getIssueBgColor(severity: string): string {
  switch (severity) {
    case 'critical':
    case 'error':
      return 'bg-red-500/5';
    case 'warning':
      return 'bg-yellow-500/5';
    case 'suggestion':
    case 'info':
      return 'bg-blue-500/5';
    default:
      return 'bg-foreground/5';
  }
}

export default function CodeViewer({ code, issues }: CodeViewerProps) {
  const lines = code.split('\n');

  const issuesByLine = useMemo(() => {
    const map = new Map<number, CodeIssue[]>();
    for (const issue of issues) {
      const existing = map.get(issue.line) || [];
      map.set(issue.line, [...existing, issue]);
    }
    return map;
  }, [issues]);

  return (
    <div className="panel overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border bg-foreground/[0.03] flex items-center gap-2">
        <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        <span className="text-xs font-medium">Annotated Code</span>
        <span className="text-xs text-foreground/40 ml-auto">{issues.length} issue{issues.length !== 1 ? 's' : ''} found</span>
      </div>

      <div className="overflow-x-auto">
        <div className="font-mono text-xs">
          {lines.map((line, index) => {
            const lineNumber = index + 1;
            const lineIssues = issuesByLine.get(lineNumber);
            const hasIssues = lineIssues && lineIssues.length > 0;
            const primarySeverity = hasIssues ? lineIssues[0].severity : '';

            return (
              <div key={index}>
                {/* Code line */}
                <div className={`flex ${hasIssues ? getIssueBgColor(primarySeverity) : ''}`}>
                  <div className="select-none w-12 flex-shrink-0 text-right pr-3 py-1 text-foreground/30 border-r border-border bg-foreground/[0.03]">
                    {lineNumber}
                  </div>
                  <div className="flex-1 px-4 py-1">
                    <pre className="text-foreground/90">{line || ' '}</pre>
                  </div>
                </div>

                {/* Issue annotations */}
                {hasIssues && (
                  <div className={`ml-12 px-4 py-2 ${getIssueBgColor(primarySeverity)} border-l-2 ${getIssueBorderColor(primarySeverity)} space-y-2`}>
                    {lineIssues.map((issue, issueIndex) => (
                      <div key={issueIndex} className="text-xs space-y-1">
                        <div className="font-medium">{issue.message}</div>
                        <div className="text-foreground/60">{issue.suggestion}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
