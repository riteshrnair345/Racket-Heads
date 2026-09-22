import { NextResponse } from 'next/server';
import { getPlayers, savePlayers, getEvents } from '@/lib/db';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.NEXT_PUBLIC_ADMIN_PIN || "0000"}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId, playerIds, sendEmail } = await request.json();

    if (!eventId || !playerIds || !Array.isArray(playerIds)) {
      return NextResponse.json({ success: false, error: 'Missing eventId or playerIds array' }, { status: 400 });
    }

    const players = await getPlayers();
    const events = await getEvents();
    const targetEvent = events.find(e => e.id === eventId);
    
    let transporter: any = null;
    if (sendEmail && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '465', 10),
        secure: (process.env.SMTP_PORT || '465') === '465',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }

    const now = new Date().toISOString();
    let importedCount = 0;

    for (const pId of playerIds) {
      const playerIndex = players.findIndex(p => p.id === pId);
      if (playerIndex === -1) continue;

      const player = players[playerIndex];
      player.lastActive = now;
      
      if (!player.registrations) player.registrations = [];
      const regIndex = player.registrations.findIndex(r => r.eventId === eventId);
      
      let wasAlreadyConfirmed = false;

      if (regIndex !== -1) {
        if (player.registrations[regIndex].registrationStatus === 'Confirmed') {
          wasAlreadyConfirmed = true;
        } else {
          player.registrations[regIndex].checkInStatus = 'Pending';
          player.registrations[regIndex].registrationStatus = 'Confirmed';
        }
      } else {
        player.registrations.push({
          eventId,
          checkInStatus: 'Pending',
          timeWhenCheckedIn: null,
          registrationStatus: 'Confirmed'
        });
      }

      if (!wasAlreadyConfirmed) {
        importedCount++;
        
        // Send email if requested
        if (transporter) {
          const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(player.qrId)}`;
          const htmlBody = `
            <div style="font-family: Arial, sans-serif; color: #000; font-size: 14px; line-height: 1.6;">
              <p>Hi ${player.name},</p>
              <p>You've been added to the <strong>${targetEvent?.name || 'community session'}</strong> of RacketHeads Kochi!</p>
              
              <p>We've attached your exclusive QR ticket below. <strong>Please show this QR code when you arrive at the venue for a quick check-in.</strong></p>
              
              <div style="text-align: center; margin: 30px 0;">
                <img src="${qrCodeUrl}" alt="Your QR Ticket" width="200" height="200" style="border: 2px solid #000; border-radius: 10px; padding: 10px; background: #fff;" />
              </div>
              
              <p>Cheers,<br/>
              RacketHeads Kochi Team</p>
            </div>
          `;

          try {
            await transporter.sendMail({
              from: `"RacketHeads Kochi" <${process.env.EMAIL_USER}>`,
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
          } catch (emailErr) {
            console.error(`Failed to send email to ${player.email}`, emailErr);
          }
        }
      }
    }

    // Save all modified players
    await savePlayers(players);

    return NextResponse.json({ success: true, message: `Successfully imported ${importedCount} players` });
  } catch (error: any) {
    console.error('Import participants error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
