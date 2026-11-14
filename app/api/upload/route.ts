import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary if credentials are present
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_URL ||
  (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
);

if (isCloudinaryConfigured) {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config();
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.NEXT_PUBLIC_ADMIN_PIN || "0000"}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  let filename = searchParams.get('filename') || 'upload.jpg';

  if (!request.body) {
    return NextResponse.json({ success: false, error: "Request body is required" }, { status: 400 });
  }

  try {
    const arrayBuffer = await request.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      return NextResponse.json({ success: false, error: "Uploaded file is empty" }, { status: 400 });
    }

    const lowerName = filename.toLowerCase();
    const isHeic = lowerName.endsWith('.heic') || lowerName.endsWith('.heif');
    const isImage = isHeic || lowerName.match(/\.(jpg|jpeg|png|webp|avif)$/);

    // Convert HEIC or optimize large images with Sharp on the server
    if (isHeic) {
      try {
        const sharp = (await import('sharp')).default;
        const converted = await sharp(buffer)
          .rotate()
          .resize({ width: 2048, height: 2048, fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85, progressive: true })
          .toBuffer();
        buffer = Buffer.from(converted);
        filename = filename.replace(/\.(heic|heif)$/i, '.jpg');
      } catch (heicErr: any) {
        console.error("Server Sharp HEIC conversion error:", heicErr);
      }
    }

    // 1. If Cloudinary credentials exist, upload to Cloudinary (recommended for video/image hosting)
    if (isCloudinaryConfigured) {
      const sanitizedName = filename
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .substring(0, 60);

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto',
            public_id: `${Date.now()}_${sanitizedName}`,
            folder: 'twb_gallery',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      });

      return NextResponse.json({ success: true, url: (uploadResult as any).secure_url });
    }

    // 2. In local dev or environments with a persistent filesystem, save to public/uploads/
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (fs.existsSync(uploadsDir)) {
      try {
        const ext = path.extname(filename) || '.jpg';
        const safeName = `upload_${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        const filePath = path.join(uploadsDir, safeName);
        fs.writeFileSync(filePath, buffer);
        return NextResponse.json({ success: true, url: `/uploads/${safeName}` });
      } catch (fsErr) {
        // Read-only filesystem (e.g. Vercel Serverless environment), fall through to base64
        console.warn("Filesystem read-only, falling back to data URL:", fsErr);
      }
    }

    // 3. Fallback: compact base64 Data URL (optimized for Redis storage)
    if (isImage && !isHeic) {
      try {
        const sharp = (await import('sharp')).default;
        const optimized = await sharp(buffer)
          .rotate()
          .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80, progressive: true })
          .toBuffer();
        buffer = Buffer.from(optimized);
        filename = filename.replace(/\.[^/.]+$/, '.jpg');
      } catch (optErr) {
        console.warn("Image optimization fallback error:", optErr);
      }
    }

    const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
      heic: 'image/jpeg',
      heif: 'image/jpeg',
      mp4: 'video/mp4',
      webm: 'video/webm',
      mov: 'video/quicktime',
      quicktime: 'video/quicktime',
      m4v: 'video/mp4',
    };
    const mimeType = mimeTypes[ext] || (ext.match(/(mp4|webm|mov|m4v)/) ? 'video/mp4' : 'image/jpeg');
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    return NextResponse.json({ success: true, url: dataUrl });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Upload processing error" }, { status: 500 });
  }
}
