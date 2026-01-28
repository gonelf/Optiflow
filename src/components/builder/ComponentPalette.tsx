'use client';

import React from 'react';
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
  Box,
  LayoutTemplate,
  LayoutGrid,
  Columns,
  Type,
  Image,
  Video,
  Smile,
  MousePointer,
  Link,
  Code,
  Minus,
  Space,
  List
} from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { PRIMITIVE_CONFIGS, PrimitiveType } from '@/types/primitives';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface PaletteItem {
  type: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  isPrimitive: boolean;
}

const legacyComponents: PaletteItem[] = [
  {
    type: ComponentType.HERO,
    label: 'Hero',
    description: 'Header section with headline and CTA',
    icon: <Layout className="h-4 w-4" />,
    category: 'Templates',
    isPrimitive: false,
  },
  {
    type: ComponentType.CTA,
    label: 'Call to Action',
    description: 'Button or link with action',
    icon: <MousePointerClick className="h-4 w-4" />,
    category: 'Templates',
    isPrimitive: false,
  },
  {
    type: ComponentType.PRICING,
    label: 'Pricing',
    description: 'Pricing tables and plans',
    icon: <DollarSign className="h-4 w-4" />,
    category: 'Templates',
    isPrimitive: false,
  },
  {
    type: ComponentType.FEATURES,
    label: 'Features',
    description: 'Feature grid or list',
    icon: <Grid3x3 className="h-4 w-4" />,
    category: 'Templates',
    isPrimitive: false,
  },
  {
    type: ComponentType.TESTIMONIALS,
    label: 'Testimonials',
    description: 'Customer reviews and quotes',
    icon: <MessageSquare className="h-4 w-4" />,
    category: 'Templates',
    isPrimitive: false,
  },
  {
    type: ComponentType.FAQ,
    label: 'FAQ',
    description: 'Frequently asked questions',
    icon: <HelpCircle className="h-4 w-4" />,
    category: 'Templates',
    isPrimitive: false,
  },
  {
    type: ComponentType.FORM,
    label: 'Form',
    description: 'Contact or lead capture form',
    icon: <FileText className="h-4 w-4" />,
    category: 'Templates',
    isPrimitive: false,
  },
  {
    type: ComponentType.NEWSLETTER,
    label: 'Newsletter',
    description: 'Email subscription form',
    icon: <Mail className="h-4 w-4" />,
    category: 'Templates',
    isPrimitive: false,
  },
];

const iconMap: Record<string, React.ReactNode> = {
  Box: <Box className="h-4 w-4" />,
  LayoutTemplate: <LayoutTemplate className="h-4 w-4" />,
  LayoutGrid: <LayoutGrid className="h-4 w-4" />,
  Columns: <Columns className="h-4 w-4" />,
  Type: <Type className="h-4 w-4" />,
  FileText: <FileText className="h-4 w-4" />,
  Image: <Image className="h-4 w-4" />,
  Video: <Video className="h-4 w-4" />,
  Smile: <Smile className="h-4 w-4" />,
  MousePointer: <MousePointer className="h-4 w-4" />,
  Link: <Link className="h-4 w-4" />,
  Code: <Code className="h-4 w-4" />,
  Minus: <Minus className="h-4 w-4" />,
  Space: <Space className="h-4 w-4" />,
  List: <List className="h-4 w-4" />,
};

const primitives: PaletteItem[] = Object.values(PRIMITIVE_CONFIGS).map(config => ({
  type: config.type,
  label: config.name,
  description: config.description || '',
  icon: iconMap[config.icon] || <Box className="h-4 w-4" />,
  category: config.category.charAt(0).toUpperCase() + config.category.slice(1),
  isPrimitive: true,
}));

const allItems = [...primitives, ...legacyComponents];
const categories = Array.from(new Set(allItems.map(item => item.category)));

function DraggableItem({ item }: { item: PaletteItem }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${item.type}`,
    data: {
      type: item.type,
      isPrimitive: item.isPrimitive
    },
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
        'group cursor-grab rounded-md border bg-white p-2.5 transition-all hover:border-primary hover:shadow-sm active:cursor-grabbing',
        isDragging && 'opacity-50 ring-2 ring-primary ring-offset-1'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="rounded bg-slate-100 p-1.5 text-slate-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          {item.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[13px] truncate">{item.label}</h3>
        </div>
      </div>
    </div>
  );
}

export function ComponentPalette() {
  return (
    <div className="w-64 border-r bg-slate-50/50 flex flex-col h-full">
      <div className="p-4 border-b bg-white">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Elements Palette
        </h2>
        <p className="text-[11px] text-slate-400 mt-1">
          Drag elements to the canvas to build your page
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Accordion type="multiple" defaultValue={['Layout', 'Content']} className="w-full">
          {categories.map(category => (
            <AccordionItem key={category} value={category} className="border-none px-2">
              <AccordionTrigger className="py-3 px-2 hover:no-underline hover:bg-slate-100 rounded text-xs font-semibold text-slate-700 decoration-0">
                {category}
              </AccordionTrigger>
              <AccordionContent className="pt-1 pb-4 border-none">
                <div className="grid grid-cols-1 gap-2 px-1">
                  {allItems
                    .filter(item => item.category === category)
                    .map(item => (
                      <DraggableItem key={item.type} item={item} />
                    ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
