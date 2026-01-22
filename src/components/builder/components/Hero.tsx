'use client';

import { BuilderComponent } from '@/store/builder.store';
import { cn } from '@/lib/utils';

interface HeroRendererProps {
  component: BuilderComponent;
}

export function HeroRenderer({ component }: HeroRendererProps) {
  const { content, styles } = component;

  return (
    <section
      className={cn('py-20 px-6', styles?.customClasses)}
      style={{
        backgroundColor: styles?.backgroundColor || '#ffffff',
        padding: `${styles?.padding || 80}px ${styles?.padding || 24}px`,
        margin: `${styles?.margin || 0}px`,
      }}
    >
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          {content?.headline || 'Your Headline Here'}
        </h1>
        {content?.subheadline && (
          <p className="mt-6 text-xl text-gray-600">{content.subheadline}</p>
        )}
        {content?.ctaText && (
          <div className="mt-10">
            <a
              href={content?.ctaLink || '#'}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-base font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              {content.ctaText}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
