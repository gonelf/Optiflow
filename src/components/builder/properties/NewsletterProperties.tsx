'use client';

import { BuilderComponent } from '@/store/builder.store';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface NewsletterPropertiesProps {
  component: BuilderComponent;
  onChange: (id: string, updates: Partial<BuilderComponent>) => void;
}

export function NewsletterProperties({ component, onChange }: NewsletterPropertiesProps) {
  const updateContent = (key: string, value: any) => {
    onChange(component.id, {
      content: {
        ...component.content,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="headline" className="text-xs">
          Headline
        </Label>
        <Input
          id="headline"
          value={component.content?.headline || ''}
          onChange={(e) => updateContent('headline', e.target.value)}
          placeholder="Subscribe to our newsletter"
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="description" className="text-xs">
          Description
        </Label>
        <Input
          id="description"
          value={component.content?.description || ''}
          onChange={(e) => updateContent('description', e.target.value)}
          placeholder="Get the latest updates"
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="placeholder" className="text-xs">
          Input Placeholder
        </Label>
        <Input
          id="placeholder"
          value={component.content?.placeholder || ''}
          onChange={(e) => updateContent('placeholder', e.target.value)}
          placeholder="Enter your email"
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="submitText" className="text-xs">
          Submit Button Text
        </Label>
        <Input
          id="submitText"
          value={component.content?.submitText || ''}
          onChange={(e) => updateContent('submitText', e.target.value)}
          placeholder="Subscribe"
          className="mt-2"
        />
      </div>
    </div>
  );
}
