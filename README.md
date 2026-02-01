# OptiVibe

**No-Code SaaS Marketing Site Builder with Native A/B Testing & Analytics**

OptiVibe is a powerful, modern platform for building, testing, and optimizing marketing pages without code. Built with Next.js 14, it combines an intuitive drag-and-drop builder with integrated A/B testing and real-time analytics.

## Features

### Core Capabilities
- **No-Code Builder**: Drag-and-drop editor with 8+ pre-built components
- **AI-Powered**: Generate pages and variants using AI prompts (e.g., "Create a B2B SaaS pricing page")
- **Native A/B Testing**: Visual variant creation, automatic traffic splitting, statistical significance calculator
- **Integrated Analytics**: Real-time dashboards, conversion funnels, heatmaps, cohort analysis
- **Template Library**: Pre-built templates for heroes, pricing pages, demos, and funnels
- **Integrations**: Stripe payments, HubSpot/CRM connectors, webhook support

### Tech Stack
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Auth**: NextAuth.js
- **AI**: OpenAI GPT-4
- **Deployment**: Vercel
- **Analytics**: PostHog (optional)

## Quick Start

### Prerequisites
```bash
Node.js 18.17+
pnpm 8+
PostgreSQL (Supabase account)
```

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/optivibe.git
cd optivibe

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Set up database
pnpm db:migrate
pnpm db:seed

# Start development server
pnpm dev
```

Access at: http://localhost:3000

## Documentation

Comprehensive documentation is available in the `/docs` folder:

### 📐 [Architecture Overview](docs/architecture.md)
- System architecture diagram
- Tech stack decisions
- Data flows
- Security architecture
- Performance optimizations

### 🛠️ [Setup Guide](docs/setup-guide.md)
- Complete installation instructions
- Environment configuration
- Database setup (Supabase)
- Authentication setup (NextAuth)
- Deployment guide

### 🗺️ [Development Roadmap](docs/development-roadmap.md)
- 7-week MVP development plan
- Phase-by-phase task breakdown
- Success metrics
- Resource requirements
- Risk mitigation strategies

## Project Structure

```
optivibe/
├── docs/                      # Documentation
│   ├── architecture.md        # System architecture
│   ├── setup-guide.md         # Installation guide
│   └── development-roadmap.md # Development plan
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Seed data
├── src/
│   ├── app/                   # Next.js 14 App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Dashboard (builder, analytics, etc.)
│   │   ├── (marketing)/       # Public marketing pages
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── builder/           # Page builder components
│   │   ├── analytics/         # Analytics components
│   │   ├── ab-testing/        # A/B testing components
│   │   └── ui/                # Reusable UI components
│   ├── lib/                   # Core libraries
│   ├── services/              # Business logic
│   ├── hooks/                 # React hooks
│   ├── store/                 # State management (Zustand)
│   └── types/                 # TypeScript types
└── tests/                     # Tests (unit, integration, e2e)
```

## Development Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Database
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed database
pnpm db:studio        # Open Prisma Studio
pnpm db:reset         # Reset database

# Testing
pnpm test             # Run unit tests
pnpm test:watch       # Run tests in watch mode
pnpm test:e2e         # Run E2E tests
pnpm type-check       # TypeScript type checking

# Code Quality
pnpm format           # Format code with Prettier
pnpm format:check     # Check formatting
```

## Development Phases

### Phase 1: Authentication & Workspaces (Week 1)
- User authentication (email, OAuth)
- Multi-tenant workspaces
- Team collaboration

### Phase 2: Page Builder (Weeks 2-3)
- Drag-and-drop editor
- Component library (Hero, CTA, Pricing, etc.)
- Template system
- Property panel

### Phase 3: A/B Testing (Week 4)
- Variant creation
- Traffic splitting
- Statistical analysis
- Results dashboard

### Phase 4: Analytics (Week 5)
- Event tracking
- Real-time dashboard
- Conversion funnels
- Heatmaps & cohorts

