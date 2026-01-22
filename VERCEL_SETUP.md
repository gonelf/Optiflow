# Vercel Deployment Setup

## Required Environment Variables

To deploy OptiFlow on Vercel, you **MUST** add these environment variables in your Vercel project settings:

### 1. Go to Vercel Project Settings

1. Open your Vercel dashboard
2. Select your OptiFlow project
3. Go to **Settings** → **Environment Variables**

### 2. Add Required Variables

#### Database (Required)
```env
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

DIRECT_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

Get these from your Supabase project:
- Go to **Project Settings** → **Database** → **Connection string**
- Use **Transaction mode** for `DATABASE_URL` (port 6543)
- Use **Session mode** for `DIRECT_URL` (port 5432)
- Replace `[PASSWORD]` with your actual database password

#### NextAuth (Required)
```env
NEXTAUTH_SECRET=your-generated-secret-key-here

NEXTAUTH_URL=https://your-app.vercel.app
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

Or use an online generator like: https://generate-secret.vercel.app/32

**Set NEXTAUTH_URL** to your actual Vercel deployment URL (e.g., `https://optiflow-seven.vercel.app`)

### 3. Optional OAuth Variables

Only add these if you want to enable Google/GitHub login:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 4. Apply to All Environments

When adding each variable, make sure to select:
- ✅ Production
- ✅ Preview
- ✅ Development

### 5. Redeploy

After adding all variables:
1. Go to **Deployments**
2. Find the latest deployment
3. Click the **...** menu
4. Select **Redeploy**

## Minimum Required Setup

At minimum, you need these 4 variables for the app to work:

```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXTAUTH_SECRET=random-32-char-string
NEXTAUTH_URL=https://your-app.vercel.app
```

## Testing the Deployment

Once deployed, test these endpoints:

1. **Health Check**: `https://your-app.vercel.app/api/health`
   - Should return: `{"status":"ok",...}`

2. **Debug Info**: `https://your-app.vercel.app/api/debug`
   - Shows which environment variables are set
   - **Remove this endpoint in production!**

3. **Homepage**: `https://your-app.vercel.app/`
   - Should show the OptiFlow landing page

## Troubleshooting

### Still Getting 404?

Check the deployment logs:
1. Go to **Deployments**
2. Click on the latest deployment
3. Click **View Function Logs**
4. Look for errors

Common issues:
- ✗ Missing `NEXTAUTH_SECRET` → Auth won't work
- ✗ Wrong `DATABASE_URL` format → Prisma client generation fails
- ✗ Database not accessible → Connection errors

### Build Failing?

Check the build logs:
1. Go to **Deployments**
2. Click on the failed deployment
3. Click **View Build Logs**
4. Look for `prisma generate` errors

Common fixes:
- Ensure `DATABASE_URL` is set (required for Prisma)
- Check database connection string format
- Verify database password is correct

### Database Not Connected?

1. Test your connection string locally:
   ```bash
   DATABASE_URL="your-connection-string" npx prisma db push
   ```

2. Check Supabase:
   - Project is not paused
   - Password is correct
   - Connection pooling is enabled

## Next Steps

After successful deployment:

1. **Run Migrations**:
   ```bash
   # Using Vercel CLI
   vercel env pull .env
   npx prisma migrate deploy
   ```

2. **Create First User**:
   - Visit `/signup`
   - Create an account
   - Start building!

3. **Remove Debug Endpoint**:
   - Delete `src/app/api/debug/route.ts` before going to production
