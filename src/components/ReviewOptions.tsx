'use client';

import { ReviewOptions as ReviewOptionsType } from '@/types';

interface ReviewOptionsProps {
  options: ReviewOptionsType;
  onChange: (options: ReviewOptionsType) => void;
}

const REVIEW_DESCRIPTIONS = {
  solid: {
    title: 'SOLID Principles',
    description: 'Check for violations of SOLID principles (SRP, OCP, LSP, ISP, DIP)',
  },
  hygiene: {
    title: 'Code Hygiene',
    description: 'Check for naming conventions, magic numbers, error handling, and cleanliness',
  },
  unnecessary: {
    title: 'Unnecessary Code',
    description: 'Detect unused variables, dead code, and redundant logic',
  },
  simplicity: {
    title: 'Simplicity Check',
    description: 'Identify over-engineering, premature abstraction, and unnecessary complexity',
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
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-foreground">Review Types</label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(Object.keys(REVIEW_DESCRIPTIONS) as Array<keyof ReviewOptionsType>).map((key) => {
          const { title, description } = REVIEW_DESCRIPTIONS[key];
          return (
            <label
              key={key}
              className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                options[key]
                  ? 'border-foreground/40 bg-foreground/5'
                  : 'border-foreground/10 hover:border-foreground/20'
              }`}
            >
              <input
                type="checkbox"
                checked={options[key]}
                onChange={() => handleToggle(key)}
                className="mt-0.5 h-4 w-4 rounded border-foreground/30 text-foreground focus:ring-2 focus:ring-foreground/20 cursor-pointer"
              />
              <div className="flex-1">
                <div className="font-medium text-sm text-foreground">{title}</div>
                <div className="text-xs text-foreground/60 mt-1">{description}</div>
              </div>
            </label>
          );
        })}
      </div>

      <p className="text-xs text-foreground/60">
        Select at least one review type to analyze your code.
      </p>
    </div>
  );
}
