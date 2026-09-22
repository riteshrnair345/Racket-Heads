import { NextResponse } from 'next/server';
import { savePendingRegistration } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, proficiency, duration, shoes, heardFrom } = body;

    if (!name || !email || !phone) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    await savePendingRegistration(email, {
      name,
      email,
      phone,
      proficiency,
      duration,
      shoes,
      heardFrom,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Pending registration error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
