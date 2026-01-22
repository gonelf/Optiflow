'use client';

import { BuilderComponent } from '@/store/builder.store';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface PricingRendererProps {
  component: BuilderComponent;
}

export function PricingRenderer({ component }: PricingRendererProps) {
  const { content, styles } = component;
  const tiers = content?.tiers || [];

  return (
    <section
      className={cn('py-16 px-6', styles?.customClasses)}
      style={{
        backgroundColor: styles?.backgroundColor || '#ffffff',
        padding: `${styles?.padding || 64}px ${styles?.padding || 24}px`,
        margin: `${styles?.margin || 0}px`,
      }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-3">
          {tiers.map((tier: any, index: number) => (
            <div
              key={index}
              className={cn(
                'rounded-lg border-2 p-8',
                tier.highlighted
                  ? 'border-primary shadow-lg scale-105'
                  : 'border-gray-200'
              )}
            >
              <h3 className="text-2xl font-bold">{tier.name}</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-gray-600">/{tier.interval}</span>
              </div>
              <ul className="mt-8 space-y-4">
                {(tier.features || []).map((feature: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-8 w-full rounded-lg bg-primary py-3 text-white font-semibold hover:bg-primary/90 transition-colors">
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
