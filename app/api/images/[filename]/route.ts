import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    console.log('[IMAGE] Image request received:', filename);

    // Construct the file path
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
    console.log('[IMAGE] Looking for file at:', filepath);

    // Check if file exists
    if (!existsSync(filepath)) {
      console.log('[IMAGE] File not found:', filename);
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Read the file
    console.log('[IMAGE] Reading file:', filename);
    const fileBuffer = await readFile(filepath);
    console.log('[IMAGE] File read successfully:', {
      filename,
      size: fileBuffer.length,
      sizeKB: (fileBuffer.length / 1024).toFixed(2) + ' KB'
    });

    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    const contentTypeMap: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    };

    const contentType = contentTypeMap[ext] || 'application/octet-stream';
    console.log('[IMAGE] Serving with content type:', contentType);

    // Return the image with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('[IMAGE] Error serving image:', error);
    return NextResponse.json({ error: 'Failed to serve image' }, { status: 500 });
  }
}
