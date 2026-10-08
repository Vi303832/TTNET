import { NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage';
import { hashPassword, signToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name, balance_limit = 5.00 } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Geçerli bir e-posta adresi giriniz.' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Şifreniz en az 6 karakter olmalıdır.' }, { status: 400 });
    }

    const password_hash = await hashPassword(password);

    const user = await StorageService.createUser({
      email,
      password_hash,
      name: name || email.split('@')[0],
      balance_limit: Number(balance_limit) || 5.00
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name
    });

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı kaydı başarıyla oluşturuldu.',
      token,
      user: {
        uid: user.id,
        id: user.id,
        email: user.email,
        displayName: user.name,
        balanceLimit: user.balance_limit,
        totalSpentUSD: user.total_spent_usd,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: error.message || 'Kayıt işlemi başarısız.' }, { status: 400 });
  }
}
