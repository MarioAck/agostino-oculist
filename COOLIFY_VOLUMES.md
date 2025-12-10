# Coolify Volume Permissions Fix

## Problem

When deploying to Coolify with Docker volumes, the mounted `/app/data` directory may be owned by `root:root` (uid 0), but the Next.js application runs as the `nextjs` user (uid 1001). This causes permission errors when trying to read or write `items.json`.

Error you'll see:
```
ENOENT: no such file or directory, open '/app/data/items.json'
```

## Solution Options

### Option 1: Fix Permissions in Coolify (Recommended)

After deploying to Coolify, run this command in the container terminal:

```bash
# Connect to the container
docker exec -it -u root <container-name> sh

# Fix permissions
chown -R 1001:1001 /app/data
chmod -R 755 /app/data

# Exit
exit
```

### Option 2: Pre-create the Volume Directory

Before deploying, create the data directory on the host with correct permissions:

```bash
# On the Coolify host machine
mkdir -p /path/to/your/data
chown -R 1001:1001 /path/to/your/data
chmod -R 755 /path/to/your/data
```

### Option 3: Use Docker Compose Override

In Coolify, you can set the volume mount options:

```yaml
volumes:
  - ./data:/app/data:rw
  - ./public/uploads:/app/public/uploads:rw

# Add this to ensure proper ownership
user: "1001:1001"  # Run container as nextjs user
```

## Verification

After applying the fix, check the logs:

```bash
docker logs <container-name>
```

You should see:
```
=== Starting initialization ===
Current user: nextjs
Current user ID: 1001
✓ items.json already exists
```

And the admin page should load items correctly.

## Persistent Fix

To make this permanent, add an init container or modify the Dockerfile to handle this automatically. The current implementation attempts to create the file in the entrypoint script, which will work if permissions are correct.
