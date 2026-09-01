import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request): Promise<NextResponse> {
  const session = await verifySession()
  if (!session.isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const limit = parseInt(searchParams.get('limit') || '50', 10)

  try {
    const items = await prisma.media.findMany({
      where: query
        ? {
            OR: [
              { filename: { contains: query, mode: 'insensitive' } },
              { altText: { contains: query, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ items })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch media' }, { status: 500 })
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const session = await verifySession()
  if (!session.isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const filename = searchParams.get('filename')

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 })
  }

  // Clean filename to prevent path traversal or unsafe characters
  const baseName = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_')

  try {
    const arrayBuffer = await request.arrayBuffer()
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return NextResponse.json({ error: 'File content is required' }, { status: 400 })
    }

    const buffer = Buffer.from(arrayBuffer)
    const size = buffer.length
    let url = ''
    let contentType = request.headers.get('content-type') || 'image/jpeg'

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // 1. If Vercel Blob token is provided, upload to Vercel Blob CDN
      const blob = await put(baseName, buffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      })
      url = blob.url
      contentType = blob.contentType || contentType
    } else {
      // 2. Local fallback storage in public/uploads/
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
      }

      const timestamp = Date.now()
      const uniqueFilename = `${timestamp}-${baseName}`
      const filePath = path.join(uploadsDir, uniqueFilename)
      fs.writeFileSync(filePath, buffer)

      url = `/uploads/${uniqueFilename}`
    }

    // Save to Prisma Media library (or update if duplicate)
    const media = await prisma.media.upsert({
      where: { url },
      update: {
        filename: baseName,
        mimeType: contentType,
        size,
      },
      create: {
        url,
        filename: baseName,
        mimeType: contentType,
        size,
      },
    })

    return NextResponse.json({ url: media.url, filename: media.filename, id: media.id })
  } catch (error: any) {
    console.error('Error uploading image:', error)
    return NextResponse.json({ error: error.message || 'Failed to upload image' }, { status: 500 })
  }
}
