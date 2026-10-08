import { NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const authUser = getAuthenticatedUser(request);
    const userId = authUser.userId;
    const { sessionId } = params;

    const messages = await StorageService.getSessionMessages(userId, sessionId);
    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error('Session messages error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
