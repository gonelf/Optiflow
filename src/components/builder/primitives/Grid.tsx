// ============================================================================
// PHASE 8: GRID PRIMITIVE
// ============================================================================

'use client';

import React from 'react';
import { BuilderElement } from '@/types/builder';
import { GridContent } from '@/types/primitives';
import { stylesToCSSObject, mergeStyles } from '@/lib/styles';
import { resolveStylesAtBreakpoint } from '@/lib/styles/responsive-utils';

interface GridProps {
  element: BuilderElement;
  children?: React.ReactNode;
  breakpoint?: 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isBuilder?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export function Grid({
  element,
  children,
  breakpoint = 'base',
  isBuilder = false,
  onClick,
}: GridProps) {
  const content = element.content as GridContent;

  // Resolve styles for current breakpoint
  const resolvedStyles = resolveStylesAtBreakpoint(element.styles, breakpoint);

  // Ensure grid display and add grid-specific defaults
  const gridStyles = mergeStyles(
    {
      display: 'grid',
      gridTemplateColumns: content.columns
        ? `repeat(${content.columns}, 1fr)`
        : undefined,
      gridTemplateRows: content.rows ? `repeat(${content.rows}, 1fr)` : undefined,
      gridAutoFlow: content.autoFlow || 'row',
    },
    resolvedStyles
  );

  const styleObject = stylesToCSSObject(gridStyles);

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
