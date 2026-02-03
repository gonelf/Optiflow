// ============================================================================
// PHASE 8: CONTAINER PRIMITIVE
// ============================================================================

'use client';

import React from 'react';
import { BuilderElement } from '@/types/builder';
import { ContainerContent } from '@/types/primitives';
import { stylesToCSSObject } from '@/lib/styles';
import { resolveStylesAtBreakpoint } from '@/lib/styles/responsive-utils';
import { isVoidElement } from '@/lib/utils';

interface ContainerProps {
  element: BuilderElement;
  children?: React.ReactNode;
  breakpoint?: 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isBuilder?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export function Container({
  element,
  children,
  breakpoint = 'base',
  isBuilder = false,
  onClick,
}: ContainerProps) {
  const content = element.content as ContainerContent;
  const Tag = content.tag || 'div';

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
      ...element.attributes,
    },
    children
  );
}
