import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function POST(request: Request): Promise<NextResponse> {
  const session = await verifySession();
  if (!session.isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  try {
    const body = await request.body;
    if (!body) {
      return NextResponse.json({ error: 'Body is required' }, { status: 400 });
    }

    const blob = await put(filename, body, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Save to Media library in DB
    await prisma.media.create({
      data: {
        url: blob.url,
        filename: filename,
        mimeType: blob.contentType || 'application/octet-stream',
        size: 0, // In a real app we might want to calculate the size or use the metadata
      }
    });

    return NextResponse.json(blob);
  } catch (error: any) {
    console.error('Error uploading to Vercel Blob:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
