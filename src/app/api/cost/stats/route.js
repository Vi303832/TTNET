import { NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authUser = getAuthenticatedUser(request);
    const userId = authUser.userId;
    const stats = await StorageService.getUserStats(userId);
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
