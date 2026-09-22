import { NextResponse } from 'next/server';
import { getFeedbacks, saveFeedbacks, Feedback } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.NEXT_PUBLIC_ADMIN_PIN || "0000"}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const feedbacks = await getFeedbacks();
    
    // Sort by most recent first
    feedbacks.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    return NextResponse.json({ success: true, feedbacks });
  } catch (error: any) {
    console.error('Feedback fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body || typeof body.overallRating !== 'number') {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const newFeedback: Feedback = {
      id: randomUUID(),
      submittedAt: new Date().toISOString(),
      
      eventId: body.eventId,
      eventName: body.eventName,
      playerName: body.playerName || "",
      
      overallRating: body.overallRating,
      likelyToAttend: body.likelyToAttend || 0,
      nps: body.nps || 0,
      
      enjoyedMost: body.enjoyedMost || "",
      ratings: body.ratings || {
        organization: "",
        scheduling: "",
        venue: "",
        gameQuality: "",
        communityVibe: "",
        hosts: "",
        refreshments: ""
      },
      matchesFair: body.matchesFair || "",
      enoughPlayTime: body.enoughPlayTime || "",
      durationAppropriate: body.durationAppropriate || "",
      
      improvements: body.improvements || "",
      issuesFaced: body.issuesFaced || "",
      futureEventsWanted: body.futureEventsWanted || [],
      preferredDays: body.preferredDays || [],
      
      heardFrom: body.heardFrom || "",
      addToCommunity: body.addToCommunity || "",
      finalSuggestions: body.finalSuggestions || "",
      
      threeWords: body.threeWords || ""
    };

    const feedbacks = await getFeedbacks();
    feedbacks.push(newFeedback);
    await saveFeedbacks(feedbacks);

    return NextResponse.json({ success: true, feedback: newFeedback });
  } catch (error: any) {
    console.error('Feedback creation error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing feedback ID' }, { status: 400 });
    }

    const feedbacks = await getFeedbacks();
    const updatedFeedbacks = feedbacks.filter(f => f.id !== id);
    await saveFeedbacks(updatedFeedbacks);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Feedback deletion error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
