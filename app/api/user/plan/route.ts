import { NextRequest, NextResponse } from 'next/server';
import { changePlanOnServer } from '@/lib/server/user-store';
import { PlanType } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { userId, targetPlan, userFallback } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required to update plan' },
        { status: 400 }
      );
    }

    if (!targetPlan || !['free', 'pro', 'pro_plus'].includes(targetPlan)) {
      return NextResponse.json(
        { error: 'Valid target plan (free, pro, pro_plus) is required' },
        { status: 400 }
      );
    }

    const result = await changePlanOnServer(userId, targetPlan as PlanType, userFallback);

    return NextResponse.json({
      success: true,
      user: result.user,
      action: result.action,
      message: result.message,
    });
  } catch (err: any) {
    console.error('Error changing plan on server:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to change plan' },
      { status: 500 }
    );
  }
}
