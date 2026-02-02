# Scripts

This directory contains deployment and maintenance scripts for Optiflow.

## Available Scripts

### migrate.sh

Database migration script with safety checks and colored output.

**Usage**:
```bash
bash scripts/migrate.sh
```

**What it does**:
1. Validates DATABASE_URL environment variable is set
2. Runs `prisma migrate deploy` to apply pending migrations
3. Generates Prisma Client
4. Provides clear success/error messages

**Environment Variables Required**:
- `DATABASE_URL` - Database connection string

**Use Cases**:
- Manual production deployments
- CI/CD pipelines (non-Vercel)
- Emergency database updates
- Testing migration process

**Notes**:
- This script is used by `npm run deploy:migrate`
- Vercel uses `npm run vercel-build` which runs migrations directly
- Script exits with error code on failure for CI/CD integration
