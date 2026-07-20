import { NextResponse } from 'next/server';
import { getPlayers, getEvents } from '@/lib/db';

export const dynamic = 'force-dynamic'; // Prevent caching

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    
    const players = await getPlayers();
    const events = await getEvents();
    
    if (eventId) {
      const event = events.find(e => e.id === eventId);
      if (!event) return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
      
      const currentCount = players.filter(p => p.registrations?.some(r => r.eventId === eventId && r.registrationStatus !== 'Waitlisted')).length;
      return NextResponse.json({ 
        success: true, 
        count: currentCount,
        maxSlots: event.participantLimit,
        isFull: currentCount >= event.participantLimit
      });
    }

    // Default: return status for all active events
    const activeEvents = events.filter(e => e.isActive);
    const eventStatuses = activeEvents.map(event => {
      const currentCount = players.filter(p => p.registrations?.some(r => r.eventId === event.id && r.registrationStatus !== 'Waitlisted')).length;
      return {
        id: event.id,
        name: event.name,
        date: event.date,
        count: currentCount,
        maxSlots: event.participantLimit,
        isFull: currentCount >= event.participantLimit
      };
    });

    return NextResponse.json({ 
      success: true, 
      events: eventStatuses
    });
  } catch (error) {
    console.error('Failed to get registration status:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch status' }, { status: 500 });
  }
}
