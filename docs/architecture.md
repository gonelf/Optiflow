# Reoptimize System Architecture

## Overview
Reoptimize is a no-code SaaS marketing site builder with native A/B testing and integrated analytics. Built with Next.js 14, Tailwind CSS, Prisma + PostgreSQL (Supabase), and deployed on Vercel.

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (Browser)                    │
├─────────────────────────────────────────────────────────────────┤
│  Next.js 14 App Router Frontend (RSC + Client Components)       │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │ Builder UI   │ Analytics    │ A/B Test     │ Auth/Settings│ │
│  │ (DnD Editor) │ Dashboard    │ Manager      │ (Workspace)  │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┘ │
│         │                │               │              │        │
│         └────────────────┴───────────────┴──────────────┘        │
│                          │                                       │
│                    tRPC/API Routes                               │
└─────────────────────────┴───────────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────────┐
│                    APPLICATION LAYER (Vercel)                    │
├─────────────────────────────────────────────────────────────────┤
│  Next.js API Routes & Server Actions                            │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │ Page Builder │ A/B Test     │ Analytics    │ AI Service   │ │
│  │ Service      │ Engine       │ Collector    │ Layer        │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┘ │
│         │                │               │              │        │
│  ┌──────┴────────────────┴───────────────┴──────────────┴────┐ │
│  │             Business Logic & Domain Services               │ │
│  │  • Page/Component CRUD    • Variant Management             │ │
│  │  • Traffic Splitter       • Event Tracking                 │ │
│  │  • Conversion Attribution • Statistical Analysis           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼────────┐ ┌──────▼──────┐ ┌────────▼────────┐
│ DATABASE LAYER │ │ CACHE LAYER │ │ EXTERNAL APIS   │
│  (Supabase)    │ │  (Vercel    │ │                 │
│                │ │   Edge)     │ │ • OpenAI        │
│ Postgres DB    │ │             │ │ • Stripe        │
│ via Prisma ORM │ │ • Sessions  │ │ • HubSpot       │
│                │ │ • Hot Data  │ │ • Resend (email)│
│ ┌────────────┐ │ │ • Analytics │ │ • Analytics     │
│ │ Core Tables│ │ └─────────────┘ │   Engines       │
│ │ • Users    │ │                 │   (PostHog)     │
│ │ • Pages    │ │                 └─────────────────┘
│ │ • Variants │ │
│ │ • Events   │ │
│ │ • Sessions │ │
│ └────────────┘ │
│                │
│ Row Level      │
│ Security (RLS) │
└────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    RENDERING LAYER (CDN)                         │
├─────────────────────────────────────────────────────────────────┤
│  Published Sites on Custom Domains                              │
│  ┌──────────────────────────────────────────────────┐           │
│  │  Visitor hits: marketing-site.example.com        │           │
│  │  1. Edge Middleware determines A/B variant       │           │
│  │  2. ISR serves pre-rendered page variant         │           │
│  │  3. Client-side tracker logs events              │           │
│  │  4. Analytics beacon → /api/track                │           │
│  └──────────────────────────────────────────────────┘           │
│  Vercel Edge Network + CDN                                      │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flows

### 1. Builder Flow
User creates page → Saves to DB → Generates components JSON

### 2. A/B Test Flow
Create variants → Traffic splitter assigns → Track conversions

### 3. Analytics Flow
Event → Client beacon → API ingestion → DB → Dashboard

### 4. AI Flow
User prompt → OpenAI API → Component generation → Rendered in builder

### 5. Publish Flow
Page → Build static/ISR → Deploy to edge → Custom domain

## Tech Stack

### Frontend
- **Next.js 14** (App Router, RSC)
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **@dnd-kit** for drag-and-drop builder
- **Zustand/Jotai** for state management
- **React Query** for server state
- **Zod** for validation

### Backend
- **Next.js API Routes** & Server Actions
- **Prisma ORM** for database access
- **PostgreSQL** (Supabase)
- **NextAuth.js** for authentication

### External Services
- **Vercel** for hosting & edge functions
- **Supabase** for PostgreSQL + Auth
- **OpenAI** for AI generation
- **Stripe** for payments
- **Resend** for transactional email
- **PostHog** for product analytics (optional)

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| **Next.js 14 App Router** | RSC for better performance, built-in streaming, better SEO |
| **@dnd-kit** for builder | Lightweight, accessible, works with RSC |
| **Zustand** for state | Simpler than Redux, works well with server components |
| **Prisma** | Type-safe ORM, great DX, migration system |
| **Edge Middleware** | A/B variant routing without server latency |
| **Supabase** | Managed PostgreSQL with RLS, real-time subscriptions |
| **ISR** | Fast page loads for published sites with auto-revalidation |

## Security Architecture

