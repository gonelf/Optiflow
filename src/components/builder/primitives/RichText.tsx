// ============================================================================
// PHASE 8: RICH TEXT PRIMITIVE
// ============================================================================

'use client';

import React from 'react';
import { BuilderElement } from '@/types/builder';
import { RichTextContent } from '@/types/primitives';
import { stylesToCSSObject } from '@/lib/styles';
import { resolveStylesAtBreakpoint } from '@/lib/styles/responsive-utils';

interface RichTextProps {
  element: BuilderElement;
  breakpoint?: 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isBuilder?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
}

export function RichText({
  element,
  breakpoint = 'base',
  isBuilder = false,
  onClick,
  onDoubleClick,
}: RichTextProps) {
  const content = element.content as RichTextContent;

  // Resolve styles for current breakpoint
  const resolvedStyles = resolveStylesAtBreakpoint(element.styles, breakpoint);
  const styleObject = stylesToCSSObject(resolvedStyles);

  return (
    <div
      data-element-id={element.id}
      data-element-type={element.type}
      className={element.className}
      style={styleObject}
      onClick={isBuilder ? onClick : undefined}
      onDoubleClick={isBuilder ? onDoubleClick : undefined}
      dangerouslySetInnerHTML={{ __html: content.html || '<p>Enter rich text here</p>' }}
      {...element.attributes}
    />
  );
}
