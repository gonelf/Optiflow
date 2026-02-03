import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Zap,
  BarChart3,
  Sparkles,
  Code2,
  TrendingUp,
  Layers,
  CheckCircle2,
  ArrowRight,
  Users,
  Clock,
  DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SavingsCalculator } from '@/components/savings-calculator'

export const metadata: Metadata = {
  title: 'Reoptimize - The Webflow Killer for Marketing Teams | Vibe Code Builder with Native A/B Testing',
  description: 'Replace Webflow, VWO, and Mixpanel with one powerful platform. Build, test, and optimize marketing pages with vibe code. Native A/B testing and analytics for marketing teams. Lift conversions by 10-50%.',
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Zap className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Reoptimize</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#benefits" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Why Reoptimize
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Learn More
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link href="/waitlist">
                <Button size="sm">Join the Waitlist</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm mb-8 bg-muted/50">
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            <span className="font-medium">The Webflow Killer for Marketing Teams</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Build, Test, Win
            <span className="block text-primary mt-2">Convert More Visitors</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Replace Webflow, VWO, and Mixpanel with one platform. Build with <strong className="text-foreground">vibe code</strong>, ship <strong className="text-foreground">native A/B tests</strong>, and track <strong className="text-foreground">real revenue impact</strong>—all in one seamless workflow.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/waitlist">
              <Button size="lg" className="text-lg px-8 py-6 h-auto">
                Join the Waitlist
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto">
                See How It Works
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
              No credit card required
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
              Setup in 5 minutes
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted/30 border-y py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10-50%</div>
              <div className="text-sm text-muted-foreground">Avg. Conversion Lift</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">3x</div>
              <div className="text-sm text-muted-foreground">Faster Iterations</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">$0</div>
              <div className="text-sm text-muted-foreground">Extra Tool Costs</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1</div>
              <div className="text-sm text-muted-foreground">Unified Platform</div>
            </div>
          </div>
        </div>
      </section>

      {/* Savings Calculator Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              How Much Could You Save?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See the real cost of your current Webflow + VWO + Mixpanel stack vs. Reoptimize&apos;s all-in-one platform
            </p>
          </div>
          <SavingsCalculator />
        </div>
      </section>

      {/* Problem Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Webflow is Great. Your Franken-Stack Isn&apos;t.
          </h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Webflow lets you build beautiful sites. But then you need
            <strong className="text-foreground"> VWO or Optimizely</strong> for A/B testing ($200-800/mo),
            <strong className="text-foreground"> Mixpanel or Amplitude</strong> for analytics ($90-300/mo), and
            <strong className="text-foreground"> countless hours</strong> maintaining integrations. Marketing teams deserve better.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="p-6 bg-destructive/5 border-destructive/20">
              <Clock className="h-8 w-8 text-destructive mb-4" />
              <h3 className="font-semibold mb-2">Slow Iterations</h3>
              <p className="text-sm text-muted-foreground">Switching between tools kills momentum and wastes hours</p>
            </Card>
            <Card className="p-6 bg-destructive/5 border-destructive/20">
              <DollarSign className="h-8 w-8 text-destructive mb-4" />
              <h3 className="font-semibold mb-2">Tool Sprawl</h3>
              <p className="text-sm text-muted-foreground">Paying for 3-5 separate subscriptions adds up fast</p>
            </Card>
            <Card className="p-6 bg-destructive/5 border-destructive/20">
              <Users className="h-8 w-8 text-destructive mb-4" />
              <h3 className="font-semibold mb-2">Data Silos</h3>
              <p className="text-sm text-muted-foreground">Fragmented insights make optimization guesswork</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted/30 py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Everything You Need, Nothing You Don&apos;t
            </h2>
            <p className="text-lg text-muted-foreground">
              Reoptimize combines visual page building with native experimentation and analytics—all in one seamless workflow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                <Code2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Vibe Code Builder</h3>
              <p className="text-muted-foreground mb-4">
                Visual editor that vibes with marketing teams. AI-powered prompts generate high-converting pages—heroes, CTAs, pricing tables, funnels, and more. Like Webflow, but better.
              </p>
              <div className="text-sm text-primary font-medium">Pure vibes, zero code →</div>
            </Card>

            {/* Feature 2 */}
            <Card className="p-8 hover:shadow-lg transition-shadow bg-primary/5 border-primary/20">
              <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Native A/B Testing</h3>
              <p className="text-muted-foreground mb-4">
                Create variants visually—headlines, buttons, entire layouts. Auto-split traffic, track significance, declare winners without leaving the editor.
              </p>
              <div className="text-sm text-primary font-medium">Test everything →</div>
            </Card>

            {/* Feature 3 */}
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Integrated Analytics</h3>
              <p className="text-muted-foreground mb-4">
                Real-time dashboards for conversions, funnels, cohorts, and heatmaps. Track SaaS metrics like trial signups and MRR impact—all built in.
              </p>
              <div className="text-sm text-primary font-medium">See what works →</div>
            </Card>

            {/* Feature 4 */}
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Optimization</h3>
              <p className="text-muted-foreground mb-4">
                Get auto-suggested variants, personalized copy for visitor segments, SEO improvements, and performance tweaks powered by AI.
              </p>
              <div className="text-sm text-primary font-medium">Optimize smarter →</div>
            </Card>

            {/* Feature 5 */}
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">SaaS-First Metrics</h3>
              <p className="text-muted-foreground mb-4">
                Built for product-led growth. Track trial signups, conversion rates, cohort retention, and revenue impact—not just page views.
              </p>
              <div className="text-sm text-primary font-medium">Measure what matters →</div>
            </Card>

            {/* Feature 6 */}
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Easy Integrations</h3>
              <p className="text-muted-foreground mb-4">
                Connect Stripe for payments, HubSpot for CRM, and more. Plus code export to avoid lock-in and maintain full portability.
              </p>
              <div className="text-sm text-primary font-medium">Stay flexible →</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Why Marketing Teams Ditch Webflow for Reoptimize
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              One platform. Zero tool sprawl. Pure marketing velocity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                🚀 Ship Experiments 3x Faster
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                No more context switching between your builder, testing tool, and analytics dashboard.
                Create a variant, launch a test, and see results—all without leaving the editor.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Visual variant creation in seconds</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Auto traffic splitting & statistical significance</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>One-click winner deployment</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                <div className="text-center p-8">
                  <Zap className="h-16 w-16 text-primary mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Interactive Demo Coming Soon</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 md:order-1 relative">
              <div className="aspect-video rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                <div className="text-center p-8">
                  <BarChart3 className="h-16 w-16 text-primary mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Real-time Analytics Dashboard</p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                📊 See What Actually Drives Revenue
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                Built-in analytics track the metrics that matter for SaaS growth—trial signups, conversion funnels,
                cohort retention, and revenue impact. No more vanity metrics.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Real-time conversion tracking</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Funnel visualization & drop-off analysis</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Cohort insights & heatmap click tracking</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                💰 Webflow&apos;s Price + Your Sanity Back
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                Pay less than Webflow alone, but get the builder PLUS native A/B testing PLUS analytics.
                Save $3,000-$10,000 per year eliminating VWO and Mixpanel. Zero integration headaches.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>All-in-one pricing—no surprise add-ons</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Eliminate integration maintenance costs</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Free tier to get started—scale as you grow</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <SavingsCalculator />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials Section */}
      <section className="bg-muted/30 py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Marketing Teams Love the Switch
            </h2>
            <p className="text-lg text-muted-foreground">
              Former Webflow users shipping faster experiments and seeing real ROI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-8">
              <div className="mb-6">
                <div className="flex text-primary mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  &quot;Switched from Webflow + VWO and haven&apos;t looked back. Increased trial signups 34% in month one. The native A/B testing is a game-changer.&quot;
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <span className="font-semibold text-primary">AK</span>
                </div>
                <div>
                  <div className="font-semibold">Alex Kim</div>
                  <div className="text-sm text-muted-foreground">Growth Lead, TechCo</div>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="mb-6">
                <div className="flex text-primary mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  &quot;Finally! A builder that doesn&apos;t make me context-switch to run experiments. Our iteration speed has tripled.&quot;
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <span className="font-semibold text-primary">SM</span>
                </div>
                <div>
                  <div className="font-semibold">Sarah Martinez</div>
                  <div className="text-sm text-muted-foreground">Founder, StartupX</div>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="mb-6">
                <div className="flex text-primary mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  &quot;The integrated analytics are a game-changer. We see exactly which variants drive revenue, not just clicks.&quot;
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <span className="font-semibold text-primary">JR</span>
                </div>
                <div>
                  <div className="font-semibold">James Rodriguez</div>
                  <div className="text-sm text-muted-foreground">Marketing Director, SaaSCo</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Lift Your Conversions?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join growth teams shipping winning experiments without the tool sprawl.
            Start free—no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/waitlist">
              <Button size="lg" className="text-lg px-8 py-6 h-auto">
                Join the Waitlist
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/features">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto">
                Explore All Features
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center">
              <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
              Free forever plan available
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
              No credit card required
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
              Cancel anytime
            </div>
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
                <span className="font-bold">Reoptimize</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The vibe code builder for marketing teams. Replace Webflow + VWO + Mixpanel with one platform.
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
            <p>© 2026 Reoptimize. All rights reserved.</p>
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
