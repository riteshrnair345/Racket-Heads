import { NextResponse } from 'next/server';
import { getPlayerByEmail } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
  }

  try {
    const player = await getPlayerByEmail(email);

    if (!player) {
      return NextResponse.json({ success: true, status: 'Not Found' });
    }

    if (player.payment_status === 'Paid') {
      return NextResponse.json({
        success: true,
        status: 'Paid',
        qrId: player.qrId,
        name: player.name
      });
    }

    return NextResponse.json({ success: true, status: player.payment_status || 'Pending' });

  } catch (error: any) {
    console.error('Error fetching player status:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
