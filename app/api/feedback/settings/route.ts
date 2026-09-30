import { NextResponse } from 'next/server';
import { getFeedbackSettings, saveFeedbackSettings } from '@/lib/db';

const ADMIN_PIN = process.env.ADMIN_PIN || '9999';

export async function GET() {
  try {
    const settings = await getFeedbackSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || authHeader !== `Bearer ${ADMIN_PIN}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.settings || typeof body.settings !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    await saveFeedbackSettings({
      customQuestionText: body.settings.customQuestionText || 'WHICH AREA IN THE CITY WOULD YOU PREFER FOR OUR FUTURE EVENTS?',
      customQuestionOptions: Array.isArray(body.settings.customQuestionOptions) 
        ? body.settings.customQuestionOptions.filter(Boolean)
        : ['KAKKANAD/TRIKKAKARA', 'THAMMANAM', 'KALOOR / KADAVANTHRA / KATHRIKADAVU', 'TRIPUNITHURA']
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save settings' }, { status: 500 });
  }
}
