# Reoptimize Troubleshooting Guide

## Common Issues and Solutions

### 🔴 Getting 404 Errors

#### Symptoms
- Homepage returns 404
- All routes return 404
- "Page Not Found" error

#### Causes & Solutions

**1. Missing Environment Variables**

Check that ALL required environment variables are set in Vercel:

```bash
# Check using the debug endpoint
curl https://your-app.vercel.app/api/debug
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct PostgreSQL connection
- `NEXTAUTH_SECRET` - Random 32-character string
- `NEXTAUTH_URL` - Your Vercel deployment URL

**Fix:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all required variables (see VERCEL_SETUP.md)
3. Redeploy the application

**2. Build Failed**

Check Vercel build logs:
1. Go to Deployments → Click latest deployment
2. Click "View Build Logs"
3. Look for errors in `prisma generate` or `next build`

**Common build errors:**
- `Prisma Client could not locate the Query Engine` → DATABASE_URL not set
- `Error: @prisma/client did not initialize yet` → Run `npm run postinstall`
- TypeScript errors → Run `npm run type-check` locally

**3. Routing Issues**

Verify `vercel.json` exists in your project root:

```json
{
  "framework": "nextjs",
  "buildCommand": "prisma generate && next build"
}
```

**4. Middleware Blocking Requests**

Check middleware logs in Vercel Function Logs:
1. Go to Deployments → Click deployment → View Function Logs
2. Look for middleware errors

If you see authentication errors:
- Verify `NEXTAUTH_SECRET` is set
- Check that `NEXTAUTH_URL` matches your deployment URL
- Ensure database is accessible

---

### 📝 No Logs Appearing

#### Symptoms
- No logs in Vercel Function Logs
- Can't debug issues
- Silent failures

#### Solutions

**1. Check Vercel Function Logs Location**

Logs are in a specific place:
1. Vercel Dashboard → Your Project → Deployments
2. Click on a specific deployment
3. Click **"View Function Logs"** (NOT "Build Logs")
4. Filter by time range

**2. Verify Logging is Working**

Test the debug endpoint:
```bash
curl https://your-app.vercel.app/api/debug
```

Expected response:
```json
{
  "status": "ok",
  "environment": {
    "hasDatabase": true,
    "hasNextAuthSecret": true,
    ...
  },
  "logging": {
    "enabled": true,
    "level": "info"
  }
}
```

**3. Enable Real-Time Logs**

Using Vercel CLI:
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Stream logs in real-time
vercel logs your-project-name --follow
```

**4. Check Application Startup**

Look for these logs when the app starts:
```
🚀 Reoptimize Application Starting
Environment variables check
✅ Database connection successful
✅ Reoptimize Application Started Successfully
```

If you don't see these, the instrumentation hook may not be working:
- Check that `instrumentation.ts` exists in `src/`
- Verify `next.config.js` has `instrumentationHook: true`

**5. Test Local Logging**

Run locally to verify logging works:
```bash
npm run dev

# In another terminal, test endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/debug
curl http://localhost:3000/
```

You should see colored logs with emojis in development:
```
ℹ️ [INFO] 2026-01-22T15:25:00.000Z - GET /api/health
ℹ️ [INFO] 2026-01-22T15:25:00.000Z - GET /api/health - 200
```

**6. Production Log Format**

In production (Vercel), logs are JSON format:
```json
{
  "timestamp": "2026-01-22T15:25:00.000Z",
  "level": "INFO",
  "message": "GET /api/health - 200",
  "status": 200,
  "duration": "15ms"
}
```

---

### 🔑 Authentication Errors

#### Symptoms
- Can't log in
- Redirected to login page in loop
- "NextAuth configuration error"

#### Solutions

**1. Check NEXTAUTH_SECRET**

Generate a new secret:
```bash
openssl rand -base64 32
```

Or use: https://generate-secret.vercel.app/32

Add to Vercel environment variables.

**2. Verify NEXTAUTH_URL**

