// ============================================================================
// PHASE 8: VIDEO PRIMITIVE
// ============================================================================

'use client';

import React from 'react';
import { BuilderElement } from '@/types/builder';
import { VideoContent } from '@/types/primitives';
import { stylesToCSSObject } from '@/lib/styles';
import { resolveStylesAtBreakpoint } from '@/lib/styles/responsive-utils';

interface VideoProps {
  element: BuilderElement;
  breakpoint?: 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isBuilder?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export function Video({
  element,
  breakpoint = 'base',
  isBuilder = false,
  onClick,
}: VideoProps) {
  const content = element.content as VideoContent;

  // Resolve styles for current breakpoint
  const resolvedStyles = resolveStylesAtBreakpoint(element.styles, breakpoint);
  const styleObject = stylesToCSSObject(resolvedStyles);

  // Get aspect ratio
  const aspectRatio = content.aspectRatio === 'custom'
    ? undefined
    : content.aspectRatio === '16:9'
    ? '56.25%'
    : content.aspectRatio === '4:3'
    ? '75%'
    : content.aspectRatio === '1:1'
    ? '100%'
    : '56.25%'; // Default to 16:9

  // Placeholder for empty videos
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
        Click to add video
      </div>
    );
  }

  // YouTube embed
  if (content.type === 'youtube') {
    const videoId = extractYouTubeId(content.src);
    if (!videoId) {
      return <div>Invalid YouTube URL</div>;
    }

    return (
      <div
        data-element-id={element.id}
        data-element-type={element.type}
        className={element.className}
        style={{ ...styleObject, position: 'relative', width: '100%' }}
        onClick={isBuilder ? onClick : undefined}
      >
        {aspectRatio && (
          <div style={{ paddingBottom: aspectRatio }} />
        )}
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=${content.autoplay ? 1 : 0}&loop=${content.loop ? 1 : 0}&mute=${content.muted ? 1 : 0}&controls=${content.controls ? 1 : 0}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            position: aspectRatio ? 'absolute' : 'relative',
            top: 0,
            left: 0,
            width: '100%',
            height: aspectRatio ? '100%' : 'auto',
            border: 'none',
          }}
        />
      </div>
    );
  }

  // Vimeo embed
  if (content.type === 'vimeo') {
    const videoId = extractVimeoId(content.src);
    if (!videoId) {
      return <div>Invalid Vimeo URL</div>;
    }

    return (
      <div
        data-element-id={element.id}
        data-element-type={element.type}
        className={element.className}
        style={{ ...styleObject, position: 'relative', width: '100%' }}
        onClick={isBuilder ? onClick : undefined}
      >
        {aspectRatio && (
          <div style={{ paddingBottom: aspectRatio }} />
        )}
        <iframe
          src={`https://player.vimeo.com/video/${videoId}?autoplay=${content.autoplay ? 1 : 0}&loop=${content.loop ? 1 : 0}&muted=${content.muted ? 1 : 0}&controls=${content.controls ? 1 : 0}`}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          style={{
            position: aspectRatio ? 'absolute' : 'relative',
            top: 0,
            left: 0,
            width: '100%',
            height: aspectRatio ? '100%' : 'auto',
            border: 'none',
          }}
        />
      </div>
    );
  }

  // Self-hosted video
  return (
    <div
      data-element-id={element.id}
      data-element-type={element.type}
      className={element.className}
      style={styleObject}
      onClick={isBuilder ? onClick : undefined}
    >
      <video
        src={content.src}
        poster={content.poster}
        autoPlay={content.autoplay}
        loop={content.loop}
        muted={content.muted}
        controls={content.controls}
        style={{ width: '100%', height: 'auto' }}
        {...element.attributes}
      />
    </div>
  );
}

// Helper functions
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
    /youtube\.com\/embed\/([^&\s]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}
