/**
 * Converts the DB element tree (ExtendedElement[]) to an HTML string
 * so that GrapesJS can render existing pages.
 */

interface AnyElement {
    id: string;
    type: string;
    tagName?: string;
    className?: string;
    styles?: Record<string, any>;
    content?: any;
    children?: AnyElement[];
}

function styleObjectToInline(styles: Record<string, any>): string {
    return Object.entries(styles)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => {
            // Convert camelCase to kebab-case
            const prop = k.replace(/([A-Z])/g, '-$1').toLowerCase();
            return `${prop}:${v}`;
        })
        .join(';');
}

function elementToHtml(el: AnyElement): string {
    const dataId = `data-gjs-id="${el.id}"`;
    const cls = el.className ? ` class="${el.className}"` : '';
    const inlineStyle = el.styles && Object.keys(el.styles).length > 0
        ? ` style="${styleObjectToInline(el.styles)}"`
        : '';
    const content = el.content || {};
    const children = el.children || [];

    switch (el.type) {
        case 'raw': {
            // Already raw HTML (new save format)
            if (typeof content.html === 'string') {
                return content.html;
            }
            return '';
        }

        case 'text': {
            const tag = (el.tagName || content.tagName || 'p') as string;
            const text = content.content || content.text || '';
            const childHtml = children.map(elementToHtml).join('');
            const inner = childHtml || text;
            return `<${tag} ${dataId}${cls}${inlineStyle}>${inner}</${tag}>`;
        }

        case 'button': {
            const text = content.content || content.text || 'Button';
            const href = content.href;
            if (href) {
                return `<a href="${href}" ${dataId}${cls}${inlineStyle}>${text}</a>`;
            }
            return `<button ${dataId}${cls}${inlineStyle}>${text}</button>`;
        }

        case 'image': {
            const src = content.src || '';
            const alt = content.alt || '';
            return `<img ${dataId}${cls}${inlineStyle} src="${src}" alt="${alt}" />`;
        }

        case 'container': {
            const tag = (el.tagName || content.tagName || 'div') as string;
            const childHtml = children.map(elementToHtml).join('');
            return `<${tag} ${dataId}${cls}${inlineStyle}>${childHtml}</${tag}>`;
        }

        case 'section': {
            const childHtml = children.map(elementToHtml).join('');
            return `<section ${dataId}${cls}${inlineStyle}>${childHtml}</section>`;
        }

        case 'link': {
            const href = content.href || '#';
            const text = content.content || content.text || 'Link';
            return `<a href="${href}" ${dataId}${cls}${inlineStyle}>${text}</a>`;
        }

        case 'embed': {
            if (content.type === 'html' || content.type === 'script') {
                return `<div ${dataId}${cls}${inlineStyle}>${content.code || ''}</div>`;
            }
            if (content.type === 'iframe') {
                const ar = content.aspectRatio || '56.25%';
                return `<div ${dataId} style="position:relative;padding-bottom:${ar};height:0;overflow:hidden;">
  <iframe src="${content.code || ''}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" ${content.allowFullscreen ? 'allowfullscreen' : ''}></iframe>
</div>`;
            }
            return `<div ${dataId}>${content.code || ''}</div>`;
        }

        default: {
            // Fallback: render as a div
            const childHtml = children.map(elementToHtml).join('');
            const text = content.content || content.text || '';
            return `<div ${dataId}${cls}${inlineStyle}>${childHtml || text}</div>`;
        }
    }
}

export function elementsToHtml(elements: AnyElement[]): string {
    return elements.map(elementToHtml).join('\n');
}

export function elementsHaveRawFormat(elements: AnyElement[]): boolean {
    return elements.length === 1 && elements[0].type === 'raw';
}

export function getRawHtmlCss(elements: AnyElement[]): { html: string; css: string } {
    if (elementsHaveRawFormat(elements)) {
        const content = elements[0].content || {};
        return { html: content.html || '', css: content.css || '' };
    }
    return { html: elementsToHtml(elements), css: '' };
}
