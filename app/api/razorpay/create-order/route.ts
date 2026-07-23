import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const { amount = 15000 } = await request.json(); // Default to 150 INR (15000 paise)

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

    const options = {
      amount: amount,
      currency: "INR",
      receipt: `rcpt_${randomUUID().replace(/-/g, '').substring(0, 10)}`,
    };

    const order = await razorpay.orders.create(options);
    
    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Razorpay Order Creation Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment order.' },
      { status: 500 }
    );
  }
}
