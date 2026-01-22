'use client';

import { BuilderComponent } from '@/store/builder.store';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface HeroPropertiesProps {
  component: BuilderComponent;
  onChange: (id: string, updates: Partial<BuilderComponent>) => void;
}

export function HeroProperties({ component, onChange }: HeroPropertiesProps) {
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
          placeholder="Your Headline Here"
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="subheadline" className="text-xs">
          Subheadline
        </Label>
        <textarea
          id="subheadline"
          value={component.content?.subheadline || ''}
          onChange={(e) => updateContent('subheadline', e.target.value)}
          placeholder="A compelling subheadline"
          className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 min-h-[80px]"
        />
      </div>

      <div>
        <Label htmlFor="ctaText" className="text-xs">
          CTA Button Text
        </Label>
        <Input
          id="ctaText"
          value={component.content?.ctaText || ''}
          onChange={(e) => updateContent('ctaText', e.target.value)}
          placeholder="Get Started"
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="ctaLink" className="text-xs">
          CTA Button Link
        </Label>
        <Input
          id="ctaLink"
          value={component.content?.ctaLink || ''}
          onChange={(e) => updateContent('ctaLink', e.target.value)}
          placeholder="#"
          className="mt-2"
        />
      </div>
    </div>
  );
}
