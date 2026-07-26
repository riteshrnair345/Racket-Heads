import { NextResponse } from 'next/server';
import { getPlayers, getEvents } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');
    const eventId = searchParams.get('eventId');

    if (!playerId || !eventId) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    const players = await getPlayers();
    const player = players.find(p => p.id === playerId);
    
    if (!player) {
      return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 });
    }

    const events = await getEvents();
    const event = events.find(e => e.id === eventId);
    
    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    const registration = player.registrations?.find(r => r.eventId === eventId);
    if (!registration) {
      return NextResponse.json({ success: false, error: 'Registration not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      player: {
        name: player.name,
        email: player.email,
        phone: player.phone,
        qrId: player.qrId
      },
      event: {
        name: event.name,
        amount: event.amount ?? 150
      },
      registrationStatus: registration.registrationStatus,
      paymentStatus: registration.paymentStatus
    });

  } catch (error: any) {
    console.error('Waitlist info fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
