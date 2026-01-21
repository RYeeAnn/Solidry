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
    <div className="card p-8 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-950/20 dark:to-blue-950/20 border-2 border-primary-200 dark:border-primary-800 animate-scale-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-sm font-medium text-foreground/60 mb-1">Code Quality Score</div>
          <h3 className="text-3xl font-bold text-foreground">{score}/100</h3>
        </div>
        <div className="relative">
          <div className="absolute inset-0 blur-2xl opacity-30">
            <div className={`w-24 h-24 rounded-full ${gradeColor}`} />
          </div>
          <div className={`relative w-24 h-24 ${gradeColor} rounded-2xl flex items-center justify-center shadow-lg`}>
            <span className="text-5xl font-bold text-white drop-shadow-lg">{grade}</span>
          </div>
        </div>
      </div>

      {/* Score bar */}
      <div className="mb-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full transition-all duration-1000 ease-out shadow-lg ${
              score >= 90
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : score >= 80
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                : score >= 70
                ? 'bg-gradient-to-r from-yellow-500 to-orange-400'
                : score >= 60
                ? 'bg-gradient-to-r from-orange-500 to-red-500'
                : 'bg-gradient-to-r from-red-500 to-red-600'
            }`}
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>

      {/* Message */}
      <p className="text-center text-foreground/80 font-medium">{message}</p>
    </div>
  );
}
