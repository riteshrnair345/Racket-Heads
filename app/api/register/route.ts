import { NextResponse } from 'next/server';
import { getPlayerByEmail, generateNextPlayerId, upsertPlayer, Player, getPlayers, getEvents } from '@/lib/db';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, age, proficiency, duration, shoes, heardFrom, eventId } = body;

    if (!name || !email || !phone || !age || !proficiency || !duration) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Get active events to determine which event to register for
    const events = await getEvents();
    const activeEvents = events.filter(e => e.isActive);
    
    // Determine target event
    let targetEventId = eventId;
    if (!targetEventId) {
      if (activeEvents.length > 0) {
        targetEventId = activeEvents[0].id;
      } else {
        targetEventId = 'legacy_event'; // Fallback
      }
    }
    
    const targetEvent = events.find(e => e.id === targetEventId);
    const participantLimit = targetEvent ? targetEvent.participantLimit : 28;

    let formattedPhone = phone.trim().replace(/\s+/g, '');
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('91') && formattedPhone.length > 10) {
        formattedPhone = '+' + formattedPhone;
      } else {
        formattedPhone = '+91' + formattedPhone;
      }
    }

    // Enforce player limit for the SPECIFIC event
    const playersList = await getPlayers();
    
    // Count how many people are registered for THIS event
    const eventPlayers = playersList.filter(p => p.registrations?.some(r => r.eventId === targetEventId));
    const isExisting = eventPlayers.some(p => p.email.toLowerCase() === email.toLowerCase());
    
    if (eventPlayers.length >= participantLimit && !isExisting) {
      return NextResponse.json({ success: false, error: \`Registration is full. We have reached the \${participantLimit} player limit for this event.\` }, { status: 403 });
    }

    // Check if player already exists in the master database
    let player = await getPlayerByEmail(email);
    const now = new Date().toISOString();

    if (player) {
      // If player exists, we update their latest answers
      player = {
        ...player,
        name,
        phone: formattedPhone,
        age,
        proficiency,
        duration,
        shoes,
        heardFrom,
        lastActive: now,
      };
      
      // Add or update registration for THIS event
      if (!player.registrations) player.registrations = [];
      const regIndex = player.registrations.findIndex(r => r.eventId === targetEventId);
      if (regIndex !== -1) {
        // Reset to pending if they re-register
        player.registrations[regIndex].checkInStatus = 'Pending';
      } else {
        // Add new registration
        player.registrations.push({
          eventId: targetEventId,
          checkInStatus: 'Pending',
          timeWhenCheckedIn: null
        });
      }
    } else {
      // New player
      const id = await generateNextPlayerId();
      
      // We use base64 encoding to make a URL-safe QR string
      const rawString = `${id}-${email}`;
      const qrId = Buffer.from(rawString).toString('base64').replace(/=/g, '');

      player = {
        id,
        qrId,
        name,
        email,
        phone: formattedPhone,
        age,
        proficiency,
        duration,
        shoes,
        heardFrom,
        firstSeen: now,
        lastActive: now,
        eventsAttended: 0,
        registrations: [
          {
            eventId: targetEventId,
            checkInStatus: 'Pending',
            timeWhenCheckedIn: null
          }
        ]
      };
    }

    await upsertPlayer(player);

    // Send email with QR code if credentials exist
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && !isExisting) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '465', 10),
        secure: process.env.SMTP_PORT === '465' ? true : false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(player.qrId)}`;
      
      const htmlBody = \`
        <div style="font-family: Arial, sans-serif; color: #000; font-size: 14px; line-height: 1.6;">
          <p>Hi \${player.name},</p>
          <p>You're officially signed up for the \${targetEvent?.name || 'community session'} of RacketHeads Kochi!</p>
          
          <p><strong>Sign up details:</strong><br/>
          Name: \${player.name}<br/>
          Proficiency: \${player.proficiency}<br/>
          Phone Number: \${formattedPhone}</p>
          
          <p>Get ready for an epic session—we have a great mix of competitive match play lined up alongside some custom challenges and fun group games!</p>
          
          <p>📲 <strong>Your Entry Pass:</strong> Your personal QR code is attached to this email. Please have it ready on your phone when you arrive at the venue so we can quickly scan you in.</p>
          
          <p>👟 <strong>Gear Reminder:</strong> Please remember to bring your own racket and strict non-marking indoor shoes to the court.</p>
          
          <p>See you on the court!</p>
          
          <p>Cheers,<br/>
          RacketHeads Kochi Team</p>
        </div>
      \`;

      try {
        await transporter.sendMail({
          from: \`"RacketHeads Kochi" <\${process.env.EMAIL_USER}>\`,
          to: player.email,
          subject: "🏸 You're in! Welcome to RacketHeads Kochi 🏸",
          html: htmlBody,
          attachments: [
            {
              filename: 'qr-code.png',
              path: qrCodeUrl,
            }
          ]
        });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // We still return success because registration succeeded, even if email failed
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Registration successful',
      qrId: player.qrId,
      name: player.name
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
