import { NextResponse } from 'next/server';
import { getGalleryItems, saveGalleryItems, GalleryItem } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await getGalleryItems();
    // Sort by createdAt descending
    const sortedItems = [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json({ success: true, items: sortedItems });
  } catch (error: any) {
    console.error('Gallery fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.NEXT_PUBLIC_ADMIN_PIN || "0000"}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { url, alt, type } = body;

    if (!url) {
      return NextResponse.json({ success: false, error: 'Missing media URL' }, { status: 400 });
    }

    const items = await getGalleryItems();
    
    const newItem: GalleryItem = {
      id: `gal_${Date.now()}`,
      url,
      alt: alt || 'Gallery Media',
      type: type || (url.match(/\.(mp4|webm|ogg|mov|m4v|avi)$/i) ? 'video' : 'image'),
      createdAt: new Date().toISOString()
    };
    
    items.push(newItem);
    await saveGalleryItems(items);

    return NextResponse.json({ success: true, item: newItem });
  } catch (error: any) {
    console.error('Gallery addition error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.NEXT_PUBLIC_ADMIN_PIN || "0000"}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing gallery item ID' }, { status: 400 });
    }

    let items = await getGalleryItems();
    const initialLength = items.length;
    items = items.filter(item => item.id !== id);
    
    if (items.length === initialLength) {
      return NextResponse.json({ success: false, error: 'Gallery item not found' }, { status: 404 });
    }

    await saveGalleryItems(items);

    return NextResponse.json({ success: true, message: 'Gallery item deleted' });
  } catch (error: any) {
    console.error('Gallery deletion error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
