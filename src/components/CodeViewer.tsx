'use client';

import { CodeIssue } from '@/types';
import { getSeverityBgColor } from '@/utils/scoring';
import { useMemo } from 'react';

interface CodeViewerProps {
  code: string;
  issues: CodeIssue[];
}

export default function CodeViewer({ code, issues }: CodeViewerProps) {
  const lines = code.split('\n');

  // Create a map of line numbers to issues
  const issuesByLine = useMemo(() => {
    const map = new Map<number, CodeIssue[]>();
    for (const issue of issues) {
      const existing = map.get(issue.line) || [];
      map.set(issue.line, [...existing, issue]);
    }
    return map;
  }, [issues]);

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-foreground">Code with Annotations</label>

      <div className="rounded-lg border border-foreground/20 overflow-hidden">
        <div className="bg-foreground/5 px-4 py-2 border-b border-foreground/10">
          <span className="text-xs font-medium text-foreground/70">
            {lines.length} lines • {issues.length} issues
          </span>
        </div>

        <div className="overflow-x-auto">
          <div className="font-mono text-sm">
            {lines.map((line, index) => {
              const lineNumber = index + 1;
              const lineIssues = issuesByLine.get(lineNumber);
              const hasIssues = lineIssues && lineIssues.length > 0;

              return (
                <div key={index}>
                  {/* Code line */}
                  <div
                    className={`flex ${
                      hasIssues ? 'bg-foreground/5' : ''
                    } hover:bg-foreground/5 transition-colors`}
                  >
                    <div className="select-none w-12 flex-shrink-0 text-right pr-4 py-1 text-foreground/40 bg-foreground/5 border-r border-foreground/10">
                      {lineNumber}
                    </div>
                    <div className="flex-1 px-4 py-1 overflow-x-auto">
                      <pre className="text-foreground/90">{line || ' '}</pre>
                    </div>
                  </div>

                  {/* Issue annotations */}
                  {hasIssues && (
                    <div className="ml-12 mr-4 mb-2">
                      {lineIssues.map((issue, issueIndex) => (
                        <div
                          key={issueIndex}
                          className={`mt-1 p-2 rounded border-l-4 text-xs ${getSeverityBgColor(issue.severity)}`}
                        >
                          <div className="font-semibold mb-1">{issue.message}</div>
                          <div className="text-foreground/70">{issue.suggestion}</div>
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
    </div>
  );
}
