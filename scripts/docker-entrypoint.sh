#!/bin/sh

echo "🚀 Starting Agostino Oculist..."
echo ""

# Run cleanup script to remove unused upload files
echo "🧹 Running upload cleanup..."
node /app/scripts/cleanup-uploads.js
echo ""

# Start the Next.js server
echo "✅ Starting server..."
exec node server.js
