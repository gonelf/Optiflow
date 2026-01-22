'use client';

import { BuilderComponent } from '@/store/builder.store';
import { Label } from '@/components/ui/label';

interface FAQPropertiesProps {
  component: BuilderComponent;
  onChange: (id: string, updates: Partial<BuilderComponent>) => void;
}

export function FAQProperties({ component, onChange }: FAQPropertiesProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        FAQ configuration coming soon. Edit Q&A items in advanced mode.
      </p>
    </div>
  );
}
