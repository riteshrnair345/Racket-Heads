import { NextResponse } from 'next/server';
import { getPlayers } from '@/lib/db';

export const dynamic = 'force-dynamic'; // Prevent caching

export async function GET() {
  try {
    const players = await getPlayers();
    
    // We limit the event to 28 participants
    const maxSlots = 28;
    const currentCount = players.length;
    const isFull = currentCount >= maxSlots;

    return NextResponse.json({ 
      success: true, 
      count: currentCount,
      maxSlots,
      isFull
    });
  } catch (error) {
    console.error('Failed to get registration status:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch status' }, { status: 500 });
  }
}
