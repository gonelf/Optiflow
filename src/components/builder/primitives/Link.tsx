// ============================================================================
// PHASE 8: LINK PRIMITIVE
// ============================================================================

'use client';

import React from 'react';
import NextLink from 'next/link';
import { BuilderElement } from '@/types/builder';
import { LinkContent } from '@/types/primitives';
import { stylesToCSSObject } from '@/lib/styles';
import { resolveStylesAtBreakpoint } from '@/lib/styles/responsive-utils';

interface LinkProps {
  element: BuilderElement;
  breakpoint?: 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isBuilder?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export function Link({
  element,
  breakpoint = 'base',
  isBuilder = false,
  onClick,
}: LinkProps) {
  const content = element.content as LinkContent;

  // Resolve styles for current breakpoint
  const resolvedStyles = resolveStylesAtBreakpoint(element.styles, breakpoint);
  const styleObject = stylesToCSSObject(resolvedStyles);

  const handleClick = (e: React.MouseEvent) => {
    if (isBuilder) {
      e.preventDefault();
      onClick?.(e);
    }
  };

  // Format href based on link type
  const formatHref = () => {
    switch (content.type) {
      case 'email':
        return `mailto:${content.href}`;
      case 'phone':
        return `tel:${content.href}`;
      case 'anchor':
        return `#${content.href}`;
      default:
        return content.href || '#';
    }
  };

  const href = formatHref();
  const isInternal = content.type === 'internal' || content.type === 'anchor';

  // Use Next.js Link for internal links
  if (isInternal && !isBuilder) {
    return (
      <NextLink
        href={href}
        data-element-id={element.id}
        data-element-type={element.type}
        className={element.className}
        style={styleObject}
        onClick={handleClick}
        {...element.attributes}
      >
        {content.text || 'Link'}
      </NextLink>
    );
  }

  // Use regular anchor for external links or in builder mode
  return (
    <a
      href={href}
      data-element-id={element.id}
      data-element-type={element.type}
      target={content.target || '_self'}
      rel={content.rel || (content.target === '_blank' ? 'noopener noreferrer' : undefined)}
      className={element.className}
      style={styleObject}
      onClick={handleClick}
      {...element.attributes}
    >
      {content.text || 'Link'}
    </a>
  );
}
