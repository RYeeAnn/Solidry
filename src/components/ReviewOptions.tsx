'use client';

import { ReviewOptions as ReviewOptionsType } from '@/types';

interface ReviewOptionsProps {
  options: ReviewOptionsType;
  onChange: (options: ReviewOptionsType) => void;
}

const REVIEW_DESCRIPTIONS = {
  solid: {
    title: 'SOLID Principles',
    description: 'Checks for violations of SOLID design principles (SRP, OCP, LSP, ISP, DIP)',
  },
  hygiene: {
    title: 'Code Hygiene',
    description: 'Identifies code quality issues like console.log, var usage, TODO comments, and type safety',
  },
  unnecessary: {
    title: 'Dead Code',
    description: 'Detects commented-out code, empty catch blocks, and unused code',
  },
  simplicity: {
    title: 'Complexity',
    description: 'Analyzes code complexity including deep nesting, magic numbers, and unclear variable names',
  },
};

export default function ReviewOptions({ options, onChange }: ReviewOptionsProps) {
  const handleToggle = (key: keyof ReviewOptionsType) => {
    onChange({
      ...options,
      [key]: !options[key],
    });
  };

  return (
    <div className="space-y-3">
      {(Object.keys(REVIEW_DESCRIPTIONS) as Array<keyof ReviewOptionsType>).map((key) => {
        const { title, description } = REVIEW_DESCRIPTIONS[key];
        return (
          <label
            key={key}
            className="flex items-start gap-3 cursor-pointer hover:bg-foreground/5 p-2 rounded transition-colors"
          >
            <input
              type="checkbox"
              checked={options[key]}
              onChange={() => handleToggle(key)}
              className="mt-0.5 rounded border-border"
            />
            <div className="flex-1">
              <div className="text-sm font-medium">{title}</div>
              <div className="text-xs text-foreground/60">{description}</div>
            </div>
          </label>
        );
      })}
    </div>
  );
}
