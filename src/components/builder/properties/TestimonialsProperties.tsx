'use client';

import { BuilderComponent } from '@/store/builder.store';
import { Label } from '@/components/ui/label';

interface TestimonialsPropertiesProps {
  component: BuilderComponent;
  onChange: (id: string, updates: Partial<BuilderComponent>) => void;
}

export function TestimonialsProperties({ component, onChange }: TestimonialsPropertiesProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Testimonials configuration coming soon. Edit items in advanced mode.
      </p>
    </div>
  );
}
