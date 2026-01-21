'use client';

import type { ConfidenceMetadata, AnalysisMetadata } from '@/types/analysis';
import {
  getConfidenceColorClasses,
  getConfidenceLabel,
  getConfidenceDescription,
} from '@/lib/confidence/confidenceCalculator';

interface ConfidenceIndicatorProps {
  confidence: ConfidenceMetadata;
  metadata: AnalysisMetadata;
}

export default function ConfidenceIndicator({ confidence, metadata }: ConfidenceIndicatorProps) {
  const getConfidenceIcon = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'medium':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'low':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="panel p-4 space-y-4">
      {/* Confidence Level */}
      <div className={`flex items-start gap-3 p-3 rounded border ${getConfidenceColorClasses(confidence.level)}`}>
        <div className="flex-shrink-0 mt-0.5">
          {getConfidenceIcon(confidence.level)}
        </div>
        <div className="flex-1 space-y-1">
          <div className="font-medium text-sm flex items-center gap-2">
            <span>{getConfidenceLabel(confidence.level)} ({confidence.overall}%)</span>
            <div className="relative group">
              <svg
                className="w-4 h-4 text-blue-500 hover:text-blue-600 cursor-help transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-background border border-border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 text-xs leading-relaxed">
                <div className="font-semibold mb-1.5 text-foreground">What is Confidence Score?</div>
                <div className="text-foreground/70 space-y-1.5">
                  <p><strong className="text-foreground">Quality Score</strong> measures how good your code is (based on issues found).</p>
                  <p><strong className="text-foreground">Confidence Score</strong> measures how much you should trust the analysis (based on conditions like demo mode, code length, and language detection).</p>
                  <p className="pt-1 text-foreground/60">Example: High quality (96/100) with high confidence (82%) means &quot;Your code is excellent, and we&apos;re confident in this assessment.&quot;</p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-xs opacity-90">
            {getConfidenceDescription(confidence.level)}
          </div>
        </div>
      </div>

      {/* Confidence Factors */}
      {confidence.factors.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-foreground/50 uppercase tracking-wider">
            Confidence Factors
          </div>
          <ul className="space-y-1.5 text-xs text-foreground/70">
            {confidence.factors.map((factor: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-foreground/30 mt-0.5">•</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Metadata */}
      <div className="pt-3 border-t border-border space-y-2">
        <div className="text-xs font-medium text-foreground/50 uppercase tracking-wider">
          Analysis Details
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs text-foreground/70">
          <div>
            <div className="text-foreground/40 mb-0.5">Model</div>
            <div className="font-medium">{metadata.modelVersion}</div>
          </div>
          <div>
            <div className="text-foreground/40 mb-0.5">Duration</div>
            <div className="font-medium">{metadata.analysisTimeMs}ms</div>
          </div>
          <div>
            <div className="text-foreground/40 mb-0.5">Lines Analyzed</div>
            <div className="font-medium">{metadata.linesAnalyzed}</div>
          </div>
          <div>
            <div className="text-foreground/40 mb-0.5">Language Detection</div>
            <div className="font-medium">{confidence.languageDetection}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
