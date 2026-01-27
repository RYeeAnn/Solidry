'use client';

import { useState, useEffect } from 'react';
import {
  ProgrammingLanguage,
  ReviewOptions as ReviewOptionsType,
  AnalysisResult,
  MultiFileAnalysisResult,
} from '@/types';
import CodeInput from '@/components/CodeInput';
import ScoreCard from '@/components/ScoreCard';
import ResultsSummary from '@/components/ResultsSummary';
import CodeViewer from '@/components/CodeViewer';
import ExampleCodeSelector from '@/components/ExampleCodeSelector';
import ConfidenceIndicator from '@/components/ConfidenceIndicator';
import FileUpload from '@/components/FileUpload';
import MultiFileUpload, { UploadedFile } from '@/components/MultiFileUpload';
import MultiFileResults from '@/components/MultiFileResults';
import AnalysisSkeleton from '@/components/AnalysisSkeleton';
import { checkLanguageMismatch } from '@/utils/languageDetect';

type AnalysisMode = 'single' | 'multi';

const DEMO_CODE = `class UserService {
  constructor() {
    // Direct instantiation - violates DIP
    this.database = new PostgresDatabase();
    this.cache = new RedisCache();
  }

  // Multiple responsibilities - violates SRP
  saveUserAndSendEmail(user, emailTemplate) {
    this.database.save(user);
    this.sendEmail(user.email, emailTemplate);
    this.logActivity(user.id, 'user_created');
    this.updateAnalytics(user);
  }
}

function getUserData(id: any, name: string, email: string, phone: string) {
  console.log('Fetching user data for:', id);

  const data = fetch('https://api.example.com/users/' + id);

  if (data) {
    console.log('Data found:', data);
    return data;
  } else {
    return null;
  }
}`;

