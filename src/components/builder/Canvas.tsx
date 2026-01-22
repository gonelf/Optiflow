'use client';

import { useBuilderStore, BuilderComponent } from '@/store/builder.store';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Trash2, Copy, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Import component renderers (we'll create these next)
import { HeroRenderer } from './components/Hero';
import { CTARenderer } from './components/CTA';
import { PricingRenderer } from './components/Pricing';
import { FeaturesRenderer } from './components/Features';
import { TestimonialsRenderer } from './components/Testimonials';
import { FAQRenderer } from './components/FAQ';
import { FormRenderer } from './components/Form';
import { NewsletterRenderer } from './components/Newsletter';

interface SortableComponentProps {
  component: BuilderComponent;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function SortableComponent({
  component,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}: SortableComponentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: component.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const renderComponent = () => {
    switch (component.type) {
      case 'HERO':
        return <HeroRenderer component={component} />;
      case 'CTA':
        return <CTARenderer component={component} />;
      case 'PRICING':
        return <PricingRenderer component={component} />;
      case 'FEATURES':
        return <FeaturesRenderer component={component} />;
      case 'TESTIMONIALS':
        return <TestimonialsRenderer component={component} />;
      case 'FAQ':
        return <FAQRenderer component={component} />;
      case 'FORM':
        return <FormRenderer component={component} />;
      case 'NEWSLETTER':
        return <NewsletterRenderer component={component} />;
      default:
        return (
          <div className="p-8 bg-gray-100 text-center">
            <p className="text-gray-500">Unknown component type: {component.type}</p>
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative transition-all',
        isSelected && 'ring-2 ring-primary ring-offset-2',
        isDragging && 'opacity-50 z-50'
      )}
      onClick={onSelect}
    >
      {/* Component Actions Overlay */}
      <div
        className={cn(
          'absolute -top-10 left-0 right-0 z-10 flex items-center justify-between rounded-t-lg bg-primary px-3 py-2 opacity-0 transition-opacity',
          isSelected && 'opacity-100'
        )}
      >
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-medium text-white">{component.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Component Content */}
      <div className="relative">{renderComponent()}</div>

      {/* Hover Overlay */}
      {!isSelected && (
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/50 pointer-events-none transition-colors" />
      )}
    </div>
  );
}

export function Canvas() {
  const { components, selectComponent, selectedComponentId, deleteComponent, duplicateComponent } =
    useBuilderStore();

  const { setNodeRef } = useDroppable({
    id: 'canvas',
  });

  return (
    <div ref={setNodeRef} className="flex-1 overflow-y-auto bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl bg-white shadow-lg min-h-screen">
        {components.length === 0 ? (
          <div className="flex h-96 items-center justify-center">
            <div className="text-center">
              <Layout className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-semibold text-gray-600">
                Start building your page
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Drag components from the left panel to get started
              </p>
            </div>
          </div>
        ) : (
          <SortableContext
            items={components.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {components
                .sort((a, b) => a.order - b.order)
                .map((component) => (
                  <SortableComponent
                    key={component.id}
                    component={component}
                    isSelected={selectedComponentId === component.id}
                    onSelect={() => selectComponent(component.id)}
                    onDelete={() => deleteComponent(component.id)}
                    onDuplicate={() => duplicateComponent(component.id)}
                  />
                ))}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  );
}

// Import Layout icon
import { Layout } from 'lucide-react';
