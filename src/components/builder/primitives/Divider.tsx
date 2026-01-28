// ============================================================================
// PHASE 8: DIVIDER PRIMITIVE
// ============================================================================

'use client';

import React from 'react';
import { BuilderElement } from '@/types/builder';
import { DividerContent } from '@/types/primitives';
import { stylesToCSSObject, mergeStyles } from '@/lib/styles';
import { resolveStylesAtBreakpoint } from '@/lib/styles/responsive-utils';

interface DividerProps {
  element: BuilderElement;
  breakpoint?: 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isBuilder?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export function Divider({
  element,
  breakpoint = 'base',
  isBuilder = false,
  onClick,
}: DividerProps) {
  const content = element.content as DividerContent;

  // Resolve styles for current breakpoint
  const resolvedStyles = resolveStylesAtBreakpoint(element.styles, breakpoint);

  // Add divider-specific styles
  const dividerStyles = mergeStyles(
    {
      borderWidth: content.thickness || '1px',
      borderStyle: content.style || 'solid',
      borderColor: resolvedStyles.borderColor || '#e5e7eb',
      ...(content.orientation === 'vertical'
        ? {
            height: '100%',
            borderRightWidth: content.thickness || '1px',
            borderBottomWidth: '0',
          }
        : {
            width: '100%',
            borderTopWidth: content.thickness || '1px',
            borderLeftWidth: '0',
          }),
    },
    resolvedStyles
  );

  const styleObject = stylesToCSSObject(dividerStyles);

  return (
    <hr
      data-element-id={element.id}
      data-element-type={element.type}
      className={element.className}
      style={styleObject}
      onClick={isBuilder ? onClick : undefined}
      {...element.attributes}
    />
  );
}
