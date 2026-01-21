'use client';

import { useState } from 'react';
import { ProgrammingLanguage, ReviewOptions as ReviewOptionsType, AnalysisResult } from '@/types';
import CodeInput from '@/components/CodeInput';
import ReviewOptions from '@/components/ReviewOptions';
import ScoreCard from '@/components/ScoreCard';
import ResultsSummary from '@/components/ResultsSummary';
import CodeViewer from '@/components/CodeViewer';

export default function ReviewPage() {
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
    // Validation
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="mb-6 p-4 bg-blue-500/10 border-2 border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🎭</div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Demo Mode Active</h3>
                <p className="text-sm text-foreground/70">
                  You're using sample analysis without API calls. Results are simulated based on common code patterns.
                  To use real AI analysis, add your Anthropic API key to <code className="bg-foreground/10 px-1 rounded">.env.local</code> and set <code className="bg-foreground/10 px-1 rounded">NEXT_PUBLIC_DEMO_MODE=false</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            SOLIDify Code Review
          </h1>
          <p className="text-foreground/70">
            AI-powered analysis for SOLID principles, code hygiene, and quality
          </p>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Input */}
          <div className="flex flex-col gap-6">
            <CodeInput
              value={code}
              onChange={setCode}
              language={language}
              onLanguageChange={setLanguage}
            />

            <ReviewOptions options={reviewOptions} onChange={setReviewOptions} />

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !code.trim()}
              className="w-full py-3 px-6 bg-foreground text-background rounded-lg font-semibold hover:bg-foreground/90 disabled:bg-foreground/50 disabled:cursor-not-allowed transition-colors"
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Analyzing...
                </span>
              ) : (
                'Analyze Code'
              )}
            </button>

            {/* Error message */}
            {error && (
              <div className="p-4 bg-critical/10 border border-critical/30 rounded-lg">
                <p className="text-sm text-critical font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Right column - Results */}
          <div className="flex flex-col gap-6">
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
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-foreground/20 rounded-lg">
                <p className="text-foreground/50 text-center px-4">
                  Enter code and click "Analyze Code" to see results
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Code viewer - Full width below */}
        {result && result.issues.length > 0 && (
          <div className="mt-8">
            <CodeViewer code={code} issues={result.issues} />
          </div>
        )}
      </div>
    </div>
  );
}
