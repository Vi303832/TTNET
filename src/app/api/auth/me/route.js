import { NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authUser = getAuthenticatedUser(request);
    if (!authUser || !authUser.userId) {
      return NextResponse.json({ error: 'Yetkilendirme başarısız.' }, { status: 401 });
    }

    const quota = await StorageService.checkUserQuota(authUser.userId);
    const userDoc = quota.user;

    return NextResponse.json({
      success: true,
      user: {
        uid: authUser.userId,
        id: authUser.userId,
        email: userDoc?.email || authUser.email,
        displayName: userDoc?.name || authUser.name,
        balanceLimit: quota.balanceLimit,
        totalSpentUSD: quota.totalSpent,
        remainingBudgetUSD: quota.remainingBudget,
        isQuotaExceeded: !quota.allowed,
        isDev: authUser.isDev
      }
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
