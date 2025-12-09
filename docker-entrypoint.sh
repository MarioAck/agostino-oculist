#!/bin/sh
set -e

# Function to initialize data file if it doesn't exist
init_data_file() {
  DATA_DIR="/app/data"
  DATA_FILE="$DATA_DIR/items.json"

  echo "Checking data directory and file..."

  # Create data directory if it doesn't exist (as current user)
  if [ ! -d "$DATA_DIR" ]; then
    echo "Creating data directory..."
    mkdir -p "$DATA_DIR" || echo "Could not create data directory, it may be mounted"
  fi

  # Create items.json with default data if it doesn't exist
  if [ ! -f "$DATA_FILE" ]; then
    echo "Creating default items.json file..."
    cat > "$DATA_FILE" << 'EOF' || echo "Could not create items.json, check permissions"
{
  "bestSellers": [
    {
      "id": "bs1",
      "name": "Classic Aviator",
      "price": 129,
      "description": "Timeless style for every occasion",
      "image": "👓",
      "category": "best-seller"
    },
    {
      "id": "bs2",
      "name": "Modern Wayfarer",
      "price": 149,
      "description": "Contemporary design meets comfort",
      "image": "👓",
      "category": "best-seller"
    },
    {
      "id": "bs3",
      "name": "Round Vintage",
      "price": 139,
      "description": "Retro elegance for the discerning eye",
      "image": "👓",
      "category": "best-seller"
    }
  ],
  "saleItems": [
    {
      "id": "sale1",
      "name": "Summer Shades",
      "price": 99,
      "originalPrice": 159,
      "discount": 38,
      "description": "Perfect for sunny days",
      "image": "🕶️",
      "category": "sale"
    },
    {
      "id": "sale2",
      "name": "Designer Collection",
      "price": 149,
      "originalPrice": 249,
      "discount": 40,
      "description": "Luxury meets affordability",
      "image": "🕶️",
      "category": "sale"
    }
  ]
}
EOF
    echo "Default items.json created successfully"
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

  echo "Data initialization complete!"
}

# Initialize data file
init_data_file

# Execute the main command
echo "Starting application..."
exec "$@"
