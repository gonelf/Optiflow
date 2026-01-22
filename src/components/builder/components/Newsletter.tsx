'use client';

import { BuilderComponent } from '@/store/builder.store';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface NewsletterRendererProps {
  component: BuilderComponent;
}

export function NewsletterRenderer({ component }: NewsletterRendererProps) {
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
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold">
          {content?.headline || 'Subscribe to our newsletter'}
        </h2>
        {content?.description && (
          <p className="mt-4 text-gray-600">{content.description}</p>
        )}
        <form className="mt-8 flex gap-4 max-w-md mx-auto">
          <Input
            type="email"
            placeholder={content?.placeholder || 'Enter your email'}
            className="flex-1"
          />
          <Button type="submit">{content?.submitText || 'Subscribe'}</Button>
        </form>
      </div>
    </section>
  );
}
