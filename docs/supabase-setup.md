# Supabase Setup Guide

This guide will help you set up Supabase as the database for Reoptimize.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **New Project**
4. Fill in the project details:
   - **Name**: reoptimize (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the region closest to your users
   - **Pricing Plan**: Free tier is fine to start
5. Click **Create new project**
6. Wait 2-3 minutes for the database to be provisioned

## 2. Get Your Connection Strings

Once your project is ready:

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **Database** in the left menu
3. Scroll down to **Connection string**
4. You'll see two types of connections:

### Session Mode (Direct Connection) - Use for DIRECT_URL
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

### Transaction Mode (Connection Pooling) - Use for DATABASE_URL
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Important**: Replace `[YOUR-PASSWORD]` with your actual database password!

## 3. Configure Environment Variables

### For Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the connection strings in `.env`:
   ```env
   # Transaction mode (pooled) - for app queries
   DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

   # Session mode (direct) - for migrations
   DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
   ```

3. Generate a NextAuth secret:
   ```bash
   openssl rand -base64 32
   ```
   Add it to `.env`:
   ```env
   NEXTAUTH_SECRET="your-generated-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

### For Vercel Production

1. Go to your Vercel project
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:

```env
# Database
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres

# Auth
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=https://your-app.vercel.app

# Optional OAuth providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

## 4. Run Database Migrations

### Option A: Using Prisma CLI (Recommended)

```bash
# Generate Prisma Client
npm install
npx prisma generate

# Create initial migration
npx prisma migrate dev --name init

# Or deploy to production
npx prisma migrate deploy
```

### Option B: Using Supabase SQL Editor

If you prefer to run SQL directly:

1. Generate the SQL:
   ```bash
   npx prisma migrate diff \
     --from-empty \
     --to-schema-datamodel prisma/schema.prisma \
     --script > migration.sql
   ```

2. Go to **SQL Editor** in your Supabase dashboard
3. Copy and paste the contents of `migration.sql`
4. Click **Run**

## 5. Verify Setup

### Check Database Tables

1. In Supabase dashboard, go to **Table Editor**
2. You should see all tables created:
   - User
   - Workspace
   - WorkspaceMember
   - Page
   - Component
   - Template
   - ABTest
   - PageVariant
   - AnalyticsSession
   - AnalyticsEvent
   - And more...

### Test Connection Locally

```bash
# Start development server
npm run dev

# In another terminal, test Prisma
npx prisma studio
```

Prisma Studio should open at `http://localhost:5555` showing your database tables.

## 6. Additional Supabase Features (Optional)

### Row Level Security (RLS)

Supabase has built-in RLS. While Reoptimize handles auth with NextAuth, you can add an extra security layer:

```sql
-- Enable RLS on sensitive tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Workspace" ENABLE ROW LEVEL SECURITY;

-- Create policies (example)
CREATE POLICY "Users can view their own data"
  ON "User"
  FOR SELECT
  USING (auth.uid() = id);
```

### Supabase Storage (for images/files)

If you want to use Supabase Storage for page images:

1. Go to **Storage** in Supabase dashboard
2. Create a bucket: `reoptimize-assets`
3. Set it to **Public** (or configure policies)
4. Use Supabase Storage SDK in your app

### Supabase Realtime (for live updates)

Enable realtime for collaborative editing:

1. Go to **Database** → **Replication**
2. Enable replication for tables you want to sync
3. Use Supabase Realtime client in your app

## Troubleshooting

### Connection Issues

**Error: `P1001: Can't reach database server`**
- Check your connection strings are correct
- Verify your IP is not blocked (Supabase allows all IPs by default)
- Check if your database password is correct

**Error: `P1017: Server has closed the connection`**
- Use `DATABASE_URL` with connection pooling (port 6543)
- Add `&connection_limit=1` to your connection string

### Migration Issues

**Error: `Migration failed to apply`**
- Make sure you're using `DIRECT_URL` for migrations
- Check if the migration has already been applied
- View migration status: `npx prisma migrate status`

**Reset Database (Development Only)**
```bash
npx prisma migrate reset
```
⚠️ This will delete all data!

## Next Steps

Once your database is set up:

1. ✅ Create your first user by signing up
2. ✅ Create a workspace
3. ✅ Start building pages!

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma + Supabase Guide](https://www.prisma.io/docs/guides/database/supabase)
- [NextAuth.js Documentation](https://next-auth.js.org/)
