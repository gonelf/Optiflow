'use client';

import { useEffect } from 'react';
import { Component, Element } from '@prisma/client';
import { ElementRenderer } from '@/components/builder/ElementRenderer';
import { Check, Star, Mail, MessageCircle } from 'lucide-react';

// Hero Component
const HeroComponent = ({ content }: { content: any }) => (
  <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white overflow-hidden">
    <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
      <div className="text-center">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
          {content?.headline || 'Your Headline Here'}
        </h1>
        <p className="text-xl sm:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
          {content?.subheadline || 'A compelling subheadline that explains your value proposition'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {content?.primaryCTA && (
            <button className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-200">
              {content.primaryCTA.text || 'Get Started'}
            </button>
          )}
          {content?.secondaryCTA && (
            <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all duration-200">
              {content.secondaryCTA.text || 'Learn More'}
            </button>
          )}
        </div>
      </div>
    </div>
    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
  </div>
);

// Pricing Component
const PricingComponent = ({ content }: { content: any }) => {
  const tiers = content?.tiers || [
    { name: 'Free', price: '$0', features: ['Up to 5 Walkthroughs', 'Basic Analytics', 'Community Support'] },
    { name: 'Pro', price: '$49', features: ['Unlimited Walkthroughs', 'Advanced Analytics', 'Email Support', 'Custom Branding'], highlighted: true },
    { name: 'Enterprise', price: 'Contact Us', features: ['Everything in Pro', 'Dedicated Support', 'Custom Integrations', 'Priority Features'] },
  ];

  return (
    <div className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {content?.heading || 'Simple, Transparent Pricing'}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {content?.subheading || 'Choose the plan that fits your needs'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier: any, index: number) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 ${tier.highlighted
                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl scale-105 border-4 border-indigo-400'
                : 'bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow'
                }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-gray-900 text-sm font-bold rounded-full">
                  MOST POPULAR
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className={`text-2xl font-bold mb-2 ${tier.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {tier.name}
                </h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className={`text-5xl font-extrabold ${tier.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {tier.price}
                  </span>
                  {tier.price !== 'Contact Us' && (
                    <span className={`text-lg ${tier.highlighted ? 'text-white/80' : 'text-gray-500'}`}>
                      /month
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature: string, fIndex: number) => (
                  <li key={fIndex} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${tier.highlighted ? 'text-white' : 'text-indigo-600'}`} />
                    <span className={tier.highlighted ? 'text-white/90' : 'text-gray-700'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${tier.highlighted
                  ? 'bg-white text-indigo-600 hover:bg-gray-100 shadow-lg'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                  }`}
              >
                {tier.cta || 'Get Started'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Features Component
const FeaturesComponent = ({ content }: { content: any }) => {
  const features = content?.features || [
    { icon: '🚀', title: 'Lightning Fast', description: 'Optimized for speed and performance' },
    { icon: '🎨', title: 'Beautiful Design', description: 'Stunning UI that users love' },
    { icon: '🔒', title: 'Secure & Private', description: 'Your data is always protected' },
    { icon: '📊', title: 'Advanced Analytics', description: 'Track everything that matters' },
    { icon: '🤝', title: 'Great Support', description: '24/7 customer support' },
    { icon: '⚡', title: 'Easy Integration', description: 'Works with your favorite tools' },
  ];

  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {content?.heading || 'Everything You Need'}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {content?.subheading || 'Powerful features to help you succeed'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature: any, index: number) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Testimonials Component
const TestimonialsComponent = ({ content }: { content: any }) => {
  const testimonials = content?.items || [
    { quote: 'This product changed everything for us!', author: 'John Doe', role: 'CEO', company: 'Company Inc.' },
  ];

  return (
    <div className="py-24 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Loved by Thousands
          </h2>
          <p className="text-xl text-gray-600">
            See what our customers have to say
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial: any, index: number) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                &quot;{testimonial.quote}&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {testimonial.author?.charAt(0) || 'A'}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// CTA Component
const CTAComponent = ({ content }: { content: any }) => (
  <div className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-4xl sm:text-5xl font-bold mb-6">
        {content?.heading || 'Ready to Get Started?'}
      </h2>
      <p className="text-xl text-white/90 mb-10">
        {content?.subheading || 'Join thousands of satisfied customers today'}
      </p>
      <button className="px-10 py-5 bg-white text-indigo-600 font-bold rounded-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-200 text-lg">
        {content?.text || 'Get Started Today'}
      </button>
    </div>
  </div>
);

// Newsletter Component
const NewsletterComponent = ({ content }: { content: any }) => (
  <div className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
        <div className="text-center mb-8">
          <Mail className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            {content?.headline || 'Subscribe to our newsletter'}
          </h3>
          <p className="text-gray-600">
            {content?.description || 'Get the latest updates delivered to your inbox'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder={content?.placeholder || 'Enter your email'}
            className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
          />
          <button className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
            {content?.submitText || 'Subscribe'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// FAQ Component
const FAQComponent = ({ content }: { content: any }) => {
  const faqs = content?.items || [
    { question: 'What is this?', answer: 'This is an answer.' },
    { question: 'How does it work?', answer: 'It works like this.' },
  ];

  return (
    <div className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq: any, index: number) => (
            <details key={index} className="group bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
              <summary className="flex items-center justify-between cursor-pointer font-semibold text-gray-900 text-lg">
                {faq.question}
                <span className="ml-4 text-indigo-600">+</span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};

// Header Component
const HeaderComponent = ({ content }: { content: any }) => (
  <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="font-bold text-xl text-indigo-600">
          {content?.logo || 'OptiFlow'}
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Features</a>
          <a href="#" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Pricing</a>
          <a href="#" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">About</a>
          <button className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
            Get Started
          </button>
        </nav>
      </div>
    </div>
  </header>
);

// Footer Component
const FooterComponent = ({ content }: { content: any }) => (
  <footer className="bg-gray-900 text-white py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="font-bold text-xl mb-4">OptiFlow</div>
          <p className="text-gray-400">
            Building the future of landing pages
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Product</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">About</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
        <p>© 2026 OptiFlow. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

// Component mapper
const ComponentRenderer = ({ type, content, config }: { type: string; content: any; config: any }) => {
  const components: Record<string, React.ComponentType<{ content: any }>> = {
    HERO: HeroComponent,
    PRICING: PricingComponent,
    FEATURES: FeaturesComponent,
    TESTIMONIALS: TestimonialsComponent,
    CTA: CTAComponent,
    NEWSLETTER: NewsletterComponent,
    FAQ: FAQComponent,
    HEADER: HeaderComponent,
    FOOTER: FooterComponent,
  };

  const Component = components[type];

  if (Component) {
    return <Component content={content} />;
  }

  // Fallback for unknown components
  return (
    <div className="min-h-[200px] bg-gray-100 flex items-center justify-center p-8">
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-2">Unknown component type: {type}</p>
        <p className="text-xs text-gray-400">Configure this component in the builder</p>
      </div>
    </div>
  );
};



interface PageRendererProps {
  components: any[];
  elements?: any[]; // Add support for elements
  pageId: string;
  variantId?: string | null;
}

export function PageRenderer({ components, elements, pageId, variantId }: PageRendererProps) {
  useEffect(() => {
    // ... existing analytics code ...
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

  // If we have recursive elements, use the new ElementRenderer
  if (elements && elements.length > 0) {
    // Sort root elements
    const rootElements = elements
      .filter(el => !el.parentId)
      .sort((a, b) => a.order - b.order);

    // Build the tree structure in memory for rendering
    const buildTree = (parentId: string | null): any[] => {
      return elements
        .filter(el => el.parentId === parentId)
        .sort((a, b) => a.order - b.order)
        .map(el => ({
          ...el,
          // Since Element from Prisma doesn't strictly adhere to what ElementRenderer expects in terms of types (any vs Json)
          // We cast or rely on runtime behavior. The ElementRenderer expects 'children' array
          children: buildTree(el.id)
        }));
    };

    const tree = buildTree(null);

    return (
      <div className="min-h-screen bg-white">
        {tree.map(el => (
          <ElementRenderer
            key={el.id}
            element={el}
            onElementClick={(id, type) => handleComponentClick(id, type)}
          />
        ))}
      </div>
    );
  }

  // Fallback to legacy Component rendering
  return (
    <div className="min-h-screen bg-white">
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
            <ComponentRenderer
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
