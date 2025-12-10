#!/bin/sh
set -e

# Function to initialize directories
init_directories() {
  DATA_DIR="/app/data"
  DATA_FILE="$DATA_DIR/items.json"

  echo "=== Starting initialization ==="
  echo "Current user: $(whoami)"
  echo "Current user ID: $(id -u)"
  echo "Working directory: $(pwd)"

  # Check if data directory exists
  if [ ! -d "$DATA_DIR" ]; then
    echo "Creating data directory..."
    mkdir -p "$DATA_DIR" 2>&1 || echo "WARNING: Could not create data directory"
  fi

  # Show directory permissions
  echo "Data directory info:"
  ls -la "$DATA_DIR" 2>&1 || echo "Could not list data directory"

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
      echo "Template not found, creating empty file..."
      cat > "$DATA_FILE" << 'EOF' && echo "✓ Empty file created" || echo "✗ Failed to create file"
{
  "bestSellers": [],
  "saleItems": []
}
EOF
    fi

    # Check if file was created
    if [ -f "$DATA_FILE" ]; then
      echo "✓ items.json exists now"
      ls -la "$DATA_FILE" 2>&1
    else
      echo "✗ CRITICAL: Failed to create items.json"
      echo "Directory permissions:"
      ls -lad "$DATA_DIR" 2>&1
      echo "Attempting to write test file..."
      echo "test" > "$DATA_DIR/test.txt" 2>&1 && echo "Test write succeeded" || echo "Test write FAILED - check volume permissions!"
    fi
  else
    echo "✓ items.json already exists"
    ls -la "$DATA_FILE" 2>&1
    # Show first few lines of the file
    echo "File contents preview:"
    head -n 5 "$DATA_FILE" 2>&1 || echo "Could not read file"
  fi

  # Ensure uploads directory exists
  UPLOADS_DIR="/app/public/uploads"
  if [ ! -d "$UPLOADS_DIR" ]; then
    echo "Creating uploads directory..."
    mkdir -p "$UPLOADS_DIR" 2>&1 || echo "WARNING: Could not create uploads directory"
  fi

  echo "=== Initialization complete ==="
}

# Initialize directories
init_directories

# Execute the main command
echo "Starting application..."
exec "$@"
