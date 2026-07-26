import { NextResponse } from 'next/server';
import { getPlayerByEmail, generateNextPlayerId, upsertPlayer, Player, getPlayers, getEvents } from '@/lib/db';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, age, proficiency, duration, shoes, heardFrom, eventId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

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
    const isDoubles = targetEvent?.eventType === 'doubles';

    if (!name || !email || !phone || !age) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    if (!isDoubles && (!proficiency || !duration)) {
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

    // Enforce player limit for the SPECIFIC event
    const playersList = await getPlayers();
    
    // Count how many people are registered for THIS event
    const eventPlayers = playersList.filter(p => p.registrations?.some(r => r.eventId === targetEventId));
    const confirmedCount = eventPlayers.filter(p => p.registrations?.some(r => r.eventId === targetEventId && r.registrationStatus !== 'Waitlisted')).length;
    const isExisting = eventPlayers.some(p => p.email.toLowerCase() === email.toLowerCase());
    
    // Check if player already exists in the master database
    let player = await getPlayerByEmail(email);
    
    const existingRegistration = player?.registrations?.find(r => r.eventId === targetEventId);
    
    // If they already have a registration for THIS event, KEEP their previous waitlist status.
    // Otherwise, check if the limit is reached.
    let isWaitlisted = existingRegistration ? 
      existingRegistration.registrationStatus === 'Waitlisted' : 
      confirmedCount >= participantLimit;

    const requiresPayment = targetEvent ? (targetEvent.requiresPayment ?? true) : true;

    // Verify Payment if not waitlisted and not already confirmed AND payment is required
    if (requiresPayment && !isWaitlisted && (!existingRegistration || existingRegistration.registrationStatus !== 'Confirmed')) {
      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return NextResponse.json({ success: false, error: 'Payment details are missing' }, { status: 400 });
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
    }


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
        // We keep their current registrationStatus
      } else {
        // Add new registration
        player.registrations.push({
          eventId: targetEventId,
          checkInStatus: 'Pending',
          timeWhenCheckedIn: null,
          registrationStatus: isWaitlisted ? 'Waitlisted' : 'Confirmed',
          paymentStatus: isWaitlisted ? 'Pending' : 'Paid',
          razorpayPaymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id
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
            timeWhenCheckedIn: null,
            registrationStatus: isWaitlisted ? 'Waitlisted' : 'Confirmed',
            paymentStatus: isWaitlisted ? 'Pending' : 'Paid',
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id
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
        secure: (process.env.SMTP_PORT || '465') === '465',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(player.qrId)}`;
      
      const htmlBody = isWaitlisted ? `
        <div style="font-family: Arial, sans-serif; color: #000; font-size: 14px; line-height: 1.6;">
          <p>Hi ${player.name},</p>
          <p>You have been placed on the <strong>Waitlist</strong> for the ${targetEvent?.name || 'community session'} of RacketHeads Kochi because all spots are currently filled.</p>
          
          <p><strong>Waitlist details:</strong><br/>
          Name: ${player.name}<br/>
          ${!isDoubles ? `Proficiency: ${player.proficiency}<br/>` : ''}          Phone Number: ${formattedPhone}</p>
          
          <p><strong>Event Details:</strong><br/>
          Date: ${targetEvent?.date || 'TBD'}<br/>
          Time: ${targetEvent?.time || 'TBD'}<br/>
          Venue: ${targetEvent?.venue || 'TBD'}</p>
          
          <p>If a spot opens up, we will contact you immediately and upgrade you to the confirmed list. Keep an eye on your email!</p>
          
          <p>Cheers,<br/>
          RacketHeads Kochi Team</p>
        </div>
      ` : `
        <div style="font-family: Arial, sans-serif; color: #000; font-size: 14px; line-height: 1.6;">
          <p>Hi ${player.name},</p>
          <p>You're officially signed up for the ${targetEvent?.name || 'community session'} of RacketHeads Kochi!</p>
          
          <p><strong>Sign up details:</strong><br/>
          Name: ${player.name}<br/>
          ${!isDoubles ? `Proficiency: ${player.proficiency}<br/>` : ''}          Phone Number: ${formattedPhone}</p>
          
          <p><strong>Event Details:</strong><br/>
          Date: ${targetEvent?.date || 'TBD'}<br/>
          Time: ${targetEvent?.time || 'TBD'}<br/>
          Venue: ${targetEvent?.venue || 'TBD'} 
          <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(targetEvent?.venue || '')}">(View on Map)</a></p>
          
          <p>Get ready for an epic session—we have a great mix of competitive match play lined up alongside some custom challenges and fun group games!</p>
          
          ${isDoubles ? `
            <p><strong>We will add you to our WhatsApp group for further updates shortly!</strong></p>
          ` : `
            <p>We've attached your exclusive QR ticket below. <strong>Please show this QR code when you arrive at the venue for a quick check-in.</strong></p>
            <div style="text-align: center; margin: 30px 0;">
              <img src="${qrCodeUrl}" alt="Your QR Ticket" width="200" height="200" style="border: 2px solid #000; border-radius: 10px; padding: 10px; background: #fff;" />
            </div>
          `}
          
          <p>Cheers,<br/>
          RacketHeads Kochi Team</p>
        </div>
      `;

      try {
        await transporter.sendMail({
          from: `"RacketHeads Kochi" <${process.env.EMAIL_USER}>`,
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
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // We still return success because registration succeeded, even if email failed
      }
    }

    // Waitlist threshold logic
    if (isWaitlisted) {
      // Fetch latest players to get accurate waitlist count including this newly inserted player
      const updatedPlayersList = await getPlayers();
      const updatedEventPlayers = updatedPlayersList.filter(p => p.registrations?.some(r => r.eventId === targetEventId));
      const waitlistGroup = updatedEventPlayers.filter(p => p.registrations?.some(r => r.eventId === targetEventId && r.registrationStatus === 'Waitlisted' && r.paymentStatus === 'Pending'));
      
      if (waitlistGroup.length > 0 && waitlistGroup.length % (targetEvent?.waitlistThreshold ?? 6) === 0) {
        // Trigger emails to the waitlisted players to pay
        const playersToEmail = waitlistGroup.slice(0, targetEvent?.waitlistThreshold ?? 6);
        
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
          
          const host = request.headers.get('host') || 'racketheads.club';
          const protocol = host.includes('localhost') ? 'http' : 'https';
          
          for (const wp of playersToEmail) {
            const checkoutLink = `${protocol}://${host}/pay/${wp.id}/${targetEventId}`;
            const waitlistHtml = `
              <div style="font-family: Arial, sans-serif; color: #000; font-size: 14px; line-height: 1.6;">
                <p>Hi ${wp.name},</p>
                <p>Great news! Your session on <strong>${targetEvent?.date || 'TBD'}</strong> is confirmed for <strong>${targetEvent?.name || 'community session'}</strong>.</p>
                
                <p>You have 2 hours to pay your ₹${targetEvent?.amount ?? 150} fee to secure your spot. If you fail to complete the payment in time, your spot will be given to the next person on the waitlist.</p>
                
                <p>
                  <a href="${checkoutLink}" style="display: inline-block; padding: 12px 24px; background-color: #6b21a8; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Pay Now to Confirm Spot
                  </a>
                </p>
                
                <p>Cheers,<br/>
                RacketHeads Kochi Team</p>
              </div>
            `;
            
            try {
              await transporter.sendMail({
                from: '"RacketHeads Kochi" <' + process.env.EMAIL_USER + '>',
                to: wp.email,
                subject: `🏸 Session confirmed on ${targetEvent?.date || 'TBD'}`,
                html: waitlistHtml,
              });
            } catch (err) {
              console.error('Failed to send waitlist unlock email to', wp.email, err);
            }
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Registration successful',
      qrId: player.qrId,
      name: player.name,
      isWaitlisted
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
