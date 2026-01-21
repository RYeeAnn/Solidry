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
  onAnalyze: () => void;
  isAnalyzing: boolean;
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
}: CodeInputProps) {
  const [lineCount, setLineCount] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    const lines = newValue.split('\n').length;
    setLineCount(lines);
  };

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

      <div className="text-xs text-foreground/40">
        {lineCount} lines · {value.length} characters
      </div>
    </div>
  );
}
