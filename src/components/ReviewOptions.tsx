'use client';

import { ReviewOptions as ReviewOptionsType } from '@/types';

interface ReviewOptionsProps {
  options: ReviewOptionsType;
  onChange: (options: ReviewOptionsType) => void;
}

const REVIEW_DESCRIPTIONS = {
  solid: {
    title: 'SOLID Principles',
    description: 'Detect violations of SRP, OCP, LSP, ISP, and DIP',
    icon: '🎯',
    color: 'from-blue-500 to-cyan-500',
  },
  hygiene: {
    title: 'Code Hygiene',
    description: 'Check naming, magic numbers, and error handling',
    icon: '✨',
    color: 'from-purple-500 to-pink-500',
  },
  unnecessary: {
    title: 'Dead Code',
    description: 'Find unused variables and redundant logic',
    icon: '🔍',
    color: 'from-orange-500 to-red-500',
  },
  simplicity: {
    title: 'Simplicity',
    description: 'Identify over-engineering and complexity',
    icon: '⚡',
    color: 'from-green-500 to-emerald-500',
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
    <div className="card p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <label className="text-sm font-semibold text-foreground">Review Types</label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(Object.keys(REVIEW_DESCRIPTIONS) as Array<keyof ReviewOptionsType>).map((key) => {
          const { title, description, icon, color } = REVIEW_DESCRIPTIONS[key];
          const isSelected = options[key];

          return (
            <label
              key={key}
              className={`group relative cursor-pointer transition-all duration-200 ${
                isSelected ? 'scale-100' : 'hover:scale-[1.02]'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggle(key)}
                className="sr-only peer"
              />
              <div
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-primary-300'
                }`}
              >
                {/* Gradient background on hover/select */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 ${
                    isSelected ? 'peer-checked:opacity-5' : 'group-hover:opacity-5'
                  } rounded-xl transition-opacity`}
                />

                {/* Checkmark indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                <div className="relative flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0">{icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground mb-0.5">{title}</div>
                    <div className="text-xs text-foreground/60 leading-relaxed">{description}</div>
                  </div>
                </div>
              </div>
            </label>
          );
        })}
      </div>

      <div className="flex items-start gap-2 text-xs text-foreground/60">
        <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>Select at least one review type. Combine multiple for comprehensive analysis.</p>
      </div>
    </div>
  );
}
