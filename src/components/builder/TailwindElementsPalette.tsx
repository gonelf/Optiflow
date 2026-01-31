'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Type,
  Square,
  CreditCard,
  AlertCircle,
  FileText,
  Layers,
  Layout,
  Search
} from 'lucide-react';

interface TailwindElement {
  id: string;
  name: string;
  type: string;
  category: string;
  icon: any;
  template: {
    type: string;
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
      tagName: 'span',
      content: { tagName: 'span', content: 'Featured' },
      styles: {},
      className: 'inline-block px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded-full'
    },
    preview: 'Blue badge'
  },
];

export function TailwindElementsPalette({ onAddElement }: { onAddElement: (element: any) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'typography', name: 'Typography' },
    { id: 'buttons', name: 'Buttons' },
    { id: 'cards', name: 'Cards' },
    { id: 'layout', name: 'Layout' },
    { id: 'alerts', name: 'Alerts' },
    { id: 'badges', name: 'Badges' },
  ];

  const filteredElements = TAILWIND_ELEMENTS.filter(element => {
    const matchesSearch = element.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || element.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-80 border-l bg-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm mb-3">Tailwind Elements</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search elements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="border-b">
        <ScrollArea className="w-full">
          <div className="flex gap-2 p-3 overflow-x-auto">
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                className="whitespace-nowrap text-xs"
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
                onClick={() => onAddElement(element.template)}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-md group-hover:bg-primary/10 transition-colors">
                    <element.icon className="h-4 w-4 text-gray-600 group-hover:text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900">{element.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{element.preview}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
