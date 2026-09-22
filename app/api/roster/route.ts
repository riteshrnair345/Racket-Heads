import { NextResponse } from 'next/server';
import { getPlayers, getEvents } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    
    if (!eventId) {
      return NextResponse.json({ success: false, error: 'Missing eventId parameter' }, { status: 400 });
    }

    const players = await getPlayers();
    
    // Filter players who are registered for this specific event
    const eventPlayers = players.filter(p => p.registrations?.some(r => r.eventId === eventId));
    
    const roster = eventPlayers.map(player => {
      const registration = player.registrations.find(r => r.eventId === eventId)!;
      return {
        id: player.id,
        name: player.name,
        email: player.email,
        phone: player.phone,
        proficiency: player.proficiency,
        duration: player.duration,
        shoes: player.shoes,
        checkInTime: registration.timeWhenCheckedIn,
        status: registration.checkInStatus,
        registrationStatus: registration.registrationStatus || 'Confirmed'
      };
    });
    
    // Sort so checked-in players appear first, then confirmed, then waitlisted
    roster.sort((a, b) => {
      if (a.registrationStatus === 'Confirmed' && b.registrationStatus === 'Waitlisted') return -1;
      if (a.registrationStatus === 'Waitlisted' && b.registrationStatus === 'Confirmed') return 1;
      
      if (a.status === 'Checked In' && b.status === 'Pending') return -1;
      if (a.status === 'Pending' && b.status === 'Checked In') return 1;
      return 0;
    });

    return NextResponse.json(roster);

  } catch (error: any) {
    console.error('Roster fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
