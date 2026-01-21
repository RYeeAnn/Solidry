import { NextRequest, NextResponse } from 'next/server';
import { analyzeCode, validateReviewConfig } from '@/lib/analyzers';
import { ReviewConfig } from '@/types';

/**
 * POST /api/analyze
 * Analyzes code and returns issues, score, and suggestions
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate the configuration
    const validation = validateReviewConfig(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Log warnings if any (language mismatch, etc.)
    if (validation.warnings && validation.warnings.length > 0) {
      console.warn('Validation warnings:', validation.warnings);
    }

    // Build review configuration with defaults
    const config: ReviewConfig = {
      code: body.code,
      language: body.language || 'auto',
      reviewTypes: body.reviewTypes || ['solid', 'hygiene'],
      inputType: body.inputType || 'code',
      context: body.context,
    };

    // Perform the analysis
    const result = await analyzeCode(config);

    // Return the analysis result
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in /api/analyze:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('ANTHROPIC_API_KEY')) {
        return NextResponse.json(
          {
            error: 'API key not configured',
            details: 'The Anthropic API key is not set. Please configure it in your environment variables.',
          },
          { status: 500 }
        );
      }

      if (error.message.includes('Claude API error')) {
        return NextResponse.json(
          {
            error: 'AI analysis failed',
            details: error.message,
          },
          { status: 502 }
        );
      }

      return NextResponse.json(
        {
          error: 'Analysis failed',
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analyze
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Solidry API is running',
    apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY,
  });
}
