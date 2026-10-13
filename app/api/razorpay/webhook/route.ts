import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { 
  getPlayers, 
  getPlayerByEmail, 
  upsertPlayer, 
  generateNextPlayerId, 
  getEvents, 
  getOrderRegistration, 
  deleteOrderRegistration,
  Player
} from '@/lib/db';
import { sendConfirmationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'racketheads';

    if (!signature) {
      console.error('Razorpay webhook missing x-razorpay-signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Razorpay webhook signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const eventData = JSON.parse(rawBody);
    const eventName = eventData.event;
    console.log(`Received Razorpay webhook event: ${eventName}`);

    if (eventName !== 'payment.captured' && eventName !== 'order.paid') {
      return NextResponse.json({ status: 'ignored', message: `Unhandled event: ${eventName}` });
    }

    const paymentEntity = eventData.payload?.payment?.entity;
    const orderEntity = eventData.payload?.order?.entity;

    const paymentId = paymentEntity?.id;
    const orderId = paymentEntity?.order_id || orderEntity?.id;
    const notes = paymentEntity?.notes || orderEntity?.notes || {};

    // Retrieve registration draft stored on the server during create-order
    const draft = orderId ? await getOrderRegistration(orderId) : null;

    const email = (draft?.email || paymentEntity?.email || notes.email || '').toLowerCase().trim();
    const phone = draft?.phone || paymentEntity?.contact || notes.phone || '';
    const name = draft?.name || notes.name || (email ? email.split('@')[0] : 'Participant');
    const eventIdFromData = draft?.eventId || notes.eventId;

    if (!email) {
      console.warn('Webhook received but no email could be determined for payment:', paymentId);
      return NextResponse.json({ status: 'ok', warning: 'No email found' });
    }

    // Determine target event
    const events = await getEvents();
    let targetEventId = eventIdFromData;
    if (!targetEventId) {
      const activeEvents = events.filter(e => e.isActive);
      targetEventId = activeEvents.length > 0 ? activeEvents[0].id : events[events.length - 1]?.id;
    }
    const targetEvent = events.find(e => e.id === targetEventId);

    // Format phone
    let formattedPhone = phone.trim().replace(/\s+/g, '');
    if (formattedPhone && !formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('91') && formattedPhone.length > 10) {
        formattedPhone = '+' + formattedPhone;
      } else {
        formattedPhone = '+91' + formattedPhone;
      }
    }

    const players = await getPlayers();
    
    // Check if player or registration already exists
    let existingPlayer = players.find(p => p.email.toLowerCase() === email);
    const playerWithPayment = players.find(p => 
      p.registrations?.some(r => r.razorpayPaymentId === paymentId || (orderId && r.razorpayOrderId === orderId))
    );

    if (playerWithPayment) {
      console.log(`Payment ${paymentId} already processed for player ${playerWithPayment.id}`);
      return NextResponse.json({ status: 'ok', message: 'Already processed' });
    }

    const now = new Date().toISOString();

    if (existingPlayer) {
      if (!existingPlayer.registrations) existingPlayer.registrations = [];
      const regIndex = existingPlayer.registrations.findIndex(r => r.eventId === targetEventId);

      if (regIndex !== -1) {
        existingPlayer.registrations[regIndex].registrationStatus = 'Confirmed';
        existingPlayer.registrations[regIndex].paymentStatus = 'Paid';
        if (paymentId) existingPlayer.registrations[regIndex].razorpayPaymentId = paymentId;
        if (orderId) existingPlayer.registrations[regIndex].razorpayOrderId = orderId;
      } else {
        existingPlayer.registrations.push({
          eventId: targetEventId || 'legacy_event',
          checkInStatus: 'Pending',
          timeWhenCheckedIn: null,
          registrationStatus: 'Confirmed',
          paymentStatus: 'Paid',
          razorpayPaymentId: paymentId,
          razorpayOrderId: orderId
        });
      }

      existingPlayer.lastActive = now;
      if (formattedPhone && !existingPlayer.phone) existingPlayer.phone = formattedPhone;
      if (name && (!existingPlayer.name || existingPlayer.name === 'Participant')) existingPlayer.name = name;

      await upsertPlayer(existingPlayer);
      await sendConfirmationEmail(existingPlayer, targetEvent, false);
    } else {
      // Create new player
      const id = await generateNextPlayerId();
      const rawString = `${id}-${email}`;
      const qrId = Buffer.from(rawString).toString('base64').replace(/=/g, '');

      const newPlayer: Player = {
        id,
        qrId,
        name,
        email,
        phone: formattedPhone,
        age: draft?.age || '',
        proficiency: draft?.proficiency || 'Amateur',
        duration: draft?.duration || '1-3 years',
        shoes: draft?.shoes || 'Required',
        heardFrom: draft?.heardFrom || 'Instagram',
        firstSeen: now,
        lastActive: now,
        eventsAttended: 0,
        registrations: [
          {
            eventId: targetEventId || 'legacy_event',
            checkInStatus: 'Pending',
            timeWhenCheckedIn: null,
            registrationStatus: 'Confirmed',
            paymentStatus: 'Paid',
            razorpayPaymentId: paymentId,
            razorpayOrderId: orderId
          }
        ]
      };

      await upsertPlayer(newPlayer);
      await sendConfirmationEmail(newPlayer, targetEvent, false);
    }

    if (orderId) {
      await deleteOrderRegistration(orderId);
    }

    return NextResponse.json({ status: 'ok', message: 'Payment successfully processed' });
  } catch (error: any) {
    console.error('Razorpay Webhook Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
