import { AIAnalysisResponse, CodeIssue, IssueMetrics } from '@/types';

/**
 * Parses the AI response text into structured data
 */
export function parseAIResponse(responseText: string): AIAnalysisResponse {
  try {
    // Extract JSON from markdown code blocks if present
    let jsonText = responseText.trim();

    // Remove markdown code fences if present
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim();
    }

    // Parse the JSON
    const parsed = JSON.parse(jsonText);

    // Validate the structure
    if (!parsed.issues || !Array.isArray(parsed.issues)) {
      throw new Error('Invalid response structure: missing or invalid issues array');
    }

    if (!parsed.summary || typeof parsed.summary !== 'string') {
      throw new Error('Invalid response structure: missing or invalid summary');
    }

    if (!parsed.metrics || typeof parsed.metrics !== 'object') {
      throw new Error('Invalid response structure: missing or invalid metrics');
    }

    // Validate each issue
    const validatedIssues: CodeIssue[] = parsed.issues.map((issue: unknown, index: number) => {
      const issueRecord = issue as Record<string, unknown>;
      if (typeof issueRecord.line !== 'number') {
        throw new Error(`Issue ${index}: line must be a number`);
      }

      if (!['critical', 'warning', 'suggestion'].includes(issueRecord.severity as string)) {
        throw new Error(`Issue ${index}: invalid severity "${issueRecord.severity}"`);
      }

      if (!['solid', 'hygiene', 'unnecessary', 'complexity'].includes(issueRecord.category as string)) {
        throw new Error(`Issue ${index}: invalid category "${issueRecord.category}"`);
      }

      if (!issueRecord.message || typeof issueRecord.message !== 'string') {
        throw new Error(`Issue ${index}: message is required`);
      }

      if (!issueRecord.suggestion || typeof issueRecord.suggestion !== 'string') {
        throw new Error(`Issue ${index}: suggestion is required`);
      }

      return {
        line: issueRecord.line,
        severity: issueRecord.severity,
        category: issueRecord.category,
        principle: issueRecord.principle || 'other',
        message: issueRecord.message,
        explanation: issueRecord.explanation,
        suggestion: issueRecord.suggestion,
        codeSnippet: issueRecord.codeSnippet,
      } as CodeIssue;
    });

    // Validate metrics
    const validatedMetrics: IssueMetrics = {
      criticalIssues: Number(parsed.metrics.criticalIssues) || 0,
      warnings: Number(parsed.metrics.warnings) || 0,
      suggestions: Number(parsed.metrics.suggestions) || 0,
      totalIssues: Number(parsed.metrics.totalIssues) || validatedIssues.length,
    };

    return {
      issues: validatedIssues,
      summary: parsed.summary,
      metrics: validatedMetrics,
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    console.error('Response text:', responseText);

    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse AI response as JSON. The AI may have returned invalid JSON.');
    }

    if (error instanceof Error) {
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }

    throw new Error('Unknown error while parsing AI response');
  }
}

/**
 * Creates a fallback response when AI analysis fails
 */
export function createFallbackResponse(errorMessage: string): AIAnalysisResponse {
  return {
    issues: [],
    summary: `Analysis failed: ${errorMessage}`,
    metrics: {
      criticalIssues: 0,
      warnings: 0,
      suggestions: 0,
      totalIssues: 0,
    },
  };
}