### Authentication & Authorization
- NextAuth.js with session-based JWT
- OAuth providers (Google, GitHub)
- Magic link email authentication
- Role-based access control (OWNER, ADMIN, MEMBER, VIEWER)

### Database Security
- Row Level Security (RLS) policies in Supabase
- Workspace-level data isolation
- API key authentication for headless access

### Input Validation
- Zod schemas on all API routes
- DOMPurify for user-generated HTML
- CSRF protection via NextAuth
- Rate limiting on AI and analytics endpoints

### Data Protection
- Encrypted environment variables
- HTTPS only in production
- Secure cookie settings
- SQL injection prevention via Prisma

## Performance Optimizations

### Frontend
- React Server Components by default
- Streaming with Suspense boundaries
- Next.js Image optimization
- Code splitting per route
- Virtual scrolling for large lists

### Backend
- ISR for published pages (1hr revalidation)
- Edge runtime for analytics endpoints
- Database connection pooling via Prisma
- Denormalized metrics for fast queries
- Background jobs for heavy aggregations

### Caching Strategy
- Edge caching for published pages
- Browser caching for static assets
- SWR for client-side data fetching
- Redis (optional) for session storage

## Scalability Considerations

### Database
- Indexed fields for common queries
- Partitioning for analytics tables (by date)
- Read replicas for analytics dashboards
- Archive old data to cold storage

### Application
- Horizontal scaling via Vercel
- Stateless API design
- Queue system for async jobs (optional: BullMQ + Redis)
- CDN for global distribution

### Analytics
- Event batching on client-side
- Bulk insert for event ingestion
- Background aggregation jobs
- Time-series tables for metrics

## Monitoring & Observability

### Metrics
- Vercel Analytics for web vitals
- Custom metrics via OpenTelemetry
- Database query performance (Prisma Insights)

### Error Tracking
- Sentry for error monitoring
- Structured logging (Pino/Winston)
- Alert triggers for critical failures

### Logging
- Request/response logging
- Audit logs for sensitive operations
- Performance profiling in dev

## Folder Structure

See `docs/setup-guide.md` for complete folder structure.

## API Design

### RESTful Endpoints
- `GET /api/pages` - List pages
- `POST /api/pages` - Create page
- `GET /api/pages/[id]` - Get page
- `PATCH /api/pages/[id]` - Update page
- `DELETE /api/pages/[id]` - Delete page
- `POST /api/pages/[id]/publish` - Publish page
- `POST /api/ab-tests` - Create A/B test
- `GET /api/analytics/stats` - Get analytics
- `POST /api/analytics/track` - Track event
- `POST /api/ai/generate` - AI generation

### Server Actions
- `createPageAction()` - Create page
- `updateComponentAction()` - Update component
- `assignVariantAction()` - Assign A/B variant

## Database Schema

See `prisma/schema.prisma` for complete schema definition.

### Core Entities
- **User** - Authentication and profile
- **Workspace** - Multi-tenant container
- **Page** - Landing pages
- **Component** - Page building blocks
- **PageVariant** - A/B test variants
- **ABTest** - A/B test configuration
- **AnalyticsSession** - Visitor sessions
- **AnalyticsEvent** - User interactions
- **Template** - Pre-built page templates
- **Integration** - Third-party connections

## Deployment Architecture

### Vercel Deployment
- Production: `main` branch → reoptimize.com
- Preview: Pull requests → auto-deploy
- Development: `develop` branch → dev.reoptimize.com

### Environment Strategy
- `.env.local` - Local development
- `.env.preview` - Preview deployments
- `.env.production` - Production (via Vercel)

### CI/CD Pipeline
1. Push to GitHub
2. GitHub Actions runs tests
3. Type checking & linting
4. Vercel builds & deploys
5. E2E tests on preview
6. Manual approval for production

## Future Enhancements

### Phase 2 Features
- Collaborative editing (WebSockets)
- Version history & rollback
- Advanced personalization engine
- Multi-language support
- White-label options

### Technical Improvements
- GraphQL API layer
- Real-time analytics dashboard
- Mobile app (React Native)
- Self-hosted option
- Plugin marketplace

## Architecture Diagrams

### Component Interaction
```
User → Builder UI → Canvas
              ↓
        Component Palette
              ↓
        Drag & Drop
              ↓
        Property Panel
              ↓
        Save Action → API → DB
```

### A/B Test Flow
```
Visitor → Edge Middleware → Assign Variant
                ↓
        Set Cookie (variant_id)
                ↓
        Render Page Variant
                ↓
        Track Events → Analytics
                ↓
        Calculate Stats → Dashboard
```

### Analytics Pipeline
```
Client Event → Beacon API → Validation
                ↓
        Batch Insert → DB
                ↓
        Background Job → Aggregation
                ↓
        Dashboard Query → Cached Results
```

## References

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Last Updated**: 2026-01-22
**Version**: 1.0.0
**Maintainers**: Reoptimize Team
