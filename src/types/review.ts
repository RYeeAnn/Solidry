/**
 * Types of code reviews available
 */
export type ReviewType = 'solid' | 'hygiene' | 'unnecessary' | 'simplicity';

/**
 * Supported programming languages
 */
export type ProgrammingLanguage =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'java'
  | 'csharp'
  | 'go'
  | 'rust'
  | 'cpp'
  | 'auto'; // Auto-detect

/**
 * Input type for code review
 */
export type CodeInputType = 'code' | 'diff';

/**
 * Configuration for a code review request
 */
export interface ReviewConfig {
  /** Types of reviews to perform */
  reviewTypes: ReviewType[];

  /** Programming language of the code */
  language: ProgrammingLanguage;

  /** Type of input (raw code or git diff) */
  inputType: CodeInputType;

  /** The actual code or diff to analyze */
  code: string;

  /** Optional: Additional context or instructions */
  context?: string;
}

/**
 * Options for individual review types
 */
export interface ReviewOptions {
  /** Check SOLID principles violations */
  solid: boolean;

  /** Check code hygiene issues */
  hygiene: boolean;

  /** Detect unnecessary/dead code */
  unnecessary: boolean;

  /** Check for over-engineering (simplicity check) */
  simplicity: boolean;
}
