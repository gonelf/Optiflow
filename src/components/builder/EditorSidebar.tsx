'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  PanelRightClose,
  PanelRightOpen,
  Settings2,
  LayoutGrid,
  Bookmark,
  X,
  Type,
  Square,
  CreditCard,
  AlertCircle,
  FileText,
  Layers,
  Layout,
  Search,
  Plus
} from 'lucide-react';
import { Element } from '@prisma/client';
import { AIEditPopover } from '@/components/builder/ai/AIEditPopover';
import { ElementActions } from '@/components/builder/ElementActions';
import { styleObjectToString, stringToStyleObject } from '@/lib/css';
import {
  BoxModelEditor,
  LayoutPanel,
  TypographyPanel,
  SizingPanel,
  BorderPanel,
  BackgroundPanel
} from '@/components/builder/style-panel';
import { useBuilderStore } from '@/store/builder.store';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface ExtendedElement extends Element {
  children?: ExtendedElement[];
}

interface EditorSidebarProps {
  selectedElementId: string | null;
  elements: ExtendedElement[];
  onElementUpdate: (id: string, updates: Partial<Element>) => void;
  onElementSelect: (id: string | null) => void;
  onAddElement: (element: any, targetId?: string | null) => void;
  setElements: (elements: ExtendedElement[]) => void;
}

// Tailwind elements library
interface TailwindElement {
  id: string;
  name: string;
  type: string;
  category: string;
  icon: any;
  template: {
    type: string;
    name: string;
    tagName?: string;
    content: any;
    styles: any;
    className: string;
  };
  preview: string;
}

