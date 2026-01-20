import Anthropic from '@anthropic-ai/sdk';
import { ReviewType, ProgrammingLanguage, AIAnalysisResponse } from '@/types';
import { buildAnalysisPrompt, SYSTEM_PROMPT } from './prompts';
import { parseAIResponse } from './parser';

/**
 * Initialize Anthropic client
 */
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * Model to use for code analysis
 */
const MODEL = 'claude-3-5-sonnet-20241022';

/**
 * Analyzes code using Claude AI
 */
export async function analyzeCodeWithClaude(
  code: string,
  language: ProgrammingLanguage,
  reviewTypes: ReviewType[]
): Promise<AIAnalysisResponse> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const prompt = buildAnalysisPrompt(code, language, reviewTypes);

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      temperature: 0.3, // Lower temperature for more consistent, focused analysis
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract the text content from the response
    const textContent = message.content.find((block) => block.type === 'text');

    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in Claude response');
    }

    // Parse the JSON response
    const analysisResult = parseAIResponse(textContent.text);

    return analysisResult;
  } catch (error) {
    console.error('Error calling Claude API:', error);

    if (error instanceof Error) {
      throw new Error(`Claude API error: ${error.message}`);
    }

    throw new Error('Unknown error occurred while analyzing code');
  }
}

/**
 * Validates that the API key is configured
 */
export function isAPIKeyConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}
