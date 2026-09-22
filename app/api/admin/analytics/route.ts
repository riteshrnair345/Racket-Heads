import { NextResponse } from 'next/server';
import { getAnalyticsData } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pin = searchParams.get('pin');

  if (pin !== (process.env.NEXT_PUBLIC_ADMIN_PIN || '0000')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await getAnalyticsData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to get analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
