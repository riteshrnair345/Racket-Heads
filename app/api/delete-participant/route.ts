import { NextResponse } from 'next/server';
import { getPlayers, savePlayers } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.NEXT_PUBLIC_ADMIN_PIN || "0000"}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { playerId, eventId } = await request.json();

    if (!playerId || !eventId) {
      return NextResponse.json({ success: false, error: 'Missing playerId or eventId' }, { status: 400 });
    }

    const players = await getPlayers();
    const playerIndex = players.findIndex(p => p.id === playerId);

    if (playerIndex === -1) {
      return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 });
    }

    const player = players[playerIndex];
    
    // Remove the registration for this event
    if (player.registrations) {
      player.registrations = player.registrations.filter(r => r.eventId !== eventId);
    }
    
    // Save the updated players list
    await savePlayers(players);

    return NextResponse.json({ success: true, message: 'Player removed from event' });
  } catch (error: any) {
    console.error('Delete participant error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
