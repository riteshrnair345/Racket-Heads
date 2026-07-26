import { NextResponse } from 'next/server';
import { getEvents, saveEvents, Event, getPlayers } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const events = await getEvents();
    const players = await getPlayers();

    // Return events sorted by date descending (newest first)
    const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(event => {
      const confirmedCount = players.filter(p => p.registrations?.some(r => r.eventId === event.id && r.registrationStatus !== 'Waitlisted')).length;
      const waitlistedCount = players.filter(p => p.registrations?.some(r => r.eventId === event.id && r.registrationStatus === 'Waitlisted')).length;
      return { ...event, confirmedCount, waitlistedCount };
    });
    
    return NextResponse.json({ success: true, events: sortedEvents });
  } catch (error: any) {
    console.error('Events fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Check for authorization header to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.NEXT_PUBLIC_ADMIN_PIN || "0000"}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, date, time, venue, requiresPayment, amount, participantLimit, eventType, isActive, isFeedbackOpen } = body;

    if (!name || !date || typeof participantLimit !== 'number') {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const events = await getEvents();
    
    // Deactivate other events if this one is active?
    // Let's allow multiple active events for now, as requested by "multiple events addition"
    
    const newEvent: Event = {
      id: `evt_${Date.now()}`,
      name,
      date,
      time: time || "",
      venue: venue || "",
      requiresPayment: requiresPayment ?? true, // default to true if not specified
      amount: amount ?? 150, // default 150 INR
      participantLimit,
      eventType: eventType || 'community', // default to community
      isActive: isActive || false,
      isFeedbackOpen: isFeedbackOpen || false,
      createdAt: new Date().toISOString()
    };
    
    events.push(newEvent);
    await saveEvents(events);

    return NextResponse.json({ success: true, event: newEvent });
  } catch (error: any) {
    console.error('Event creation error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.NEXT_PUBLIC_ADMIN_PIN || "0000"}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, date, time, venue, requiresPayment, amount, participantLimit, eventType, isActive, isFeedbackOpen } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing event ID' }, { status: 400 });
    }

    const events = await getEvents();
    const eventIndex = events.findIndex(e => e.id === id);
    
    if (eventIndex === -1) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    // Update fields
    if (name) events[eventIndex].name = name;
    if (date) events[eventIndex].date = date;
    if (time !== undefined) events[eventIndex].time = time;
    if (venue !== undefined) events[eventIndex].venue = venue;
    if (typeof participantLimit === 'number') events[eventIndex].participantLimit = participantLimit;
    if (eventType) events[eventIndex].eventType = eventType;
    if (typeof isActive === 'boolean') events[eventIndex].isActive = isActive;
    if (typeof requiresPayment === 'boolean') events[eventIndex].requiresPayment = requiresPayment;
    if (typeof amount === 'number') events[eventIndex].amount = amount;
    if (typeof isFeedbackOpen === 'boolean') {
      events[eventIndex].isFeedbackOpen = isFeedbackOpen;
      if (isFeedbackOpen) {
        events.forEach((e, i) => {
          if (i !== eventIndex) e.isFeedbackOpen = false;
        });
      }
    }

    await saveEvents(events);

    return NextResponse.json({ success: true, event: events[eventIndex] });
  } catch (error: any) {
    console.error('Event update error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.NEXT_PUBLIC_ADMIN_PIN || "0000"}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing event ID' }, { status: 400 });
    }

    let events = await getEvents();
    const initialLength = events.length;
    events = events.filter(e => e.id !== id);
    
    if (events.length === initialLength) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    await saveEvents(events);

    // Also remove any registrations for this event from all players
    const { getPlayers, savePlayers } = await import('@/lib/db');
    const players = await getPlayers();
    let playersModified = false;
    for (const player of players) {
      if (player.registrations) {
        const initialRegCount = player.registrations.length;
        player.registrations = player.registrations.filter(r => r.eventId !== id);
        if (player.registrations.length !== initialRegCount) {
          playersModified = true;
        }
      }
    }
    if (playersModified) {
      await savePlayers(players);
    }

    return NextResponse.json({ success: true, message: 'Event deleted' });
  } catch (error: any) {
    console.error('Event deletion error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

