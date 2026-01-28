'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import { Toolbar } from '@/components/builder/Toolbar';
import { ComponentPalette } from '@/components/builder/ComponentPalette';
import { Canvas } from '@/components/builder/Canvas';
import { PropertyPanel } from '@/components/builder/PropertyPanel';
import { useBuilderStore, BuilderComponent, ComponentType } from '@/store/builder.store';
import { BuilderElement } from '@/types/builder';
import { PRIMITIVE_CONFIGS, PrimitiveType } from '@/types/primitives';
import { useToast } from '@/hooks/use-toast';

export default function BuilderPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { addComponent, addElement, loadPage, setSaving, components, elements } = useBuilderStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Load page data
  useEffect(() => {
    const loadPageData = async () => {
      try {
        const pageId = params.pageId as string;

        // Fetch page data from API
        const response = await fetch(`/api/pages/${pageId}`);

        if (!response.ok) {
          throw new Error('Failed to load page');
        }

        const pageData = await response.json();

        // Load into store
        loadPage({
          id: pageData.id,
          metadata: {
            title: pageData.title,
            slug: pageData.slug,
            description: pageData.description,
            seoTitle: pageData.seoTitle,
            seoDescription: pageData.seoDescription,
            ogImage: pageData.ogImage,
            favicon: pageData.favicon,
          },
          components: pageData.components || [],
        });
      } catch (error) {
        console.error('Error loading page:', error);
        toast({
          title: 'Error',
          description: 'Failed to load page. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPageData();
  }, [params.pageId, loadPage, toast]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Check if dragging from palette
    if (active.id.toString().startsWith('palette-')) {
      const type = active.data.current?.type;
      const isPrimitive = active.data.current?.isPrimitive;

      if (isPrimitive) {
        const primitiveType = type as PrimitiveType;
        const config = PRIMITIVE_CONFIGS[primitiveType];

        const newElement: BuilderElement = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: primitiveType,
          name: config.name,
          pageId: params.pageId as string,
          parentId: null, // For now, drops on canvas are top-level
          order: elements.length,
          depth: 0,
          path: '',
          content: { ...config.defaultContent },
          styles: {
            base: { ...config.defaultStyles } as any
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        addElement(newElement);

        toast({
          title: 'Element added',
          description: `${newElement.name} has been added to your page.`,
        });
      } else {
        const componentType = type as ComponentType;

        // Create new legacy component
        const newComponent: BuilderComponent = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: componentType,
          name: getDefaultComponentName(componentType),
          order: components.length,
          config: getDefaultConfig(componentType),
          styles: getDefaultStyles(componentType),
          content: getDefaultContent(componentType),
        };

        addComponent(newComponent);

        toast({
          title: 'Component added',
          description: `${newComponent.name} has been added to your page.`,
        });
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const pageId = params.pageId as string;
      const state = useBuilderStore.getState();

      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: state.metadata.title,
          slug: state.metadata.slug,
          description: state.metadata.description,
          seoTitle: state.metadata.seoTitle,
          seoDescription: state.metadata.seoDescription,
          ogImage: state.metadata.ogImage,
          favicon: state.metadata.favicon,
          components: state.components,
          elements: state.elements,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save page');
      }

      toast({
        title: 'Page saved',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving page:', error);
      toast({
        title: 'Error',
        description: 'Failed to save page. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    const workspaceSlug = params.workspaceSlug as string;
    const pageId = params.pageId as string;
    window.open(`/${workspaceSlug}/preview/${pageId}`, '_blank');
  };

  const handleSettings = () => {
    // TODO: Open page settings modal
    toast({
      title: 'Coming soon',
      description: 'Page settings will be available soon.',
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Loading page...</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-screen flex-col">
        <Toolbar onSave={handleSave} onPreview={handlePreview} onSettings={handleSettings} />
        <div className="flex flex-1 overflow-hidden">
          <ComponentPalette />
          <Canvas />
          <PropertyPanel />
        </div>
      </div>

      <DragOverlay>
        {activeId ? (
          <div className="rounded-lg border-2 border-primary bg-white p-4 shadow-lg">
            <p className="text-sm font-medium">Dragging component...</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// Helper functions
function getDefaultComponentName(type: ComponentType): string {
  const names: Record<ComponentType, string> = {
    HERO: 'Hero Section',
    CTA: 'Call to Action',
    PRICING: 'Pricing Table',
    FEATURES: 'Features Grid',
    TESTIMONIALS: 'Testimonials',
    FAQ: 'FAQ Section',
    FORM: 'Contact Form',
    NEWSLETTER: 'Newsletter Signup',
    HEADER: 'Header',
    FOOTER: 'Footer',
    CUSTOM: 'Custom Component',
  };
  return names[type];
}

function getDefaultConfig(type: ComponentType): Record<string, any> {
  return {
    layout: 'default',
    visible: true,
  };
}

function getDefaultStyles(type: ComponentType): Record<string, any> {
  return {
    backgroundColor: '#ffffff',
    padding: 32,
    margin: 0,
  };
}

function getDefaultContent(type: ComponentType): Record<string, any> {
  const defaults: Record<ComponentType, Record<string, any>> = {
    HERO: {
      headline: 'Your Headline Here',
      subheadline: 'A compelling subheadline that explains your value proposition',
      ctaText: 'Get Started',
      ctaLink: '#',
    },
    CTA: {
      text: 'Get Started Today',
      link: '#',
      variant: 'default',
    },
    PRICING: {
      tiers: [
        {
          name: 'Basic',
          price: '$29',
          interval: 'month',
          features: ['Feature 1', 'Feature 2', 'Feature 3'],
        },
        {
          name: 'Pro',
          price: '$99',
          interval: 'month',
          features: ['All Basic features', 'Feature 4', 'Feature 5'],
          highlighted: true,
        },
      ],
    },
    FEATURES: {
      items: [
        { icon: 'check', title: 'Feature 1', description: 'Description here' },
        { icon: 'check', title: 'Feature 2', description: 'Description here' },
        { icon: 'check', title: 'Feature 3', description: 'Description here' },
      ],
    },
    TESTIMONIALS: {
      items: [
        {
          quote: 'This product changed everything for us!',
          author: 'John Doe',
          role: 'CEO',
          company: 'Company Inc.',
        },
      ],
    },
    FAQ: {
      items: [
        { question: 'What is this?', answer: 'This is an answer.' },
        { question: 'How does it work?', answer: 'It works like this.' },
      ],
    },
    FORM: {
      fields: [
        { type: 'text', label: 'Name', required: true },
        { type: 'email', label: 'Email', required: true },
        { type: 'textarea', label: 'Message', required: false },
      ],
      submitText: 'Submit',
    },
    NEWSLETTER: {
      headline: 'Subscribe to our newsletter',
      description: 'Get the latest updates delivered to your inbox',
      placeholder: 'Enter your email',
      submitText: 'Subscribe',
    },
    HEADER: {},
    FOOTER: {},
    CUSTOM: {},
  };

  return defaults[type] || {};
}
