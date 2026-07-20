import { NextResponse } from 'next/server';
import { getPlayers } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.NEXT_PUBLIC_ADMIN_PIN || "0000"}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const players = await getPlayers();
    
    const masterDb = players.map(player => {
      return {
        id: player.id,
        name: player.name,
        email: player.email,
        phone: player.phone,
        firstSeen: player.firstSeen,
        eventsAttended: player.registrations?.filter(r => r.checkInStatus === 'Checked In').length || player.eventsAttended,
        totalRegistrations: player.registrations?.length || (player.checkInStatus ? 1 : 0),
      };
    });
    
    // Sort by most recent first
    masterDb.sort((a, b) => new Date(b.firstSeen).getTime() - new Date(a.firstSeen).getTime());

    return NextResponse.json(masterDb);

  } catch (error: any) {
    console.error('Master DB fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
