import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    console.log('[UPLOAD] Received file upload request');
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.log('[UPLOAD] No file provided');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log('[UPLOAD] File received:', { name: file.name, type: file.type, size: file.size });

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      console.log('[UPLOAD] Invalid file type:', file.type);
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.log('[UPLOAD] File size exceeds limit:', file.size);
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/\s+/g, '-');
    const filename = `${timestamp}-${originalName}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    console.log('[UPLOAD] Uploads directory:', uploadsDir);
    await mkdir(uploadsDir, { recursive: true });

    // Save file
    const filepath = path.join(uploadsDir, filename);
    console.log('[UPLOAD] Writing file to:', filepath);
    await writeFile(filepath, buffer);

    // Return the API URL for serving the image with logging
    const imageUrl = `/api/images/${filename}`;
    console.log('[UPLOAD] File uploaded successfully, accessible at:', imageUrl);

    return NextResponse.json({
      success: true,
      url: imageUrl,
      filename: filename
    });
  } catch (error) {
    console.error('[UPLOAD] Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