const TAILWIND_ELEMENTS: TailwindElement[] = [
  // Typography
  {
    id: 'tw-heading',
    name: 'Heading',
    type: 'text',
    category: 'typography',
    icon: Type,
    template: {
      type: 'text',
      name: 'Heading',
      tagName: 'h2',
      content: { tagName: 'h2', content: 'Heading Text' },
      styles: {},
      className: 'text-3xl font-bold text-gray-900'
    },
    preview: 'Large heading with bold weight'
  },
  {
    id: 'tw-subheading',
    name: 'Subheading',
    type: 'text',
    category: 'typography',
    icon: Type,
    template: {
      type: 'text',
      name: 'Subheading',
      tagName: 'h3',
      content: { tagName: 'h3', content: 'Subheading Text' },
      styles: {},
      className: 'text-xl font-semibold text-gray-800'
    },
    preview: 'Medium heading with semibold weight'
  },
  {
    id: 'tw-paragraph',
    name: 'Paragraph',
    type: 'text',
    category: 'typography',
    icon: FileText,
    template: {
      type: 'text',
      name: 'Paragraph',
      tagName: 'p',
      content: { tagName: 'p', content: 'This is a paragraph of text. You can edit this content.' },
      styles: {},
      className: 'text-base text-gray-600 leading-relaxed'
    },
    preview: 'Body text with relaxed line height'
  },
  {
    id: 'tw-lead-text',
    name: 'Lead Text',
    type: 'text',
    category: 'typography',
    icon: FileText,
    template: {
      type: 'text',
      name: 'Lead Text',
      tagName: 'p',
      content: { tagName: 'p', content: 'This is lead text that stands out from regular paragraphs.' },
      styles: {},
      className: 'text-lg text-gray-700 leading-8'
    },
    preview: 'Larger body text for emphasis'
  },
  // Buttons
  {
    id: 'tw-btn-primary',
    name: 'Primary Button',
    type: 'button',
    category: 'buttons',
    icon: Square,
    template: {
      type: 'button',
      name: 'Primary Button',
      content: { content: 'Click me' },
      styles: {},
      className: 'px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors'
    },
    preview: 'Solid blue button'
  },
  {
    id: 'tw-btn-secondary',
    name: 'Secondary Button',
    type: 'button',
    category: 'buttons',
    icon: Square,
    template: {
      type: 'button',
      name: 'Secondary Button',
      content: { content: 'Learn More' },
      styles: {},
      className: 'px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors'
    },
    preview: 'Gray outline button'
  },
  {
    id: 'tw-btn-outline',
    name: 'Outline Button',
    type: 'button',
    category: 'buttons',
    icon: Square,
    template: {
      type: 'button',
      name: 'Outline Button',
      content: { content: 'Get Started' },
      styles: {},
      className: 'px-6 py-3 border-2 border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors'
    },
    preview: 'Bordered button'
  },
  {
    id: 'tw-btn-ghost',
    name: 'Ghost Button',
    type: 'button',
    category: 'buttons',
    icon: Square,
    template: {
      type: 'button',
      name: 'Ghost Button',
      content: { content: 'Ghost' },
      styles: {},
      className: 'px-6 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors'
    },
    preview: 'Minimal hover button'
  },
  // Cards
  {
    id: 'tw-card-simple',
    name: 'Simple Card',
    type: 'container',
    category: 'cards',
    icon: CreditCard,
    template: {
      type: 'container',
      name: 'Container',
      content: {},
      styles: {},
      className: 'p-6 bg-white border border-gray-200 rounded-lg shadow-sm'
    },
    preview: 'White card with subtle border'
  },
  {
    id: 'tw-card-elevated',
    name: 'Elevated Card',
    type: 'container',
    category: 'cards',
    icon: CreditCard,
    template: {
      type: 'container',
      name: 'Container',
      content: {},
      styles: {},
      className: 'p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow'
    },
    preview: 'Card with prominent shadow'
  },
  {
    id: 'tw-card-gradient',
    name: 'Gradient Card',
    type: 'container',
    category: 'cards',
    icon: CreditCard,
    template: {
      type: 'container',
      name: 'Container',
      content: {},
      styles: {},
      className: 'p-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg shadow-lg'
    },
    preview: 'Card with gradient background'
  },
  // Containers
  {
    id: 'tw-section',
    name: 'Section',
    type: 'container',
    category: 'layout',
    icon: Layout,
    template: {
      type: 'container',
      name: 'Section',
      tagName: 'section',
      content: { tagName: 'section' },
      styles: {},
      className: 'py-16 px-4'
    },
    preview: 'Spacious section container'
  },
  {
    id: 'tw-container',
    name: 'Container',
    type: 'container',
    category: 'layout',
    icon: Layout,
    template: {
      type: 'container',
      name: 'Container',
      content: {},
      styles: {},
      className: 'max-w-7xl mx-auto px-4'
    },
    preview: 'Centered max-width container'
  },
  {
    id: 'tw-flex-row',
    name: 'Flex Row',
    type: 'container',
    category: 'layout',
    icon: Layers,
    template: {
      type: 'container',
      name: 'Container',
      content: {},
      styles: {},
      className: 'flex flex-row gap-4 items-center'
    },
    preview: 'Horizontal flex layout'
  },
  {
    id: 'tw-flex-col',
    name: 'Flex Column',
    type: 'container',
    category: 'layout',
    icon: Layers,
    template: {
      type: 'container',
      name: 'Container',
      content: {},
      styles: {},
      className: 'flex flex-col gap-4'
    },
    preview: 'Vertical flex layout'
  },
  {
    id: 'tw-grid-2',
    name: 'Grid 2 Columns',
    type: 'container',
    category: 'layout',
    icon: Layers,
    template: {
      type: 'container',
      name: 'Container',
      content: {},
      styles: {},
      className: 'grid grid-cols-1 md:grid-cols-2 gap-6'
    },
    preview: 'Responsive 2-column grid'
  },
  {
    id: 'tw-grid-3',
    name: 'Grid 3 Columns',
    type: 'container',
    category: 'layout',
    icon: Layers,
    template: {
      type: 'container',
      name: 'Container',
      content: {},
      styles: {},
      className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    },
    preview: 'Responsive 3-column grid'
  },
  // Alerts & Messages
  {
    id: 'tw-alert-info',
    name: 'Info Alert',
    type: 'container',
    category: 'alerts',
    icon: AlertCircle,
    template: {
      type: 'container',
      name: 'Container',
      content: {},
      styles: {},
      className: 'p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded'
    },
    preview: 'Blue informational alert'
  },
  {
    id: 'tw-alert-success',
    name: 'Success Alert',
    type: 'container',
    category: 'alerts',
    icon: AlertCircle,
    template: {
      type: 'container',
      name: 'Container',
      content: {},
      styles: {},
      className: 'p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded'
    },
    preview: 'Green success alert'
  },
  {
    id: 'tw-alert-warning',
    name: 'Warning Alert',
    type: 'container',
    category: 'alerts',
    icon: AlertCircle,
    template: {
      type: 'container',
      name: 'Container',
      content: {},
      styles: {},
      className: 'p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 rounded'
    },
    preview: 'Yellow warning alert'
  },
  {
    id: 'tw-alert-error',
    name: 'Error Alert',
    type: 'container',
    category: 'alerts',
    icon: AlertCircle,
    template: {
      type: 'container',
      name: 'Container',
      content: {},
      styles: {},
      className: 'p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded'
    },
    preview: 'Red error alert'
  },
  // Badges
  {
    id: 'tw-badge-default',
    name: 'Badge',
    type: 'text',
    category: 'badges',
    icon: Square,
    template: {
      type: 'text',
      name: 'Badge',
      tagName: 'span',
      content: { tagName: 'span', content: 'New' },
      styles: {},
      className: 'inline-block px-3 py-1 text-xs font-semibold bg-gray-200 text-gray-800 rounded-full'
    },
    preview: 'Small rounded badge'
  },
  {
    id: 'tw-badge-primary',
    name: 'Primary Badge',
    type: 'text',
    category: 'badges',
    icon: Square,
    template: {
      type: 'text',
      name: 'Primary Badge',
      tagName: 'span',
      content: { tagName: 'span', content: 'Featured' },
      styles: {},
      className: 'inline-block px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded-full'
    },
    preview: 'Blue badge'
  },
];

