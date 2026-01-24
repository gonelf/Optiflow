/**
 * Unit tests for XSS Prevention and Sanitization
 * Tests HTML sanitization, URL validation, and security functions
 */

import { describe, test, expect } from '@jest/globals';

// Sanitization functions to test
function sanitizeHtml(html: string): string {
  if (!html) return '';

  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:text\/html/gi, '');

  const dangerousTags = ['iframe', 'object', 'embed', 'applet', 'meta', 'link', 'style', 'base'];
  dangerousTags.forEach((tag) => {
    const regex = new RegExp(`<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`, 'gi');
    sanitized = sanitized.replace(regex, '');
    const selfClosingRegex = new RegExp(`<${tag}\\b[^>]*\\/>`, 'gi');
    sanitized = sanitized.replace(selfClosingRegex, '');
  });

  return sanitized;
}

function escapeHtml(text: string): string {
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

function sanitizeUrl(url: string): string {
  if (!url) return '';

  const trimmedUrl = url.trim().toLowerCase();

  if (
    trimmedUrl.startsWith('javascript:') ||
    trimmedUrl.startsWith('data:') ||
    trimmedUrl.startsWith('vbscript:')
  ) {
    return '';
  }

  return url;
}

function sanitizeFilename(filename: string): string {
  if (!filename) return '';

  let sanitized = filename.replace(/\.\./g, '');
  sanitized = sanitized.replace(/[\/\\]/g, '');
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');

  if (sanitized.length > 255) {
    const ext = sanitized.split('.').pop() || '';
    const nameWithoutExt = sanitized.substring(0, 255 - ext.length - 1);
    sanitized = `${nameWithoutExt}.${ext}`;
  }

  return sanitized;
}

function sanitizeObjectKeys(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObjectKeys);
  }

  const sanitized: any = {};
  for (const key in obj) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }

    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      sanitized[key] = sanitizeObjectKeys(obj[key]);
    }
  }

  return sanitized;
}

describe('HTML Sanitization', () => {
  describe('Script Tag Removal', () => {
    test('should remove script tags', () => {
      const input = '<p>Hello</p><script>alert("XSS")</script><p>World</p>';
      const output = sanitizeHtml(input);

      expect(output).not.toContain('<script>');
      expect(output).not.toContain('alert');
      expect(output).toContain('<p>Hello</p>');
      expect(output).toContain('<p>World</p>');
    });

    test('should remove script tags with attributes', () => {
      const input = '<script src="evil.js"></script>';
      const output = sanitizeHtml(input);

      expect(output).not.toContain('<script');
      expect(output).not.toContain('evil.js');
    });

    test('should remove inline scripts', () => {
      const input = '<script>var x = 1; console.log(x);</script>';
      const output = sanitizeHtml(input);

      expect(output).not.toContain('<script>');
      expect(output).not.toContain('var x');
    });

    test('should handle multiple script tags', () => {
      const input = '<script>alert(1)</script><div>Safe</div><script>alert(2)</script>';
      const output = sanitizeHtml(input);

      expect(output).not.toContain('<script>');
      expect(output).toContain('<div>Safe</div>');
    });
  });

  describe('Event Handler Removal', () => {
    test('should remove onclick handler', () => {
      const input = '<button onclick="alert(1)">Click me</button>';
      const output = sanitizeHtml(input);

      expect(output).not.toContain('onclick');
      expect(output).toContain('Click me');
    });

    test('should remove onload handler', () => {
      const input = '<img src="image.jpg" onload="alert(1)">';
      const output = sanitizeHtml(input);

      expect(output).not.toContain('onload');
    });

    test('should remove all event handlers', () => {
      const input = `
        <div onmouseover="hack()" onclick="xss()" onload="bad()">
          Content
        </div>
      `;
      const output = sanitizeHtml(input);

      expect(output).not.toContain('onmouseover');
      expect(output).not.toContain('onclick');
      expect(output).not.toContain('onload');
      expect(output).toContain('Content');
    });

    test('should handle event handlers without quotes', () => {
      const input = '<button onclick=alert(1)>Click</button>';
      const output = sanitizeHtml(input);

      expect(output).not.toContain('onclick');
    });
  });

  describe('JavaScript Protocol Removal', () => {
    test('should remove javascript: protocol from links', () => {
      const input = '<a href="javascript:alert(1)">Click</a>';
      const output = sanitizeHtml(input);

      expect(output).not.toContain('javascript:');
    });

    test('should handle mixed case javascript:', () => {
      const input = '<a href="JaVaScRiPt:alert(1)">Click</a>';
      const output = sanitizeHtml(input);

      expect(output.toLowerCase()).not.toContain('javascript:');
    });

    test('should remove data:text/html protocol', () => {
      const input = '<a href="data:text/html,<script>alert(1)</script>">Click</a>';
      const output = sanitizeHtml(input);

      expect(output).not.toContain('data:text/html');
    });
  });

  describe('Dangerous Tag Removal', () => {
    test('should remove iframe tags', () => {
      const input = '<iframe src="evil.com"></iframe>';
      const output = sanitizeHtml(input);

      expect(output).not.toContain('<iframe');
      expect(output).not.toContain('evil.com');
    });

    test('should remove object tags', () => {
      const input = '<object data="malware.swf"></object>';
      const output = sanitizeHtml(input);

      expect(output).not.toContain('<object');
    });

    test('should remove embed tags', () => {
      const input = '<embed src="bad.swf">';
      const output = sanitizeHtml(input);

      expect(output).not.toContain('<embed');
    });

    test('should remove style tags', () => {
      const input = '<style>body { background: url("javascript:alert(1)") }</style>';
      const output = sanitizeHtml(input);

      expect(output).not.toContain('<style');
    });

    test('should remove meta tags', () => {
      const input = '<meta http-equiv="refresh" content="0;url=evil.com">';
      const output = sanitizeHtml(input);

      expect(output).not.toContain('<meta');
    });
  });

  describe('Safe HTML Preservation', () => {
    test('should preserve safe paragraph tags', () => {
      const input = '<p>This is safe content</p>';
      const output = sanitizeHtml(input);

      expect(output).toBe(input);
    });

    test('should preserve safe formatting tags', () => {
      const input = '<strong>Bold</strong> <em>Italic</em> <u>Underline</u>';
      const output = sanitizeHtml(input);

      expect(output).toContain('<strong>');
      expect(output).toContain('<em>');
      expect(output).toContain('<u>');
    });

    test('should preserve safe list tags', () => {
      const input = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const output = sanitizeHtml(input);

      expect(output).toContain('<ul>');
      expect(output).toContain('<li>');
    });
  });
});

