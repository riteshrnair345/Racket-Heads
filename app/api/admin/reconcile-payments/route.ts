import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { 
  getPlayers, 
  getPlayerByEmail, 
  upsertPlayer, 
  generateNextPlayerId, 
  getEvents, 
  Player 
} from '@/lib/db';
import { sendConfirmationEmail } from '@/lib/email';

function getRazorpayClient() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.NEXT_PUBLIC_ADMIN_PIN || "0000"}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return NextResponse.json({ success: false, error: 'Razorpay credentials missing' }, { status: 500 });
    }

    const players = await getPlayers();
    const knownPaymentIds = new Set<string>();
    const knownOrderIds = new Set<string>();

    players.forEach(p => {
      p.registrations?.forEach(r => {
        if (r.razorpayPaymentId) knownPaymentIds.add(r.razorpayPaymentId);
        if (r.razorpayOrderId) knownOrderIds.add(r.razorpayOrderId);
      });
    });

    const paymentsResponse = await razorpay.payments.all({ count: 50 });
    const capturedPayments = paymentsResponse.items.filter(p => p.status === 'captured');

    const unlinkedPayments = capturedPayments.map(pay => {
      const isLinked = knownPaymentIds.has(pay.id) || (pay.order_id && knownOrderIds.has(pay.order_id));
      const existingPlayer = pay.email ? players.find(p => p.email.toLowerCase() === pay.email.toLowerCase()) : null;

      return {
        id: pay.id,
        orderId: pay.order_id,
        amount: Number(pay.amount) / 100,
        email: pay.email,
        contact: pay.contact,
        method: pay.method,
        createdAt: new Date(Number(pay.created_at) * 1000).toISOString(),
        isLinked,
        existingPlayerId: existingPlayer?.id,
        existingPlayerName: existingPlayer?.name,
      };
    });

    return NextResponse.json({ success: true, payments: unlinkedPayments });
  } catch (error: any) {
    console.error('Reconciliation fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.NEXT_PUBLIC_ADMIN_PIN || "0000"}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentId, eventId, name, email, phone, shouldEmail = true } = await request.json();

    if (!paymentId) {
      return NextResponse.json({ success: false, error: 'Payment ID is required' }, { status: 400 });
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return NextResponse.json({ success: false, error: 'Razorpay credentials missing' }, { status: 500 });
    }

    const payment = await razorpay.payments.fetch(paymentId);
    if (!payment || payment.status !== 'captured') {
      return NextResponse.json({ success: false, error: 'Payment is not captured in Razorpay' }, { status: 400 });
    }

    const finalEmail = (email || payment.email || '').toLowerCase().trim();
    const finalPhone = phone || payment.contact || '';
    const finalName = name || (finalEmail ? finalEmail.split('@')[0] : 'Participant');

    if (!finalEmail) {
      return NextResponse.json({ success: false, error: 'Customer email could not be determined' }, { status: 400 });
    }

    const events = await getEvents();
    let targetEvent = events.find(e => e.id === eventId);
    if (!targetEvent) {
      const activeEvents = events.filter(e => e.isActive);
      targetEvent = activeEvents[0] || events[events.length - 1];
    }
    const targetEventId = targetEvent?.id || 'legacy_event';

    let formattedPhone = finalPhone.trim().replace(/\s+/g, '');
    if (formattedPhone && !formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('91') && formattedPhone.length > 10) {
        formattedPhone = '+' + formattedPhone;
      } else {
        formattedPhone = '+91' + formattedPhone;
      }
    }

    let player = await getPlayerByEmail(finalEmail);
    const now = new Date().toISOString();

    if (player) {
      if (!player.registrations) player.registrations = [];
      const regIndex = player.registrations.findIndex(r => r.eventId === targetEventId);

      if (regIndex !== -1) {
        player.registrations[regIndex].registrationStatus = 'Confirmed';
        player.registrations[regIndex].paymentStatus = 'Paid';
        player.registrations[regIndex].razorpayPaymentId = payment.id;
        player.registrations[regIndex].razorpayOrderId = payment.order_id;
      } else {
        player.registrations.push({
          eventId: targetEventId,
          checkInStatus: 'Pending',
          timeWhenCheckedIn: null,
          registrationStatus: 'Confirmed',
          paymentStatus: 'Paid',
          razorpayPaymentId: payment.id,
          razorpayOrderId: payment.order_id
        });
      }
      player.lastActive = now;
      if (formattedPhone && !player.phone) player.phone = formattedPhone;
      if (finalName && (!player.name || player.name === 'Participant')) player.name = finalName;
    } else {
      const id = await generateNextPlayerId();
      const rawString = `${id}-${finalEmail}`;
      const qrId = Buffer.from(rawString).toString('base64').replace(/=/g, '');

      player = {
        id,
        qrId,
        name: finalName,
        email: finalEmail,
        phone: formattedPhone,
        proficiency: 'Amateur',
        duration: '1-3 years',
        shoes: 'Required',
        heardFrom: 'Razorpay Import',
        firstSeen: now,
        lastActive: now,
        eventsAttended: 0,
        registrations: [
          {
            eventId: targetEventId,
            checkInStatus: 'Pending',
            timeWhenCheckedIn: null,
            registrationStatus: 'Confirmed',
            paymentStatus: 'Paid',
            razorpayPaymentId: payment.id,
            razorpayOrderId: payment.order_id
          }
        ]
      };
    }

    await upsertPlayer(player);

    if (shouldEmail) {
      await sendConfirmationEmail(player, targetEvent, false);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Player ${player.name} (${player.id}) confirmed and linked to payment ${payment.id}` 
    });
  } catch (error: any) {
    console.error('Reconciliation import error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
