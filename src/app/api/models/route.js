import { NextResponse } from 'next/server';
import { getModelsCatalog } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export async function GET() {
  const models = getModelsCatalog();
  return NextResponse.json({
    models,
    timestamp: new Date().toISOString()
  });
}