describe('HTML Entity Escaping', () => {
  test('should escape < and >', () => {
    const input = '<script>alert(1)</script>';
    const output = escapeHtml(input);

    expect(output).toBe('&lt;script&gt;alert(1)&lt;&#x2F;script&gt;');
  });

  test('should escape quotes', () => {
    const input = '"Hello" and \'World\'';
    const output = escapeHtml(input);

    expect(output).toContain('&quot;');
    expect(output).toContain('&#x27;');
  });

  test('should escape ampersands', () => {
    const input = 'Fish & Chips';
    const output = escapeHtml(input);

    expect(output).toBe('Fish &amp; Chips');
  });

  test('should escape forward slashes', () => {
    const input = '</script>';
    const output = escapeHtml(input);

    expect(output).toContain('&#x2F;');
  });

  test('should handle empty string', () => {
    expect(escapeHtml('')).toBe('');
  });

  test('should handle text without special chars', () => {
    const input = 'Hello World';
    const output = escapeHtml(input);

    expect(output).toBe('Hello World');
  });
});

describe('URL Sanitization', () => {
  test('should block javascript: URLs', () => {
    const input = 'javascript:alert(1)';
    const output = sanitizeUrl(input);

    expect(output).toBe('');
  });

  test('should block data: URLs', () => {
    const input = 'data:text/html,<script>alert(1)</script>';
    const output = sanitizeUrl(input);

    expect(output).toBe('');
  });

  test('should block vbscript: URLs', () => {
    const input = 'vbscript:msgbox(1)';
    const output = sanitizeUrl(input);

    expect(output).toBe('');
  });

  test('should allow safe HTTP URLs', () => {
    const input = 'https://example.com/page';
    const output = sanitizeUrl(input);

    expect(output).toBe(input);
  });

  test('should allow safe relative URLs', () => {
    const input = '/path/to/page';
    const output = sanitizeUrl(input);

    expect(output).toBe(input);
  });

  test('should handle mixed case dangerous protocols', () => {
    const input = 'JaVaScRiPt:alert(1)';
    const output = sanitizeUrl(input);

    expect(output).toBe('');
  });

  test('should handle empty URLs', () => {
    expect(sanitizeUrl('')).toBe('');
  });
});

