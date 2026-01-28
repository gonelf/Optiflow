// ============================================================================
// PHASE 8: BUTTON PRIMITIVE
// ============================================================================

'use client';

import React from 'react';
import * as LucideIcons from 'lucide-react';
import { BuilderElement } from '@/types/builder';
import { ButtonContent } from '@/types/primitives';
import { stylesToCSSObject } from '@/lib/styles';
import { resolveStylesAtBreakpoint } from '@/lib/styles/responsive-utils';

interface ButtonProps {
  element: BuilderElement;
  breakpoint?: 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isBuilder?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export function Button({
  element,
  breakpoint = 'base',
  isBuilder = false,
  onClick,
}: ButtonProps) {
  const content = element.content as ButtonContent;

  // Resolve styles for current breakpoint
  const resolvedStyles = resolveStylesAtBreakpoint(element.styles, breakpoint);
  const styleObject = stylesToCSSObject(resolvedStyles);

  // Get icon if specified
  const IconComponent = content.icon
    ? (LucideIcons as any)[content.icon] || null
    : null;

  const handleClick = (e: React.MouseEvent) => {
    if (isBuilder) {
      onClick?.(e);
    } else {
      // Handle action in production
      if (content.onClick) {
        // Trigger custom action (will be implemented later)
        console.log('Button action:', content.onClick);
      }
    }
  };

  return (
    <button
      data-element-id={element.id}
      data-element-type={element.type}
      type={content.type || 'button'}
      disabled={content.disabled}
      className={element.className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: content.disabled ? 'not-allowed' : 'pointer',
        ...styleObject,
      }}
      onClick={handleClick}
      {...element.attributes}
    >
      {IconComponent && content.iconPosition === 'left' && (
        <IconComponent size={16} />
      )}

      {content.loading ? (
        <span>Loading...</span>
      ) : (
        <span>{content.text || 'Button'}</span>
      )}

      {IconComponent && content.iconPosition === 'right' && (
        <IconComponent size={16} />
      )}
    </button>
  );
}
