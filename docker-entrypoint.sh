#!/bin/sh
set -e

# Function to initialize directories
init_directories() {
  DATA_DIR="/app/data"
  DATA_FILE="$DATA_DIR/items.json"

  echo "Checking directories..."

  # Create data directory if it doesn't exist
  if [ ! -d "$DATA_DIR" ]; then
    echo "Creating data directory..."
    mkdir -p "$DATA_DIR" || echo "Could not create data directory, it may be mounted"
  fi

  # Create empty items.json if it doesn't exist
  if [ ! -f "$DATA_FILE" ]; then
    echo "Creating empty items.json file..."
    cat > "$DATA_FILE" << 'EOF' || echo "Could not create items.json, check permissions"
{
  "bestSellers": [],
  "saleItems": []
}
EOF
    echo "Empty items.json created"
  else
    echo "items.json already exists"
  fi

  # Ensure uploads directory exists
  UPLOADS_DIR="/app/public/uploads"
  if [ ! -d "$UPLOADS_DIR" ]; then
    echo "Creating uploads directory..."
    mkdir -p "$UPLOADS_DIR" || echo "Could not create uploads directory"
  fi

  # Test write permissions
  echo "Testing write permissions..."
  if [ -w "$DATA_DIR" ]; then
    echo "✓ Data directory is writable"
  else
    echo "✗ WARNING: Data directory is NOT writable! Changes will not be saved."
    echo "  Please check volume permissions in Coolify."
  fi

  echo "Initialization complete!"
}

# Initialize directories
init_directories

# Execute the main command
echo "Starting application..."
exec "$@"
