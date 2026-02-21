# Vercel Environment Variables Configuration

## Required Environment Variables

Add these to your Vercel project settings:

### 1. API Configuration
```
NEXT_PUBLIC_API_URL=https://iced-latte-backend.onrender.com/api/v1
```

**Important:** Include the `/api/v1` path - this is the full API base URL.

### 2. Server-Side Variables (Optional - for SSR)
```
PROTOCOL=https
HOST=iced-latte-backend.onrender.com
PORT=443
```

## How to Add in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add `NEXT_PUBLIC_API_URL` with value: `https://iced-latte-backend.onrender.com/api/v1`
4. Click **Save**
5. **Redeploy** your application

## Backend CORS Configuration (Render)

On your Render backend dashboard:

1. Go to **Environment** tab
2. Add/Update these variables:

```
ALLOWED_ORIGINS=https://iced-latte-frontend.vercel.app,https://iced-latte-frontend-*.vercel.app
```

**Note:** The wildcard pattern allows preview deployments to work.

## Testing

After deployment:
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Visit your Vercel site
4. Check API calls to `/api/proxy/*`
5. Verify they return data (not 404 or CORS errors)

## Common Issues

### 404 Not Found
- Missing `/api/v1` in `NEXT_PUBLIC_API_URL`
- Solution: Add the full path

### CORS Error
- Backend hasn't whitelisted Vercel domain
- Solution: Update `ALLOWED_ORIGINS` on Render

### 504 Timeout (First Load)
- Render free tier "cold start" (30-60 seconds)
- Solution: Wait and refresh - this is normal

### Connection Refused
- Backend is sleeping or URL is wrong
- Solution: Check Render backend is running
