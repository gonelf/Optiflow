'use client';

import React from 'react';
import { Element } from '@prisma/client';

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
