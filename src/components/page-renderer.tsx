'use client';

import { useEffect } from 'react';
import { Component } from '@prisma/client';
import dynamic from 'next/dynamic';

// Lazy load components for better performance
const Hero = dynamic(() => import('@/components/builder/components/Hero'), {
  loading: () => <div className="min-h-[400px] animate-pulse bg-gray-100" />,
});

const CTA = dynamic(() => import('@/components/builder/components/CTA'), {
  loading: () => <div className="min-h-[200px] animate-pulse bg-gray-100" />,
});

const Pricing = dynamic(() => import('@/components/builder/components/Pricing'), {
  loading: () => <div className="min-h-[500px] animate-pulse bg-gray-100" />,
});

const Features = dynamic(() => import('@/components/builder/components/Features'), {
  loading: () => <div className="min-h-[400px] animate-pulse bg-gray-100" />,
});

const Testimonials = dynamic(() => import('@/components/builder/components/Testimonials'), {
  loading: () => <div className="min-h-[400px] animate-pulse bg-gray-100" />,
});

const FAQ = dynamic(() => import('@/components/builder/components/FAQ'), {
  loading: () => <div className="min-h-[400px] animate-pulse bg-gray-100" />,
});

const Form = dynamic(() => import('@/components/builder/components/Form'), {
  loading: () => <div className="min-h-[400px] animate-pulse bg-gray-100" />,
});

const Newsletter = dynamic(() => import('@/components/builder/components/Newsletter'), {
  loading: () => <div className="min-h-[200px] animate-pulse bg-gray-100" />,
});

const Header = dynamic(() => import('@/components/builder/components/Header'), {
  loading: () => <div className="h-16 animate-pulse bg-gray-100" />,
});

const Footer = dynamic(() => import('@/components/builder/components/Footer'), {
  loading: () => <div className="min-h-[200px] animate-pulse bg-gray-100" />,
});

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
      });
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
    });
  };

  return (
    <div className="min-h-screen">
      {components.map((component) => {
        const ComponentToRender = getComponent(component.type);
        if (!ComponentToRender) return null;

        return (
          <div
            key={component.id}
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
            <ComponentToRender {...component.config} {...component.content} styles={component.styles} />
          </div>
        );
      })}
    </div>
  );
}

function getComponent(type: string) {
  switch (type) {
    case 'HERO':
      return Hero;
    case 'CTA':
      return CTA;
    case 'PRICING':
      return Pricing;
    case 'FEATURES':
      return Features;
    case 'TESTIMONIALS':
      return Testimonials;
    case 'FAQ':
      return FAQ;
    case 'FORM':
      return Form;
    case 'NEWSLETTER':
      return Newsletter;
    case 'HEADER':
      return Header;
    case 'FOOTER':
      return Footer;
    default:
      return null;
  }
}
