#!/bin/bash
set -e

echo "🔍 Starting database migration process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}❌ Error: DATABASE_URL environment variable is not set${NC}"
  exit 1
fi

echo "✅ Database URL configured"

# Run Prisma migrations
echo "📦 Running Prisma migrations..."
if npx prisma migrate deploy; then
  echo -e "${GREEN}✅ Migrations completed successfully${NC}"
else
  echo -e "${RED}❌ Migration failed${NC}"
  exit 1
fi

# Generate Prisma Client (in case schema changed)
echo "🔧 Generating Prisma Client..."
if npx prisma generate; then
  echo -e "${GREEN}✅ Prisma Client generated${NC}"
else
  echo -e "${YELLOW}⚠️  Warning: Prisma Client generation failed${NC}"
fi

echo -e "${GREEN}🎉 Database migration process completed successfully${NC}"
