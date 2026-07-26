import { NextResponse } from 'next/server';
import { getPlayers, upsertPlayer, getEvents } from '@/lib/db';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { playerId, eventId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

    if (!playerId || !eventId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ success: false, error: 'Server misconfiguration: Payment secret missing' }, { status: 500 });
    }

    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Payment verification failed' }, { status: 400 });
    }

    const players = await getPlayers();
    const player = players.find(p => p.id === playerId);
    
    if (!player) {
      return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 });
    }

    const registrationIndex = player.registrations?.findIndex(r => r.eventId === eventId);
    if (registrationIndex === undefined || registrationIndex === -1) {
      return NextResponse.json({ success: false, error: 'Registration not found' }, { status: 404 });
    }

    // Update the registration status
    player.registrations![registrationIndex].paymentStatus = 'Paid';
    player.registrations![registrationIndex].registrationStatus = 'Confirmed';
    player.registrations![registrationIndex].razorpayPaymentId = razorpay_payment_id;
    player.registrations![registrationIndex].razorpayOrderId = razorpay_order_id;
    
    await upsertPlayer(player);

    const events = await getEvents();
    const targetEvent = events.find(e => e.id === eventId);

    // Send confirmation email with QR Code
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '465', 10),
        secure: (process.env.SMTP_PORT || '465') === '465',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(player.qrId)}`;
      
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; color: #000; font-size: 14px; line-height: 1.6;">
          <p>Hi ${player.name},</p>
          <p>Your payment was successful and you're officially confirmed for the ${targetEvent?.name || 'community session'} of RacketHeads Kochi!</p>
          
          <p><strong>Sign up details:</strong><br/>
          Name: ${player.name}<br/>
          Proficiency: ${player.proficiency}<br/>
          Phone Number: ${player.phone}</p>
          
          <p><strong>Event Details:</strong><br/>
          Date: ${targetEvent?.date || 'TBD'}<br/>
          Time: ${targetEvent?.time || 'TBD'}<br/>
          Venue: ${targetEvent?.venue || 'TBD'} 
          <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(targetEvent?.venue || '')}">(View on Map)</a></p>
          
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
          subject: "🏸 You're in! Spot Confirmed for RacketHeads Kochi 🏸",
          html: htmlBody,
          attachments: [
            {
              filename: 'qr-code.png',
              path: qrCodeUrl,
            }
          ]
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }
    }

    return NextResponse.json({ success: true, message: 'Payment verified and status updated' });
  } catch (error: any) {
    console.error('Waitlist confirm error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
