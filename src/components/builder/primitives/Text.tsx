// ============================================================================
// PHASE 8: TEXT PRIMITIVE
// ============================================================================

'use client';

import React from 'react';
import { BuilderElement } from '@/types/builder';
import { TextContent } from '@/types/primitives';
import { stylesToCSSObject } from '@/lib/styles';
import { resolveStylesAtBreakpoint } from '@/lib/styles/responsive-utils';
import { isVoidElement } from '@/lib/utils';

interface TextProps {
  element: BuilderElement;
  breakpoint?: 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isBuilder?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
}

export function Text({
  element,
  breakpoint = 'base',
  isBuilder = false,
  onClick,
  onDoubleClick,
}: TextProps) {
  const content = element.content as TextContent;
  const Tag = content.tag || 'p';

  // Resolve styles for current breakpoint
  const resolvedStyles = resolveStylesAtBreakpoint(element.styles, breakpoint);
  const styleObject = stylesToCSSObject(resolvedStyles);

  if (isVoidElement(Tag)) {
    return React.createElement(Tag, {
      'data-element-id': element.id,
      'data-element-type': element.type,
      className: element.className,
      style: styleObject,
      onClick: isBuilder ? onClick : undefined,
      onDoubleClick: isBuilder ? onDoubleClick : undefined,
      ...element.attributes,
    });
  }

  return React.createElement(
    Tag,
    {
      'data-element-id': element.id,
      'data-element-type': element.type,
      className: element.className,
      style: styleObject,
      onClick: isBuilder ? onClick : undefined,
      onDoubleClick: isBuilder ? onDoubleClick : undefined,
      ...element.attributes,
    },
    content.text || 'Enter text here'
  );
}
