import { NextResponse } from 'next/server';
import { getPlayerByEmail, generateNextPlayerId, upsertPlayer, Player, getPlayers } from '@/lib/db';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, age, proficiency, duration, shoes, heardFrom } = body;

    if (!name || !email || !phone || !age || !proficiency || !duration) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    let formattedPhone = phone.trim().replace(/\s+/g, '');
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('91') && formattedPhone.length > 10) {
        formattedPhone = '+' + formattedPhone;
      } else {
        formattedPhone = '+91' + formattedPhone;
      }
    }

    // Enforce 28 player limit
    const playersList = await getPlayers();
    const isExisting = playersList.some(p => p.email.toLowerCase() === email.toLowerCase());
    
    if (playersList.length >= 28 && !isExisting) {
      return NextResponse.json({ success: false, error: 'Registration is full. We have reached the 28 player limit.' }, { status: 403 });
    }

    // Check if player already exists
    let player = await getPlayerByEmail(email);
    const now = new Date().toISOString();

    if (player) {
      // If player exists, we update their latest answers and reset check-in status
      player = {
        ...player,
        name,
        phone: formattedPhone,
        age,
        proficiency,
        duration,
        shoes,
        heardFrom,
        checkInStatus: 'Pending', // Reset to pending for the new event
        payment_status: 'Free',
      };
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
        checkInStatus: 'Pending',
        timeWhenCheckedIn: null,
        payment_status: 'Free',
      };
    }

    await upsertPlayer(player);

    // Send email with QR code if credentials exist
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
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
          <p>You're officially signed up for the community session of RacketHeads Kochi!</p>
          
          <p><strong>Sign up details:</strong><br/>
          Name: ${player.name}<br/>
          Proficiency: ${player.proficiency}<br/>
          Phone Number: ${formattedPhone}</p>
          
          <p>Get ready for an epic session—we have a great mix of competitive match play lined up alongside some custom challenges and fun group games!</p>
          
          <p>📲 <strong>Your Entry Pass:</strong> Your personal QR code is attached to this email. Please have it ready on your phone when you arrive at the venue so we can quickly scan you in.</p>
          
          <p>👟 <strong>Gear Reminder:</strong> Please remember to bring your own racket and strict non-marking indoor shoes to the court.</p>
          
          <p>See you on the court!</p>
          
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
