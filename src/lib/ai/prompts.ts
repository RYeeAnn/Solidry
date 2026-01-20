import { ReviewType, ProgrammingLanguage } from '@/types';

/**
 * System prompt for code review
 */
export const SYSTEM_PROMPT = `You are an expert code reviewer specializing in software architecture, SOLID principles, and code quality. Your task is to analyze code and provide constructive, actionable feedback.

Always respond with valid JSON following the exact structure specified in the user prompt. Be specific, cite line numbers, and provide concrete suggestions for improvement.`;

/**
 * Base instruction for all reviews
 */
const BASE_INSTRUCTION = `
Analyze the following code and provide your response as a valid JSON object with this exact structure:

{
  "issues": [
    {
      "line": <line_number>,
      "severity": "critical" | "warning" | "suggestion",
      "category": "solid" | "hygiene" | "unnecessary" | "complexity",
      "principle": "SRP" | "OCP" | "LSP" | "ISP" | "DIP" | "other",
      "message": "Brief description",
      "suggestion": "How to fix"
    }
  ],
  "summary": "Overall assessment of the code quality",
  "metrics": {
    "criticalIssues": <number>,
    "warnings": <number>,
    "suggestions": <number>,
    "totalIssues": <number>
  }
}

IMPORTANT:
- Line numbers are 1-indexed (first line is 1)
- Be specific and actionable in your suggestions
- Focus only on the requested review types
- Provide realistic, practical advice
`;

/**
 * SOLID principles review prompt
 */
export const SOLID_REVIEW_PROMPT = `
Review this code for SOLID principles violations:

1. **Single Responsibility Principle (SRP)**: Check for classes/functions doing too many things
   - Functions with multiple responsibilities
   - Mixed concerns (business logic + I/O + formatting)
   - Function names containing "and" or doing multiple actions

2. **Open/Closed Principle (OCP)**: Check for code that's not extensible
   - Hard-coded values that should be configurable
   - Switch/if-else chains that should use polymorphism
   - Direct class instantiation instead of factories/DI

3. **Liskov Substitution Principle (LSP)**: Check for inheritance issues
   - Type checking before using subclass
   - Empty method implementations in derived classes
   - Derived classes throwing exceptions not in base class

4. **Interface Segregation Principle (ISP)**: Check for overly broad interfaces
   - Large interfaces with many methods
   - Classes implementing interfaces with unused methods
   - Clients depending on methods they don't use

5. **Dependency Inversion Principle (DIP)**: Check for tight coupling
   - Direct instantiation of concrete classes
   - Missing abstraction layers
   - Dependencies on implementations rather than interfaces

Mark violations as:
- **critical**: Clear SOLID violation that will cause maintenance issues
- **warning**: Violation that could lead to problems
- **suggestion**: Opportunities for better architecture
`;

/**
 * Code hygiene review prompt
 */
export const HYGIENE_REVIEW_PROMPT = `
Review this code for hygiene and quality issues:

1. **Naming Conventions**
   - Inconsistent naming (camelCase, snake_case, PascalCase)
   - Non-descriptive variable names (x, data, temp)
   - Misleading names that don't match functionality

2. **Code Organization**
   - Magic numbers without constants
   - Long parameter lists (>3-4 parameters)
   - Deep nesting (>3 levels)
   - Long functions (>50 lines)

3. **Error Handling**
   - Missing error handling
   - Swallowing exceptions silently
   - Generic error messages

4. **Code Cleanliness**
   - Console.log statements left in code
   - Commented-out code
   - TODOs without context or ticket references
   - Duplicate code blocks

5. **Type Safety** (if applicable)
   - Missing type annotations
   - Use of 'any' type
   - Type assertions that could be avoided

Mark issues as:
- **critical**: Will likely cause bugs or maintenance nightmares
- **warning**: Should be fixed but not urgent
- **suggestion**: Nice-to-have improvements
`;

/**
 * Unnecessary code detection prompt
 */
export const UNNECESSARY_CODE_PROMPT = `
Review this code for unnecessary or dead code:

1. **Unused Code**
   - Unused variables, functions, or imports
   - Dead code paths (unreachable code)
   - Unused parameters

2. **Redundant Code**
   - Redundant conditionals (if-else that does the same thing)
   - Unnecessary abstractions (wrapper functions that just call another function)
   - Duplicate logic that could be shared

3. **Over-complicated**
   - Complex logic that could be simplified
   - Multiple steps that could be combined
   - Verbose code that could be more concise

Mark issues as:
- **warning**: Code that serves no purpose and should be removed
- **suggestion**: Code that could be simplified or consolidated
`;

/**
 * Simplicity check (anti-over-engineering) prompt
 */
export const SIMPLICITY_CHECK_PROMPT = `
Review this code for over-engineering and unnecessary complexity:

1. **Premature Abstraction**
   - Over-abstraction for simple use cases
   - Complex design patterns where simple code would work
   - Creating interfaces/abstractions for code used in only one place

2. **Premature Optimization**
   - Complex optimizations without evidence of need
   - Micro-optimizations that hurt readability
   - Caching that's not needed

3. **Excessive Configuration**
   - Too many configuration options for simple features
   - Over-engineered dependency injection
   - Unnecessary feature flags

4. **Complexity Without Benefit**
   - Generic solutions for specific problems
   - Future-proofing for hypothetical requirements
   - Complex inheritance hierarchies

The goal is pragmatic, maintainable code that solves today's problems well, not every possible future problem.

Mark issues as:
- **warning**: Clear over-engineering that should be simplified
- **suggestion**: Areas where simpler approaches would work
`;

/**
 * Gets the appropriate prompt for a review type
 */
export function getReviewTypePrompt(reviewType: ReviewType): string {
  const prompts: Record<ReviewType, string> = {
    solid: SOLID_REVIEW_PROMPT,
    hygiene: HYGIENE_REVIEW_PROMPT,
    unnecessary: UNNECESSARY_CODE_PROMPT,
    simplicity: SIMPLICITY_CHECK_PROMPT,
  };

  return prompts[reviewType];
}

/**
 * Builds a complete prompt for code analysis
 */
export function buildAnalysisPrompt(
  code: string,
  language: ProgrammingLanguage,
  reviewTypes: ReviewType[]
): string {
  const reviewPrompts = reviewTypes.map((type) => getReviewTypePrompt(type)).join('\n\n');

  const langName = language === 'auto' ? 'the detected language' : language;

  return `${BASE_INSTRUCTION}

${reviewPrompts}

**Language**: ${langName}

**Code to Review**:
\`\`\`${language === 'auto' ? '' : language}
${code}
\`\`\`

Provide your analysis as a JSON object following the structure above. Focus on being practical and helpful.`;
}
