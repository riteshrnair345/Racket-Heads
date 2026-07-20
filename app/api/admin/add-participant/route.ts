import { NextResponse } from 'next/server';
import { getPlayers, getPlayerByEmail, upsertPlayer, generateNextPlayerId } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.NEXT_PUBLIC_ADMIN_PIN || "0000"}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId, name, email, phone } = await request.json();

    if (!eventId || !name || !email) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    let player = await getPlayerByEmail(email);
    const now = new Date().toISOString();

    if (player) {
      // Update existing player
      player.name = name;
      if (phone) player.phone = phone;
      player.lastActive = now;
      
      if (!player.registrations) player.registrations = [];
      const regIndex = player.registrations.findIndex(r => r.eventId === eventId);
      
      if (regIndex !== -1) {
        player.registrations[regIndex].checkInStatus = 'Pending';
        player.registrations[regIndex].registrationStatus = 'Confirmed';
      } else {
        player.registrations.push({
          eventId,
          checkInStatus: 'Pending',
          timeWhenCheckedIn: null,
          registrationStatus: 'Confirmed'
        });
      }
    } else {
      // New player
      const id = await generateNextPlayerId();
      const rawString = `${id}-${email}`;
      const qrId = Buffer.from(rawString).toString('base64').replace(/=/g, '');

      player = {
        id,
        qrId,
        name,
        email,
        phone: phone || '',
        proficiency: 'Unknown',
        duration: 'Unknown',
        shoes: 'Unknown',
        heardFrom: 'Admin Added',
        firstSeen: now,
        lastActive: now,
        eventsAttended: 0,
        registrations: [
          {
            eventId,
            checkInStatus: 'Pending',
            timeWhenCheckedIn: null,
            registrationStatus: 'Confirmed'
          }
        ]
      };
    }

    await upsertPlayer(player);

    return NextResponse.json({ success: true, message: 'Player added to event successfully' });
  } catch (error: any) {
    console.error('Add participant error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
