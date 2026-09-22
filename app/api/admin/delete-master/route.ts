import { NextResponse } from 'next/server';
import { getPlayers, savePlayers } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.NEXT_PUBLIC_ADMIN_PIN || "0000"}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { playerId } = await request.json();

    if (!playerId) {
      return NextResponse.json({ success: false, error: 'Missing playerId' }, { status: 400 });
    }

    const players = await getPlayers();
    const newPlayers = players.filter(p => p.id !== playerId);

    if (newPlayers.length === players.length) {
      return NextResponse.json({ success: false, error: 'Player not found in Master DB' }, { status: 404 });
    }

    await savePlayers(newPlayers);

    return NextResponse.json({ success: true, message: 'Player removed from Master DB' });
  } catch (error: any) {
    console.error('Delete from master error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
