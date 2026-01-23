import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Zap,
  BarChart3,
  Sparkles,
  Code2,
  TrendingUp,
  Layers,
  Eye,
  Palette,
  Layout,
  MousePointerClick,
  GitBranch,
  LineChart,
  Users2,
  Gauge,
  Brain,
  Target,
  Workflow,
  Boxes,
  Lock,
  Plug,
  FileCode,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const metadata: Metadata = {
  title: 'Features - OptiFlow | Native A/B Testing & Analytics Builder',
  description: 'Explore OptiFlow\'s comprehensive features: visual page builder, native A/B testing, integrated analytics, AI optimizations, and more. Everything you need to optimize SaaS conversions.',
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Zap className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">OptiFlow</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="/#benefits" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Why OptiFlow
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/features" className="text-sm font-medium text-foreground transition-colors">
                Learn More
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started Free</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Every Feature You Need to
            <span className="block text-primary mt-2">Win More Conversions</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            OptiFlow combines powerful page building, native A/B testing, and deep analytics
            in one seamless platform. No integrations, no friction—just results.
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8 py-6 h-auto">
              Start Building Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Core Features Tabs */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Tabs defaultValue="builder" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-12">
            <TabsTrigger value="builder" className="text-base">
              <Code2 className="mr-2 h-4 w-4" />
              Page Builder
            </TabsTrigger>
            <TabsTrigger value="testing" className="text-base">
              <Zap className="mr-2 h-4 w-4" />
              A/B Testing
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-base">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Builder Tab */}
          <TabsContent value="builder" className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Visual No-Code Page Builder</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Create high-converting marketing pages in minutes with our intuitive drag-and-drop editor
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                  <Palette className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Drag-and-Drop Interface</h3>
                <p className="text-muted-foreground mb-4">
                  Intuitive visual editor that feels natural. Drag components, resize elements, and see changes in real-time.
                  No code required—ever.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Real-time preview as you build
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Undo/redo with full history
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Responsive design controls
                  </li>
                </ul>
              </Card>

              <Card className="p-8">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                  <Boxes className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Pre-Built Components</h3>
                <p className="text-muted-foreground mb-4">
                  Start with conversion-optimized components designed specifically for SaaS marketing.
                  Customize to match your brand.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Hero sections & CTAs
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Pricing tables & feature grids
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Forms, testimonials & FAQs
                  </li>
                </ul>
              </Card>

              <Card className="p-8">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                  <Layout className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Professionally Designed Templates</h3>
                <p className="text-muted-foreground mb-4">
                  Launch faster with battle-tested templates for every SaaS marketing need—landing pages,
                  product tours, pricing pages, and more.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    50+ conversion-tested templates
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Fully customizable designs
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Mobile-first responsive layouts
                  </li>
                </ul>
              </Card>

              <Card className="p-8">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI-Assisted Generation</h3>
                <p className="text-muted-foreground mb-4">
                  Describe what you need in plain English and let AI generate the page structure, copy,
                  and design. Edit and refine with visual tools.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Generate pages from prompts
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Smart copy suggestions
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Auto-optimize for conversions
                  </li>
                </ul>
              </Card>
            </div>
          </TabsContent>

          {/* A/B Testing Tab */}
          <TabsContent value="testing" className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Native A/B Testing & Experimentation</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Create, launch, and analyze experiments without ever leaving the builder
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                  <GitBranch className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Visual Variant Creation</h3>
                <p className="text-muted-foreground mb-4">
                  Clone any page element and create variants visually. Test headlines, CTAs, layouts,
                  colors, images—anything that might impact conversions.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    One-click variant duplication
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Test multiple elements at once
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Unlimited variants per test
                  </li>
                </ul>
              </Card>

              <Card className="p-8">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                  <Workflow className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Smart Traffic Splitting</h3>
                <p className="text-muted-foreground mb-4">
                  Automatically split visitors across variants with configurable ratios.
                  Fair, random assignment ensures reliable results.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Custom traffic allocation (50/50, 60/40, etc.)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Cookie-based session persistence
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Multi-armed bandit optimization
                  </li>
                </ul>
              </Card>

              <Card className="p-8">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                  <LineChart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Statistical Significance</h3>
                <p className="text-muted-foreground mb-4">
                  Built-in statistical analysis calculates confidence intervals and p-values automatically.
                  Know when you have a winner—no guessing required.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Real-time significance calculations
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Bayesian & frequentist methods
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Confidence interval visualization
                  </li>
                </ul>
              </Card>

              <Card className="p-8">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Goal Tracking & Conversion Events</h3>
                <p className="text-muted-foreground mb-4">
                  Define custom conversion goals for each test. Track button clicks, form submissions,
                  signups, purchases—whatever matters to your business.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Multiple goals per experiment
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Primary & secondary metrics
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Revenue impact tracking
                  </li>
                </ul>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Integrated Analytics & Insights</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                See what&apos;s working with real-time dashboards and SaaS-specific metrics
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                  <Gauge className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Real-Time Dashboard</h3>
                <p className="text-muted-foreground mb-4">
                  Monitor conversions, traffic, and engagement as they happen. No delays,
                  no exports—instant insights when you need them.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Live visitor count & activity
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Real-time conversion tracking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Customizable date ranges
                  </li>
                </ul>
              </Card>

              <Card className="p-8">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Conversion Funnels</h3>
                <p className="text-muted-foreground mb-4">
                  Visualize your user journey from first visit to conversion. Identify drop-off points
                  and optimize the steps that matter.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Visual funnel builder
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Step-by-step conversion rates
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Drop-off analysis & insights
                  </li>
                </ul>
              </Card>

              <Card className="p-8">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                  <Users2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Cohort Analysis</h3>
                <p className="text-muted-foreground mb-4">
                  Group visitors by acquisition date, traffic source, or behavior.
                  Track retention and engagement over time.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Custom cohort definitions
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Retention heatmaps
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Segment performance comparison
                  </li>
                </ul>
              </Card>

              <Card className="p-8">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                  <MousePointerClick className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Heatmaps & Click Tracking</h3>
                <p className="text-muted-foreground mb-4">
                  See where visitors click, scroll, and engage. Visual heatmaps reveal user behavior
                  patterns you might otherwise miss.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Click heatmaps overlay
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Scroll depth tracking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Mobile & desktop views
                  </li>
                </ul>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Additional Features Grid */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              And So Much More
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to build, test, and optimize—all in one place
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-6">
              <Sparkles className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI-Powered Suggestions</h3>
              <p className="text-sm text-muted-foreground">
                Get smart recommendations for copy improvements, variant ideas, and optimization opportunities
              </p>
            </Card>

            <Card className="p-6">
              <Eye className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Visitor Segmentation</h3>
              <p className="text-sm text-muted-foreground">
                Personalize experiences based on traffic source, device, location, or custom attributes
              </p>
            </Card>

            <Card className="p-6">
              <Plug className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Native Integrations</h3>
              <p className="text-sm text-muted-foreground">
                Connect Stripe, HubSpot, Zapier, and more. Sync data seamlessly across your stack
              </p>
            </Card>

            <Card className="p-6">
              <FileCode className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Code Export</h3>
              <p className="text-sm text-muted-foreground">
                Export clean, production-ready code anytime. No lock-in, full portability
              </p>
            </Card>

            <Card className="p-6">
              <Lock className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Enterprise Security</h3>
              <p className="text-sm text-muted-foreground">
                SSO, role-based permissions, audit logs, and SOC 2 compliance for peace of mind
              </p>
            </Card>

            <Card className="p-6">
              <Layers className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Custom Domains & Hosting</h3>
              <p className="text-sm text-muted-foreground">
                Deploy instantly with custom domains, SSL certificates, and global CDN—all included
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Built for Every SaaS Marketing Need
          </h2>
          <p className="text-lg text-muted-foreground">
            From landing pages to product-led funnels—OptiFlow has you covered
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="font-semibold mb-2">Landing Pages</h3>
            <p className="text-sm text-muted-foreground">High-converting pages for campaigns, product launches, and lead gen</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="font-semibold mb-2">Pricing Pages</h3>
            <p className="text-sm text-muted-foreground">Test pricing tiers, CTAs, and messaging to maximize conversions</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="font-semibold mb-2">Product Tours</h3>
            <p className="text-sm text-muted-foreground">Showcase features with interactive demos and video walkthroughs</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="font-semibold mb-2">Signup Funnels</h3>
            <p className="text-sm text-muted-foreground">Optimize every step from first click to trial signup or purchase</p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to See It in Action?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
            Start building, testing, and optimizing today. Free forever plan available—no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 h-auto">
                Start Building Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="h-5 w-5 text-primary" />
                <span className="font-bold">OptiFlow</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The no-code builder for SaaS growth teams. Build, test, and optimize—all in one place.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Templates</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Integrations</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">API Reference</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Case Studies</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>© 2026 OptiFlow. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="hover:text-foreground transition-colors">Twitter</Link>
              <Link href="#" className="hover:text-foreground transition-colors">LinkedIn</Link>
              <Link href="#" className="hover:text-foreground transition-colors">GitHub</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