Must match your deployment URL EXACTLY:
```
# Wrong
NEXTAUTH_URL=http://localhost:3000

# Correct (for production)
NEXTAUTH_URL=https://your-app.vercel.app
```

**3. Check Database Connection**

Test from local machine:
```bash
DATABASE_URL="your-connection-string" npx prisma db push
```

If this fails, your database is not accessible.

**4. Review Auth Logs**

Look for these in Function Logs:
```
Auth middleware error
Unauthorized access attempt
Auth successful for user: user@example.com
```

---

### 💾 Database Connection Errors

#### Symptoms
- "PrismaClient initialization error"
- "Can't reach database server"
- "Connection timeout"

#### Solutions

**1. Verify Connection Strings**

Test both URLs:
```bash
# Test pooled connection (DATABASE_URL)
psql "postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Test direct connection (DIRECT_URL)
psql "postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

**2. Check Supabase Project**

- Project is not paused (free tier pauses after 7 days inactivity)
- Password is correct
- Connection pooling is enabled
- Database accepts connections from Vercel IPs

**3. Regenerate Prisma Client**

```bash
npx prisma generate
npx prisma db push
npm run build
```

---

### 🚀 Vercel Deployment Checklist

Before asking "why isn't it working", check:

- [ ] All environment variables set (DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET, NEXTAUTH_URL)
- [ ] Variables applied to all environments (Production, Preview, Development)
- [ ] Latest deployment succeeded (green checkmark)
- [ ] Build logs show no errors
- [ ] `prisma generate` ran successfully
- [ ] Database is accessible from Vercel
- [ ] `/api/health` returns 200 OK
- [ ] `/api/debug` shows all env vars are set
- [ ] Function logs show application startup logs

---

### 📊 Monitoring and Debugging

#### Enable Enhanced Logging

Add to Vercel environment variables:
```
LOG_LEVEL=debug
```

This enables verbose logging for debugging.

#### View All Logs

```bash
# Real-time logs
vercel logs --follow

# Last 100 logs
vercel logs --limit 100

# Filter by function
vercel logs --filter=GET

# Show only errors
vercel logs --filter=error
```

#### Request Tracking

Every request gets a unique ID in headers:
```
x-request-id: 550e8400-e29b-41d4-a716-446655440000
```

Use this to trace requests across logs.

#### Common Log Messages

**Good (Working):**
```
✅ Database connection successful
✅ Reoptimize Application Started Successfully
Auth successful for user: user@example.com
GET / - 200
```

**Bad (Errors):**
```
❌ DATABASE_URL is not set
❌ Database connection failed
Auth middleware error
GET / - 404
GET /api/workspaces - 500
```

---

## Still Having Issues?

### 1. Check Recent Changes

```bash
git log --oneline -10
git diff HEAD~1
```

### 2. Compare with Working Version

```bash
# Find last working commit
git log --all --oneline

# Checkout working version
git checkout <commit-hash>
```

### 3. Fresh Deploy

```bash
# Pull latest
git pull origin main

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma
npx prisma generate

# Test locally
npm run build
npm start
```

### 4. Contact Support

If nothing works, open an issue with:
- [ ] URL of deployment
- [ ] Output of `/api/debug`
- [ ] Build logs (last 50 lines)
- [ ] Function logs (last 50 lines)
- [ ] Environment variable names (NOT values!)
- [ ] What you've already tried

---

## Quick Test Script

Run this to verify everything:

```bash
#!/bin/bash

echo "Testing Reoptimize Deployment..."

URL="https://your-app.vercel.app"

echo "1. Health Check"
curl -s "$URL/api/health" | jq

echo "2. Debug Info"
curl -s "$URL/api/debug" | jq

echo "3. Homepage"
curl -s -o /dev/null -w "%{http_code}" "$URL/"

echo "Done!"
```

Save as `test-deployment.sh` and run: `chmod +x test-deployment.sh && ./test-deployment.sh`
