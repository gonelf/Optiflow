'use client';

import { BuilderComponent } from '@/store/builder.store';
import { Label } from '@/components/ui/label';

interface PricingPropertiesProps {
  component: BuilderComponent;
  onChange: (id: string, updates: Partial<BuilderComponent>) => void;
}

export function PricingProperties({ component, onChange }: PricingPropertiesProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Pricing table configuration coming soon. Edit tiers in advanced mode.
      </p>
    </div>
  );
}
