// ============================================================================
// PHASE 8: ICON PRIMITIVE
// ============================================================================

'use client';

import React from 'react';
import * as LucideIcons from 'lucide-react';
import { BuilderElement } from '@/types/builder';
import { IconContent } from '@/types/primitives';
import { stylesToCSSObject } from '@/lib/styles';
import { resolveStylesAtBreakpoint } from '@/lib/styles/responsive-utils';

interface IconProps {
  element: BuilderElement;
  breakpoint?: 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isBuilder?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export function Icon({
  element,
  breakpoint = 'base',
  isBuilder = false,
  onClick,
}: IconProps) {
  const content = element.content as IconContent;

  // Resolve styles for current breakpoint
  const resolvedStyles = resolveStylesAtBreakpoint(element.styles, breakpoint);
  const styleObject = stylesToCSSObject(resolvedStyles);

  // Get the icon component
  const iconName = content.name || 'Star';
  const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Star;

  return (
    <span
      data-element-id={element.id}
      data-element-type={element.type}
      className={element.className}
      style={{ display: 'inline-flex', ...styleObject }}
      onClick={isBuilder ? onClick : undefined}
      {...element.attributes}
    >
      <IconComponent size={content.size || 24} />
    </span>
  );
}
