'use client';

import { QualityGrade } from '@/types';
import { getGradeColor, getGradeMessage } from '@/utils/scoring';

interface ScoreCardProps {
  score: number;
  grade: QualityGrade;
}

export default function ScoreCard({ score, grade }: ScoreCardProps) {
  const gradeColor = getGradeColor(grade);
  const message = getGradeMessage(grade);

  // Calculate the progress bar width
  const progressWidth = score;

  return (
    <div className="bg-gradient-to-br from-foreground/5 to-foreground/10 rounded-xl p-6 border border-foreground/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Code Quality Score</h3>
        <div className={`text-5xl font-bold ${gradeColor}`}>{grade}</div>
      </div>

      {/* Score bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-foreground/70">Overall Score</span>
          <span className="text-2xl font-bold text-foreground">{score}/100</span>
        </div>
        <div className="h-3 bg-foreground/10 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ease-out ${
              score >= 90
                ? 'bg-green-500'
                : score >= 80
                ? 'bg-blue-500'
                : score >= 70
                ? 'bg-yellow-500'
                : score >= 60
                ? 'bg-orange-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>

      {/* Message */}
      <p className="text-sm text-foreground/80 text-center mt-4">{message}</p>
    </div>
  );
}