### Phase 5: AI & Integrations (Week 6)
- AI page generation
- Optimization suggestions
- Stripe integration
- HubSpot/CRM connectors

### Phase 6: Launch (Week 7)
- Performance optimization
- Security hardening
- Testing & documentation
- Production deployment

See [Development Roadmap](docs/development-roadmap.md) for detailed breakdown.

## Database Schema

The application uses PostgreSQL with Prisma ORM. Key entities:

- **User** - Authentication and profiles
- **Workspace** - Multi-tenant container
- **Page** - Landing pages with components
- **Component** - Draggable building blocks
- **ABTest** - A/B test configuration
- **PageVariant** - Test variants
- **AnalyticsSession** - Visitor sessions
- **AnalyticsEvent** - User interactions
- **Template** - Pre-built page templates
- **Integration** - Third-party connections

See [prisma/schema.prisma](prisma/schema.prisma) for complete schema.

## API Routes

### Authentication
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signup` - Sign up
- `GET /api/auth/session` - Get session

### Pages
- `GET /api/pages` - List pages
- `POST /api/pages` - Create page
- `GET /api/pages/[id]` - Get page
- `PATCH /api/pages/[id]` - Update page
- `DELETE /api/pages/[id]` - Delete page
- `POST /api/pages/[id]/publish` - Publish page

### A/B Testing
- `POST /api/ab-tests` - Create test
- `GET /api/ab-tests/[id]` - Get test
- `GET /api/ab-tests/[id]/stats` - Get test statistics

### Analytics
- `POST /api/analytics/track` - Track event
- `GET /api/analytics/stats` - Get analytics

### AI
- `POST /api/ai/generate` - Generate page/component
- `POST /api/ai/optimize` - Get optimization suggestions

## Environment Variables

Required environment variables (see `.env.example`):

```bash
# Database
DATABASE_URL=              # Supabase connection string

# Authentication
NEXTAUTH_URL=              # App URL
NEXTAUTH_SECRET=           # Auth secret (generate with openssl)

# OpenAI
OPENAI_API_KEY=            # OpenAI API key

# Stripe
STRIPE_SECRET_KEY=         # Stripe secret key
STRIPE_PUBLISHABLE_KEY=    # Stripe publishable key

# Email
RESEND_API_KEY=            # Resend API key
EMAIL_FROM=                # From email address

# Feature Flags
ENABLE_AI_FEATURES=true    # Enable AI features
ENABLE_INTEGRATIONS=true   # Enable integrations
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Deploy
vercel
```

Configure environment variables in Vercel Dashboard.

### Database Migration

```bash
# Pull production env vars
vercel env pull .env.production.local

# Run migrations
pnpm prisma migrate deploy
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

```bash
# Run all tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Run tests in watch mode
pnpm test:watch
```

## Performance

- **Lighthouse Score**: 90+ performance, 100 SEO
- **API Response Time**: < 100ms p95
- **Time to Interactive**: < 2s
- **Edge Caching**: ISR with 1hr revalidation

## Security

- Row Level Security (RLS) on all tables
- Input validation with Zod
- CSRF protection via NextAuth
- Rate limiting on API routes
- Content Security Policy (CSP)
- SQL injection prevention via Prisma

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [/docs](docs/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/optivibe/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/optivibe/discussions)

## Roadmap

### Current (MVP)
- ✅ Core builder functionality
- ✅ A/B testing
- ✅ Analytics dashboard
- ✅ AI generation

### Next (Post-MVP)
- [ ] Collaborative editing
- [ ] Version history
- [ ] Advanced personalization
- [ ] Mobile app preview
- [ ] White-label options

### Future
- [ ] Template marketplace
- [ ] Plugin system
- [ ] Multi-language support
- [ ] Self-hosted option

---

**Built with ❤️ using Next.js 14, Tailwind CSS, and Supabase**

**Version**: 1.0.0 (MVP)
**Last Updated**: 2026-01-22
