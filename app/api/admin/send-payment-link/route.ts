import { NextResponse } from 'next/server';
import { getPlayers, getEvents } from '@/lib/db';
import { getTransporter, EMAIL_FROM } from '@/lib/email';

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

    const reg = player.registrations?.find(r => r.eventId === eventId);
    if (!reg) {
      return NextResponse.json({ success: false, error: 'Registration for event not found' }, { status: 404 });
    }

    const events = await getEvents();
    const targetEvent = events.find(e => e.id === eventId);
    if (!targetEvent) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    // Determine host for the payment checkout link
    const host = request.headers.get('host') || 'racketheads.club';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const checkoutLink = `${protocol}://${host}/pay/${player.id}/${targetEvent.id}`;
    const amount = targetEvent.amount ?? 150;

    const transporter = getTransporter();
    if (!transporter) {
      return NextResponse.json({
        success: false,
        error: 'Email service credentials not configured. You can share this link directly with the player:',
        checkoutLink
      }, { status: 500 });
    }

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; color: #000; font-size: 14px; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6b21a8; margin-top: 0;">🏸 Spot Available! Complete Payment to Confirm</h2>
        <p>Hi <strong>${player.name}</strong>,</p>
        <p>Great news! A spot has opened up for you for the upcoming <strong>${targetEvent.name || 'community session'}</strong> of RacketHeads Kochi!</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0; font-weight: bold; color: #334155;">Session Details:</p>
          <p style="margin: 4px 0;">🏸 <strong>Event:</strong> ${targetEvent.name || 'Community Session'}</p>
          <p style="margin: 4px 0;">📅 <strong>Date:</strong> ${targetEvent.date || 'TBD'}</p>
          <p style="margin: 4px 0;">⏰ <strong>Time:</strong> ${targetEvent.time || 'TBD'}</p>
          <p style="margin: 4px 0;">📍 <strong>Venue:</strong> ${targetEvent.venue || 'TBD'}</p>
          <p style="margin: 4px 0;">💰 <strong>Amount Due:</strong> ₹${amount}</p>
        </div>

        <p>To lock in your spot on the main roster, please complete your payment of <strong>₹${amount}</strong> using the secure checkout button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${checkoutLink}" style="display: inline-block; padding: 14px 28px; background-color: #6b21a8; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px; box-shadow: 0 4px 10px rgba(107, 33, 168, 0.25);">
            Pay ₹${amount} & Confirm Spot
          </a>
        </div>
        
        <p style="font-size: 12px; color: #64748b; margin-top: 15px;">
          Or copy and paste this link in your browser:<br/>
          <a href="${checkoutLink}" style="color: #6b21a8; word-break: break-all;">${checkoutLink}</a>
        </p>

        <p style="font-size: 12px; color: #64748b; background: #f8f9fa; padding: 12px; border-radius: 8px; margin-top: 25px; border: 1px solid #e9ecef;">
          <strong>⚡ Please Note:</strong> Spots are confirmed on a first-paid basis. Once your payment is complete, you will instantly receive your official entry ticket with your personal QR check-in code.<br/><br/>
          <strong>Need help?</strong> WhatsApp us at <a href="https://wa.me/919037498391" style="color: #128C7E; text-decoration: none;">+91 90374 98391</a> or <a href="https://wa.me/919745477798" style="color: #128C7E; text-decoration: none;">+91 97454 77798</a>.
        </p>

        <p style="margin-top: 25px;">Cheers,<br/>
        <strong>RacketHeads Kochi Team</strong></p>
      </div>
    `;

    await transporter.sendMail({
      from: `"RacketHeads Kochi" <${EMAIL_FROM}>`,
      replyTo: EMAIL_FROM,
      to: player.email,
      subject: `🏸 Spot Available! Complete payment for ${targetEvent.name || 'RacketHeads Kochi'}`,
      html: htmlBody,
    });

    return NextResponse.json({
      success: true,
      message: `Payment link emailed to ${player.email}!`,
      checkoutLink
    });
  } catch (error: any) {
    console.error('Send payment link error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
