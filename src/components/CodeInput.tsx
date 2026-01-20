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
    <div className="flex flex-col gap-3">
      {/* Header with language selector */}
      <div className="flex items-center justify-between">
        <label htmlFor="code-input" className="text-sm font-medium text-foreground">
          Code Input
        </label>
        <div className="flex items-center gap-2">
          <label htmlFor="language-select" className="text-sm text-foreground/70">
            Language:
          </label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as ProgrammingLanguage)}
            className="rounded-md border border-foreground/20 bg-background px-3 py-1.5 text-sm focus:border-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/20"
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
          className="w-full h-96 px-4 py-3 font-mono text-sm rounded-lg border border-foreground/20 bg-background text-foreground placeholder:text-foreground/40 focus:border-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/20 resize-y"
          spellCheck={false}
        />
        <div className="absolute bottom-2 right-2 text-xs text-foreground/50">
          {lineCount} {lineCount === 1 ? 'line' : 'lines'} • {value.length} chars
        </div>
      </div>

      {/* Helper text */}
      <p className="text-xs text-foreground/60">
        Supports raw code and git diffs. Code will be analyzed for SOLID principles, hygiene, and quality issues.
      </p>
    </div>
  );
}
