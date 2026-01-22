'use client';

import { BuilderComponent } from '@/store/builder.store';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface FormPropertiesProps {
  component: BuilderComponent;
  onChange: (id: string, updates: Partial<BuilderComponent>) => void;
}

export function FormProperties({ component, onChange }: FormPropertiesProps) {
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
        <Label htmlFor="submitText" className="text-xs">
          Submit Button Text
        </Label>
        <Input
          id="submitText"
          value={component.content?.submitText || ''}
          onChange={(e) => updateContent('submitText', e.target.value)}
          placeholder="Submit"
          className="mt-2"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Form fields configuration coming soon. Edit fields in advanced mode.
      </p>
    </div>
  );
}
