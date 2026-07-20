import { NextResponse } from 'next/server';
import { getPlayers, upsertPlayer, getEvents } from '@/lib/db';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.NEXT_PUBLIC_ADMIN_PIN || "0000"}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { playerId, eventId } = await request.json();

    if (!playerId || !eventId) {
      return NextResponse.json({ success: false, error: 'Missing playerId or eventId' }, { status: 400 });
    }

    const players = await getPlayers();
    const player = players.find(p => p.id === playerId);

    if (!player) {
      return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 });
    }

    const regIndex = player.registrations?.findIndex(r => r.eventId === eventId);
    
    if (regIndex === undefined || regIndex === -1) {
      return NextResponse.json({ success: false, error: 'Registration for event not found' }, { status: 404 });
    }

    if (player.registrations[regIndex].registrationStatus === 'Confirmed') {
      return NextResponse.json({ success: false, error: 'Player is already confirmed' }, { status: 400 });
    }

    // Update status
    player.registrations[regIndex].registrationStatus = 'Confirmed';
    await upsertPlayer(player);

    // Send confirmation email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      const events = await getEvents();
      const targetEvent = events.find(e => e.id === eventId);
      
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
      
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; color: #000; font-size: 14px; line-height: 1.6;">
          <p>Hi ${player.name},</p>
          <p>Good news! A spot opened up and you have been <strong>promoted from the Waitlist to Confirmed</strong> for the ${targetEvent?.name || 'community session'} of RacketHeads Kochi!</p>
          
          <p>Get ready for an epic session—we have a great mix of competitive match play lined up alongside some custom challenges and fun group games!</p>
          
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
          subject: "🎉 You're in! Welcome to RacketHeads Kochi 🎉",
          html: htmlBody,
          attachments: [
            {
              filename: 'qr-code.png',
              path: qrCodeUrl,
            }
          ]
        });
      } catch (emailError) {
        console.error('Failed to send promotion email:', emailError);
      }
    }

    return NextResponse.json({ success: true, message: 'Player promoted to Confirmed' });
  } catch (error: any) {
    console.error('Promotion error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
