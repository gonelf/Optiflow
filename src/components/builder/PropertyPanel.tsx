'use client';

import { useBuilderStore } from '@/store/builder.store';
import { ElementStyles } from '@/types/styles';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Property editors for different component types
import { HeroProperties } from './properties/HeroProperties';
import { CTAProperties } from './properties/CTAProperties';
import { PricingProperties } from './properties/PricingProperties';
import { FeaturesProperties } from './properties/FeaturesProperties';
import { TestimonialsProperties } from './properties/TestimonialsProperties';
import { FAQProperties } from './properties/FAQProperties';
import { FormProperties } from './properties/FormProperties';
import { NewsletterProperties } from './properties/NewsletterProperties';

// Phase 8 Style Panels
import {
  BoxModelEditor,
  LayoutPanel,
  TypographyPanel,
  SizingPanel,
  BorderPanel,
  BackgroundPanel
} from './style-panel';

export function PropertyPanel() {
  const {
    getSelectedComponent,
    getSelectedElement,
    selectComponent,
    selectElement,
    updateComponent,
    updateElement,
    viewport
  } = useBuilderStore();

  const selectedComponent = getSelectedComponent();
  const selectedElement = getSelectedElement();
  const currentBreakpoint = viewport.breakpoint;

  const isElement = !!selectedElement;
  const item = selectedElement || selectedComponent;

  if (!item) {
    return (
      <div className="w-80 border-l bg-gray-50 p-6">
        <div className="flex h-full items-center justify-center">
          <div className="text-center text-sm text-muted-foreground">
            <p>Select an element or component</p>
            <p className="mt-1">to edit its properties</p>
          </div>
        </div>
      </div>
    );
  }

  const handleStyleChange = (updates: Partial<ElementStyles>) => {
    if (!selectedElement) return;

    const currentStyles = selectedElement.styles[currentBreakpoint] || {};

    updateElement(selectedElement.id, {
      styles: {
        ...selectedElement.styles,
        [currentBreakpoint]: {
          ...currentStyles,
          ...updates,
        },
      },
    });
  };

  const renderComponentProperties = () => {
    if (!selectedComponent) return null;

    switch (selectedComponent.type) {
      case 'HERO':
        return <HeroProperties component={selectedComponent} onChange={updateComponent} />;
      case 'CTA':
        return <CTAProperties component={selectedComponent} onChange={updateComponent} />;
      case 'PRICING':
        return <PricingProperties component={selectedComponent} onChange={updateComponent} />;
      case 'FEATURES':
        return <FeaturesProperties component={selectedComponent} onChange={updateComponent} />;
      case 'TESTIMONIALS':
        return <TestimonialsProperties component={selectedComponent} onChange={updateComponent} />;
      case 'FAQ':
        return <FAQProperties component={selectedComponent} onChange={updateComponent} />;
      case 'FORM':
        return <FormProperties component={selectedComponent} onChange={updateComponent} />;
      case 'NEWSLETTER':
        return <NewsletterProperties component={selectedComponent} onChange={updateComponent} />;
      default:
        return <div className="p-4 text-sm text-muted-foreground">No properties available</div>;
    }
  };

  const renderElementProperties = () => {
    if (!selectedElement) return null;

    // TODO: Create specific property editors for primitives (TextProperties, ImageProperties, etc.)
    return (
      <div className="space-y-4">
        <div className="p-4 bg-muted/50 rounded-md border text-xs text-muted-foreground">
          Property editors for <strong>{selectedElement.type}</strong> primitives are coming soon. Use the Style tab for visual control.
        </div>
      </div>
    );
  };

  const handleNameChange = (newName: string) => {
    if (isElement && selectedElement) {
      updateElement(selectedElement.id, { name: newName });
    } else if (selectedComponent) {
      updateComponent(selectedComponent.id, { name: newName });
    }
  };

  const handleClose = () => {
    if (isElement) {
      selectElement(null);
    } else {
      selectComponent(null);
    }
  };

  return (
    <div className="w-80 border-l bg-white flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {item.type}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Item Name */}
      <div className="border-b p-4">
        <Label htmlFor="item-name" className="text-xs">
          {isElement ? 'Element Name' : 'Component Name'}
        </Label>
        <Input
          id="item-name"
          value={item.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="mt-2"
        />
      </div>

      {/* Properties Tabs */}
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="content"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Content
            </TabsTrigger>
            <TabsTrigger
              value="style"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Style
            </TabsTrigger>
            <TabsTrigger
              value="advanced"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="p-4">
            {isElement ? renderElementProperties() : renderComponentProperties()}
          </TabsContent>

          <TabsContent value="style" className="p-0">
            {isElement && selectedElement ? (
              <div className="divide-y p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-250px)]">
                <LayoutPanel
                  styles={selectedElement.styles[currentBreakpoint] || {}}
                  onChange={handleStyleChange}
                />
                <SizingPanel
                  styles={selectedElement.styles[currentBreakpoint] || {}}
                  onChange={handleStyleChange}
                />
                <BoxModelEditor
                  styles={selectedElement.styles[currentBreakpoint] || {}}
                  onChange={handleStyleChange}
                />
                <TypographyPanel
                  styles={selectedElement.styles[currentBreakpoint] || {}}
                  onChange={handleStyleChange}
                />
                <BackgroundPanel
                  styles={selectedElement.styles[currentBreakpoint] || {}}
                  onChange={handleStyleChange}
                />
                <BorderPanel
                  styles={selectedElement.styles[currentBreakpoint] || {}}
                  onChange={handleStyleChange}
                />
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {/* Legacy style controls for components */}
                <div>
                  <Label className="text-xs">Background Color</Label>
                  <Input
                    type="color"
                    value={selectedComponent?.styles?.backgroundColor || '#ffffff'}
                    onChange={(e) =>
                      selectedComponent && updateComponent(selectedComponent.id, {
                        styles: {
                          ...selectedComponent.styles,
                          backgroundColor: e.target.value,
                        },
                      })
                    }
                    className="mt-2 h-10"
                  />
                </div>

                <div>
                  <Label className="text-xs">Padding (px)</Label>
                  <Input
                    type="number"
                    value={selectedComponent?.styles?.padding || 0}
                    onChange={(e) =>
                      selectedComponent && updateComponent(selectedComponent.id, {
                        styles: {
                          ...selectedComponent.styles,
                          padding: parseInt(e.target.value),
                        },
                      })
                    }
                    className="mt-2"
                  />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="p-4">
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Custom CSS Classes</Label>
                <Input
                  value={isElement ? (selectedElement?.className || '') : (selectedComponent?.styles?.customClasses || '')}
                  onChange={(e) => {
                    if (isElement && selectedElement) {
                      updateElement(selectedElement.id, { className: e.target.value });
                    } else if (selectedComponent) {
                      updateComponent(selectedComponent.id, {
                        styles: { ...selectedComponent.styles, customClasses: e.target.value }
                      });
                    }
                  }}
                  placeholder="custom-class another-class"
                  className="mt-2"
                />
              </div>

              {!isElement && selectedComponent && (
                <div>
                  <Label className="text-xs">Custom ID</Label>
                  <Input
                    value={selectedComponent.config?.customId || ''}
                    onChange={(e) =>
                      updateComponent(selectedComponent.id, {
                        config: {
                          ...selectedComponent.config,
                          customId: e.target.value,
                        },
                      })
                    }
                    placeholder="my-component"
                    className="mt-2"
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
