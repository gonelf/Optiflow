'use client';

import React from 'react';
import { Element } from '@prisma/client';
import { sanitizeHtml, isUrlSafe, getIframeSandbox } from '@/lib/embed-security';

interface ExtendedElement extends Element {
    children?: ExtendedElement[];
    content: any; // Type as any for flexibility with JSON
    styles: any;
}

interface ElementRendererProps {
    element: ExtendedElement;
    onElementClick?: (elementId: string, type: string) => void;
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({ element, onElementClick }) => {
    const { type, content, styles, children } = element;

    // Extract content properties
    const tagName = content?.tagName || 'div';
    const textContent = content?.content;
    const attributes = { ...content };

    // Remove content and tagName from attributes to avoid React warnings
    delete attributes.content;
    delete attributes.tagName;

    // Convert styles object to React style object if needed, 
    // currently simplified assuming styles are React-compatible camelCase
    // If they are kebab-case (CSS), we might need conversion, 
    // but let's assume the AI generates React-friendly styles or Tailwind classes

    // If styles contains className, extract it
    const className = styles?.className || '';
    const inlineStyles = { ...styles };
    delete inlineStyles.className;

    // Common props
    const props = {
        ...attributes,
        className,
        style: inlineStyles,
        onClick: (e: React.MouseEvent) => {
            // Stop propagation to allow selecting nested elements
            e.stopPropagation();
            if (onElementClick) {
                onElementClick(element.id, type);
            }
        },
        'data-element-id': element.id,
        'data-element-type': type,
    };

    const renderChildren = () => {
        if (!children || children.length === 0) return null;
        return children
            .sort((a, b) => a.order - b.order)
            .map((child) => (
                <ElementRenderer
                    key={child.id}
                    element={child}
                    onElementClick={onElementClick}
                />
            ));
    };

    // Render based on type
    switch (type) {
        case 'text':
            // Text elements (h1-h6, p, span)
            return React.createElement(
                tagName,
                props,
                textContent,
                renderChildren()
            );

        case 'button':
            // Button elements
            return React.createElement(
                tagName, // usually 'button' or 'a'
                props,
                textContent || renderChildren()
            );

        case 'image':
            // Image elements (self-closing)
            return React.createElement(tagName, {
                ...props,
                src: attributes.src || 'https://via.placeholder.com/150',
                alt: attributes.alt || 'Image',
            });

        case 'input':
            // Input elements
            return React.createElement(tagName, props);

        case 'embed': {
            // Embed elements (HTML, iFrame, or Script)
            const embedContent = content as { type?: string; code?: string; aspectRatio?: string; allowFullscreen?: boolean; sandbox?: string[] };

            // Empty embed
            if (!embedContent?.code) {
                return (
                    <div
                        {...props}
                        style={{ ...inlineStyles, backgroundColor: '#f3f4f6', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}
                    >
                        No embed content
                    </div>
                );
            }

            // iFrame embed - with URL validation and sandbox
            if (embedContent.type === 'iframe') {
                // Validate URL before rendering
                if (!isUrlSafe(embedContent.code)) {
                    return (
                        <div
                            {...props}
                            style={{ ...inlineStyles, backgroundColor: '#fef2f2', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', padding: '1rem' }}
                        >
                            Invalid or unsafe URL
                        </div>
                    );
                }

                const containerStyle = embedContent.aspectRatio
                    ? {
                        ...inlineStyles,
                        position: 'relative' as const,
                        width: '100%',
                        paddingBottom: embedContent.aspectRatio,
                    }
                    : inlineStyles;

                // Get appropriate sandbox attributes
                const sandboxAttr = embedContent.sandbox?.join(' ') || getIframeSandbox(embedContent.code);

                return (
                    <div
                        {...props}
                        style={containerStyle}
                    >
                        <iframe
                            src={embedContent.code}
                            allowFullScreen={embedContent.allowFullscreen}
                            sandbox={sandboxAttr}
                            referrerPolicy="strict-origin-when-cross-origin"
                            loading="lazy"
                            style={embedContent.aspectRatio ? {
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                border: 'none',
                            } : {
                                width: '100%',
                                border: 'none',
                            }}
                        />
                    </div>
                );
            }

            // Script embed - Note: Scripts are inherently dangerous
            // Only trusted/reviewed scripts should be allowed
            if (embedContent.type === 'script') {
                // Scripts are rendered as-is but wrapped in a container
                // The security review happens at the UI level (PageSettingsDialog shows warnings)
                return (
                    <div
                        {...props}
                        style={inlineStyles}
                        data-embed-type="script"
                    >
                        <script dangerouslySetInnerHTML={{ __html: embedContent.code }} />
                    </div>
                );
            }

            // HTML embed (default) - Sanitize HTML before rendering
            const sanitizedHtml = sanitizeHtml(embedContent.code || '');
            return (
                <div
                    {...props}
                    style={inlineStyles}
                    dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                />
            );
        }

        case 'container':
        default:
            // Container elements (div, section, header, footer, etc.)
            return React.createElement(
                tagName,
                props,
                textContent, // Sometimes containers have direct text
                renderChildren()
            );
    }
};
