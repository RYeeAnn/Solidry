'use client';

import { useState } from 'react';
import Link from 'next/link';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-blue-950/30 dark:to-slate-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-200/20 dark:bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors group"
          >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="mb-8 glass rounded-2xl p-5 border-2 border-primary-500/30 animate-slide-down">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                🎭
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1.5 text-lg">Demo Mode Active</h3>
                <p className="text-sm text-foreground/70 leading-relaxed">
                  Currently using pattern-based analysis for demonstration. For professional-grade AI code review,
                  add your Anthropic API key to <code className="px-2 py-0.5 bg-foreground/10 rounded text-xs font-mono">.env.local</code> and
                  set <code className="px-2 py-0.5 bg-foreground/10 rounded text-xs font-mono">NEXT_PUBLIC_DEMO_MODE=false</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-10 text-center animate-fade-in">
          <h1 className="text-5xl font-bold mb-3">
            <span className="text-gradient">Code Review</span>
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Paste your code below and get instant feedback on SOLID principles, code hygiene, and best practices
          </p>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Left column - Input */}
          <div className="flex flex-col gap-6 animate-slide-up">
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
              className="group relative w-full py-4 px-6 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:scale-100 transition-all duration-200 overflow-hidden hover:scale-105 active:scale-95"
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center gap-3">
                  <svg
                    className="animate-spin h-6 w-6"
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
                  <span>Analyzing your code...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Analyze Code
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </button>

            {/* Error message */}
            {error && (
              <div className="p-4 bg-critical-light/10 border-2 border-critical rounded-xl animate-slide-down">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-critical flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-critical font-medium">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right column - Results */}
          <div className="flex flex-col gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
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
              <div className="card flex items-center justify-center min-h-[400px] border-2 border-dashed">
                <div className="text-center px-6 py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Analyze</h3>
                  <p className="text-foreground/60 max-w-sm">
                    Paste your code on the left, select review types, and click "Analyze Code" to get professional feedback
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Code viewer - Full width below */}
        {result && result.issues.length > 0 && (
          <div className="mt-8 animate-fade-in">
            <CodeViewer code={code} issues={result.issues} />
          </div>
        )}
      </div>
    </div>
  );
}
