// ============================================================================
// PHASE 8: LIST PRIMITIVE
// ============================================================================

'use client';

import React from 'react';
import { BuilderElement } from '@/types/builder';
import { ListContent } from '@/types/primitives';
import { stylesToCSSObject, mergeStyles } from '@/lib/styles';
import { resolveStylesAtBreakpoint } from '@/lib/styles/responsive-utils';

interface ListProps {
  element: BuilderElement;
  breakpoint?: 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isBuilder?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export function List({
  element,
  breakpoint = 'base',
  isBuilder = false,
  onClick,
}: ListProps) {
  const content = element.content as ListContent;
  const Tag = content.type || 'ul';

  // Resolve styles for current breakpoint
  const resolvedStyles = resolveStylesAtBreakpoint(element.styles, breakpoint);

  // Add list-specific styles
  const listStyles = mergeStyles(
    {
      listStyleType: content.marker || 'disc',
      paddingLeft: '1.5rem',
    },
    resolvedStyles
  );

  const styleObject = stylesToCSSObject(listStyles);

  // If no items, show placeholder in builder
  if ((!content.items || content.items.length === 0) && isBuilder) {
    return (
      <div
        data-element-id={element.id}
        data-element-type={element.type}
        className={element.className}
        style={{
          ...styleObject,
          backgroundColor: '#f3f4f6',
          padding: '1rem',
          borderRadius: '0.375rem',
          color: '#9ca3af',
        }}
        onClick={onClick}
      >
        Click to add list items
      </div>
    );
  }

  return React.createElement(
    Tag,
    {
      'data-element-id': element.id,
      'data-element-type': element.type,
      className: element.className,
      style: styleObject,
      onClick: isBuilder ? onClick : undefined,
      ...element.attributes,
    },
    content.items?.map((item) => (
      <li key={item.id}>{item.content}</li>
    ))
  );
}
