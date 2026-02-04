import type { Metadata } from 'next'
import { Navbar } from '@/components/landing/navbar'
import { Hero } from '@/components/landing/hero'
import { LogoCloud } from '@/components/landing/logo-cloud'
import { Stats } from '@/components/landing/stats'
import { Features } from '@/components/landing/features'
import { Testimonials } from '@/components/landing/testimonials'
import { CTA } from '@/components/landing/cta'
import { Footer } from '@/components/landing/footer'
import { SavingsCalculator } from '@/components/savings-calculator'

export const metadata: Metadata = {
  title: 'Reoptimize - The Webflow Killer for Marketing Teams | Vibe Code Builder with Native A/B Testing',
  description: 'Replace Webflow, VWO, and Mixpanel with one powerful platform. Build, test, and optimize marketing pages with vibe code. Native A/B testing and analytics for marketing teams. Lift conversions by 10-50%.',
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <Navbar />

      <main>
        <Hero />
        <LogoCloud />
        <Stats />

        {/* Features & Bento Grid */}
        <Features />

        {/* Value Prop Section (Savings) */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                How Much Could You Save?
              </h2>
              <p className="text-lg text-muted-foreground">
                See the real cost of your current Webflow + VWO + Mixpanel stack vs. Reoptimize's all-in-one platform
              </p>
            </div>
            <div className="max-w-4xl mx-auto rounded-3xl border bg-muted/20 p-8 md:p-12 shadow-sm">
              <SavingsCalculator />
            </div>
          </div>
        </section>

        <Testimonials />

        <CTA />
      </main>

      <Footer />
    </div>
  )
}
