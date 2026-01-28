'use client';

import React from 'react';
import { useBuilderStore, BuilderComponent } from '@/store/builder.store';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Trash2, Copy, GripVertical, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BuilderElement } from '@/types/builder';
import * as Primitives from './primitives';

// Import legacy component renderers
import { HeroRenderer } from './components/Hero';
import { CTARenderer } from './components/CTA';
import { PricingRenderer } from './components/Pricing';
import { FeaturesRenderer } from './components/Features';
import { TestimonialsRenderer } from './components/Testimonials';
import { FAQRenderer } from './components/FAQ';
import { FormRenderer } from './components/Form';
import { NewsletterRenderer } from './components/Newsletter';

// --- Legacy Component Renderer ---

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
      case 'HERO': return <HeroRenderer component={component} />;
      case 'CTA': return <CTARenderer component={component} />;
      case 'PRICING': return <PricingRenderer component={component} />;
      case 'FEATURES': return <FeaturesRenderer component={component} />;
      case 'TESTIMONIALS': return <TestimonialsRenderer component={component} />;
      case 'FAQ': return <FAQRenderer component={component} />;
      case 'FORM': return <FormRenderer component={component} />;
      case 'NEWSLETTER': return <NewsletterRenderer component={component} />;
      default:
        return (
          <div className="p-8 bg-muted/50 text-center">
            <p className="text-muted-foreground">Unknown component type: {component.type}</p>
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
      <div
        className={cn(
          'absolute -top-10 left-0 right-0 z-10 flex items-center justify-between rounded-t-lg bg-primary px-3 py-2 opacity-0 transition-opacity whitespace-nowrap',
          isSelected && 'opacity-100'
        )}
      >
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-medium text-primary-foreground">{component.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-primary-foreground hover:bg-white/20" onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
            <Copy className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-primary-foreground hover:bg-white/20" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="relative">{renderComponent()}</div>
      {!isSelected && (
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/50 pointer-events-none transition-colors" />
      )}
    </div>
  );
}

// --- Phase 8 Element Renderer (Recursive) ---

interface ElementRendererProps {
  element: BuilderElement;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  breakpoint: Breakpoint;
}

function ElementRenderer({
  element,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  breakpoint,
}: ElementRendererProps) {
  const { getElementsByParentId } = useBuilderStore();
  const children = getElementsByParentId(element.id);

  // @ts-ignore - dynamic primitive lookup
  const PrimitiveComponent = Primitives[element.type.toUpperCase() as keyof typeof Primitives]
    // @ts-ignore
    || Primitives[element.type as keyof typeof Primitives];

  if (!PrimitiveComponent) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded text-destructive text-xs">
        Unknown element type: {element.type}
      </div>
    );
  }

  const childElements = children.map((child) => (
    <ElementRenderer
      key={child.id}
      element={child}
      isSelected={useBuilderStore.getState().selection.selectedElementIds.includes(child.id)}
      isHovered={useBuilderStore.getState().selection.hoveredElementId === child.id}
      onSelect={onSelect}
      onHover={onHover}
      breakpoint={breakpoint}
    />
  ));

  return (
    <div
      className="relative group/element"
      onMouseEnter={(e) => { e.stopPropagation(); onHover(element.id); }}
      onMouseLeave={(e) => { e.stopPropagation(); onHover(null); }}
    >
      {(isSelected || isHovered) && (
        <div className={cn(
          "absolute inset-0 pointer-events-none z-10",
          isSelected ? "ring-2 ring-primary ring-offset-1" : "ring-1 ring-primary/50"
        )} />
      )}

      {isHovered && !isSelected && (
        <div className="absolute -top-5 left-0 z-20 px-1.5 py-0.5 bg-primary text-primary-foreground text-[10px] rounded-t font-medium">
          {element.name}
        </div>
      )}

      <PrimitiveComponent
        element={element}
        breakpoint={breakpoint}
        isBuilder={true}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          onSelect(element.id);
        }}
      >
        {childElements}
      </PrimitiveComponent>
    </div>
  );
}

// --- Main Canvas ---

import { Breakpoint } from '@/types/styles';

export function Canvas() {
  const {
    components,
    elements,
    selection,
    viewport,
    selectComponent,
    selectElement,
    setHoveredElement,
    deleteComponent,
    duplicateComponent
  } = useBuilderStore();

  const { setNodeRef } = useDroppable({
    id: 'canvas',
  });

  const isPhase8 = elements.length > 0;

  return (
    <div ref={setNodeRef} className="flex-1 overflow-auto bg-slate-100 flex items-start justify-center p-8">
      <div
        className={cn(
          "bg-white shadow-2xl min-h-[calc(100vh-8rem)] transition-all origin-top",
          viewport.deviceFrame === 'mobile' && 'w-[375px]',
          viewport.deviceFrame === 'tablet' && 'w-[768px]',
          viewport.deviceFrame === 'desktop' && 'w-full max-w-6xl',
          viewport.deviceFrame === 'none' && 'w-full max-w-5xl'
        )}
        style={{
          transform: `scale(${viewport.zoom})`,
          minHeight: '100%'
        }}
      >
        {!isPhase8 && components.length === 0 && (
          <div className="flex h-96 items-center justify-center">
            <div className="text-center">
              <Layout className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <h3 className="mt-4 text-lg font-semibold text-foreground/70">Start building your page</h3>
              <p className="mt-2 text-sm text-muted-foreground">Drag components or elements to get started</p>
            </div>
          </div>
        )}

        {!isPhase8 && components.length > 0 && (
          <SortableContext items={components.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-0.5">
              {components
                .sort((a, b) => a.order - b.order)
                .map((component) => (
                  <SortableComponent
                    key={component.id}
                    component={component}
                    isSelected={useBuilderStore.getState().selectedComponentId === component.id}
                    onSelect={() => selectComponent(component.id)}
                    onDelete={() => deleteComponent(component.id)}
                    onDuplicate={() => duplicateComponent(component.id)}
                  />
                ))}
            </div>
          </SortableContext>
        )}

        {isPhase8 && (
          <div className="relative min-h-screen">
            {elements
              .filter(el => !el.parentId)
              .sort((a, b) => a.order - b.order)
              .map((element) => (
                <ElementRenderer
                  key={element.id}
                  element={element}
                  isSelected={selection.selectedElementIds.includes(element.id)}
                  isHovered={selection.hoveredElementId === element.id}
                  onSelect={selectElement}
                  onHover={setHoveredElement}
                  breakpoint={viewport.breakpoint}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
