import { NextResponse } from 'next/server';
import { calculateCost, DEFAULT_USD_TRY_RATE } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { model = 'gemini-3.8-flash', promptTokens = 0, candidateTokens = 0, exchangeRate = DEFAULT_USD_TRY_RATE } = body;

    const calculation = calculateCost(model, promptTokens, candidateTokens, exchangeRate);
    return NextResponse.json({ success: true, calculation });
  } catch (error) {
    console.error('Estimate error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
