// ============================================================================
// PHASE 8: SECTION PRIMITIVE
// ============================================================================

'use client';

import React from 'react';
import { BuilderElement } from '@/types/builder';
import { SectionContent } from '@/types/primitives';
import { stylesToCSSObject } from '@/lib/styles';
import { resolveStylesAtBreakpoint } from '@/lib/styles/responsive-utils';

interface SectionProps {
  element: BuilderElement;
  children?: React.ReactNode;
  breakpoint?: 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isBuilder?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export function Section({
  element,
  children,
  breakpoint = 'base',
  isBuilder = false,
  onClick,
}: SectionProps) {
  const content = element.content as SectionContent;
  const Tag = content.tag || 'section';

  // Resolve styles for current breakpoint
  const resolvedStyles = resolveStylesAtBreakpoint(element.styles, breakpoint);
  const styleObject = stylesToCSSObject(resolvedStyles);

  // Add centering wrapper if needed
  if (content.centered) {
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
      <div
        style={{
          maxWidth: content.maxWidth || '1280px',
          marginLeft: 'auto',
          marginRight: 'auto',
          width: '100%',
        }}
      >
        {children}
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
    children
  );
}
