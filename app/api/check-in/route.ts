import { NextResponse } from 'next/server';
import { getPlayerByQrId, upsertPlayer, getEvents } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { qrId, eventId } = body;

    if (!qrId) {
      return NextResponse.json({ success: false, error: 'No QR ID provided' }, { status: 400 });
    }

    const player = await getPlayerByQrId(qrId);

    if (!player) {
      return NextResponse.json({ success: false, error: 'Invalid ticket' }, { status: 404 });
    }

    // Determine event to check into
    const events = await getEvents();
    let targetEventId = eventId;
    
    if (!targetEventId) {
      const activeEvents = events.filter(e => e.isActive);
      if (activeEvents.length > 0) {
        targetEventId = activeEvents[0].id;
      } else {
        targetEventId = 'legacy_event';
      }
    }

    const now = new Date().toISOString();

    if (!player.registrations) {
       player.registrations = [];
    }

    const regIndex = player.registrations.findIndex(r => r.eventId === targetEventId);
    
    if (regIndex === -1) {
      return NextResponse.json({ success: false, error: 'Player not registered for this event', name: player.name });
    }

    const registration = player.registrations[regIndex];

    // Check if already checked in recently
    if (registration.timeWhenCheckedIn) {
      const lastCheckIn = new Date(registration.timeWhenCheckedIn);
      const timeDiff = new Date().getTime() - lastCheckIn.getTime();
      
      if (timeDiff < 12 * 60 * 60 * 1000) {
        return NextResponse.json({ success: false, error: 'Already checked in', name: player.name });
      }
    }

    // Update player stats
    player.lastActive = now;
    if (registration.checkInStatus !== 'Checked In') {
      player.eventsAttended += 1;
    }
    
    player.registrations[regIndex].checkInStatus = 'Checked In';
    player.registrations[regIndex].timeWhenCheckedIn = now;

    await upsertPlayer(player);

    return NextResponse.json({ 
      success: true, 
      message: 'Check-in successful', 
      name: player.name,
      phone: player.phone,
      proficiency: player.proficiency,
      duration: player.duration,
      shoes: player.shoes,
      time: now
    });

  } catch (error: any) {
    console.error('Check-in error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
