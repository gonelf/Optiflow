/**
 * Embed Security Utilities
 *
 * Provides sanitization and validation for embedded content to prevent
 * XSS attacks, clickjacking, and other security vulnerabilities.
 */

// Allowed HTML tags for HTML embeds (whitelist approach)
const ALLOWED_TAGS = new Set([
  // Structure
  'div', 'span', 'p', 'br', 'hr',
  // Headings
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  // Lists
  'ul', 'ol', 'li',
  // Tables
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  // Forms (for form embeds)
  'form', 'input', 'textarea', 'select', 'option', 'button', 'label', 'fieldset', 'legend',
  // Media
  'img', 'video', 'audio', 'source', 'iframe',
  // Text formatting
  'strong', 'em', 'b', 'i', 'u', 's', 'sub', 'sup', 'mark', 'small',
  // Links
  'a',
  // Semantic
  'article', 'section', 'nav', 'aside', 'header', 'footer', 'main',
  // Other
  'blockquote', 'pre', 'code', 'figure', 'figcaption',
]);

// Allowed attributes per tag (whitelist approach)
const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
  '*': new Set(['class', 'id', 'style', 'title', 'aria-label', 'aria-describedby', 'role', 'data-*']),
  'a': new Set(['href', 'target', 'rel']),
  'img': new Set(['src', 'alt', 'width', 'height', 'loading']),
  'video': new Set(['src', 'poster', 'controls', 'autoplay', 'muted', 'loop', 'width', 'height']),
  'audio': new Set(['src', 'controls', 'autoplay', 'muted', 'loop']),
  'source': new Set(['src', 'type']),
  'iframe': new Set(['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'loading', 'sandbox']),
  'form': new Set(['action', 'method', 'enctype', 'target']),
  'input': new Set(['type', 'name', 'value', 'placeholder', 'required', 'disabled', 'readonly', 'min', 'max', 'step', 'pattern', 'checked']),
  'textarea': new Set(['name', 'placeholder', 'required', 'disabled', 'readonly', 'rows', 'cols']),
  'select': new Set(['name', 'required', 'disabled', 'multiple']),
  'option': new Set(['value', 'selected', 'disabled']),
  'button': new Set(['type', 'disabled']),
  'label': new Set(['for']),
  'td': new Set(['colspan', 'rowspan']),
  'th': new Set(['colspan', 'rowspan', 'scope']),
};

// Dangerous patterns in URLs
const DANGEROUS_URL_PATTERNS = [
  /^javascript:/i,
  /^data:text\/html/i,
  /^vbscript:/i,
];

// Allowed URL protocols
const ALLOWED_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

// Trusted embed domains for iframes
const TRUSTED_IFRAME_DOMAINS = [
  // Video platforms
  'youtube.com',
  'www.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  'vimeo.com',
  'player.vimeo.com',
  'dailymotion.com',
  'www.dailymotion.com',
  'wistia.com',
  'fast.wistia.net',
  'loom.com',
  'www.loom.com',
  // Maps
  'google.com',
  'www.google.com',
  'maps.google.com',
  // Forms
  'typeform.com',
  'form.typeform.com',
  'forms.gle',
  'docs.google.com',
  'airtable.com',
  'tally.so',
  'jotform.com',
  'form.jotform.com',
  'hubspot.com',
  'forms.hubspot.com',
  // Social
  'twitter.com',
  'platform.twitter.com',
  'facebook.com',
  'www.facebook.com',
  'instagram.com',
  'www.instagram.com',
  'linkedin.com',
  'www.linkedin.com',
  // Productivity
  'calendly.com',
  'cal.com',
  'notion.so',
  'figma.com',
  'www.figma.com',
  'canva.com',
  'www.canva.com',
  'miro.com',
  // Analytics/widgets
  'intercom.io',
  'crisp.chat',
  'tidio.com',
  // Code
  'codepen.io',
  'codesandbox.io',
  'stackblitz.com',
  'replit.com',
  'jsfiddle.net',
  // Other
  'spotify.com',
  'open.spotify.com',
  'soundcloud.com',
  'w.soundcloud.com',
];

/**
 * Validates if a URL is safe
 */
export function isUrlSafe(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  const trimmedUrl = url.trim();

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_URL_PATTERNS) {
    if (pattern.test(trimmedUrl)) {
      return false;
    }
  }

  // Allow relative URLs
  if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('./') || trimmedUrl.startsWith('../')) {
    return true;
  }

  // Parse and validate absolute URLs
  try {
    const parsed = new URL(trimmedUrl);
    return ALLOWED_PROTOCOLS.includes(parsed.protocol);
  } catch {
    // Invalid URL
    return false;
  }
}

