'use client';

import { useEffect, useState, useRef } from 'react';
import { QualityGrade } from '@/types';

interface ScoreCardProps {
  score: number;
  grade: QualityGrade;
}

function getScoreColor(score: number): { stroke: string; bg: string; text: string; glow: string } {
  if (score >= 80) return { stroke: '#22c55e', bg: 'bg-green-500/10', text: 'text-green-500', glow: 'shadow-green-500/20' };
  if (score >= 60) return { stroke: '#3b82f6', bg: 'bg-blue-500/10', text: 'text-blue-500', glow: 'shadow-blue-500/20' };
  if (score >= 40) return { stroke: '#eab308', bg: 'bg-yellow-500/10', text: 'text-yellow-500', glow: 'shadow-yellow-500/20' };
  if (score >= 20) return { stroke: '#f97316', bg: 'bg-orange-500/10', text: 'text-orange-500', glow: 'shadow-orange-500/20' };
  return { stroke: '#ef4444', bg: 'bg-red-500/10', text: 'text-red-500', glow: 'shadow-red-500/20' };
}

function getGradeColor(grade: QualityGrade): string {
  switch (grade) {
    case 'A': return 'text-green-500';
    case 'B': return 'text-blue-500';
    case 'C': return 'text-yellow-500';
    case 'D': return 'text-orange-500';
    case 'F': return 'text-red-500';
    default: return 'text-foreground';
  }
}

function useCountUp(target: number, duration: number = 1200) {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number>(0);

  useEffect(() => {
    startTime.current = null;

    const animate = (timestamp: number) => {
      if (startTime.current === null) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));

      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      }
    };

    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, [target, duration]);

  return value;
}

export default function ScoreCard({ score, grade }: ScoreCardProps) {
  const displayScore = useCountUp(score);
  const colors = getScoreColor(score);

  // SVG radial gauge parameters
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="panel p-6 animate-fade-in">
      <div className="flex items-center gap-6">
        {/* Radial Gauge */}
        <div className="relative flex-shrink-0">
          <svg width="108" height="108" viewBox="0 0 108 108" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="54"
              cy="54"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-foreground/10"
            />
            {/* Score arc */}
            <circle
              cx="54"
              cy="54"
              r={radius}
              fill="none"
              stroke={colors.stroke}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
              style={{
                filter: `drop-shadow(0 0 6px ${colors.stroke}40)`,
              }}
            />
          </svg>
          {/* Score number centered in gauge */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{displayScore}</span>
          </div>
        </div>

        {/* Score details */}
        <div className="flex-1 space-y-2">
          <div className="text-sm font-medium text-foreground/60">Quality Score</div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${getGradeColor(grade)}`}>{grade}</span>
            <span className="text-sm text-foreground/40">grade</span>
          </div>
          <div className="text-xs text-foreground/50">
            {score >= 80 && 'Excellent code quality'}
            {score >= 60 && score < 80 && 'Good with room to improve'}
            {score >= 40 && score < 60 && 'Needs attention'}
            {score >= 20 && score < 40 && 'Significant issues found'}
            {score < 20 && 'Critical issues detected'}
          </div>
        </div>
      </div>
    </div>
  );
}
