'use client';

import { useState } from 'react';
import { ProgrammingLanguage } from '@/types';
import { getLanguageName } from '@/utils/languageDetect';

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  language: ProgrammingLanguage;
  onLanguageChange: (language: ProgrammingLanguage) => void;
  placeholder?: string;
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
  placeholder = 'Paste your code or git diff here...',
}: CodeInputProps) {
  const [lineCount, setLineCount] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Update line count
    const lines = newValue.split('\n').length;
    setLineCount(lines);
  };

  return (
    <div className="card p-6 flex flex-col gap-4">
      {/* Header with language selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <label htmlFor="code-input" className="text-sm font-semibold text-foreground">
            Code Input
          </label>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="language-select" className="text-sm text-foreground/60">
            Language:
          </label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as ProgrammingLanguage)}
            className="rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm font-medium focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {getLanguageName(lang)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Code textarea */}
      <div className="relative">
        <textarea
          id="code-input"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full h-96 px-4 py-3 font-mono text-sm rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-foreground placeholder:text-foreground/40 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-y transition-colors"
          spellCheck={false}
        />
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 text-xs text-foreground/60 font-medium">
          {lineCount} {lineCount === 1 ? 'line' : 'lines'} • {value.length} chars
        </div>
      </div>

      {/* Helper text */}
      <div className="flex items-start gap-2 text-xs text-foreground/60">
        <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>Supports raw code and git diffs. Auto-detects language or select manually above.</p>
      </div>
    </div>
  );
}
