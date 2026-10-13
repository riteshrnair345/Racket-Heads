import { NextResponse } from 'next/server';
import { getPlayers, getEvents } from '@/lib/db';
import { sendConfirmationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.NEXT_PUBLIC_ADMIN_PIN || "0000"}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { playerId, eventId } = await request.json();

    if (!playerId) {
      return NextResponse.json({ success: false, error: 'Player ID is required' }, { status: 400 });
    }

    const players = await getPlayers();
    const player = players.find(p => p.id === playerId);

    if (!player) {
      return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 });
    }

    const events = await getEvents();
    let targetEvent = events.find(e => e.id === eventId);
    if (!targetEvent) {
      const activeEvents = events.filter(e => e.isActive);
      targetEvent = activeEvents[0] || events[events.length - 1];
    }

    const reg = player.registrations?.find(r => r.eventId === targetEvent?.id);
    const isWaitlisted = reg ? reg.registrationStatus === 'Waitlisted' : false;

    const emailSent = await sendConfirmationEmail(player, targetEvent, isWaitlisted);

    if (!emailSent) {
      return NextResponse.json({ success: false, error: 'Failed to send email. Check SMTP settings.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Email successfully sent to ${player.email}` });
  } catch (error: any) {
    console.error('Resend email error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
