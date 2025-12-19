#!/usr/bin/env node

/**
 * Cleanup script for unused upload files
 * Removes files from public/uploads that are not referenced in data/items.json
 * Run at deployment time to keep the upload directory clean
 */

const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const DATA_FILE = path.join(process.cwd(), 'data', 'items.json');

function getReferencedImages() {
  try {
    // Read items.json
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const referencedFiles = new Set();

    // Extract filenames from both bestSellers and saleItems
    const allItems = [...(data.bestSellers || []), ...(data.saleItems || [])];

    allItems.forEach((item) => {
      // Extract from single image field (supports both /uploads/ and /api/images/ patterns)
      if (item.image) {
        const filename = extractFilename(item.image);
        if (filename) referencedFiles.add(filename);
      }

      // Extract from images array
      if (Array.isArray(item.images)) {
        item.images.forEach((imgPath) => {
          const filename = extractFilename(imgPath);
          if (filename) referencedFiles.add(filename);
        });
      }
    });

    return referencedFiles;
  } catch (error) {
    console.error('Error reading items.json:', error.message);
    // If we can't read the file, don't delete anything
    return new Set();
  }
}

function extractFilename(imagePath) {
  // Handle different path formats:
  // - /uploads/filename.jpg
  // - /api/images/filename.jpg
  // - filename.jpg
  if (!imagePath) return null;

  const parts = imagePath.split('/');
  const filename = parts[parts.length - 1];

  // Only return valid image filenames (skip .gitkeep, etc.)
  if (filename && /\.(jpg|jpeg|png|gif|webp)$/i.test(filename)) {
    return filename;
  }

  return null;
}

function cleanupUnusedFiles() {
  console.log('🧹 Starting cleanup of unused upload files...\n');

  // Ensure directories exist
  if (!fs.existsSync(UPLOADS_DIR)) {
    console.log('⚠️  Uploads directory does not exist. Nothing to clean.');
    return;
  }

  if (!fs.existsSync(DATA_FILE)) {
    console.log('⚠️  items.json not found. Skipping cleanup to be safe.');
    return;
  }

  // Get all referenced images
  const referencedImages = getReferencedImages();
  console.log(`📋 Found ${referencedImages.size} referenced image(s) in items.json`);

  // Get all files in uploads directory
  const uploadedFiles = fs.readdirSync(UPLOADS_DIR).filter((file) => {
    // Skip .gitkeep and non-image files
    return file !== '.gitkeep' && /\.(jpg|jpeg|png|gif|webp)$/i.test(file);
  });

  console.log(`📁 Found ${uploadedFiles.length} file(s) in uploads directory\n`);

  // Find unused files
  const unusedFiles = uploadedFiles.filter((file) => !referencedImages.has(file));

  if (unusedFiles.length === 0) {
    console.log('✅ No unused files found. Upload directory is clean!');
    return;
  }

  // Delete unused files
  let deletedCount = 0;
  let deletedSize = 0;

  console.log(`🗑️  Removing ${unusedFiles.length} unused file(s):\n`);

  unusedFiles.forEach((file) => {
    const filePath = path.join(UPLOADS_DIR, file);
    try {
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);

      fs.unlinkSync(filePath);
      deletedCount++;
      deletedSize += stats.size;

      console.log(`  ✓ Deleted: ${file} (${sizeKB} KB)`);
    } catch (error) {
      console.error(`  ✗ Failed to delete ${file}:`, error.message);
    }
  });

  const totalSizeMB = (deletedSize / 1024 / 1024).toFixed(2);
  console.log(`\n✨ Cleanup complete!`);
  console.log(`   Deleted: ${deletedCount} file(s)`);
  console.log(`   Freed: ${totalSizeMB} MB`);
}

// Run cleanup
cleanupUnusedFiles();
