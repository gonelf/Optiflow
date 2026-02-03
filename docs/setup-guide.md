# Reoptimize Setup Guide

Complete setup instructions for getting Reoptimize running locally and deploying to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Initialization](#project-initialization)
3. [Environment Configuration](#environment-configuration)
4. [Supabase Setup](#supabase-setup)
5. [Prisma Setup](#prisma-setup)
6. [NextAuth Configuration](#nextauth-configuration)
7. [Tailwind Configuration](#tailwind-configuration)
8. [Middleware Setup](#middleware-setup)
9. [Folder Structure](#folder-structure)
10. [Development Commands](#development-commands)
11. [Testing Setup](#testing-setup)
12. [Deployment](#deployment)

---

## Prerequisites

Ensure you have the following installed:

```bash
Node.js 18.17+ or 20+
pnpm 8+ (recommended) or npm
PostgreSQL 14+ (via Supabase)
Git
```

Verify installations:
```bash
node --version
pnpm --version
git --version
```

---

## Project Initialization

### Step 1: Create Next.js Project

```bash
# Create Next.js 14 project with TypeScript, Tailwind, App Router
npx create-next-app@latest reoptimize \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd reoptimize
```

### Step 2: Install Dependencies

```bash
# Core Dependencies
pnpm add @prisma/client next-auth @auth/prisma-adapter
pnpm add zustand jotai
pnpm add @tanstack/react-query
pnpm add zod react-hook-form @hookform/resolvers
pnpm add date-fns clsx tailwind-merge
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select
pnpm add @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-tooltip
pnpm add @radix-ui/react-slot @radix-ui/react-popover
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
pnpm add recharts react-heatmap-grid
pnpm add stripe @stripe/stripe-js
pnpm add openai
pnpm add resend
pnpm add posthog-js

# UI Utilities
pnpm add class-variance-authority
pnpm add lucide-react

# Dev Dependencies
pnpm add -D prisma
pnpm add -D @types/node @types/react @types/react-dom
pnpm add -D eslint eslint-config-next
pnpm add -D prettier prettier-plugin-tailwindcss
pnpm add -D @playwright/test
pnpm add -D jest @testing-library/react @testing-library/jest-dom
pnpm add -D @testing-library/user-event
pnpm add -D tsx
```

---

## Environment Configuration

### Step 3: Create Environment Files

Create `.env.local` in project root:

```bash
# Database (Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres?schema=public"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here-generate-with-openssl"

# OAuth Providers (optional for MVP)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# OpenAI
OPENAI_API_KEY="sk-your-openai-key"

# Stripe
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"

# Email (Resend)
RESEND_API_KEY="re_your-resend-api-key"
EMAIL_FROM="noreply@reoptimize.com"

# Analytics (Optional)
POSTHOG_API_KEY="phc_your-posthog-key"
POSTHOG_HOST="https://app.posthog.com"

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Reoptimize"

# Feature Flags
ENABLE_AI_FEATURES="true"
ENABLE_INTEGRATIONS="true"
```

### Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy output to `NEXTAUTH_SECRET` in `.env.local`.

### Create `.env.example`

```bash
cp .env.local .env.example
# Remove actual values, keep keys only
```

---

## Supabase Setup

### Step 4: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Enter project details:
   - **Name**: reoptimize
   - **Database Password**: Generate strong password
   - **Region**: Choose closest to users
   - **Pricing Plan**: Free (for development)

### Step 5: Get Connection Strings

1. Navigate to **Settings → Database**
2. Copy **Connection Pooling** connection string
3. Update `DATABASE_URL` and `DIRECT_URL` in `.env.local`

Example:
```
DATABASE_URL="postgresql://postgres.xxxx:password@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
```

### Step 6: Enable Row Level Security

In Supabase SQL Editor, run:

```sql
-- Enable RLS on all tables (run after migrations)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Workspace" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkspaceMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Page" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Component" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ABTest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PageVariant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AnalyticsSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AnalyticsEvent" ENABLE ROW LEVEL SECURITY;

-- Example policy: Users can only view their own workspaces
CREATE POLICY "Users view own workspaces"
  ON "Workspace"
  FOR SELECT
  USING (
    id IN (
      SELECT "workspaceId"
      FROM "WorkspaceMember"
      WHERE "userId" = auth.uid()
    )
  );

-- Add more policies as needed for each table
```

---

## Prisma Setup

### Step 7: Initialize Prisma

```bash
# Copy schema.prisma from repository (already created)
# Located at: prisma/schema.prisma

# Generate Prisma Client
pnpm prisma generate

# Create initial migration
pnpm prisma migrate dev --name init
```

### Step 8: Create Seed File

Create `prisma/seed.ts`:

```typescript
import { PrismaClient, TemplateCategory } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create default templates
  const templates = [
    {
      name: 'SaaS Hero Section',
      description: 'Modern hero with gradient background and CTA',
      category: TemplateCategory.HERO,
      thumbnail: '/templates/saas-hero.png',
      isPremium: false,
      structure: {
        components: [
          {
            type: 'HERO',
            name: 'Hero Section',
            order: 0,
            config: {
              layout: 'centered',
              background: 'gradient',
            },
            styles: {
              container: 'py-20 px-4',
              background: 'bg-gradient-to-br from-purple-600 to-blue-500',
            },
            content: {
              headline: 'Build & Test Landing Pages 10x Faster',
              subheadline: 'No-code builder with built-in A/B testing and analytics',
              ctaPrimary: 'Get Started Free',
              ctaSecondary: 'View Demo',
            },
          },
        ],
      },
    },
    {
      name: 'Pricing Page - SaaS',
      description: '3-tier pricing with feature comparison',
      category: TemplateCategory.PRICING,
      thumbnail: '/templates/pricing-saas.png',
      isPremium: false,
      structure: {
        components: [
          {
            type: 'PRICING',
            name: 'Pricing Table',
            order: 0,
            config: {
              tiers: 3,
              billingToggle: true,
            },
            content: {
              plans: [
                { name: 'Starter', price: 29, features: ['5 Pages', '1,000 visitors/mo', 'Email support'] },
                { name: 'Pro', price: 99, features: ['Unlimited Pages', '50,000 visitors/mo', 'Priority support', 'AI Features'] },
                { name: 'Enterprise', price: 'Custom', features: ['Everything in Pro', 'Custom integrations', 'SLA', 'Dedicated CSM'] },
              ],
            },
          },
        ],
      },
    },
    {
      name: 'Landing Page - Waitlist',
      description: 'Coming soon page with email capture',
      category: TemplateCategory.WAITLIST,
      thumbnail: '/templates/waitlist.png',
      isPremium: false,
      structure: {
        components: [
          {
            type: 'HERO',
            name: 'Hero',
            order: 0,
            content: {
              headline: 'Something Amazing is Coming',
              subheadline: 'Join the waitlist to get early access',
            },
          },
          {
            type: 'FORM',
            name: 'Email Capture',
            order: 1,
            config: {
              fields: ['email'],
              submitText: 'Join Waitlist',
            },
          },
        ],
      },
    },
  ]

  for (const template of templates) {
    await prisma.template.upsert({
      where: { name: template.name },
      update: template,
      create: template,
    })
  }

  console.log('✅ Templates seeded')
  console.log('✅ Database seeding complete')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### Step 9: Add Seed Script to package.json

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

### Step 10: Run Seed

```bash
pnpm prisma db seed
```

---

## NextAuth Configuration

### Step 11: Create Auth Config

Create `src/lib/auth.ts`:

```typescript
import { PrismaAdapter } from "@auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import EmailProvider from "next-auth/providers/email"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/login",
    verifyRequest: "/verify-email",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.picture
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      return token
    },
  },
}
```

### Step 12: Create Prisma Client Singleton

Create `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Step 13: Create NextAuth API Route

Create `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

---

## Tailwind Configuration

### Step 14: Update tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

### Step 15: Add CSS Variables

Update `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

## Middleware Setup

### Step 16: Create Edge Middleware

Create `src/middleware.ts`:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Only handle published page routes
  if (!pathname.startsWith('/p/')) {
    return NextResponse.next()
  }

  // Check if user has A/B test variant cookie
  const variantCookie = request.cookies.get('ab_variant')

  if (!variantCookie) {
    // Simple variant assignment (50/50 split for now)
    // In production, fetch test config from edge-compatible store
    const variant = Math.random() < 0.5 ? 'control' : 'variant_a'

    const response = NextResponse.next()
    response.cookies.set('ab_variant', variant, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    // Add variant to response headers for SSR
    response.headers.set('x-ab-variant', variant)

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/p/:path*'],
}
```

---

## Folder Structure

Complete folder structure (created incrementally during development):

```
reoptimize/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
│   ├── fonts/
│   ├── images/
│   └── templates/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   └── [workspaceSlug]/
│   │   │       ├── pages/
│   │   │       ├── analytics/
│   │   │       ├── ab-tests/
│   │   │       └── settings/
│   │   ├── (marketing)/
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── pages/
│   │   │   ├── analytics/
│   │   │   └── ai/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── builder/
│   │   ├── analytics/
│   │   ├── ab-testing/
│   │   └── ui/
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   ├── services/
│   ├── hooks/
│   ├── store/
│   ├── types/
│   └── middleware.ts
├── docs/
│   ├── architecture.md
│   ├── setup-guide.md
│   └── development-roadmap.md
├── .env.local
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Development Commands

Add scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

### Start Development

```bash
# Terminal 1: Start Next.js dev server
pnpm dev

# Terminal 2: Open Prisma Studio (database GUI)
pnpm db:studio
```

Access:
- App: http://localhost:3000
- Prisma Studio: http://localhost:5555

---

## Testing Setup

### Step 17: Playwright E2E Tests

```bash
pnpm playwright install
```

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## Deployment

### Step 18: Deploy to Vercel

```bash
# Install Vercel CLI
pnpm add -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

### Environment Variables in Vercel

1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add all variables from `.env.local`
3. Update `NEXTAUTH_URL` to production URL
4. Update `NEXT_PUBLIC_APP_URL` to production URL

### Production Database

1. Upgrade Supabase to paid plan (if needed)
2. Update connection strings in Vercel
3. Run migrations:

```bash
vercel env pull .env.production.local
pnpm prisma migrate deploy
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Test database connection
pnpm prisma db execute --stdin <<< "SELECT 1"
```

### Prisma Client Issues

```bash
# Regenerate Prisma Client
pnpm prisma generate
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next
pnpm build
```

---

## Next Steps

1. Follow `docs/development-roadmap.md` for feature implementation
2. Review `docs/architecture.md` for system design
3. Start with Phase 1: Authentication & Workspaces

---

**Happy Building!** 🚀
