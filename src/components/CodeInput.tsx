'use client';

import { useState, useRef, useEffect } from 'react';
import { ProgrammingLanguage, ReviewOptions } from '@/types';
import { getLanguageName } from '@/utils/languageDetect';
import { REVIEW_DESCRIPTIONS } from '@/constants/reviewDescriptions';

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  language: ProgrammingLanguage;
  onLanguageChange: (language: ProgrammingLanguage) => void;
  placeholder?: string;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  reviewOptions: ReviewOptions;
  onReviewOptionsChange: (options: ReviewOptions) => void;
}

const SUPPORTED_LANGUAGES: ProgrammingLanguage[] = [
  'auto',
  'typescript',
  'javascript',
  'python',
  'java',
  'csharp',
  'go',
  'rust',
  'cpp',
];

export default function CodeInput({
  value,
  onChange,
  language,
  onLanguageChange,
  placeholder = 'Paste your code here...',
  onAnalyze,
  isAnalyzing,
  reviewOptions,
  onReviewOptionsChange,
}: CodeInputProps) {
  const [lineCount, setLineCount] = useState(1);
  const [isReviewDropdownOpen, setIsReviewDropdownOpen] = useState(false);
  const reviewDropdownRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    const lines = newValue.split('\n').length;
    setLineCount(lines);
  };

  const handleToggleReview = (key: keyof ReviewOptions) => {
    onReviewOptionsChange({
      ...reviewOptions,
      [key]: !reviewOptions[key],
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (reviewDropdownRef.current && !reviewDropdownRef.current.contains(event.target as Node)) {
        setIsReviewDropdownOpen(false);
      }
    };

    if (isReviewDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isReviewDropdownOpen]);

  // Count selected review options
  const selectedCount = Object.values(reviewOptions).filter(Boolean).length;

  // Check if approaching character limit (90% of 50,000)
  const charLimit = 50000;
  const warningThreshold = charLimit * 0.9; // 45,000 characters
  const isApproachingLimit = value.length >= warningThreshold;
  const percentUsed = Math.round((value.length / charLimit) * 100);

  return (
    <div className="panel p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label htmlFor="code-input" className="text-sm font-medium">
            Code
          </label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as ProgrammingLanguage)}
            className="text-xs border border-border rounded px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-foreground/20"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {getLanguageName(lang)}
              </option>
            ))}
          </select>

          {/* Review Dropdown */}
          <div className="relative" ref={reviewDropdownRef}>
            <button
              type="button"
              onClick={() => setIsReviewDropdownOpen(!isReviewDropdownOpen)}
              className="text-xs border border-border rounded px-2 py-1 bg-background hover:bg-foreground/5 focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-colors flex items-center gap-1.5"
            >
              Review
              {selectedCount > 0 && (
                <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] rounded-full bg-foreground/10">
                  {selectedCount}
                </span>
              )}
              <svg
                className={`w-3 h-3 transition-transform ${isReviewDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isReviewDropdownOpen && (
              <div className="absolute z-10 mt-1 w-80 panel border border-border rounded shadow-lg p-3 space-y-2">
                <div className="text-xs font-medium text-foreground/70 mb-2">Select review types:</div>
                {(Object.keys(REVIEW_DESCRIPTIONS) as Array<keyof ReviewOptions>).map((key) => {
                  const { title, description } = REVIEW_DESCRIPTIONS[key];
                  return (
                    <label
                      key={key}
                      className="flex items-start gap-2 cursor-pointer hover:bg-foreground/5 p-2 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={reviewOptions[key]}
                        onChange={() => handleToggleReview(key)}
                        className="mt-0.5 rounded border-border"
                      />
                      <div className="flex-1">
                        <div className="text-xs font-medium">{title}</div>
                        <div className="text-[11px] text-foreground/60 leading-snug">{description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing || !value.trim()}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      <textarea
        id="code-input"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full h-64 px-3 py-2 font-mono text-xs border border-border rounded bg-background resize-y focus:outline-none focus:ring-1 focus:ring-foreground/20"
        spellCheck={false}
      />

      <div className="flex items-center justify-between text-xs">
        <div className="text-foreground/40">
          {lineCount} lines · {value.length.toLocaleString()} characters
        </div>
        {isApproachingLimit && (
          <div className={`font-medium ${value.length >= charLimit ? 'text-red-600 dark:text-red-400' : 'text-yellow-700 dark:text-yellow-400'}`}>
            {value.length >= charLimit ? 'Character limit reached!' : `${percentUsed}% of limit`}
          </div>
        )}
      </div>
    </div>
  );
}
