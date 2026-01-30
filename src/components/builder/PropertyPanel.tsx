'use client';

import { useBuilderStore } from '@/store/builder.store';
import { ElementStyles } from '@/types/styles';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ElementActions } from './ElementActions';

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

  const handleAIUpdate = (updatedElement: any) => {
    if (updatedElement && selectedElement) {
      updateElement(selectedElement.id, {
        content: updatedElement.content,
        styles: updatedElement.styles,
      });
    }
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

    const handleContentChange = (key: string, value: any) => {
      updateElement(selectedElement.id, {
        content: {
          ...(selectedElement.content as any),
          [key]: value,
        },
      });
    };

    // Cast to any for flexible access across different element types
    const content = selectedElement.content as any;

    return (
      <div className="space-y-6">
        {/* Common Properties */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase text-muted-foreground">Element Type</Label>
          <div className="text-sm font-medium capitalize">{selectedElement.type}</div>
        </div>

        {/* Text Content */}
        {(selectedElement.type === 'text' || selectedElement.type === 'button') && (
          <div className="space-y-2">
            <Label className="text-xs">Text Content</Label>
            <Input
              value={content?.content || ''}
              onChange={(e) => handleContentChange('content', e.target.value)}
              placeholder="Enter text..."
            />
          </div>
        )}

        {/* Image Properties */}
        {selectedElement.type === 'image' && (
          <>
            <div className="space-y-2">
              <Label className="text-xs">Image Source</Label>
              <div className="flex gap-2">
                <Input
                  value={content?.src || ''}
                  onChange={(e) => handleContentChange('src', e.target.value)}
                  placeholder="https://..."
                />
                <Button variant="outline" size="icon" className="shrink-0">
                  <span className="sr-only">Upload</span>
                  {/* Icon placeholder */}
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.81825 1.18188C7.64251 1.00615 7.35759 1.00615 7.18185 1.18188L4.18185 4.18188C4.00611 4.35761 4.00611 4.64254 4.18185 4.81828C4.35759 4.99401 4.64251 4.99401 4.81825 4.81828L7.05005 2.58648V9.49996C7.05005 9.74849 7.25152 9.94996 7.50005 9.94996C7.74858 9.94996 7.95005 9.74849 7.95005 9.49996V2.58648L10.1819 4.81828C10.3576 4.99401 10.6425 4.99401 10.8182 4.81828C10.994 4.64254 10.994 4.35761 10.8182 4.18188L7.81825 1.18188ZM2.5 9.99997C2.77614 9.99997 3 10.2238 3 10.5V12C3 12.5523 3.44772 13 4 13H11C11.5523 13 12 12.5523 12 12V10.5C12 10.2238 12.2239 9.99997 12.5 9.99997C12.7761 9.99997 13 10.2238 13 10.5V12C13 13.1046 12.1046 14 11 14H4C2.89543 14 2 13.1046 2 12V10.5C2 10.2238 2.22386 9.99997 2.5 9.99997Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Alt Text</Label>
              <Input
                value={content?.alt || ''}
                onChange={(e) => handleContentChange('alt', e.target.value)}
                placeholder="Description for accessibility"
              />
            </div>
          </>
        )}

        {/* Link Properties */}
        {(selectedElement.type === 'link' || content?.tagName === 'a') && (
          <div className="space-y-2">
            <Label className="text-xs">Link URL</Label>
            <Input
              value={content?.href || ''}
              onChange={(e) => handleContentChange('href', e.target.value)}
              placeholder="https://... or /path"
            />
          </div>
        )}

        {/* Container Properties */}
        {selectedElement.type === 'container' && (
          <div className="p-4 bg-muted/30 rounded border text-xs">
            Style this container using the <strong>Style</strong> tab.
          </div>
        )}
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
        <div className="flex items-center gap-1">
          {isElement && selectedElement && (
            <ElementActions
              elementId={selectedElement.id}
              onActionComplete={handleClose}
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
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
