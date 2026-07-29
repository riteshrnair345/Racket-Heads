import { NextResponse } from 'next/server';
import { incrementPageView } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const city = request.headers.get('x-vercel-ip-city') || '';
    const country = request.headers.get('x-vercel-ip-country') || '';
    
    let location = 'Unknown';
    if (city && country) {
      location = `${decodeURIComponent(city)}, ${country}`;
    } else if (country) {
      location = country;
    }

    await incrementPageView(location);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tracking error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
