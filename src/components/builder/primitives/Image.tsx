// ============================================================================
// PHASE 8: IMAGE PRIMITIVE
// ============================================================================

'use client';

import React from 'react';
import NextImage from 'next/image';
import { BuilderElement } from '@/types/builder';
import { ImageContent } from '@/types/primitives';
import { stylesToCSSObject } from '@/lib/styles';
import { resolveStylesAtBreakpoint } from '@/lib/styles/responsive-utils';

interface ImageProps {
  element: BuilderElement;
  breakpoint?: 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isBuilder?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export function Image({
  element,
  breakpoint = 'base',
  isBuilder = false,
  onClick,
}: ImageProps) {
  const content = element.content as ImageContent;

  // Resolve styles for current breakpoint
  const resolvedStyles = resolveStylesAtBreakpoint(element.styles, breakpoint);
  const styleObject = stylesToCSSObject(resolvedStyles);

  // Placeholder for empty images
  if (!content.src) {
    return (
      <div
        data-element-id={element.id}
        data-element-type={element.type}
        className={element.className}
        style={{
          ...styleObject,
          backgroundColor: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          color: '#9ca3af',
        }}
        onClick={isBuilder ? onClick : undefined}
      >
        Click to add image
      </div>
    );
  }

  // Check if it's an external URL or relative path
  const isExternal = content.src.startsWith('http://') || content.src.startsWith('https://');

  if (isExternal) {
    // Use regular img tag for external images
    // Use Next.js Image with unoptimized for external images to keep optimization warnings away
    // while still allowing external URLs
    return (
      <div
        data-element-id={element.id}
        data-element-type={element.type}
        className={element.className}
        style={{ position: 'relative', ...styleObject }}
        onClick={isBuilder ? onClick : undefined}
      >
        <NextImage
          src={content.src}
          alt={content.alt || ''}
          title={content.title}
          fill
          unoptimized
          sizes={content.sizes || '100vw'}
          style={{ objectFit: 'contain' }}
          {...element.attributes}
        />
      </div>
    );
  }

  // Use Next.js Image for internal images
  return (
    <div
      data-element-id={element.id}
      data-element-type={element.type}
      className={element.className}
      style={{ position: 'relative', ...styleObject }}
      onClick={isBuilder ? onClick : undefined}
    >
      <NextImage
        src={content.src}
        alt={content.alt || ''}
        title={content.title}
        fill
        sizes={content.sizes || '100vw'}
        style={{ objectFit: 'contain' }}
        {...element.attributes}
      />
    </div>
  );
}
