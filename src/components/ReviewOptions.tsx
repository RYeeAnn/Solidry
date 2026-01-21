'use client';

import { ReviewOptions as ReviewOptionsType } from '@/types';

interface ReviewOptionsProps {
  options: ReviewOptionsType;
  onChange: (options: ReviewOptionsType) => void;
}

const REVIEW_DESCRIPTIONS = {
  solid: {
    title: 'SOLID Principles',
    description: 'SRP, OCP, LSP, ISP, DIP',
  },
  hygiene: {
    title: 'Code Hygiene',
    description: 'Naming, conventions, patterns',
  },
  unnecessary: {
    title: 'Dead Code',
    description: 'Unused variables, redundant logic',
  },
  simplicity: {
    title: 'Complexity',
    description: 'Over-engineering, abstractions',
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
    <div className="panel p-4 space-y-3">
      <label className="text-sm font-medium">Review</label>

      <div className="space-y-2">
        {(Object.keys(REVIEW_DESCRIPTIONS) as Array<keyof ReviewOptionsType>).map((key) => {
          const { title, description } = REVIEW_DESCRIPTIONS[key];
          return (
            <label
              key={key}
              className="flex items-start gap-3 p-2 rounded cursor-pointer hover:bg-foreground/5 transition-colors"
            >
              <input
                type="checkbox"
                checked={options[key]}
                onChange={() => handleToggle(key)}
                className="mt-0.5 rounded border-border"
              />
              <div className="flex-1">
                <div className="text-sm">{title}</div>
                <div className="text-xs text-foreground/50">{description}</div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
