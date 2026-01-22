'use client';

import { BuilderComponent } from '@/store/builder.store';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface FormRendererProps {
  component: BuilderComponent;
}

export function FormRenderer({ component }: FormRendererProps) {
  const { content, styles } = component;
  const fields = content?.fields || [];

  return (
    <section
      className={cn('py-16 px-6', styles?.customClasses)}
      style={{
        backgroundColor: styles?.backgroundColor || '#ffffff',
        padding: `${styles?.padding || 64}px ${styles?.padding || 24}px`,
        margin: `${styles?.margin || 0}px`,
      }}
    >
      <div className="mx-auto max-w-lg">
        <form className="space-y-6">
          {fields.map((field: any, index: number) => (
            <div key={index}>
              <Label htmlFor={`field-${index}`}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {field.type === 'textarea' ? (
                <textarea
                  id={`field-${index}`}
                  required={field.required}
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 min-h-[100px]"
                />
              ) : (
                <Input
                  id={`field-${index}`}
                  type={field.type}
                  required={field.required}
                  className="mt-2"
                />
              )}
            </div>
          ))}
          <Button type="submit" className="w-full">
            {content?.submitText || 'Submit'}
          </Button>
        </form>
      </div>
    </section>
  );
}
