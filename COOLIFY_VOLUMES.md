# Coolify Storage Configuration

## Current Setup (No Persistence)

By default, the application stores data **inside the container** without volume mounts. This means:

✅ **Pros:**
- No permission issues
- Works out of the box on Coolify
- Simpler deployment

❌ **Cons:**
- **Data is lost** when container restarts or rebuilds
- Uploaded images are lost on restart
- Items added via admin panel are lost on restart

## When to Use This

Use the default (no volumes) setup if:
- You're testing or developing
- You rebuild your data from an external source
- You don't need persistence between deployments

---

## Enabling Persistence (Advanced)

If you need data to persist across container restarts:

### Problem with Volumes

When deploying to Coolify with Docker volumes, the mounted `/app/data` directory may be owned by `root:root` (uid 0), but the Next.js application runs as the `nextjs` user (uid 1001). This causes permission errors.

Error you'll see:
```
cp: can't create '/app/data/items.json': Permission denied
```

## Solution to Enable Persistence

### Step 1: Enable Volumes in docker-compose.yml

Uncomment the volume lines in `docker-compose.yml`:

```yaml
volumes:
  - ./data:/app/data
  - ./public/uploads:/app/public/uploads
```

Commit and push the changes.

### Step 2: Fix Permissions in Coolify

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

### Alternative: Pre-create the Volume Directory

Before deploying, create the data directory on the host with correct permissions:

```bash
# On the Coolify host machine
mkdir -p /path/to/your/data
chown -R 1001:1001 /path/to/your/data
chmod -R 755 /path/to/your/data
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
