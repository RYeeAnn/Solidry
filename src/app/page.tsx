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
import { checkLanguageMismatch } from '@/utils/languageDetect';

type AnalysisMode = 'single' | 'multi';

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
    unnecessary: false,
    simplicity: false,
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Solidry</h1>
          {isDemoMode && <span className="text-xs text-foreground/50">Demo Mode</span>}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {/* Mode Toggle */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => handleModeChange('single')}
            className={`px-4 py-2 text-sm rounded transition-colors ${
              analysisMode === 'single'
                ? 'bg-foreground text-background'
                : 'bg-foreground/10 hover:bg-foreground/20'
            }`}
          >
            Single File
          </button>
          <button
            onClick={() => handleModeChange('multi')}
            className={`px-4 py-2 text-sm rounded transition-colors ${
              analysisMode === 'multi'
                ? 'bg-foreground text-background'
                : 'bg-foreground/10 hover:bg-foreground/20'
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
                      className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAnalyzing ? 'Analyzing...' : `Analyze ${multiFiles.length} File${multiFiles.length !== 1 ? 's' : ''}`}
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
                            className="rounded border-border"
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
            {analysisMode === 'single' ? (
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
                <div className="panel p-12 flex items-center justify-center min-h-[400px]">
                  <p className="text-sm text-foreground/40">No results yet</p>
                </div>
              )
            ) : multiResult ? (
              <MultiFileResults result={multiResult} fileContents={fileContentsMap} />
            ) : (
              <div className="panel p-12 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <p className="text-sm text-foreground/40">No results yet</p>
                  <p className="text-xs text-foreground/30 mt-1">
                    Upload files and click Analyze
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Code Viewer (Single File Mode) */}
        {analysisMode === 'single' && result && result.issues.length > 0 && (
          <div className="mt-6">
            <CodeViewer code={code} issues={result.issues} />
          </div>
        )}
      </main>
    </div>
  );
}
