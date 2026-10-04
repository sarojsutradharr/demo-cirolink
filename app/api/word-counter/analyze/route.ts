import { NextRequest, NextResponse } from 'next/server';
import { analyzeText } from '@/lib/word-counter/analyzer';
import { deductCreditOnServer } from '@/lib/server/user-store';

export async function POST(req: NextRequest) {
  try {
    const { text, userId, title, userFallback } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to analyze text.', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text cannot be empty' }, { status: 400 });
    }

    if (text.length > 500000) {
      return NextResponse.json(
        { error: 'Text exceeds maximum limit of 500,000 characters' },
        { status: 400 }
      );
    }

    // 1. Calculate text analysis stats server-side
    const stats = analyzeText(text);

    // 2. Server/Database atomic credit deduction & persistent limit enforcement
    try {
      const { user, remainingCredits, recordId } = await deductCreditOnServer(
        userId,
        title || 'Text Analysis',
        text,
        stats,
        userFallback
      );

      return NextResponse.json({
        success: true,
        stats,
        user,
        creditsRemaining: remainingCredits,
        recordId,
      });
    } catch (deductErr: any) {
      if (deductErr.code === 'LIMIT_EXHAUSTED' || deductErr.status === 403) {
        return NextResponse.json(
          {
            error: deductErr.message || 'Credit limit exhausted. Upgrade required to continue.',
            code: 'LIMIT_EXHAUSTED',
            user: deductErr.user,
            creditsRemaining: 0,
            status: 'limit_exhausted',
          },
          { status: 403 }
        );
      }
      throw deductErr;
    }
  } catch (err: any) {
    console.error('Server Text Analysis API Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Server failed to analyze text' },
      { status: 500 }
    );
  }
}
