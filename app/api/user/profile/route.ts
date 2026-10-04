import { NextRequest, NextResponse } from 'next/server';
import { getServerUser, getServerUserData } from '@/lib/server/user-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await getServerUser(userId);
    const userData = await getServerUserData(userId);

    return NextResponse.json({
      success: true,
      user,
      analyses: userData.analyses,
      transactions: userData.transactions,
    });
  } catch (err: any) {
    console.error('Error fetching user profile from server:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userFallback } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await getServerUser(userId, userFallback);
    const userData = await getServerUserData(userId);

    return NextResponse.json({
      success: true,
      user,
      analyses: userData.analyses,
      transactions: userData.transactions,
    });
  } catch (err: any) {
    console.error('Error syncing user profile on server:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to sync user profile' },
      { status: 500 }
    );
  }
}
