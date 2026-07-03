import { NextResponse } from 'next/server';
import { getPlayers } from '@/lib/db';
import JSZip from 'jszip';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pin = searchParams.get('pin');

  const adminPin = process.env.NEXT_PUBLIC_ADMIN_PIN;

  if (!adminPin || pin !== adminPin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const players = await getPlayers();
    const zip = new JSZip();
    
    // 1. Define the CSV header
    const headers = ['Name', 'Phone Number', 'Age', 'Proficiency', 'Duration', 'Heard From', 'Registration Date', 'Image Filename', 'QR Code URL'];
    
    // Map players to CSV rows and fetch their QR codes
    const qrcodeFolder = zip.folder("qrcodes");
    
    // We will do this sequentially to avoid rate limits from the qrserver, 
    // or we can use Promise.all if the player count is small. 
    // Since max is 28 players, Promise.all is fine and fast.
    const rows = await Promise.all(players.map(async (player) => {
      // Create a clean filename for the user: RHK_[name of the player]
      const cleanName = player.name.replace(/\s+/g, '_');
      const filename = `RHK_${cleanName}.png`;
      
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(player.qrId)}`;
      
      try {
        // Fetch the image
        const imgRes = await fetch(qrCodeUrl);
        const arrayBuffer = await imgRes.arrayBuffer();
        
        // Add the image to the zip folder
        if (qrcodeFolder) {
          qrcodeFolder.file(filename, arrayBuffer);
        }
      } catch (err) {
        console.error(`Failed to fetch QR for ${player.name}:`, err);
      }
      
      let formattedPhone = (player.phone || '').trim().replace(/\s+/g, '');
      if (!formattedPhone.startsWith('+')) {
        if (formattedPhone.startsWith('91') && formattedPhone.length > 10) {
          formattedPhone = '+' + formattedPhone;
        } else {
          formattedPhone = '+91' + formattedPhone;
        }
      }

      return [
        `"${player.name.replace(/"/g, '""')}"`,
        `"${formattedPhone}"`,
        `"${player.age || ''}"`,
        `"${player.proficiency}"`,
        `"${player.duration}"`,
        `"${player.heardFrom}"`,
        `"${new Date(player.firstSeen).toLocaleString()}"`,
        `"${filename}"`,
        `"${qrCodeUrl}"`
      ].join(',');
    }));
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    zip.file("racketheads_players.csv", csvContent);
    
    // Generate the zip file buffer
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    
    return new NextResponse(zipBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="racketheads_export.zip"'
      }
    });

  } catch (error) {
    console.error('Failed to generate Export ZIP:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
