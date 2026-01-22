'use client';

import { useBuilderStore } from '@/store/builder.store';
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

export function PropertyPanel() {
  const { getSelectedComponent, selectComponent, updateComponent } = useBuilderStore();
  const selectedComponent = getSelectedComponent();

  if (!selectedComponent) {
    return (
      <div className="w-80 border-l bg-gray-50 p-6">
        <div className="flex h-full items-center justify-center">
          <div className="text-center text-sm text-muted-foreground">
            <p>Select a component</p>
            <p className="mt-1">to edit its properties</p>
          </div>
        </div>
      </div>
    );
  }

  const renderProperties = () => {
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

  return (
    <div className="w-80 border-l bg-white flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h3 className="font-semibold">{selectedComponent.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {selectedComponent.type}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => selectComponent(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Component Name */}
      <div className="border-b p-4">
        <Label htmlFor="component-name" className="text-xs">
          Component Name
        </Label>
        <Input
          id="component-name"
          value={selectedComponent.name}
          onChange={(e) =>
            updateComponent(selectedComponent.id, { name: e.target.value })
          }
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
            {renderProperties()}
          </TabsContent>

          <TabsContent value="style" className="p-4">
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Background Color</Label>
                <Input
                  type="color"
                  value={selectedComponent.styles?.backgroundColor || '#ffffff'}
                  onChange={(e) =>
                    updateComponent(selectedComponent.id, {
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
                  value={selectedComponent.styles?.padding || 0}
                  onChange={(e) =>
                    updateComponent(selectedComponent.id, {
                      styles: {
                        ...selectedComponent.styles,
                        padding: parseInt(e.target.value),
                      },
                    })
                  }
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-xs">Margin (px)</Label>
                <Input
                  type="number"
                  value={selectedComponent.styles?.margin || 0}
                  onChange={(e) =>
                    updateComponent(selectedComponent.id, {
                      styles: {
                        ...selectedComponent.styles,
                        margin: parseInt(e.target.value),
                      },
                    })
                  }
                  className="mt-2"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="p-4">
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Custom CSS Classes</Label>
                <Input
                  value={selectedComponent.styles?.customClasses || ''}
                  onChange={(e) =>
                    updateComponent(selectedComponent.id, {
                      styles: {
                        ...selectedComponent.styles,
                        customClasses: e.target.value,
                      },
                    })
                  }
                  placeholder="custom-class another-class"
                  className="mt-2"
                />
              </div>

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
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
