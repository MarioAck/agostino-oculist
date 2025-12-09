# Coolify Deployment Guide

This guide will help you deploy the Agostino Oculist application on Coolify.

## Prerequisites

- A Coolify instance (self-hosted or cloud)
- GitHub repository access
- Domain name (optional)

## Deployment Steps

### 1. Create New Application in Coolify

1. Log into your Coolify dashboard
2. Click "Add New Resource" → "Application"
3. Connect your GitHub repository: `https://github.com/MarioAck/agostino-oculist.git`
4. Select the branch: `master`

### 2. Configure Build Settings

**Build Type**: Docker Compose

**Docker Compose File**: Use the provided `docker-compose.yml`

### 3. Configure Environment Variables

Add these environment variables in Coolify:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here
NODE_ENV=production
PORT=3000
```

### 4. Configure Persistent Storage (CRITICAL)

In Coolify, you MUST configure persistent volumes for data and image uploads:

**Volume 1 - Data Directory:**
- **Source**: `/data` (on host or persistent volume)
- **Destination**: `/app/data`
- **Description**: Stores items.json

**Volume 2 - Uploads Directory:**
- **Source**: `/uploads` (on host or persistent volume)
- **Destination**: `/app/public/uploads`
- **Description**: Stores uploaded product images

> ⚠️ **Important**: Without these volumes, your data and uploaded images will be lost on container restarts!

### 5. Port Configuration

- **Container Port**: 3000
- **Published Port**: 80 (or any port you prefer)

### 6. Deploy

Click "Deploy" and wait for the build to complete.

## Troubleshooting

### Issue: Items not displayed / "Failed to save item" error

**Cause**: File permission issues or missing persistent volumes

**Solution**:

#### Option 1: Don't use volumes (simplest, but data won't persist on redeploy)
Remove the volume configurations from Coolify. The app will create and manage its own data internally.

#### Option 2: Use volumes with proper permissions (recommended for production)
1. SSH into your Coolify server
2. Create directories and set permissions:
   ```bash
   # Create directories
   sudo mkdir -p /var/lib/docker/volumes/agostino-data/_data
   sudo mkdir -p /var/lib/docker/volumes/agostino-uploads/_data

   # Set ownership to user 1001 (nextjs user in container)
   sudo chown -R 1001:1001 /var/lib/docker/volumes/agostino-data/_data
   sudo chown -R 1001:1001 /var/lib/docker/volumes/agostino-uploads/_data

   # Set permissions
   sudo chmod -R 755 /var/lib/docker/volumes/agostino-data/_data
   sudo chmod -R 755 /var/lib/docker/volumes/agostino-uploads/_data
   ```

3. In Coolify, configure volumes:
   - **Volume 1**: `/var/lib/docker/volumes/agostino-data/_data` → `/app/data`
   - **Volume 2**: `/var/lib/docker/volumes/agostino-uploads/_data` → `/app/public/uploads`

4. Redeploy the application

5. Check the container logs for the message "✓ Data directory is writable"

### Issue: Images not persisting after restart

**Cause**: Missing volume for `/app/public/uploads`

**Solution**: Add the uploads volume as described in step 4 above

### Issue: Authentication not working

**Cause**: Environment variables not set

**Solution**: Verify `ADMIN_USERNAME` and `ADMIN_PASSWORD` are set in Coolify environment variables

## Viewing Logs

To check application logs in Coolify:
1. Go to your application
2. Click on "Logs" tab
3. Look for errors related to file permissions or data access

## Manual Volume Setup (Alternative)

If Coolify's volume configuration doesn't work, you can manually set up volumes:

1. SSH into your server
2. Create directories:
   ```bash
   mkdir -p /var/coolify/data/agostino-oculist/data
   mkdir -p /var/coolify/data/agostino-oculist/uploads
   chown -R 1001:1001 /var/coolify/data/agostino-oculist
   ```

3. In Coolify, map these directories to the container

## Post-Deployment

1. Access your application at your configured domain
2. Navigate to `/admin/login`
3. Login with your credentials
4. Upload product images and manage items

## Support

If you encounter issues:
1. Check the container logs in Coolify
2. Verify file permissions on the host
3. Ensure volumes are properly mounted
4. Check that environment variables are set correctly
