// ============================================================================
// PHASE 8: SPACER PRIMITIVE
// ============================================================================

'use client';

import React from 'react';
import { BuilderElement } from '@/types/builder';
import { SpacerContent } from '@/types/primitives';
import { stylesToCSSObject, mergeStyles } from '@/lib/styles';
import { resolveStylesAtBreakpoint } from '@/lib/styles/responsive-utils';

interface SpacerProps {
  element: BuilderElement;
  breakpoint?: 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isBuilder?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export function Spacer({
  element,
  breakpoint = 'base',
  isBuilder = false,
  onClick,
}: SpacerProps) {
  const content = element.content as SpacerContent;

  // Resolve styles for current breakpoint
  const resolvedStyles = resolveStylesAtBreakpoint(element.styles, breakpoint);

  // Add spacer-specific styles
  const spacerStyles = mergeStyles(
    {
      height: content.height || '2rem',
      width: content.width || '100%',
      display: 'block',
    },
    resolvedStyles
  );

  const styleObject = stylesToCSSObject(spacerStyles);

  return (
    <div
      data-element-id={element.id}
      data-element-type={element.type}
      className={element.className}
      style={{
        ...styleObject,
        ...(isBuilder && {
          backgroundColor: '#f3f4f6',
          border: '1px dashed #d1d5db',
        }),
      }}
      onClick={isBuilder ? onClick : undefined}
      {...element.attributes}
    />
  );
}
