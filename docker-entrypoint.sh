#!/bin/sh
set -e

echo "=== Starting initialization ==="
echo "Current user: $(whoami)"
echo "Current user ID: $(id -u)"
echo "Working directory: $(pwd)"

# Data file path
DATA_FILE="/app/data/items.json"

# Check if data directory exists
if [ ! -d "/app/data" ]; then
  echo "Creating /app/data directory..."
  mkdir -p /app/data
fi

echo "Data directory info:"
ls -la /app/data 2>&1 || echo "Could not list /app/data"

# Create items.json if it doesn't exist
if [ ! -f "$DATA_FILE" ]; then
  echo "items.json does NOT exist, creating from template..."

  # Try to copy from template first
  TEMPLATE_FILE="/app/data-template/items.json"
  if [ -f "$TEMPLATE_FILE" ]; then
    echo "Copying from template: $TEMPLATE_FILE"
    if cp "$TEMPLATE_FILE" "$DATA_FILE" 2>&1; then
      echo "✓ items.json copied from template successfully"
      ls -la "$DATA_FILE" 2>&1
    else
      echo "✗ FAILED to copy from template"
      echo "Trying to create empty file manually..."
      cat > "$DATA_FILE" << 'EOF' && echo "✓ Empty file created" || echo "✗ Failed to create file"
{
  "bestSellers": [],
  "saleItems": []
}
EOF
    fi
  else
    echo "Template file not found, creating empty structure..."
    cat > "$DATA_FILE" << 'EOF' && echo "✓ Empty file created" || echo "✗ Failed to create file"
{
  "bestSellers": [],
  "saleItems": []
}
EOF
  fi
else
  echo "✓ items.json already exists"
  ls -la "$DATA_FILE" 2>&1
fi

echo "=== Initialization complete ==="
echo ""

# Execute the main command
exec "$@"
