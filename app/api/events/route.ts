import { NextResponse } from 'next/server';
import { getEvents, saveEvents, Event } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const events = await getEvents();
    // Return events sorted by date descending (newest first)
    const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
    const { name, date, participantLimit, isActive } = body;

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
      participantLimit,
      isActive: isActive || false,
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
    const { id, name, date, participantLimit, isActive } = body;

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
    if (typeof participantLimit === 'number') events[eventIndex].participantLimit = participantLimit;
    if (typeof isActive === 'boolean') events[eventIndex].isActive = isActive;

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

    return NextResponse.json({ success: true, message: 'Event deleted' });
  } catch (error: any) {
    console.error('Event deletion error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

