'use client';

import { CodeIssue } from '@/types';
import { useMemo } from 'react';

interface CodeViewerProps {
  code: string;
  issues: CodeIssue[];
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
      <div className="px-4 py-2 border-b border-border bg-foreground/5">
        <span className="text-xs font-medium">Annotated Code</span>
      </div>

      <div className="overflow-x-auto">
        <div className="font-mono text-xs">
          {lines.map((line, index) => {
            const lineNumber = index + 1;
            const lineIssues = issuesByLine.get(lineNumber);
            const hasIssues = lineIssues && lineIssues.length > 0;

            return (
              <div key={index}>
                {/* Code line */}
                <div className={`flex ${hasIssues ? 'bg-foreground/5' : ''}`}>
                  <div className="select-none w-12 flex-shrink-0 text-right pr-3 py-1 text-foreground/30 border-r border-border bg-foreground/5">
                    {lineNumber}
                  </div>
                  <div className="flex-1 px-4 py-1">
                    <pre className="text-foreground/90">{line || ' '}</pre>
                  </div>
                </div>

                {/* Issue annotations */}
                {hasIssues && (
                  <div className="ml-12 px-4 py-2 bg-foreground/5 border-l-2 border-foreground space-y-2">
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