describe('Filename Sanitization', () => {
  test('should remove path traversal attempts', () => {
    const input = '../../../etc/passwd';
    const output = sanitizeFilename(input);

    expect(output).not.toContain('..');
    expect(output).not.toContain('/');
  });

  test('should remove directory separators', () => {
    const input = 'path/to/file.txt';
    const output = sanitizeFilename(input);

    expect(output).not.toContain('/');
    expect(output).not.toContain('\\');
  });

  test('should allow safe characters', () => {
    const input = 'my-document_v2.pdf';
    const output = sanitizeFilename(input);

    expect(output).toBe('my-document_v2.pdf');
  });

  test('should replace unsafe characters', () => {
    const input = 'file name with spaces!@#.txt';
    const output = sanitizeFilename(input);

    expect(output).toContain('_');
    expect(output).not.toContain(' ');
    expect(output).not.toContain('!');
    expect(output).not.toContain('@');
  });

  test('should limit filename length', () => {
    const input = 'a'.repeat(300) + '.txt';
    const output = sanitizeFilename(input);

    expect(output.length).toBeLessThanOrEqual(255);
    expect(output).toContain('.txt');
  });

  test('should handle empty filename', () => {
    expect(sanitizeFilename('')).toBe('');
  });
});

describe('Object Key Sanitization (Prototype Pollution Prevention)', () => {
  test('should remove __proto__ key', () => {
    const input = { __proto__: { isAdmin: true }, name: 'John' };
    const output = sanitizeObjectKeys(input);

    expect(output).not.toHaveProperty('__proto__');
    expect(output).toHaveProperty('name');
    expect(output.name).toBe('John');
  });

  test('should remove constructor key', () => {
    const input = { constructor: { prototype: {} }, data: 'value' };
    const output = sanitizeObjectKeys(input);

    expect(output).not.toHaveProperty('constructor');
    expect(output).toHaveProperty('data');
  });

  test('should remove prototype key', () => {
    const input = { prototype: { isAdmin: true }, value: 42 };
    const output = sanitizeObjectKeys(input);

    expect(output).not.toHaveProperty('prototype');
    expect(output).toHaveProperty('value');
  });

  test('should handle nested objects', () => {
    const input = {
      safe: 'value',
      nested: {
        __proto__: { evil: true },
        data: 'nested value',
      },
    };
    const output = sanitizeObjectKeys(input);

    expect(output.nested).not.toHaveProperty('__proto__');
    expect(output.nested).toHaveProperty('data');
  });

  test('should handle arrays', () => {
    const input = [
      { __proto__: {}, value: 1 },
      { value: 2 },
    ];
    const output = sanitizeObjectKeys(input);

    expect(output[0]).not.toHaveProperty('__proto__');
    expect(output[0]).toHaveProperty('value');
    expect(output[1]).toHaveProperty('value');
  });

  test('should preserve safe object structure', () => {
    const input = {
      user: {
        name: 'John',
        email: 'john@example.com',
        settings: {
          theme: 'dark',
          notifications: true,
        },
      },
    };
    const output = sanitizeObjectKeys(input);

    expect(output.user.name).toBe('John');
    expect(output.user.settings.theme).toBe('dark');
  });

  test('should handle null and primitive values', () => {
    expect(sanitizeObjectKeys(null)).toBeNull();
    expect(sanitizeObjectKeys('string')).toBe('string');
    expect(sanitizeObjectKeys(123)).toBe(123);
    expect(sanitizeObjectKeys(true)).toBe(true);
  });
});

describe('Combined Security Scenarios', () => {
  test('should handle complex XSS attempt', () => {
    const input = `
      <p>Normal content</p>
      <script>alert('XSS')</script>
      <img src="x" onerror="alert('XSS')">
      <a href="javascript:void(0)">Click</a>
      <iframe src="evil.com"></iframe>
    `;
    const output = sanitizeHtml(input);

    expect(output).toContain('<p>Normal content</p>');
    expect(output).not.toContain('<script>');
    expect(output).not.toContain('onerror');
    expect(output).not.toContain('javascript:');
    expect(output).not.toContain('<iframe>');
  });

  test('should sanitize user-generated content safely', () => {
    const userInput = '<strong>Hello</strong> <script>alert(1)</script> World!';
    const sanitized = sanitizeHtml(userInput);

    expect(sanitized).toContain('<strong>Hello</strong>');
    expect(sanitized).toContain('World!');
    expect(sanitized).not.toContain('<script>');
  });
});
