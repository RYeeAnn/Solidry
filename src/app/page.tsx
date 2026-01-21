'use client';

import { useState, useEffect } from 'react';
import { ProgrammingLanguage, ReviewOptions as ReviewOptionsType, AnalysisResult } from '@/types';
import CodeInput from '@/components/CodeInput';
import ScoreCard from '@/components/ScoreCard';
import ResultsSummary from '@/components/ResultsSummary';
import CodeViewer from '@/components/CodeViewer';
import ExampleCodeSelector from '@/components/ExampleCodeSelector';
import ConfidenceIndicator from '@/components/ConfidenceIndicator';
import { checkLanguageMismatch } from '@/utils/languageDetect';

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
  const [warning, setWarning] = useState<string | null>(null);
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
    setWarning(null);
  };

  // Check for language mismatch whenever code or language changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (code.trim().length > 0) {
        const mismatchWarning = checkLanguageMismatch(language, code);
        setWarning(mismatchWarning);
      } else {
        setWarning(null);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [code, language]);

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
              reviewOptions={reviewOptions}
              onReviewOptionsChange={setReviewOptions}
            />

            {/* Example Code Selector */}
            <ExampleCodeSelector onSelectExample={handleSelectExample} language={language} />

            {warning && (
              <div className="panel p-3 border-yellow-500/20 bg-yellow-500/5 flex items-start justify-between gap-2">
                <p className="text-sm text-yellow-700 dark:text-yellow-400 flex-1">{warning}</p>
                <button
                  onClick={() => setWarning(null)}
                  className="text-yellow-700 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-200 transition-colors"
                  aria-label="Dismiss warning"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

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
                <ConfidenceIndicator
                  confidence={result.confidence}
                  metadata={result.metadata}
                />
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
