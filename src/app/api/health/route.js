import { NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  const geminiConfigured = Boolean(
    process.env.GEMINI_API_KEY && 
    process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
  );

  const usingFirestore = StorageService.isUsingFirestore();

  return NextResponse.json({
    status: 'online',
    framework: 'Next.js 14 App Router',
    timestamp: new Date().toISOString(),
    services: {
      gemini: {
        status: geminiConfigured ? 'ready' : 'missing_api_key',
        modelSupport: ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.1-pro-preview', 'gemini-flash-lite-latest']
      },
      storage: {
        type: usingFirestore ? 'firestore' : 'in-memory-fallback',
        status: 'ready'
      }
    }
  });
}
