import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

// Validate file type
function validateFileType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
}

// Validate file size (max 50MB)
function validateFileSize(file: File): boolean {
  const maxSize = 50 * 1024 * 1024; // 50MB
  return file.size <= maxSize;
}

// Process and save a single file
async function processFile(file: File, uploadsDir: string): Promise<string> {
  console.log('[UPLOAD] Processing file:', { name: file.name, type: file.type, size: file.size });

  // Validate file
  if (!validateFileType(file)) {
    throw new Error(`Invalid file type: ${file.type}. Only JPEG, PNG, GIF, and WebP are allowed`);
  }

  if (!validateFileSize(file)) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    throw new Error(`File size exceeds 50MB limit (${sizeMB}MB): ${file.name}`);
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate unique filename (change extension to .webp for optimized format)
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const originalNameWithoutExt = path.parse(file.name.replace(/\s+/g, '-')).name;
  const filename = `${timestamp}-${random}-${originalNameWithoutExt}.webp`;

  console.log('[UPLOAD] Original size:', (file.size / 1024).toFixed(2), 'KB');

  // Process image with sharp
  let processedBuffer: Buffer;

  // Handle GIF separately (don't convert GIFs to WebP to preserve animation)
  if (file.type === 'image/gif') {
    const gifFilename = `${timestamp}-${random}-${originalNameWithoutExt}.gif`;
    const filepath = path.join(uploadsDir, gifFilename);
    console.log('[UPLOAD] Saving GIF without optimization');
    await writeFile(filepath, buffer);

    const imageUrl = `/api/images/${gifFilename}`;
    console.log('[UPLOAD] GIF uploaded successfully, accessible at:', imageUrl);
    return imageUrl;
  }

  try {
    // Resize to exactly 2000x2000 for high-quality images (up to ~5MB)
    processedBuffer = await sharp(buffer)
      .resize(2000, 2000, {
        fit: 'cover', // Crop to fill dimensions, maintaining aspect ratio
        position: 'center' // Center the crop
      })
      .webp({
        quality: 95, // High quality for better detail (allows larger file sizes)
        effort: 6 // Higher effort = better compression (0-6)
      })
      .toBuffer();

    console.log('[UPLOAD] Resized to: 2000x2000px');
    console.log('[UPLOAD] Optimized size:', (processedBuffer.length / 1024).toFixed(2), 'KB');
    console.log('[UPLOAD] Size reduction:', ((1 - processedBuffer.length / file.size) * 100).toFixed(1), '%');
  } catch (error) {
    console.error('[UPLOAD] Image optimization failed:', error);
    throw new Error(`Failed to optimize image: ${file.name}`);
  }

  // Save optimized file
  const filepath = path.join(uploadsDir, filename);
  console.log('[UPLOAD] Writing optimized file to:', filepath);
  await writeFile(filepath, processedBuffer);

  // Return the API URL for serving the image
  const imageUrl = `/api/images/${filename}`;
  console.log('[UPLOAD] File uploaded successfully, accessible at:', imageUrl);

  return imageUrl;
}

export async function POST(request: Request) {
  try {
    console.log('[UPLOAD] Received file upload request');
    const formData = await request.formData();

    // Get all files from FormData
    const files: File[] = [];

    // Check for single file (backward compatibility)
    const singleFile = formData.get('file') as File | null;
    if (singleFile) {
      files.push(singleFile);
    }

    // Check for multiple files
    const allFiles = formData.getAll('files');
    for (const file of allFiles) {
      if (file instanceof File) {
        files.push(file);
      }
    }

    if (files.length === 0) {
      console.log('[UPLOAD] No files provided');
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    console.log(`[UPLOAD] Processing ${files.length} file(s)`);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    console.log('[UPLOAD] Uploads directory:', uploadsDir);
    await mkdir(uploadsDir, { recursive: true });

    // Process all files
    const results = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const url = await processFile(files[i], uploadsDir);
        results.push({
          success: true,
          url,
          filename: path.basename(url)
        });
      } catch (error) {
        console.error(`[UPLOAD] Error processing file ${files[i].name}:`, error);
        errors.push({
          success: false,
          filename: files[i].name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // If single file upload, return single object for backward compatibility
    if (files.length === 1) {
      if (results.length === 1) {
        return NextResponse.json(results[0]);
      } else {
        return NextResponse.json({
          error: errors[0].error
        }, { status: 400 });
      }
    }

    // For multiple files, return array of results
    return NextResponse.json({
      success: results.length > 0,
      totalFiles: files.length,
      successCount: results.length,
      errorCount: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('[UPLOAD] Upload error:', error);
    return NextResponse.json({
      error: 'Failed to upload files',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
