import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { randomUUID } from 'crypto';
import { saveOrderRegistration } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      amount = 15000,
      eventId,
      name,
      email,
      phone,
      age,
      proficiency,
      duration,
      shoes,
      heardFrom
    } = body;

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;

    if (!keyId || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay keys are missing in environment variables.");
      return NextResponse.json(
        { success: false, error: 'Payment gateway is not configured properly.' },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const notes: Record<string, string> = {};
    if (eventId) notes.eventId = String(eventId);
    if (email) notes.email = String(email);
    if (name) notes.name = String(name);
    if (phone) notes.phone = String(phone);

    const options = {
      amount: amount,
      currency: "INR",
      receipt: `rcpt_${randomUUID().replace(/-/g, '').substring(0, 10)}`,
      notes,
    };

    const order = await razorpay.orders.create(options);

    // Save registration details linked to this order ID in Redis
    if (email && eventId) {
      await saveOrderRegistration(order.id, {
        eventId,
        name: name || '',
        email,
        phone: phone || '',
        age,
        proficiency,
        duration,
        shoes: shoes || 'Required',
        heardFrom: heardFrom || ''
      });
    }
    
    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Razorpay Order Creation Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment order.' },
      { status: 500 }
    );
  }
}
