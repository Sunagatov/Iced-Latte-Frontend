# Connection Debugging Guide

## Quick Diagnosis

Open your Vercel site and press **F12** (DevTools), then check:

### 1. Console Tab
Look for errors:

**CORS Error:**
```
Access to fetch at 'https://iced-latte-backend.onrender.com/api/v1/products' 
from origin 'https://iced-latte-frontend.vercel.app' has been blocked by CORS policy
```
**Fix:** Add Vercel domain to `ALLOWED_ORIGINS` on Render backend

**404 Not Found:**
```
GET https://iced-latte-backend.onrender.com/products 404
```
**Fix:** Missing `/api/v1` in `NEXT_PUBLIC_API_URL`

### 2. Network Tab
Filter by "proxy" and check:

**Status 200:** ✅ Working
**Status 404:** ❌ Wrong API URL
**Status 504:** ⏳ Backend cold start (wait 60s)
**Status 0 (CORS):** ❌ CORS not configured

### 3. Test Backend Directly

Open a new tab and visit:
```
https://iced-latte-backend.onrender.com/api/v1/products
```

**If this works:** Frontend config issue
**If this fails:** Backend is down or URL is wrong

## SQL Query to Check Products

Run this in your Supabase SQL Editor:

```sql
SELECT 
  id, 
  name, 
  price, 
  created_at 
FROM products 
LIMIT 5;
```

**If empty:** No products in database
**If has data:** Backend should return them

## Environment Variable Checklist

### Vercel (Frontend)
- [ ] `NEXT_PUBLIC_API_URL` = `https://iced-latte-backend.onrender.com/api/v1`
- [ ] Redeployed after adding variable

### Render (Backend)
- [ ] `ALLOWED_ORIGINS` includes `https://iced-latte-frontend.vercel.app`
- [ ] Backend service is running (not sleeping)
- [ ] Database connection is configured

## Test API Endpoint

Create this file to test: `src/app/api/test/route.ts`

```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  
  try {
    const response = await fetch(`${apiUrl}/products?page=0&size=1`)
    const data = await response.json()
    
    return NextResponse.json({
      status: 'success',
      apiUrl,
      backendResponse: data,
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      apiUrl,
      error: String(error),
    }, { status: 500 })
  }
}
```

Visit: `https://your-site.vercel.app/api/test`

This will show exactly what's happening with the backend connection.
