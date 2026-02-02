# Deployment Guide

This guide explains how deployments work in Optiflow and how database migrations are automatically handled.

## 🚨 IMPORTANT: First Time Setup

If you're setting this up for the first time or if your production database is missing the `passwordHash` column:

1. **Create the initial migration locally**:
   ```bash
   # Ensure your .env has DATABASE_URL set to your development database
   npm run db:migrate
   ```

   This will create a migration in `prisma/migrations/` directory.

2. **Commit the migration**:
   ```bash
   git add prisma/migrations/
   git commit -m "Add initial migration for passwordHash"
   ```

3. **Push to production**:
   ```bash
   git push origin main
   ```

4. **Automatic deployment**: The migration will now automatically apply in production!

**Note**: If your production database already has data but is missing the `passwordHash` column, you may need to manually apply the migration first:

```bash
# Connect to production database
export DATABASE_URL="your_production_database_url"
npx prisma migrate deploy
```

## Automated Migration Process

Database migrations are now **automatically applied** during every production deployment. You no longer need to manually run migrations!

### How It Works

1. **Vercel Deployment Flow**:
   ```
   git push → Vercel detects changes → Runs vercel-build script → Migrations applied → Build succeeds → Deploy
   ```

2. **The vercel-build Script**:
   ```bash
   prisma migrate deploy && prisma generate && next build
   ```

   This ensures migrations run **before** the build, preventing 401/500 errors from missing database columns.

### New NPM Scripts

#### Production Deployment
- `npm run vercel-build` - Used by Vercel automatically (migrates → generates → builds)
- `npm run db:migrate:deploy` - Apply migrations without building (for manual production use)
- `npm run deploy:migrate` - Run the migration script with safety checks

#### Development
- `npm run db:migrate` - Create and apply new migrations locally
- `npm run dev` - Start development server

## Deployment Platforms

### Vercel (Current Setup)

Migrations are automatically applied via the `vercel-build` command configured in `vercel.json`.

**Environment Variables Required**:
- `DATABASE_URL` - Your production database connection string
- `NEXTAUTH_URL` - Your production URL (e.g., https://optiflow.com)
- `NEXTAUTH_SECRET` - Secret for NextAuth.js JWT encryption
- `GOOGLE_CLIENT_ID` - Google OAuth credentials
- `GOOGLE_CLIENT_SECRET` - Google OAuth credentials
- `GITHUB_ID` - GitHub OAuth credentials
- `GITHUB_SECRET` - GitHub OAuth credentials
- `RESEND_API_KEY` - Email service API key

### Other Platforms

If deploying to other platforms (Docker, AWS, etc.), ensure your build command includes:

```bash
npm run vercel-build
```

Or run migrations separately:

```bash
npm run db:migrate:deploy && npm run build
```

## Creating New Migrations

When you modify the Prisma schema (`prisma/schema.prisma`):

1. **Create migration locally**:
   ```bash
   npm run db:migrate
   ```

2. **Commit the migration files**:
   ```bash
   git add prisma/migrations/
   git commit -m "Add migration for [feature]"
   ```

3. **Push to production**:
   ```bash
   git push origin main
   ```

4. **Automatic deployment**: Vercel will automatically apply the migration during build

## Troubleshooting

### Migration Fails During Deployment

If a migration fails during deployment:

1. Check Vercel build logs for the specific error
2. Common issues:
   - **Breaking changes**: Adding NOT NULL columns without defaults
   - **Data conflicts**: Unique constraints on existing data
   - **Permissions**: Database user lacks ALTER TABLE permissions

**Solution**: Fix the migration locally, test it, then push again.

### Rollback a Migration

If you need to rollback a failed migration:

1. **Connect to your production database**
2. **Manually revert the migration**:
   ```sql
   -- Example: Remove a column added by migration
   ALTER TABLE "User" DROP COLUMN "newColumn";
   ```
3. **Update `_prisma_migrations` table**:
   ```sql
   DELETE FROM "_prisma_migrations"
   WHERE migration_name = '20260202_migration_name';
   ```
4. **Push fixed code**

### Check Migration Status

View applied migrations:

```bash
npx prisma migrate status
```

## Security Notes

- Migrations run with the credentials from `DATABASE_URL`
- Never commit `.env` files with production credentials
- Use Vercel's environment variables for production secrets
- Migrations are applied before the app builds, ensuring schema consistency

## Best Practices

1. **Test migrations locally first**: Always run `npm run db:migrate` locally before pushing
2. **Keep migrations small**: One logical change per migration
3. **Review generated SQL**: Check `prisma/migrations/*/migration.sql` before committing
4. **Backup before major changes**: Take a database snapshot before breaking changes
5. **Use transactions**: Prisma migrations are transactional by default

## Previous Issue: Why Auth Failed

Before this automation:
- ❌ Code with `passwordHash` field was deployed
- ❌ Database still had old schema without `passwordHash`
- ❌ Login/signup failed with 401/500 errors

Now with automated migrations:
- ✅ Migration runs first, adding `passwordHash` column
- ✅ Build succeeds with correct schema
- ✅ Login/signup works immediately after deployment

## Questions?

If you encounter deployment issues:
1. Check Vercel build logs
2. Verify `DATABASE_URL` is set correctly
3. Ensure the database user has migration permissions
4. Review this guide's troubleshooting section
