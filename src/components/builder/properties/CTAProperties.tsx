'use client';

import { BuilderComponent } from '@/store/builder.store';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface CTAPropertiesProps {
  component: BuilderComponent;
  onChange: (id: string, updates: Partial<BuilderComponent>) => void;
}

export function CTAProperties({ component, onChange }: CTAPropertiesProps) {
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
        <Label htmlFor="text" className="text-xs">
          Button Text
        </Label>
        <Input
          id="text"
          value={component.content?.text || ''}
          onChange={(e) => updateContent('text', e.target.value)}
          placeholder="Get Started Today"
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="link" className="text-xs">
          Button Link
        </Label>
        <Input
          id="link"
          value={component.content?.link || ''}
          onChange={(e) => updateContent('link', e.target.value)}
          placeholder="#"
          className="mt-2"
        />
      </div>
    </div>
  );
}
