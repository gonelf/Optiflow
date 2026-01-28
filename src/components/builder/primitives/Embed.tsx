// ============================================================================
// PHASE 8: EMBED PRIMITIVE
// ============================================================================

'use client';

import React from 'react';
import { BuilderElement } from '@/types/builder';
import { EmbedContent } from '@/types/primitives';
import { stylesToCSSObject } from '@/lib/styles';
import { resolveStylesAtBreakpoint } from '@/lib/styles/responsive-utils';

interface EmbedProps {
  element: BuilderElement;
  breakpoint?: 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isBuilder?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export function Embed({
  element,
  breakpoint = 'base',
  isBuilder = false,
  onClick,
}: EmbedProps) {
  const content = element.content as EmbedContent;

  // Resolve styles for current breakpoint
  const resolvedStyles = resolveStylesAtBreakpoint(element.styles, breakpoint);
  const styleObject = stylesToCSSObject(resolvedStyles);

  // Placeholder for empty embeds
  if (!content.code) {
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
        Click to add embed code
      </div>
    );
  }

  // HTML embed
  if (content.type === 'html') {
    return (
      <div
        data-element-id={element.id}
        data-element-type={element.type}
        className={element.className}
        style={styleObject}
        dangerouslySetInnerHTML={{ __html: content.code }}
        onClick={isBuilder ? onClick : undefined}
        {...element.attributes}
      />
    );
  }

  // iFrame embed
  if (content.type === 'iframe') {
    const containerStyle = content.aspectRatio
      ? {
          ...styleObject,
          position: 'relative' as const,
          width: '100%',
          paddingBottom: content.aspectRatio,
        }
      : styleObject;

    const iframeStyle = content.aspectRatio
      ? {
          position: 'absolute' as const,
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
        }
      : {
          width: '100%',
          border: 'none',
        };

    return (
      <div
        data-element-id={element.id}
        data-element-type={element.type}
        className={element.className}
        style={containerStyle}
        onClick={isBuilder ? onClick : undefined}
      >
        <iframe
          src={content.code}
          allowFullScreen={content.allowFullscreen}
          sandbox={content.sandbox?.join(' ')}
          style={iframeStyle}
          {...element.attributes}
        />
      </div>
    );
  }

  // Script embed (inline script execution)
  if (content.type === 'script') {
    // In builder mode, show placeholder to avoid script execution
    if (isBuilder) {
      return (
        <div
          data-element-id={element.id}
          data-element-type={element.type}
          className={element.className}
          style={{
            ...styleObject,
            backgroundColor: '#fef3c7',
            padding: '1rem',
            borderRadius: '0.375rem',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
          }}
          onClick={onClick}
        >
          <strong>Script Embed (Preview)</strong>
          <pre style={{ marginTop: '0.5rem', overflow: 'auto' }}>
            {content.code}
          </pre>
        </div>
      );
    }

    // In production, render the script
    return (
      <div
        data-element-id={element.id}
        data-element-type={element.type}
        className={element.className}
        style={styleObject}
        {...element.attributes}
      >
        <script dangerouslySetInnerHTML={{ __html: content.code }} />
      </div>
    );
  }

  return null;
}
