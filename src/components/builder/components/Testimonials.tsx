'use client';

import { BuilderComponent } from '@/store/builder.store';
import { cn } from '@/lib/utils';

interface TestimonialsRendererProps {
  component: BuilderComponent;
}

export function TestimonialsRenderer({ component }: TestimonialsRendererProps) {
  const { content, styles } = component;
  const items = content?.items || [];

  return (
    <section
      className={cn('py-16 px-6', styles?.customClasses)}
      style={{
        backgroundColor: styles?.backgroundColor || '#f9fafb',
        padding: `${styles?.padding || 64}px ${styles?.padding || 24}px`,
        margin: `${styles?.margin || 0}px`,
      }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item: any, index: number) => (
            <div key={index} className="rounded-lg bg-white p-6 shadow-sm">
              <p className="text-gray-600 italic">&ldquo;{item.quote}&rdquo;</p>
              <div className="mt-4">
                <p className="font-semibold">{item.author}</p>
                <p className="text-sm text-gray-500">
                  {item.role} at {item.company}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
