'use client';

import { BuilderComponent } from '@/store/builder.store';
import { Label } from '@/components/ui/label';

interface FeaturesPropertiesProps {
  component: BuilderComponent;
  onChange: (id: string, updates: Partial<BuilderComponent>) => void;
}

export function FeaturesProperties({ component, onChange }: FeaturesPropertiesProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Features grid configuration coming soon. Edit items in advanced mode.
      </p>
    </div>
  );
}
