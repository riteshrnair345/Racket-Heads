import nodemailer from 'nodemailer';
import { Player, Event } from './db';

export const EMAIL_FROM = process.env.EMAIL_FROM || 'racketheadskochi@gmail.com';

export function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: (process.env.SMTP_PORT || '465') === '465',
    auth: {
      user: process.env.EMAIL_AUTH_USER || process.env.EMAIL_USER,
      pass: process.env.EMAIL_AUTH_PASSWORD || process.env.EMAIL_PASSWORD,
    },
  });
}

export async function sendConfirmationEmail(player: Player, event?: Event, isWaitlisted: boolean = false): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("Email credentials missing, skipping confirmation email.");
    return false;
  }

  const isDoubles = event?.eventType === 'doubles';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(player.qrId)}`;

  const htmlBody = isWaitlisted ? `
    <div style="font-family: Arial, sans-serif; color: #000; font-size: 14px; line-height: 1.6;">
      <p>Hi ${player.name},</p>
      <p>You have been placed on the <strong>Waitlist</strong> for the ${event?.name || 'community session'} of RacketHeads Kochi because all spots are currently filled.</p>
      
      <p><strong>Waitlist details:</strong><br/>
      Name: ${player.name}<br/>
      ${!isDoubles && player.proficiency ? `Proficiency: ${player.proficiency}<br/>` : ''}Phone Number: ${player.phone}</p>
      
      <p><strong>Event Details:</strong><br/>
      Date: ${event?.date || 'TBD'}<br/>
      Time: ${event?.time || 'TBD'}<br/>
      Venue: ${event?.venue || 'TBD'}</p>
      
      <p>If a spot opens up, we will contact you immediately and upgrade you to the confirmed list. Keep an eye on your email!</p>
      
      <p>Cheers,<br/>
      RacketHeads Kochi Team</p>
    </div>
  ` : `
    <div style="font-family: Arial, sans-serif; color: #000; font-size: 14px; line-height: 1.6;">
      <p>Hi ${player.name},</p>
      <p>You're officially signed up for the ${event?.name || 'community session'} of RacketHeads Kochi!</p>
      
      <p><strong>Sign up details:</strong><br/>
      Name: ${player.name}<br/>
      ${!isDoubles && player.proficiency ? `Proficiency: ${player.proficiency}<br/>` : ''}Phone Number: ${player.phone}</p>
      
      <p><strong>Event Details:</strong><br/>
      Date: ${event?.date || 'TBD'}<br/>
      Time: ${event?.time || 'TBD'}<br/>
      Venue: ${event?.venue || 'TBD'} 
      <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event?.venue || '')}">(View on Map)</a></p>
      
      <p>Get ready for an epic session—we have a great mix of competitive match play lined up alongside some custom challenges and fun group games!</p>
      
      ${isDoubles ? `
        <p><strong>We will add you to our WhatsApp group for further updates shortly!</strong></p>
      ` : `
        <p>We've attached your exclusive QR ticket below. <strong>Please show this QR code when you arrive at the venue for a quick check-in.</strong></p>
        <div style="text-align: center; margin: 30px 0;">
          <img src="${qrCodeUrl}" alt="Your QR Ticket" width="200" height="200" style="border: 2px solid #000; border-radius: 10px; padding: 10px; background: #fff;" />
        </div>
      `}
      
      <p style="font-size: 12px; color: #666; background: #f8f9fa; padding: 12px; border-radius: 6px; margin-top: 25px; border: 1px solid #e9ecef;">
        <strong>Cancellation Policy:</strong> Please note that a refund will only be provided if you cancel your registration more than 24 hours before the scheduled session. Cancellations made within 24 hours of the event are non-refundable. <br/><br/>
        <strong>Need help?</strong> Contact us on WhatsApp at <a href="https://wa.me/919037498391" style="color: #128C7E; text-decoration: none;">+91 90374 98391</a> or <a href="https://wa.me/919745477798" style="color: #128C7E; text-decoration: none;">+91 97454 77798</a>.
      </p>

      <p>Cheers,<br/>
      RacketHeads Kochi Team</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"RacketHeads Kochi" <${EMAIL_FROM}>`,
      replyTo: EMAIL_FROM,
      to: player.email,
      subject: isWaitlisted ? "⏳ You're on the Waitlist for RacketHeads Kochi" : "🏸 You're in! Welcome to RacketHeads Kochi 🏸",
      html: htmlBody,
      attachments: (isWaitlisted || isDoubles) ? [] : [
        {
          filename: 'qr-code.png',
          path: qrCodeUrl,
        }
      ]
    });
    console.log(`Confirmation email sent to ${player.email}:`, info.messageId);
    return true;
  } catch (err) {
    console.error(`Failed to send confirmation email to ${player.email}:`, err);
    return false;
  }
}
