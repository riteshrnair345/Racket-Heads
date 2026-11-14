import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || "vercel_blob_rw_GzJt0cYYan0Lyo3j_jIsfvggmKDh7YesB9HREod5uBqrJOw";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      token: BLOB_TOKEN,
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          maximumSizeInBytes: 500 * 1024 * 1024, // Up to 500 MB
          addRandomSuffix: true,
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    console.error("Vercel Blob token generation error:", error);
    return NextResponse.json(
      { error: error?.message || "Token generation failed" },
      { status: 400 },
    );
  }
}
