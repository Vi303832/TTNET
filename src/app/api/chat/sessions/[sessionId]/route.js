import { NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(request, { params }) {
  try {
    const authUser = getAuthenticatedUser(request);
    const userId = authUser.userId;
    const { sessionId } = params;

    await StorageService.deleteSession(userId, sessionId);
    return NextResponse.json({ success: true, message: 'Oturum başarıyla silindi.' });
  } catch (error) {
    console.error('Delete session error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
