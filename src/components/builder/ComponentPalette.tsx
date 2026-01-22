'use client';

import { ComponentType } from '@/store/builder.store';
import {
  Layout,
  MousePointerClick,
  DollarSign,
  Grid3x3,
  MessageSquare,
  HelpCircle,
  FileText,
  Mail,
} from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface ComponentPaletteItem {
  type: ComponentType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const components: ComponentPaletteItem[] = [
  {
    type: ComponentType.HERO,
    label: 'Hero',
    description: 'Header section with headline and CTA',
    icon: <Layout className="h-5 w-5" />,
  },
  {
    type: ComponentType.CTA,
    label: 'Call to Action',
    description: 'Button or link with action',
    icon: <MousePointerClick className="h-5 w-5" />,
  },
  {
    type: ComponentType.PRICING,
    label: 'Pricing',
    description: 'Pricing tables and plans',
    icon: <DollarSign className="h-5 w-5" />,
  },
  {
    type: ComponentType.FEATURES,
    label: 'Features',
    description: 'Feature grid or list',
    icon: <Grid3x3 className="h-5 w-5" />,
  },
  {
    type: ComponentType.TESTIMONIALS,
    label: 'Testimonials',
    description: 'Customer reviews and quotes',
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    type: ComponentType.FAQ,
    label: 'FAQ',
    description: 'Frequently asked questions',
    icon: <HelpCircle className="h-5 w-5" />,
  },
  {
    type: ComponentType.FORM,
    label: 'Form',
    description: 'Contact or lead capture form',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    type: ComponentType.NEWSLETTER,
    label: 'Newsletter',
    description: 'Email subscription form',
    icon: <Mail className="h-5 w-5" />,
  },
];

function DraggableComponent({ item }: { item: ComponentPaletteItem }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${item.type}`,
    data: { type: item.type },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'group cursor-grab rounded-lg border bg-white p-3 transition-all hover:border-primary hover:shadow-md',
        isDragging && 'opacity-50'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-primary/10 p-2 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
          {item.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-sm">{item.label}</h3>
          <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
        </div>
      </div>
    </div>
  );
}

export function ComponentPalette() {
  return (
    <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
      <div className="mb-4">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground">
          Components
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Drag components to the canvas
        </p>
      </div>

      <div className="space-y-2">
        {components.map((item) => (
          <DraggableComponent key={item.type} item={item} />
        ))}
      </div>
    </div>
  );
}
