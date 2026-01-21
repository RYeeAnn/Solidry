import { ReviewOptions } from '@/types';

/**
 * Shared descriptions for review types
 * Used across CodeInput and ReviewOptions components
 */
export const REVIEW_DESCRIPTIONS: Record<
  keyof ReviewOptions,
  { title: string; description: string }
> = {
  solid: {
    title: 'SOLID Principles',
    description: 'Checks for violations of SOLID design principles (SRP, OCP, LSP, ISP, DIP)',
  },
  hygiene: {
    title: 'Code Hygiene',
    description: 'Identifies code quality issues like console.log, var usage, TODO comments, and type safety',
  },
  unnecessary: {
    title: 'Dead Code & DRY',
    description: 'Detects DRY violations (duplicate code), commented-out code, empty catch blocks, and unused code',
  },
  simplicity: {
    title: 'Complexity',
    description: 'Analyzes code complexity including deep nesting, magic numbers, and unclear variable names',
  },
};
