// ============================================================================
// PHASE 8: FLEXBOX PRIMITIVE
// ============================================================================

'use client';

import React from 'react';
import { BuilderElement } from '@/types/builder';
import { FlexboxContent } from '@/types/primitives';
import { stylesToCSSObject, mergeStyles } from '@/lib/styles';
import { resolveStylesAtBreakpoint } from '@/lib/styles/responsive-utils';

interface FlexboxProps {
  element: BuilderElement;
  children?: React.ReactNode;
  breakpoint?: 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isBuilder?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export function Flexbox({
  element,
  children,
  breakpoint = 'base',
  isBuilder = false,
  onClick,
}: FlexboxProps) {
  const content = element.content as FlexboxContent;

  // Resolve styles for current breakpoint
  const resolvedStyles = resolveStylesAtBreakpoint(element.styles, breakpoint);

  // Ensure flex display and add flex-specific defaults
  const flexStyles = mergeStyles(
    {
      display: 'flex',
      flexDirection: content.direction || 'row',
      flexWrap: content.wrap ? 'wrap' : 'nowrap',
    },
    resolvedStyles
  );

  const styleObject = stylesToCSSObject(flexStyles);

  return (
    <div
      data-element-id={element.id}
      data-element-type={element.type}
      className={element.className}
      style={styleObject}
      onClick={isBuilder ? onClick : undefined}
      {...element.attributes}
    >
      {children}
    </div>
  );
}
