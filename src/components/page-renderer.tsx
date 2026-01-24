'use client';

import { useEffect } from 'react';
import { Component } from '@prisma/client';

// Placeholder component renderer
// TODO: Replace with actual component imports when builder components are created
const ComponentPlaceholder = ({ type, content, config }: { type: string; content: any; config: any }) => {
  const componentStyles: Record<string, string> = {
    HERO: 'min-h-[400px] bg-gradient-to-r from-blue-500 to-purple-600 text-white',
    CTA: 'min-h-[200px] bg-blue-600 text-white',
    PRICING: 'min-h-[500px] bg-gray-50',
    FEATURES: 'min-h-[400px] bg-white',
    TESTIMONIALS: 'min-h-[400px] bg-gray-100',
    FAQ: 'min-h-[400px] bg-white',
    FORM: 'min-h-[400px] bg-white',
    NEWSLETTER: 'min-h-[200px] bg-blue-50',
    HEADER: 'h-16 bg-white border-b',
    FOOTER: 'min-h-[200px] bg-gray-900 text-white',
    CUSTOM: 'min-h-[200px] bg-gray-100',
  };

  return (
    <div className={`${componentStyles[type] || 'min-h-[200px] bg-gray-100'} flex items-center justify-center p-8`}>
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold rounded-full bg-white/20 backdrop-blur-sm">
          {type}
        </div>
        {content?.headline && (
          <h2 className="text-4xl font-bold mb-4">{content.headline}</h2>
        )}
        {content?.subheadline && (
          <p className="text-xl mb-6 opacity-90">{content.subheadline}</p>
        )}
        {content?.description && (
          <p className="text-lg opacity-80">{content.description}</p>
        )}
        {content?.ctaText && (
          <button className="mt-6 px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            {content.ctaText}
          </button>
        )}
        {!content?.headline && !content?.subheadline && (
          <p className="text-sm opacity-60">
            Component content will be rendered here when configured in the builder.
          </p>
        )}
      </div>
    </div>
  );
};

interface PageRendererProps {
  components: Component[];
  pageId: string;
  variantId?: string | null;
}

export function PageRenderer({ components, pageId, variantId }: PageRendererProps) {
  useEffect(() => {
    // Track scroll depth for heatmap
    let maxScrollDepth = 0;
    const handleScroll = () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
      }
    };

    // Track time on page
    const startTime = Date.now();
    const trackTimeOnPage = () => {
      const duration = Math.round((Date.now() - startTime) / 1000);

      // Only track if we have meaningful data
      if (duration > 0) {
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pageId,
            variantId,
            eventType: 'TIME_ON_PAGE',
            eventData: { duration, scrollDepth: maxScrollDepth },
          }),
          keepalive: true,
        }).catch(() => {
          // Silently fail - analytics should not break the page
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', trackTimeOnPage);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', trackTimeOnPage);
      trackTimeOnPage();
    };
  }, [pageId, variantId]);

  const handleComponentClick = (componentId: string, elementType: string, elementText?: string) => {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pageId,
        variantId,
        eventType: 'CLICK',
        elementId: componentId,
        elementType,
        elementText,
      }),
      keepalive: true,
    }).catch(() => {
      // Silently fail - analytics should not break the page
    });
  };

  return (
    <div className="min-h-screen">
      {components.map((component) => {
        return (
          <div
            key={component.id}
            data-component-id={component.id}
            data-component-type={component.type}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.tagName === 'BUTTON' || target.tagName === 'A') {
                handleComponentClick(
                  component.id,
                  target.tagName.toLowerCase(),
                  target.textContent || undefined
                );
              }
            }}
          >
            <ComponentPlaceholder
              type={component.type}
              content={component.content}
              config={component.config}
            />
          </div>
        );
      })}
    </div>
  );
}
