import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Zap,
  Check,
  X,
  ArrowRight,
  HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

import { generateMetadata as genMeta, getProductSchema, getFAQSchema } from '@/lib/seo'
import { StructuredData } from '@/components/structured-data'

export const metadata = genMeta({
  title: 'Pricing - Reoptimize',
  description: 'Simple, transparent pricing for teams of all sizes. Start free, scale as you grow. No hidden fees.',
  path: '/pricing',
  keywords: [
    'reoptimize pricing',
    'no-code builder pricing',
    'A/B testing pricing',
    'marketing platform cost',
    'webflow alternative pricing',
  ],
})

export default function PricingPage() {
  // Product schemas for each pricing tier
  const starterProduct = getProductSchema({
    name: 'Reoptimize Starter',
    description: 'Perfect for side projects and testing the waters',
    price: 0,
    features: ['1 workspace', 'Up to 3 pages', '5,000 monthly visitors', 'Basic A/B testing', 'Core analytics dashboard'],
  })

  const growthProduct = getProductSchema({
    name: 'Reoptimize Growth',
    description: 'For growing teams serious about optimization',
    price: 79,
    features: ['5 workspaces', 'Unlimited pages', '100,000 monthly visitors', 'Unlimited A/B tests', 'Advanced analytics', 'AI-powered optimizations'],
  })

  // FAQ schema from the pricing page FAQs
  const pricingFAQs = getFAQSchema([
    {
      question: 'Do you offer a free trial?',
      answer: 'Yes! Our Starter plan is free forever, and Growth plan includes a 14-day free trial. No credit card required to start.',
    },
    {
      question: 'What happens if I exceed my visitor limit?',
      answer: "We'll notify you when you're approaching your limit. You can upgrade your plan anytime, or we'll automatically pause new sessions until the next billing cycle to avoid surprise charges.",
    },
    {
      question: 'Can I change plans later?',
      answer: "Absolutely! You can upgrade or downgrade at any time. When upgrading, you'll get immediate access to new features. When downgrading, changes take effect at the next billing cycle.",
    },
  ])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Structured Data for SEO and LLM Search */}
      <StructuredData data={[starterProduct, growthProduct, pricingFAQs]} />

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
              <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="/#benefits" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Why Reoptimize
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-foreground transition-colors">
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
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Start free, scale as you grow. No hidden fees, no surprises.
            <br />
            All plans include native A/B testing and analytics.
          </p>
          <div className="inline-flex items-center rounded-full border px-4 py-2 text-sm bg-primary/5 border-primary/20">
            <span className="font-medium text-primary">🎉 Launch Special: 20% off annual plans</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          {/* Free Plan */}
          <Card className="p-8 relative">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <p className="text-muted-foreground mb-4">Perfect for side projects and testing the waters</p>
              <div className="mb-2">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground">Forever free</p>
            </div>

            <Link href="/waitlist" className="block mb-6">
              <Button variant="outline" className="w-full" size="lg">
                Join Waitlist
              </Button>
            </Link>

            <div className="space-y-3 mb-6">
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm">1 workspace</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Up to 3 pages</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm">5,000 monthly visitors</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Basic A/B testing (1 active test)</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Core analytics dashboard</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm">7-day data retention</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Reoptimize branding</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Community support</span>
              </div>
            </div>
          </Card>

          {/* Pro Plan */}
          <Card className="p-8 relative border-2 border-primary shadow-lg scale-105">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Growth</h3>
              <p className="text-muted-foreground mb-4">For growing teams serious about optimization</p>
              <div className="mb-2">
                <span className="text-4xl font-bold">$79</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground">Or $63/mo billed annually (save 20%)</p>
            </div>

            <Link href="/waitlist" className="block mb-6">
              <Button className="w-full" size="lg">
                Join Waitlist
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <div className="space-y-3 mb-6">
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm">5 workspaces</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm"><strong>Unlimited pages</strong></span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm">100,000 monthly visitors</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm"><strong>Unlimited A/B tests</strong></span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm"><strong>Advanced analytics</strong> (funnels, cohorts, heatmaps)</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm">90-day data retention</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm"><strong>AI-powered optimizations</strong></span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Custom domain</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Remove Reoptimize branding</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Priority email support</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Integrations (Stripe, HubSpot, etc.)</span>
              </div>
            </div>
          </Card>

          {/* Enterprise Plan */}
          <Card className="p-8 relative">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <p className="text-muted-foreground mb-4">For large teams with custom needs</p>
              <div className="mb-2">
                <span className="text-4xl font-bold">Custom</span>
              </div>
              <p className="text-sm text-muted-foreground">Contact us for pricing</p>
            </div>

            <Link href="#contact" className="block mb-6">
              <Button variant="outline" className="w-full" size="lg">
                Contact Sales
              </Button>
            </Link>

            <div className="space-y-3 mb-6">
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Unlimited workspaces</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Unlimited pages</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Custom visitor limits</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Everything in Growth, plus:</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm"><strong>Dedicated account manager</strong></span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm"><strong>SSO & advanced security</strong></span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Custom integrations</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm">SLA guarantees</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Training & onboarding</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm">24/7 priority support</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Custom contract terms</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Compare All Features</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-semibold">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold">Starter</th>
                  <th className="text-center py-4 px-4 font-semibold bg-primary/5">Growth</th>
                  <th className="text-center py-4 px-4 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Workspaces</td>
                  <td className="text-center py-3 px-4">1</td>
                  <td className="text-center py-3 px-4 bg-primary/5">5</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Pages</td>
                  <td className="text-center py-3 px-4">3</td>
                  <td className="text-center py-3 px-4 bg-primary/5">Unlimited</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Monthly Visitors</td>
                  <td className="text-center py-3 px-4">5,000</td>
                  <td className="text-center py-3 px-4 bg-primary/5">100,000</td>
                  <td className="text-center py-3 px-4">Custom</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Active A/B Tests</td>
                  <td className="text-center py-3 px-4">1</td>
                  <td className="text-center py-3 px-4 bg-primary/5">Unlimited</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Visual Page Builder</td>
                  <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  <td className="text-center py-3 px-4 bg-primary/5"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Basic Analytics</td>
                  <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  <td className="text-center py-3 px-4 bg-primary/5"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Advanced Analytics (Funnels, Cohorts)</td>
                  <td className="text-center py-3 px-4"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="text-center py-3 px-4 bg-primary/5"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Heatmaps</td>
                  <td className="text-center py-3 px-4"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="text-center py-3 px-4 bg-primary/5"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">AI-Powered Optimizations</td>
                  <td className="text-center py-3 px-4"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="text-center py-3 px-4 bg-primary/5"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Custom Domain</td>
                  <td className="text-center py-3 px-4"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="text-center py-3 px-4 bg-primary/5"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Remove Branding</td>
                  <td className="text-center py-3 px-4"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="text-center py-3 px-4 bg-primary/5"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Integrations (Stripe, HubSpot, etc.)</td>
                  <td className="text-center py-3 px-4"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="text-center py-3 px-4 bg-primary/5"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">SSO & Advanced Security</td>
                  <td className="text-center py-3 px-4"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="text-center py-3 px-4 bg-primary/5"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Dedicated Account Manager</td>
                  <td className="text-center py-3 px-4"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="text-center py-3 px-4 bg-primary/5"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Support</td>
                  <td className="text-center py-3 px-4 text-sm">Community</td>
                  <td className="text-center py-3 px-4 bg-primary/5 text-sm">Priority Email</td>
                  <td className="text-center py-3 px-4 text-sm">24/7 Priority</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-start">
                  <HelpCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Do you offer a free trial?</h3>
                    <p className="text-muted-foreground">Yes! Our Starter plan is free forever, and Growth plan includes a 14-day free trial. No credit card required to start.</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start">
                  <HelpCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">What happens if I exceed my visitor limit?</h3>
                    <p className="text-muted-foreground">We&apos;ll notify you when you&apos;re approaching your limit. You can upgrade your plan anytime, or we&apos;ll automatically pause new sessions until the next billing cycle to avoid surprise charges.</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start">
                  <HelpCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Can I change plans later?</h3>
                    <p className="text-muted-foreground">Absolutely! You can upgrade or downgrade at any time. When upgrading, you&apos;ll get immediate access to new features. When downgrading, changes take effect at the next billing cycle.</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start">
                  <HelpCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Is there a setup fee or long-term contract?</h3>
                    <p className="text-muted-foreground">No setup fees, ever. Plans are month-to-month with no long-term contracts required. Cancel anytime with no penalties.</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start">
                  <HelpCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                    <p className="text-muted-foreground">We accept all major credit cards (Visa, Mastercard, Amex, Discover) and ACH transfers for annual plans. Enterprise customers can arrange invoicing.</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start">
                  <HelpCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Do you offer discounts for nonprofits or education?</h3>
                    <p className="text-muted-foreground">Yes! We offer 50% discounts for verified nonprofits and educational institutions. Contact our sales team for details.</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start">
                  <HelpCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Can I export my data if I cancel?</h3>
                    <p className="text-muted-foreground">Yes! We believe in data portability. You can export all your pages, analytics data, and A/B test results at any time, even after cancellation.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Optimizing?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join growth teams shipping winning experiments without the tool sprawl.
            Start free—no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/waitlist">
              <Button size="lg" className="text-lg px-8 py-6 h-auto">
                Join the Waitlist
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/#features">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto">
                Explore Features
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
                <span className="font-bold">Reoptimize</span>
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
