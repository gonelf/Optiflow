// ============================================================================
// PHASE 8: NESTED CANVAS - ELEMENT RENDERER
// ============================================================================

'use client';

import React from 'react';
import { useElementStore } from '@/store/element.store';
import { BuilderElement } from '@/types/builder';
import * as Primitives from './primitives';

interface NestedCanvasProps {
  className?: string;
}

export function NestedCanvas({ className }: NestedCanvasProps) {
  const { elements, viewport, selection, selectElement, setHoveredElement } =
    useElementStore();

  // Get top-level elements (no parent)
  const topLevelElements = elements
    .filter((el) => !el.parentId)
    .sort((a, b) => a.order - b.order);

  return (
    <div
      className={className}
      style={{
        transform: `scale(${viewport.zoom})`,
        transformOrigin: 'top left',
      }}
    >
      <div className="min-h-screen bg-white">
        {topLevelElements.map((element) => (
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

        {topLevelElements.length === 0 && (
          <div className="flex items-center justify-center h-screen">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">No elements yet</p>
              <p className="text-sm">Add elements from the palette to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Element Renderer Component
interface ElementRendererProps {
  element: BuilderElement;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  breakpoint: 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

function ElementRenderer({
  element,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  breakpoint,
}: ElementRendererProps) {
  const { getChildren } = useElementStore();
  const children = getChildren(element.id);

  // Get the primitive component
  const PrimitiveComponent = getPrimitiveComponent(element.type);

  if (!PrimitiveComponent) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-600">Unknown element type: {element.type}</p>
      </div>
    );
  }

  // Render children recursively
  const childElements = children.map((child) => (
    <ElementRenderer
      key={child.id}
      element={child}
      isSelected={false}
      isHovered={false}
      onSelect={onSelect}
      onHover={onHover}
      breakpoint={breakpoint}
    />
  ));

  return (
    <div
      className="relative group"
      onMouseEnter={(e) => {
        e.stopPropagation();
        onHover(element.id);
      }}
      onMouseLeave={(e) => {
        e.stopPropagation();
        onHover(null);
      }}
    >
      {/* Selection/Hover Overlay */}
      {(isSelected || isHovered) && (
        <div
          className={`absolute inset-0 pointer-events-none z-10 ${
            isSelected
              ? 'ring-2 ring-blue-500 ring-offset-2'
              : 'ring-1 ring-blue-300'
          }`}
        />
      )}

      {/* Element Label (on hover) */}
      {(isSelected || isHovered) && (
        <div className="absolute -top-6 left-0 z-20 px-2 py-1 bg-blue-500 text-white text-xs rounded-t">
          {element.name}
        </div>
      )}

      {/* Render the primitive component */}
      <PrimitiveComponent
        element={element}
        breakpoint={breakpoint}
        isBuilder={true}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(element.id);
        }}
      >
        {childElements}
      </PrimitiveComponent>
    </div>
  );
}

// Helper function to get primitive component by type
function getPrimitiveComponent(type: string): React.ComponentType<any> | null {
  const primitiveMap: Record<string, React.ComponentType<any>> = {
    CONTAINER: Primitives.Container,
    SECTION: Primitives.Section,
    GRID: Primitives.Grid,
    FLEXBOX: Primitives.Flexbox,
    TEXT: Primitives.Text,
    RICH_TEXT: Primitives.RichText,
    IMAGE: Primitives.Image,
    VIDEO: Primitives.Video,
    ICON: Primitives.Icon,
    BUTTON: Primitives.Button,
    LINK: Primitives.Link,
    EMBED: Primitives.Embed,
    DIVIDER: Primitives.Divider,
    SPACER: Primitives.Spacer,
    LIST: Primitives.List,
  };

  return primitiveMap[type] || null;
}
