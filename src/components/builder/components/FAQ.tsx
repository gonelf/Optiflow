'use client';

import { BuilderComponent } from '@/store/builder.store';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQRendererProps {
  component: BuilderComponent;
}

export function FAQRenderer({ component }: FAQRendererProps) {
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
      <div className="mx-auto max-w-3xl">
        <Accordion type="single" collapsible className="space-y-4">
          {items.map((item: any, index: number) => (
            <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
