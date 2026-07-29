import { NextResponse } from 'next/server';
import { incrementPageView } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const rawCity = request.headers.get('x-vercel-ip-city') || '';
    const rawRegion = request.headers.get('x-vercel-ip-country-region') || '';
    const countryCode = request.headers.get('x-vercel-ip-country') || '';
    
    const city = rawCity ? decodeURIComponent(rawCity) : '';
    const region = rawRegion ? decodeURIComponent(rawRegion) : '';
    
    let country = countryCode;
    try {
      if (countryCode) {
        const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
        country = displayNames.of(countryCode) || countryCode;
      }
    } catch (e) {}
    
    let locationParts = [];
    if (city) locationParts.push(city);
    if (region && region !== city) locationParts.push(region);
    if (country) locationParts.push(country);
    
    let location = locationParts.length > 0 ? locationParts.join(', ') : 'Unknown';

    await incrementPageView(location);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tracking error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
