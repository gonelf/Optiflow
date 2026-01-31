'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import * as Primitives from '@/components/builder/primitives';

import { HeroRenderer } from '@/components/builder/components/Hero';
import { CTARenderer } from '@/components/builder/components/CTA';
import { PricingRenderer } from '@/components/builder/components/Pricing';
import { FeaturesRenderer } from '@/components/builder/components/Features';
import { TestimonialsRenderer } from '@/components/builder/components/Testimonials';
import { FAQRenderer } from '@/components/builder/components/FAQ';
import { FormRenderer } from '@/components/builder/components/Form';
import { NewsletterRenderer } from '@/components/builder/components/Newsletter';
import { BuilderComponent } from '@/store/builder.store';
import { BuilderElement } from '@/types/builder';

// Recursive renderer for Elements (Phase 8)
const RecursiveElementRenderer = ({
    element,
    allElements
}: {
    element: BuilderElement;
    allElements: BuilderElement[];
}) => {
    const children = allElements
        .filter(el => el.parentId === element.id)
        .sort((a, b) => a.order - b.order);

    // @ts-ignore - dynamic primitive lookup
    const PrimitiveComponent = Primitives[element.type.toUpperCase() as keyof typeof Primitives]
        // @ts-ignore
        || Primitives[element.type as keyof typeof Primitives];

    if (!PrimitiveComponent) {
        return null;
    }

    return (
        <PrimitiveComponent element={element} isBuilder={false}>
            {children.map(child => (
                <RecursiveElementRenderer
                    key={child.id}
                    element={child}
                    allElements={allElements}
                />
            ))}
        </PrimitiveComponent>
    );
};

export default function PreviewPage() {
    const params = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pageData, setPageData] = useState<{
        title: string;
        components: BuilderComponent[];
        elements: BuilderElement[];
    } | null>(null);

    useEffect(() => {
        const loadPageData = async () => {
            const pageId = params.pageId as string;

            try {
                const response = await fetch(`/api/pages/${pageId}`);

                if (!response.ok) {
                    throw new Error('Failed to load page');
                }

                const data = await response.json();
                setPageData({
                    title: data.title,
                    components: data.components || [],
                    elements: data.elements || [],
                });
            } catch (err) {
                console.error('Error loading page:', err);
                setError('Failed to load page. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        loadPageData();
    }, [params.pageId]);

    const renderComponent = (component: BuilderComponent) => {
        switch (component.type) {
            case 'HERO':
                return <HeroRenderer key={component.id} component={component} />;
            case 'CTA':
                return <CTARenderer key={component.id} component={component} />;
            case 'PRICING':
                return <PricingRenderer key={component.id} component={component} />;
            case 'FEATURES':
                return <FeaturesRenderer key={component.id} component={component} />;
            case 'TESTIMONIALS':
                return <TestimonialsRenderer key={component.id} component={component} />;
            case 'FAQ':
                return <FAQRenderer key={component.id} component={component} />;
            case 'FORM':
                return <FormRenderer key={component.id} component={component} />;
            case 'NEWSLETTER':
                return <NewsletterRenderer key={component.id} component={component} />;
            default:
                return (
                    <div key={component.id} className="p-8 bg-gray-100 text-center">
                        <p className="text-gray-500">Unknown component type: {component.type}</p>
                    </div>
                );
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                    <p className="mt-4 text-sm text-muted-foreground">Loading preview...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500">{error}</p>
                </div>
            </div>
        );
    }

    if (!pageData) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground">Page not found</p>
                </div>
            </div>
        );
    }

    const hasNewElements = pageData.elements.length > 0;

    return (
        <div className="min-h-screen bg-white">
            {/* Preview Banner */}
            <div className="sticky top-0 z-50 bg-amber-500 text-white px-4 py-2 text-center text-sm font-medium">
                Preview Mode - This is how your page will look when published
            </div>

            {/* Page Content */}
            <main>
                {hasNewElements ? (
                    // Render Phase 8 Elements
                    <div className="w-full">
                        {pageData.elements
                            .filter(el => !el.parentId)
                            .sort((a, b) => a.order - b.order)
                            .map(element => (
                                <RecursiveElementRenderer
                                    key={element.id}
                                    element={element}
                                    allElements={pageData.elements}
                                />
                            ))
                        }
                    </div>
                ) : (
                    // Render Legacy Components
                    pageData.components.length === 0 ? (
                        <div className="flex h-96 items-center justify-center">
                            <div className="text-center">
                                <p className="text-gray-500">This page has no components yet.</p>
                            </div>
                        </div>
                    ) : (
                        pageData.components
                            .sort((a, b) => a.order - b.order)
                            .map((component) => renderComponent(component))
                    )
                )}
            </main>
        </div>
    );
}
