import { NextResponse } from 'next/server';
import { getGalleryItems, saveGalleryItems } from '@/lib/db';

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.NEXT_PUBLIC_ADMIN_PIN || "0000"}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { orderedIds } = await request.json();
    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 });
    }

    const items = await getGalleryItems();
    
    // Sort items based on the index in orderedIds
    const sortedItems = [...items].sort((a, b) => {
      const indexA = orderedIds.indexOf(a.id);
      const indexB = orderedIds.indexOf(b.id);
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1; // Put unknowns at the end
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

    await saveGalleryItems(sortedItems);

    return NextResponse.json({ success: true, items: sortedItems });
  } catch (error: any) {
    console.error('Gallery reorder error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