const ELEMENT_CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'typography', name: 'Typography' },
  { id: 'buttons', name: 'Buttons' },
  { id: 'cards', name: 'Cards' },
  { id: 'layout', name: 'Layout' },
  { id: 'alerts', name: 'Alerts' },
  { id: 'badges', name: 'Badges' },
];

// Draggable pool item component
function DraggablePoolItem({ element, onAdd, onRemove }: {
  element: any;
  onAdd: (element: any) => void;
  onRemove: (elementId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `pool-${element.id}`,
    data: {
      type: element.type,
      isPrimitive: true,
      isFromPool: true,
      element: element,
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
        'group relative border rounded-lg p-3 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50 ring-2 ring-primary ring-offset-1'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium capitalize bg-muted px-2 py-0.5 rounded">
              {element.type}
            </span>
          </div>
          <p className="text-sm font-medium truncate">{element.name}</p>
          {element.content && typeof element.content === 'object' && 'content' in element.content && (
            <p className="text-xs text-muted-foreground truncate mt-1">
              {(element.content as any).content || (element.content as any).src || ''}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-primary hover:bg-primary/10"
            title="Add to canvas"
            onClick={(e) => {
              e.stopPropagation();
              onAdd(element);
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            title="Remove from pool"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(element.id);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Drag to add to canvas
      </div>
    </div>
  );
}

export function EditorSidebar({
  selectedElementId,
  elements,
  onElementUpdate,
  onElementSelect,
  onAddElement,
  setElements,
}: EditorSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('elements');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const { elementPool, removeFromPool, clearPool } = useBuilderStore();

  // Find selected element in tree
  const findElement = (els: ExtendedElement[]): ExtendedElement | null => {
    for (const el of els) {
      if (el.id === selectedElementId) return el;
      if (el.children) {
        const found = findElement(el.children);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedElement = selectedElementId ? findElement(elements) : null;

  // Auto-switch to properties tab when element is selected
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Switch to properties when an element is selected
  if (selectedElement && activeTab !== 'properties') {
    // Delay the switch to avoid render issues
    setTimeout(() => setActiveTab('properties'), 0);
  }

  // Filter elements for the library
  const filteredElements = TAILWIND_ELEMENTS.filter(element => {
    const matchesSearch = element.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || element.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Collapsed state
  if (isCollapsed) {
    return (
      <div className="w-12 border-l bg-white flex flex-col items-center py-2 gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(false)}
          className="h-8 w-8 p-0"
          title="Expand sidebar"
        >
          <PanelRightOpen className="h-4 w-4" />
        </Button>
        <div className="h-px w-6 bg-gray-200 my-1" />
        <Button
          variant={activeTab === 'properties' && selectedElement ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => { setIsCollapsed(false); setActiveTab('properties'); }}
          className="h-8 w-8 p-0"
          title="Properties"
          disabled={!selectedElement}
        >
          <Settings2 className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTab === 'elements' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => { setIsCollapsed(false); setActiveTab('elements'); }}
          className="h-8 w-8 p-0"
          title="Elements"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTab === 'saved' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => { setIsCollapsed(false); setActiveTab('saved'); }}
          className="h-8 w-8 p-0"
          title="Saved Elements"
        >
          <Bookmark className="h-4 w-4" />
          {elementPool.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px] bg-primary text-white rounded-full flex items-center justify-center">
              {elementPool.length}
            </span>
          )}
        </Button>
      </div>
    );
  }

  const content = selectedElement?.content as any;
  const styles = (selectedElement?.styles || {}) as any;

  const handleStyleChange = (newStyles: any) => {
    if (selectedElement) {
      onElementUpdate(selectedElement.id, {
        styles: {
          ...styles,
          ...newStyles
        }
      });
    }
  };

  const handleCssChange = (css: string) => {
    if (selectedElement) {
      const newStyles = stringToStyleObject(css);
      onElementUpdate(selectedElement.id, {
        styles: newStyles,
      });
    }
  };

  const handleAIUpdate = (updatedElement: any) => {
    if (selectedElement) {
      onElementUpdate(selectedElement.id, {
        content: updatedElement.content,
        styles: updatedElement.styles,
      });
    }
  };

  return (
    <div className="w-80 border-l bg-white flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50/50">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1">
          <TabsList className="grid grid-cols-3 h-8">
            <TabsTrigger
              value="properties"
              className="text-xs px-2 data-[state=active]:bg-white"
              disabled={!selectedElement}
            >
              <Settings2 className="h-3.5 w-3.5 mr-1" />
              Props
            </TabsTrigger>
            <TabsTrigger value="elements" className="text-xs px-2 data-[state=active]:bg-white">
              <LayoutGrid className="h-3.5 w-3.5 mr-1" />
              Add
            </TabsTrigger>
            <TabsTrigger value="saved" className="text-xs px-2 data-[state=active]:bg-white relative">
              <Bookmark className="h-3.5 w-3.5 mr-1" />
              Saved
              {elementPool.length > 0 && (
                <span className="ml-1 h-4 min-w-4 px-1 text-[10px] bg-primary text-white rounded-full flex items-center justify-center">
                  {elementPool.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(true)}
          className="h-8 w-8 p-0 ml-2"
          title="Collapse sidebar"
        >
          <PanelRightClose className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {/* Properties Tab */}
        {activeTab === 'properties' && selectedElement && (
          <div className="flex flex-col h-full">
            {/* Element Header */}
            <div className="flex items-center justify-between p-3 border-b">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedElement.name || selectedElement.type}</p>
                  <p className="text-xs text-muted-foreground capitalize">{selectedElement.type}</p>
                </div>
                <AIEditPopover element={selectedElement} onUpdate={handleAIUpdate} />
              </div>
              <div className="flex items-center gap-1">
                <ElementActions
                  elementId={selectedElement.id}
                  element={selectedElement}
                  onActionComplete={(action) => {
                    if (action === 'delete') {
                      const removeFromTree = (els: ExtendedElement[]): ExtendedElement[] => {
                        return els.filter(el => {
                          if (el.id === selectedElement.id) return false;
                          if (el.children) {
                            el.children = removeFromTree(el.children);
                          }
                          return true;
                        });
                      };
                      setElements(removeFromTree(elements));
                      onElementSelect(null);
                    } else if (action === 'duplicate') {
                      const findAndDuplicate = (els: ExtendedElement[]): ExtendedElement[] => {
                        const result: ExtendedElement[] = [];
                        for (const el of els) {
                          if (el.id === selectedElement.id) {
                            const duplicated: ExtendedElement = {
                              ...JSON.parse(JSON.stringify(el)),
                              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                              order: el.order + 1,
                            };
                            result.push(el);
                            result.push(duplicated);
                          } else if (el.children) {
                            el.children = findAndDuplicate(el.children);
                            result.push(el);
                          } else {
                            result.push(el);
                          }
                        }
                        return result;
                      };
                      setElements(findAndDuplicate(elements));
                    }
                  }}
                />
                <Button variant="ghost" size="sm" onClick={() => onElementSelect(null)} className="h-7 w-7 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Property Tabs */}
            <Tabs defaultValue="style" className="flex-1 flex flex-col overflow-hidden">
              <div className="border-b px-3">
                <TabsList className="h-9 w-full justify-start bg-transparent p-0">
                  <TabsTrigger
                    value="content"
                    className="text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3"
                  >
                    Content
                  </TabsTrigger>
                  <TabsTrigger
                    value="style"
                    className="text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3"
                  >
                    Style
                  </TabsTrigger>
                  <TabsTrigger
                    value="advanced"
                    className="text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3"
                  >
                    Advanced
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1">
                <TabsContent value="content" className="p-4 space-y-4 mt-0">
                  <div>
                    <Label className="text-xs text-muted-foreground">Type</Label>
                    <p className="text-sm font-medium capitalize">{selectedElement.type}</p>
                  </div>

                  {(selectedElement.type === 'text' || selectedElement.type === 'button') && (
                    <div className="space-y-2">
                      <Label className="text-xs">Content</Label>
                      <Input
                        type="text"
                        value={content?.content || ''}
                        onChange={(e) => onElementUpdate(selectedElement.id, {
                          content: { ...content, content: e.target.value }
                        })}
                        className="h-9"
                      />
                    </div>
                  )}

                  {selectedElement.type === 'image' && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-xs">Image URL</Label>
                        <Input
                          type="text"
                          value={content?.src || ''}
                          onChange={(e) => onElementUpdate(selectedElement.id, {
                            content: { ...content, src: e.target.value }
                          })}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Alt Text</Label>
                        <Input
                          type="text"
                          value={content?.alt || ''}
                          onChange={(e) => onElementUpdate(selectedElement.id, {
                            content: { ...content, alt: e.target.value }
                          })}
                          className="h-9"
                        />
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="style" className="p-0 mt-0">
                  <div className="divide-y">
                    <div className="p-4">
                      <LayoutPanel styles={styles} onChange={handleStyleChange} />
                    </div>
                    <div className="p-4">
                      <SizingPanel styles={styles} onChange={handleStyleChange} />
                    </div>
                    <div className="p-4">
                      <BoxModelEditor styles={styles} onChange={handleStyleChange} />
                    </div>
                    <div className="p-4">
                      <TypographyPanel styles={styles} onChange={handleStyleChange} />
                    </div>
                    <div className="p-4">
                      <BackgroundPanel styles={styles} onChange={handleStyleChange} />
                    </div>
                    <div className="p-4">
                      <BorderPanel styles={styles} onChange={handleStyleChange} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="p-4 space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Custom CSS</Label>
                    <textarea
                      value={styleObjectToString(styles)}
                      onChange={(e) => handleCssChange(e.target.value)}
                      placeholder="color: red; padding: 10px;"
                      className="w-full h-32 px-3 py-2 border rounded font-mono text-xs bg-muted/20 resize-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Write standard CSS. It will be applied to the element.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">CSS Classes</Label>
                    <Input
                      className="h-9"
                      placeholder="class-name another-class"
                      value={selectedElement.className || ''}
                      onChange={(e) => onElementUpdate(selectedElement.id, { className: e.target.value })}
                    />
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        )}

        {/* Properties placeholder when nothing selected */}
        {activeTab === 'properties' && !selectedElement && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Settings2 className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Select an element</p>
            <p className="text-xs text-muted-foreground mt-1">to edit its properties</p>
          </div>
        )}

        {/* Elements Tab */}
        {activeTab === 'elements' && (
          <div className="flex flex-col h-full">
            {/* Search */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search elements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8 text-sm"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="border-b px-3 py-2">
              <ScrollArea className="w-full">
                <div className="flex gap-1.5">
                  {ELEMENT_CATEGORIES.map(cat => (
                    <Button
                      key={cat.id}
                      variant={activeCategory === cat.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveCategory(cat.id)}
                      className="whitespace-nowrap text-xs h-7 px-2.5"
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Elements List */}
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {filteredElements.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No elements found
                  </div>
                ) : (
                  filteredElements.map(element => (
                    <button
                      key={element.id}
                      onClick={() => onAddElement(element.template, selectedElementId)}
                      className="w-full text-left p-2.5 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors group"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 bg-gray-100 rounded group-hover:bg-primary/10 transition-colors">
                          <element.icon className="h-3.5 w-3.5 text-gray-600 group-hover:text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900">{element.name}</h4>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{element.preview}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Saved Tab */}
        {activeTab === 'saved' && (
          <div className="flex flex-col h-full">
            {elementPool.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <Bookmark className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No saved elements</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Select an element and click the bookmark icon to save it here
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b">
                  <p className="text-xs text-muted-foreground">
                    {elementPool.length} saved element{elementPool.length !== 1 ? 's' : ''}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    onClick={clearPool}
                  >
                    Clear All
                  </Button>
                </div>

                {/* Pool List */}
                <ScrollArea className="flex-1">
                  <div className="p-3 space-y-2">
                    {elementPool.map((element) => (
                      <DraggablePoolItem
                        key={element.id}
                        element={element}
                        onAdd={(el) => onAddElement(el, selectedElementId)}
                        onRemove={removeFromPool}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
