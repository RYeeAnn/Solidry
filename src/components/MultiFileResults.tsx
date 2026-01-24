'use client';

import { useState } from 'react';
import { MultiFileAnalysisResult, FileAnalysisResult } from '@/types';
import ScoreCard from './ScoreCard';
import ResultsSummary from './ResultsSummary';
import CodeViewer from './CodeViewer';
import ConfidenceIndicator from './ConfidenceIndicator';

interface MultiFileResultsProps {
  result: MultiFileAnalysisResult;
  fileContents: Map<string, string>;
}

export default function MultiFileResults({ result, fileContents }: MultiFileResultsProps) {
  const [selectedFile, setSelectedFile] = useState<FileAnalysisResult | null>(
    result.files[0] || null
  );
  const [showAggregateView, setShowAggregateView] = useState(true);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'text-green-600 dark:text-green-400';
      case 'B':
        return 'text-blue-600 dark:text-blue-400';
      case 'C':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'D':
        return 'text-orange-600 dark:text-orange-400';
      case 'F':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowAggregateView(true)}
          className={`px-3 py-1.5 text-xs rounded transition-colors ${
            showAggregateView
              ? 'bg-foreground text-background'
              : 'bg-foreground/10 hover:bg-foreground/20'
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setShowAggregateView(false)}
          className={`px-3 py-1.5 text-xs rounded transition-colors ${
            !showAggregateView
              ? 'bg-foreground text-background'
              : 'bg-foreground/10 hover:bg-foreground/20'
          }`}
        >
          By File
        </button>
      </div>

      {showAggregateView ? (
        /* Aggregate View */
        <div className="space-y-4">
          <ScoreCard score={result.aggregateScore} grade={result.aggregateGrade} />

          {/* Stats */}
          <div className="panel p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{result.totalFiles}</div>
                <div className="text-xs text-foreground/60">Files</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{result.totalLinesAnalyzed}</div>
                <div className="text-xs text-foreground/60">Lines</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{result.aggregateMetrics.totalIssues}</div>
                <div className="text-xs text-foreground/60">Issues</div>
              </div>
            </div>
          </div>

          <ResultsSummary
            issues={result.files.flatMap((f) => f.result.issues)}
            metrics={result.aggregateMetrics}
            summary={result.overallSummary}
          />

          {/* Cross-file issues */}
          {result.crossFileIssues.length > 0 && (
            <div className="panel p-4 space-y-3">
              <h3 className="text-sm font-medium">Cross-File Issues</h3>
              <div className="space-y-2">
                {result.crossFileIssues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="text-xs p-2 rounded bg-yellow-500/10 border border-yellow-500/20"
                  >
                    <div className="font-medium text-yellow-700 dark:text-yellow-400">
                      {issue.message}
                    </div>
                    {issue.suggestion && (
                      <div className="text-foreground/60 mt-1">{issue.suggestion}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Score Breakdown */}
          <div className="panel p-4 space-y-3">
            <h3 className="text-sm font-medium">File Scores</h3>
            <div className="space-y-2">
              {result.files.map((file) => (
                <div
                  key={file.fileName}
                  className="flex items-center justify-between text-xs p-2 rounded bg-foreground/5"
                >
                  <span className="truncate font-medium">{file.fileName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground/60">
                      {file.result.metrics.totalIssues} issue{file.result.metrics.totalIssues !== 1 ? 's' : ''}
                    </span>
                    <span className={`font-bold ${getGradeColor(file.result.grade)}`}>
                      {file.result.grade}
                    </span>
                    <span className="w-12 text-right">{file.result.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* File-by-File View */
        <div className="space-y-4">
          {/* File Selector */}
          <div className="panel p-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              {result.files.map((file) => (
                <button
                  key={file.fileName}
                  onClick={() => setSelectedFile(file)}
                  className={`px-3 py-1.5 text-xs rounded whitespace-nowrap transition-colors ${
                    selectedFile?.fileName === file.fileName
                      ? 'bg-foreground text-background'
                      : 'bg-foreground/10 hover:bg-foreground/20'
                  }`}
                >
                  {file.fileName}
                  <span className={`ml-1 ${getGradeColor(file.result.grade)}`}>
                    ({file.result.grade})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected File Results */}
          {selectedFile && (
            <>
              <ScoreCard score={selectedFile.result.score} grade={selectedFile.result.grade} />

              <ConfidenceIndicator
                confidence={selectedFile.result.confidence}
                metadata={selectedFile.result.metadata}
              />

              <ResultsSummary
                issues={selectedFile.result.issues}
                metrics={selectedFile.result.metrics}
                summary={selectedFile.result.summary}
              />

              {/* Code Viewer for selected file */}
              {selectedFile.result.issues.length > 0 && (
                <CodeViewer
                  code={fileContents.get(selectedFile.fileName) || ''}
                  issues={selectedFile.result.issues}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Analysis Time */}
      <div className="text-xs text-foreground/40 text-right">
        Analyzed in {(result.totalAnalysisTimeMs / 1000).toFixed(2)}s
      </div>
    </div>
  );
}