export default function HomePage() {
  // Analysis mode
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('single');

  // Single file state
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<ProgrammingLanguage>('auto');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Multi-file state
  const [multiFiles, setMultiFiles] = useState<UploadedFile[]>([]);

  // Shared state
  const [reviewOptions, setReviewOptions] = useState<ReviewOptionsType>({
    solid: true,
    hygiene: true,
    unnecessary: true,
    simplicity: true,
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [multiResult, setMultiResult] = useState<MultiFileAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  const handleModeChange = (mode: AnalysisMode) => {
    setAnalysisMode(mode);
    setResult(null);
    setMultiResult(null);
    setError(null);
  };

  const getSelectedReviewTypes = () => {
    return Object.entries(reviewOptions)
      .filter(([, enabled]) => enabled)
      .map(([key]) => key);
  };

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setError('Please enter some code to analyze');
      return;
    }

    const selectedReviews = getSelectedReviewTypes();
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
        headers: { 'Content-Type': 'application/json' },
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

  const handleMultiAnalyze = async () => {
    if (multiFiles.length === 0) {
      setError('Please upload at least one file');
      return;
    }

    const selectedReviews = getSelectedReviewTypes();
    if (selectedReviews.length === 0) {
      setError('Please select at least one review type');
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setMultiResult(null);

    try {
      const response = await fetch('/api/analyze-multi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: multiFiles.map((f) => ({
            name: f.name,
            content: f.content,
            language: f.language,
          })),
          reviewTypes: selectedReviews,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          Array.isArray(errorData.details)
            ? errorData.details.join('. ')
            : errorData.details || errorData.error || 'Analysis failed'
        );
      }

      const data = await response.json();
      setMultiResult(data);
    } catch (err) {
      console.error('Multi-file analysis error:', err);
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
    setUploadedFileName(null);
  };

  const handleFileSelect = (
    content: string,
    fileLanguage: ProgrammingLanguage,
    fileName: string
  ) => {
    setCode(content);
    setLanguage(fileLanguage);
    setResult(null);
    setError(null);
    setWarning(null);
    setUploadedFileName(fileName);
  };

  const handleTryDemo = () => {
    setCode(DEMO_CODE);
    setLanguage('typescript');
    setResult(null);
    setError(null);
    setWarning(null);
    setUploadedFileName(null);
  };

  // Check for language mismatch whenever code or language changes (with debounce)
  useEffect(() => {
    if (analysisMode !== 'single') return;

    const timeoutId = setTimeout(() => {
      if (code.trim().length > 0) {
        const mismatchWarning = checkLanguageMismatch(language, code);
        setWarning(mismatchWarning);
      } else {
        setWarning(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [code, language, analysisMode]);

  // Create file contents map for multi-file results
  const fileContentsMap = new Map(multiFiles.map((f) => [f.name, f.content]));

  const hasResults = analysisMode === 'single' ? !!result : !!multiResult;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold">SOLIDify</h1>
            <p className="text-[10px] text-foreground/40 -mt-0.5 hidden sm:block">AI Code Quality Analyzer</p>
          </div>
          {isDemoMode && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
              Demo Mode
            </span>
          )}
        </div>
      </header>

      {/* Hero Section */}
      {!hasResults && !isAnalyzing && (
        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-8 sm:py-10">
            <div className="max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Analyze code quality with{' '}
                <span className="gradient-text">AI precision</span>
              </h2>
              <p className="mt-3 text-sm sm:text-base text-foreground/60 leading-relaxed">
                Paste your code and get instant feedback on SOLID and DRY principles, code hygiene,
                complexity, and best practices. Powered by Claude AI.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  { label: '8 Languages', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
                  { label: '4 Review Types', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
                  { label: 'AI-Powered', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                ].map((pill) => (
                  <span
                    key={pill.label}
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-foreground/5 text-foreground/60 border border-border"
                  >
                    <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={pill.icon} />
                    </svg>
                    {pill.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        {/* Mode Toggle */}
        <div className="flex items-center gap-1 mb-6 p-1 bg-foreground/5 rounded-lg w-fit">
          <button
            onClick={() => handleModeChange('single')}
            className={`px-4 py-1.5 text-sm rounded-md transition-all duration-200 ${
              analysisMode === 'single'
                ? 'bg-background text-foreground shadow-sm font-medium'
                : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            Single File
          </button>
          <button
            onClick={() => handleModeChange('multi')}
            className={`px-4 py-1.5 text-sm rounded-md transition-all duration-200 ${
              analysisMode === 'multi'
                ? 'bg-background text-foreground shadow-sm font-medium'
                : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            Multiple Files
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left: Input */}
          <div className="space-y-4">
            {analysisMode === 'single' ? (
              <>
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

                {/* File Upload */}
                <FileUpload onFileSelect={handleFileSelect} disabled={isAnalyzing} />

                {uploadedFileName && (
                  <div className="text-xs text-foreground/60 px-1">
                    Loaded: <span className="font-medium">{uploadedFileName}</span>
                  </div>
                )}

                {/* Example Code Selector */}
                <ExampleCodeSelector onSelectExample={handleSelectExample} language={language} />
              </>
            ) : (
              <>
                {/* Multi-File Upload */}
                <div className="panel p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Files</label>
                    <button
                      onClick={handleMultiAnalyze}
                      disabled={isAnalyzing || multiFiles.length === 0}
                      className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      {isAnalyzing ? (
                        <span className="flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Analyzing...
                        </span>
                      ) : (
                        `Analyze ${multiFiles.length} File${multiFiles.length !== 1 ? 's' : ''}`
                      )}
                    </button>
                  </div>

                  <MultiFileUpload
                    files={multiFiles}
                    onFilesChange={setMultiFiles}
                    disabled={isAnalyzing}
                  />

                  {/* Review Options for Multi-file */}
                  <div className="pt-3 border-t border-border">
                    <div className="text-xs font-medium text-foreground/70 mb-2">Review Types:</div>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(reviewOptions) as Array<keyof ReviewOptionsType>).map((key) => (
                        <label
                          key={key}
                          className="flex items-center gap-1.5 text-xs cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={reviewOptions[key]}
                            onChange={() =>
                              setReviewOptions({ ...reviewOptions, [key]: !reviewOptions[key] })
                            }
                            className="rounded border-border accent-accent"
                          />
                          <span className="capitalize">{key}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {warning && (
              <div className="panel p-3 border-yellow-500/20 bg-yellow-500/5 flex items-start justify-between gap-2">
                <p className="text-sm text-yellow-700 dark:text-yellow-400 flex-1">{warning}</p>
                <button
                  onClick={() => setWarning(null)}
                  className="text-yellow-700 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-200 transition-colors"
                  aria-label="Dismiss warning"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
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
            {isAnalyzing ? (
              <AnalysisSkeleton />
            ) : analysisMode === 'single' ? (
              result ? (
                <>
                  <ScoreCard score={result.score} grade={result.grade} />
                  <ConfidenceIndicator confidence={result.confidence} metadata={result.metadata} />
                  <ResultsSummary
                    issues={result.issues}
                    metrics={result.metrics}
                    summary={result.summary}
                  />
                </>
              ) : (
                /* Empty State */
                <div className="panel p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
                  {/* Decorative gauge preview */}
                  <div className="relative mb-6">
                    <svg width="80" height="80" viewBox="0 0 80 80" className="transform -rotate-90 text-foreground/10">
                      <circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" strokeWidth="6" />
                      <circle
                        cx="40" cy="40" r="30" fill="none"
                        stroke="url(#emptyGradient)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 30}
                        strokeDashoffset={2 * Math.PI * 30 * 0.35}
                        opacity={0.3}
                      />
                      <defs>
                        <linearGradient id="emptyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="rgb(var(--accent))" />
                          <stop offset="100%" stopColor="rgb(var(--accent-secondary))" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-foreground/20">?</span>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-foreground/50 mb-1">No results yet</p>
                  <p className="text-xs text-foreground/30 mb-6 max-w-[240px]">
                    Paste code or upload a file, then click Analyze to see your code quality report
                  </p>

                  {/* What we analyze */}
                  <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                    {[
                      { name: 'SOLID Principles', color: 'text-accent' },
                      { name: 'Code Hygiene', color: 'text-green-500' },
                      { name: 'Dead Code & DRY', color: 'text-yellow-500' },
                      { name: 'Complexity', color: 'text-orange-500' },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center gap-2 text-xs text-foreground/40">
                        <div className={`w-1.5 h-1.5 rounded-full ${item.color} opacity-60`} style={{ backgroundColor: 'currentColor' }} />
                        {item.name}
                      </div>
                    ))}
                  </div>

                  {/* Try Demo Button */}
                  {!code && (
                    <button
                      onClick={handleTryDemo}
                      className="mt-6 btn btn-secondary text-xs group"
                    >
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-accent group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Try with Example Code
                      </span>
                    </button>
                  )}
                </div>
              )
            ) : multiResult ? (
              <MultiFileResults result={multiResult} fileContents={fileContentsMap} />
            ) : (
              <div className="panel p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="relative mb-6">
                  <svg width="80" height="80" viewBox="0 0 80 80" className="transform -rotate-90 text-foreground/10">
                    <circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" strokeWidth="6" />
                    <circle
                      cx="40" cy="40" r="30" fill="none"
                      stroke="url(#emptyGradient2)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 30}
                      strokeDashoffset={2 * Math.PI * 30 * 0.35}
                      opacity={0.3}
                    />
                    <defs>
                      <linearGradient id="emptyGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgb(var(--accent))" />
                        <stop offset="100%" stopColor="rgb(var(--accent-secondary))" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-foreground/20">?</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-foreground/50 mb-1">No results yet</p>
                <p className="text-xs text-foreground/30">
                  Upload files and click Analyze to see results
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Code Viewer (Single File Mode) */}
        {analysisMode === 'single' && result && result.issues.length > 0 && (
          <div className="mt-6 animate-fade-in-up">
            <CodeViewer code={code} issues={result.issues} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-xs text-foreground/30">
            Built with Next.js, TypeScript &amp; Claude AI
          </div>
          <div className="text-xs text-foreground/30">
            SOLIDify
          </div>
        </div>
      </footer>
    </div>
  );
}