/**
 * Validates if an iframe URL is from a trusted domain
 */
export function isIframeDomainTrusted(url: string): { trusted: boolean; domain: string | null } {
  if (!url || typeof url !== 'string') {
    return { trusted: false, domain: null };
  }

  try {
    const parsed = new URL(url.trim());
    const hostname = parsed.hostname.toLowerCase();

    // Check if domain is in trusted list
    const isTrusted = TRUSTED_IFRAME_DOMAINS.some(domain =>
      hostname === domain || hostname.endsWith('.' + domain)
    );

    return { trusted: isTrusted, domain: hostname };
  } catch {
    return { trusted: false, domain: null };
  }
}

/**
 * Sanitizes a style attribute value to prevent CSS-based attacks
 */
function sanitizeStyleValue(style: string): string {
  // Remove dangerous CSS patterns
  return style
    .replace(/expression\s*\(/gi, '') // IE expression()
    .replace(/javascript\s*:/gi, '')  // javascript: in CSS
    .replace(/behavior\s*:/gi, '')    // IE behavior
    .replace(/-moz-binding\s*:/gi, '') // Firefox binding
    .replace(/url\s*\(\s*["']?\s*javascript:/gi, 'url(') // javascript: in url()
    .replace(/url\s*\(\s*["']?\s*data:text\/html/gi, 'url('); // data: HTML in url()
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Uses a whitelist approach for tags and attributes
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';

  // Create a temporary DOM element to parse HTML
  if (typeof document === 'undefined') {
    // Server-side: use basic regex sanitization
    return sanitizeHtmlBasic(html);
  }

  const template = document.createElement('template');
  template.innerHTML = html;

  const sanitizeNode = (node: Node): void => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();

      // Remove disallowed tags
      if (!ALLOWED_TAGS.has(tagName)) {
        // For script/style tags, remove entirely
        if (tagName === 'script' || tagName === 'style' || tagName === 'link') {
          element.remove();
          return;
        }
        // For other tags, replace with span but keep content
        const span = document.createElement('span');
        while (element.firstChild) {
          span.appendChild(element.firstChild);
        }
        element.replaceWith(span);
        sanitizeNode(span);
        return;
      }

      // Get allowed attributes for this tag
      const globalAllowed = ALLOWED_ATTRIBUTES['*'] || new Set();
      const tagAllowed = ALLOWED_ATTRIBUTES[tagName] || new Set();

      // Remove disallowed attributes
      const attributesToRemove: string[] = [];
      for (const attr of Array.from(element.attributes)) {
        const attrName = attr.name.toLowerCase();

        // Check if attribute starts with 'on' (event handlers)
        if (attrName.startsWith('on')) {
          attributesToRemove.push(attr.name);
          continue;
        }

        // Check data-* attributes
        if (attrName.startsWith('data-')) {
          continue; // Allow data-* attributes
        }

        // Check if attribute is allowed
        if (!globalAllowed.has(attrName) && !tagAllowed.has(attrName)) {
          attributesToRemove.push(attr.name);
          continue;
        }

        // Sanitize URL attributes
        if (['href', 'src', 'action'].includes(attrName)) {
          if (!isUrlSafe(attr.value)) {
            attributesToRemove.push(attr.name);
            continue;
          }
        }

        // Sanitize style attribute
        if (attrName === 'style') {
          element.setAttribute('style', sanitizeStyleValue(attr.value));
        }

        // Force safe target for links
        if (tagName === 'a' && attrName === 'target') {
          element.setAttribute('rel', 'noopener noreferrer');
        }
      }

      // Remove collected attributes
      for (const attrName of attributesToRemove) {
        element.removeAttribute(attrName);
      }

      // Add sandbox to iframes
      if (tagName === 'iframe') {
        const currentSandbox = element.getAttribute('sandbox');
        if (!currentSandbox) {
          element.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
        }
      }

      // Recursively sanitize children
      for (const child of Array.from(element.childNodes)) {
        sanitizeNode(child);
      }
    }
  };

  // Sanitize all nodes in the template
  for (const child of Array.from(template.content.childNodes)) {
    sanitizeNode(child);
  }

  return template.innerHTML;
}

/**
 * Basic HTML sanitization for server-side rendering
 * Uses regex patterns (less secure, but works without DOM)
 */
function sanitizeHtmlBasic(html: string): string {
  let sanitized = html;

  // Remove script tags and content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove style tags and content
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove link tags
  sanitized = sanitized.replace(/<link[^>]*>/gi, '');

  // Remove event handlers
  sanitized = sanitized.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\son\w+\s*=\s*[^\s>]+/gi, '');

  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript\s*:/gi, '');

  // Remove data: URLs in src/href
  sanitized = sanitized.replace(/(src|href)\s*=\s*["']?\s*data:text\/html[^"'\s>]*/gi, '$1=""');

  return sanitized;
}

/**
 * Gets safe iframe sandbox attributes based on content type
 */
export function getIframeSandbox(url: string): string {
  const { trusted } = isIframeDomainTrusted(url);

  if (trusted) {
    // More permissive for trusted domains
    return 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox';
  }

  // Restrictive for untrusted domains
  return 'allow-scripts allow-forms';
}

/**
 * Validates and sanitizes script content
 * WARNING: Scripts should only be from trusted sources
 */
export function validateScript(script: string): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  if (!script || typeof script !== 'string') {
    return { valid: false, warnings: ['Empty or invalid script content'] };
  }

  // Check for potentially dangerous patterns
  const dangerousPatterns = [
    { pattern: /document\.cookie/i, warning: 'Script accesses cookies' },
    { pattern: /localStorage|sessionStorage/i, warning: 'Script accesses browser storage' },
    { pattern: /eval\s*\(/i, warning: 'Script uses eval()' },
    { pattern: /Function\s*\(/i, warning: 'Script uses Function constructor' },
    { pattern: /innerHTML\s*=/i, warning: 'Script modifies innerHTML' },
    { pattern: /outerHTML\s*=/i, warning: 'Script modifies outerHTML' },
    { pattern: /document\.write/i, warning: 'Script uses document.write' },
    { pattern: /\.src\s*=/i, warning: 'Script modifies element sources' },
    { pattern: /fetch\s*\(|XMLHttpRequest/i, warning: 'Script makes network requests' },
    { pattern: /window\.location|location\.href/i, warning: 'Script may redirect the page' },
  ];

  for (const { pattern, warning } of dangerousPatterns) {
    if (pattern.test(script)) {
      warnings.push(warning);
    }
  }

  return { valid: true, warnings };
}

/**
 * Security summary for embed content
 */
export interface EmbedSecurityCheck {
  safe: boolean;
  sanitizedContent: string;
  warnings: string[];
  recommendations: string[];
}

/**
 * Performs a comprehensive security check on embed content
 */
export function checkEmbedSecurity(
  type: 'html' | 'iframe' | 'script',
  content: string
): EmbedSecurityCheck {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let sanitizedContent = content;
  let safe = true;

  switch (type) {
    case 'html':
      sanitizedContent = sanitizeHtml(content);
      if (sanitizedContent !== content) {
        warnings.push('Some HTML content was modified for security');
      }
      break;

    case 'iframe':
      if (!isUrlSafe(content)) {
        safe = false;
        warnings.push('Invalid or unsafe URL');
        sanitizedContent = '';
      } else {
        const { trusted, domain } = isIframeDomainTrusted(content);
        if (!trusted) {
          warnings.push(`Domain "${domain}" is not in the trusted list`);
          recommendations.push('Consider using a trusted embed provider');
        }
      }
      break;

    case 'script':
      const scriptCheck = validateScript(content);
      warnings.push(...scriptCheck.warnings);
      if (scriptCheck.warnings.length > 0) {
        recommendations.push('Review script content before publishing');
        recommendations.push('Scripts only execute on published pages');
      }
      break;
  }

  return {
    safe,
    sanitizedContent,
    warnings,
    recommendations,
  };
}
