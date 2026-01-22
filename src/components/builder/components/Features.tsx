'use client';

import { BuilderComponent } from '@/store/builder.store';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface FeaturesRendererProps {
  component: BuilderComponent;
}

export function FeaturesRenderer({ component }: FeaturesRendererProps) {
  const { content, styles } = component;
  const items = content?.items || [];

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
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item: any, index: number) => (
            <div key={index} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Check className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
