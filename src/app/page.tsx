'use client';

import { useState } from 'react';
import { ProgrammingLanguage, ReviewOptions as ReviewOptionsType, AnalysisResult } from '@/types';
import CodeInput from '@/components/CodeInput';
import ReviewOptions from '@/components/ReviewOptions';
import ScoreCard from '@/components/ScoreCard';
import ResultsSummary from '@/components/ResultsSummary';
import CodeViewer from '@/components/CodeViewer';
import ExampleCodeSelector from '@/components/ExampleCodeSelector';

export default function HomePage() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<ProgrammingLanguage>('auto');
  const [reviewOptions, setReviewOptions] = useState<ReviewOptionsType>({
    solid: true,
    hygiene: true,
    unnecessary: false,
    simplicity: false,
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setError('Please enter some code to analyze');
      return;
    }

    const selectedReviews = Object.entries(reviewOptions)
      .filter(([_, enabled]) => enabled)
      .map(([key, _]) => key);

    if (selectedReviews.length === 0) {
      setError('Please select at least one review type');
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          reviewTypes: selectedReviews,
          inputType: 'code',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectExample = (exampleCode: string, exampleLanguage: ProgrammingLanguage) => {
    setCode(exampleCode);
    setLanguage(exampleLanguage);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">SOLIDify</h1>
          {isDemoMode && (
            <span className="text-xs text-foreground/50">Demo Mode</span>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left: Input */}
          <div className="space-y-4">
            <CodeInput
              value={code}
              onChange={setCode}
              language={language}
              onLanguageChange={setLanguage}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
            />

            {/* Example Code Selector */}
            <ExampleCodeSelector onSelectExample={handleSelectExample} />

            {/* Review Options */}
            <div className="panel p-4 space-y-3">
              <label className="text-sm font-medium">Review</label>
              <ReviewOptions
                options={reviewOptions}
                onChange={setReviewOptions}
              />
            </div>

            {error && (
              <div className="panel p-3 border-red-500/20 bg-red-500/5">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Right: Results */}
          <div className="space-y-4">
            {result ? (
              <>
                <ScoreCard score={result.score} grade={result.grade} />
                <ResultsSummary
                  issues={result.issues}
                  metrics={result.metrics}
                  summary={result.summary}
                />
              </>
            ) : (
              <div className="panel p-12 flex items-center justify-center min-h-[400px]">
                <p className="text-sm text-foreground/40">No results yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Code Viewer */}
        {result && result.issues.length > 0 && (
          <div className="mt-6">
            <CodeViewer code={code} issues={result.issues} />
          </div>
        )}
      </main>
    </div>
  );
}
