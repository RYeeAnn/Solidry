'use client';

import { QualityGrade } from '@/types';

interface ScoreCardProps {
  score: number;
  grade: QualityGrade;
}

export default function ScoreCard({ score, grade }: ScoreCardProps) {
  return (
    <div className="panel p-4 space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">Quality Score</span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold">{score}</span>
          <span className="text-sm text-foreground/50">/ 100</span>
        </div>
      </div>

      <div className="h-1.5 bg-foreground/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-foreground transition-all duration-500"
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-foreground/50">Grade</span>
        <span className="text-lg font-semibold">{grade}</span>
      </div>
    </div>
  );
}
