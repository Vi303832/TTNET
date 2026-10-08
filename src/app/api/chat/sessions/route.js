import { NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authUser = getAuthenticatedUser(request);
    const userId = authUser.userId;
    const sessions = await StorageService.getUserSessions(userId);
    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    console.error('Sessions error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
