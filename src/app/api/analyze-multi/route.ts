import { NextRequest, NextResponse } from 'next/server';
import { analyzeMultipleFiles, validateMultiFileConfig } from '@/lib/analyzers';
import { rateLimiter, getClientIp } from '@/lib/rateLimit';
import { isDemoMode } from '@/lib/ai/demoMode';
import { ReviewType, ProgrammingLanguage } from '@/types';

interface FilePayload {
  name: string;
  content: string;
  language: ProgrammingLanguage;
}

interface MultiAnalyzeRequest {
  files: FilePayload[];
  reviewTypes: ReviewType[];
}

/**
 * POST /api/analyze-multi
 * Analyzes multiple files and returns aggregated results
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting only applies to real API calls (not demo mode)
    // For multi-file, we consume N rate limit tokens (one per file)
    if (!isDemoMode()) {
      const clientIp = getClientIp(request);
      const rateLimitCheck = rateLimiter.check(clientIp);
      console.log(`[Rate Limit Check - Multi] IP ${clientIp}: ${rateLimitCheck.remaining} remaining, allowed: ${rateLimitCheck.allowed}`);

      if (!rateLimitCheck.allowed) {
        console.log(`[Rate Limit BLOCKED - Multi] IP ${clientIp}: exceeded limit of ${rateLimitCheck.limit}`);
        const headers = rateLimiter.getHeaders(rateLimitCheck);
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            details: `You have reached your daily limit of ${rateLimitCheck.limit} AI-powered analyses. Your limit resets at ${rateLimitCheck.resetAt.toLocaleString()}.`,
            resetAt: rateLimitCheck.resetAt.toISOString(),
            limit: rateLimitCheck.limit,
          },
          {
            status: 429,
            headers,
          }
        );
      }
    } else {
      console.log('[Rate Limit - Multi] Demo mode - rate limiting bypassed');
    }

    // Parse request body
    const body: MultiAnalyzeRequest = await request.json();

    // Validate the configuration
    const validation = validateMultiFileConfig({
      files: body.files,
      reviewTypes: body.reviewTypes,
    });

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Build file inputs
    const files = body.files.map((f) => ({
      name: f.name,
      content: f.content,
      language: f.language || 'auto',
    }));

    // Perform the analysis
    const result = await analyzeMultipleFiles({
      files,
      reviewTypes: body.reviewTypes || ['solid', 'hygiene'],
    });

    // Consume rate limit only after successful API call (and only for real API mode)
    // Multi-file analysis counts as one request to be fair
    let rateLimitHeaders: Record<string, string> = {};
    if (!isDemoMode()) {
      const clientIp = getClientIp(request);
      const consumeResult = rateLimiter.consume(clientIp);
      rateLimitHeaders = rateLimiter.getHeaders(consumeResult);
      console.log(`[Rate Limit - Multi] IP ${clientIp}: consumed 1 request for ${files.length} files, ${consumeResult.remaining} remaining`);
    }

    // Return the analysis result with rate limit headers
    return NextResponse.json(result, {
      status: 200,
      headers: rateLimitHeaders,
    });
  } catch (error) {
    console.error('Error in /api/analyze-multi:', error);

    if (error instanceof Error) {
      if (error.message.includes('ANTHROPIC_API_KEY')) {
        return NextResponse.json(
          {
            error: 'API key not configured',
            details:
              'The Anthropic API key is not set. Please configure it in your environment variables.',
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

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
