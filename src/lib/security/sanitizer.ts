/**
 * XSS Prevention and HTML Sanitization
 * Protects against Cross-Site Scripting attacks
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 * Removes dangerous tags and attributes while preserving safe formatting
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers (onclick, onload, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');

  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:text\/html/gi, '');

  // Remove dangerous tags
  const dangerousTags = ['iframe', 'object', 'embed', 'applet', 'meta', 'link', 'style', 'base'];
  dangerousTags.forEach((tag) => {
    const regex = new RegExp(`<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`, 'gi');
    sanitized = sanitized.replace(regex, '');
    // Also remove self-closing tags
    const selfClosingRegex = new RegExp(`<${tag}\\b[^>]*\\/>`, 'gi');
    sanitized = sanitized.replace(selfClosingRegex, '');
  });

  return sanitized;
}

/**
 * Sanitize user input text (for display in HTML)
 * Escapes HTML entities
 */
export function escapeHtml(text: string): string {
  if (!text) return '';

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';

  const trimmedUrl = url.trim().toLowerCase();

  // Block dangerous protocols
  if (
    trimmedUrl.startsWith('javascript:') ||
    trimmedUrl.startsWith('data:') ||
    trimmedUrl.startsWith('vbscript:')
  ) {
    return '';
  }

  return url;
}

/**
 * Sanitize filename to prevent path traversal attacks
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return '';

  // Remove path traversal attempts
  let sanitized = filename.replace(/\.\./g, '');
  sanitized = sanitized.replace(/[\/\\]/g, '');

  // Allow only alphanumeric, dash, underscore, and dot
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.split('.').pop() || '';
    const nameWithoutExt = sanitized.substring(0, 255 - ext.length - 1);
    sanitized = `${nameWithoutExt}.${ext}`;
  }

  return sanitized;
}

/**
 * Validate and sanitize JSON to prevent injection
 */
export function sanitizeJson(json: any): any {
  if (json === null || json === undefined) return null;

  const type = typeof json;

  // Primitive types
  if (type === 'string') return sanitizeHtml(json);
  if (type === 'number' || type === 'boolean') return json;

  // Arrays
  if (Array.isArray(json)) {
    return json.map(sanitizeJson);
  }

  // Objects
  if (type === 'object') {
    const sanitized: any = {};
    for (const key in json) {
      if (Object.prototype.hasOwnProperty.call(json, key)) {
        // Sanitize both key and value
        const sanitizedKey = sanitizeHtml(key);
        sanitized[sanitizedKey] = sanitizeJson(json[key]);
      }
    }
    return sanitized;
  }

  return null;
}

/**
 * SQL injection prevention - validate identifiers
 * Use with caution - prefer parameterized queries with Prisma
 */
export function validateSqlIdentifier(identifier: string): boolean {
  // Only allow alphanumeric and underscore
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier);
}

/**
 * Validate email address format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Sanitize CSS to prevent CSS injection attacks
 */
export function sanitizeCss(css: string): string {
  if (!css) return '';

  // Remove import statements
  let sanitized = css.replace(/@import\s+/gi, '');

  // Remove expression() which can execute JavaScript
  sanitized = sanitized.replace(/expression\s*\(/gi, '');

  // Remove javascript: and data: in URLs
  sanitized = sanitized.replace(/url\s*\(\s*['"]?\s*javascript:/gi, 'url(');
  sanitized = sanitized.replace(/url\s*\(\s*['"]?\s*data:/gi, 'url(');

  return sanitized;
}

/**
 * Generate a Content Security Policy hash for inline scripts/styles
 */
export function generateCspHash(content: string, algorithm: 'sha256' | 'sha384' | 'sha512' = 'sha256'): string {
  if (typeof crypto === 'undefined') {
    throw new Error('crypto not available');
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = crypto.subtle.digest(algorithm.toUpperCase(), data);

  return hashBuffer.then((hash) => {
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return `'${algorithm}-${hashHex}'`;
  });
}

/**
 * Validate webhook signature to prevent tampering
 */
export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Use HMAC SHA256 for signature validation
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Sanitize object keys to prevent prototype pollution
 */
export function sanitizeObjectKeys(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObjectKeys);
  }

  const sanitized: any = {};
  for (const key in obj) {
    // Skip prototype-related keys
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }

    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      sanitized[key] = sanitizeObjectKeys(obj[key]);
    }
  }

  return sanitized;
}
