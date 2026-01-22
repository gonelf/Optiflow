'use client';

import { BuilderComponent } from '@/store/builder.store';
import { cn } from '@/lib/utils';

interface CTARendererProps {
  component: BuilderComponent;
}

export function CTARenderer({ component }: CTARendererProps) {
  const { content, styles } = component;

  return (
    <section
      className={cn('py-16 px-6', styles?.customClasses)}
      style={{
        backgroundColor: styles?.backgroundColor || '#f9fafb',
        padding: `${styles?.padding || 64}px ${styles?.padding || 24}px`,
        margin: `${styles?.margin || 0}px`,
      }}
    >
      <div className="mx-auto max-w-4xl text-center">
        <a
          href={content?.link || '#'}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-base font-semibold text-white hover:bg-primary/90 transition-colors"
        >
          {content?.text || 'Get Started Today'}
        </a>
      </div>
    </section>
  );
}
