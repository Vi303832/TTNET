import { NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage';
import { comparePassword, signToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'E-posta ve şifre zorunludur.' }, { status: 400 });
    }

    const user = await StorageService.findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'Bu e-posta adresine ait kullanıcı bulunamadı.' }, { status: 401 });
    }

    if (!user.password_hash) {
      return NextResponse.json({ error: 'Bu hesap için şifre belirlenmemiş. Lütfen Google veya geliştirici girişi yapınız.' }, { status: 401 });
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Hatalı şifre girdiniz.' }, { status: 401 });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name
    });

    const quota = await StorageService.checkUserQuota(user.id);

    return NextResponse.json({
      success: true,
      message: 'Giriş başarılı.',
      token,
      user: {
        uid: user.id,
        id: user.id,
        email: user.email,
        displayName: user.name,
        balanceLimit: quota.balanceLimit,
        totalSpentUSD: quota.totalSpent,
        remainingBudgetUSD: quota.remainingBudget,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Giriş işlemi başarısız.' }, { status: 500 });
  }
}
