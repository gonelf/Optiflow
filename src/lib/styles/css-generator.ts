// ============================================================================
// PHASE 8: CSS GENERATION UTILITIES
// ============================================================================

import { ElementStyles, ShadowValue, GradientValue, SpacingValue } from '@/types/styles';

/**
 * Convert a shadow value to CSS box-shadow string
 */
export function shadowToCSS(shadow: ShadowValue): string {
  const { x, y, blur, spread, color, inset } = shadow;
  const prefix = inset ? 'inset ' : '';
  return `${prefix}${x}px ${y}px ${blur}px ${spread}px ${color}`;
}

/**
 * Convert an array of shadows to CSS box-shadow string
 */
export function shadowsToCSS(shadows: ShadowValue[]): string {
  return shadows.map(shadowToCSS).join(', ');
}

/**
 * Convert a gradient value to CSS gradient string
 */
export function gradientToCSS(gradient: GradientValue): string {
  const { type, angle = 0, stops } = gradient;

  const stopsCSS = stops
    .map(stop => `${stop.color} ${stop.position}%`)
    .join(', ');

  if (type === 'linear') {
    return `linear-gradient(${angle}deg, ${stopsCSS})`;
  } else {
    return `radial-gradient(circle, ${stopsCSS})`;
  }
}

/**
 * Convert spacing value to CSS
 */
export function spacingToCSS(spacing: SpacingValue): string {
  if (typeof spacing === 'string') {
    return spacing;
  }

  const { top = '0', right = '0', bottom = '0', left = '0' } = spacing;
  return `${top} ${right} ${bottom} ${left}`;
}

/**
 * Normalize CSS property name (camelCase to kebab-case)
 */
export function normalizePropertyName(prop: string): string {
  return prop.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * Convert ElementStyles object to CSS string
 */
export function stylesToCSS(styles: Partial<ElementStyles>): string {
  const cssRules: string[] = [];

  for (const [key, value] of Object.entries(styles)) {
    if (value === undefined || value === null) continue;

    const propName = normalizePropertyName(key);
    let cssValue: string;

    // Handle special cases
    if (key === 'boxShadow' && Array.isArray(value)) {
      cssValue = shadowsToCSS(value as ShadowValue[]);
    } else if (key === 'backgroundGradient' && typeof value === 'object') {
      cssRules.push(`background-image: ${gradientToCSS(value as GradientValue)}`);
      continue;
    } else if ((key === 'padding' || key === 'margin') && typeof value === 'object') {
      cssValue = spacingToCSS(value as SpacingValue);
    } else if (typeof value === 'number') {
      // Add px for numeric values that need it
      const needsPx = ![
        'opacity',
        'z-index',
        'font-weight',
        'flex-grow',
        'flex-shrink',
        'order',
        'line-height',
      ].includes(propName);
      cssValue = needsPx ? `${value}px` : String(value);
    } else {
      cssValue = String(value);
    }

    cssRules.push(`${propName}: ${cssValue}`);
  }

  return cssRules.join('; ');
}

/**
 * Convert ElementStyles object to CSS object (for React inline styles)
 */
export function stylesToCSSObject(styles: Partial<ElementStyles>): React.CSSProperties {
  const cssObject: React.CSSProperties = {};

  for (const [key, value] of Object.entries(styles)) {
    if (value === undefined || value === null) continue;

    // Handle special cases
    if (key === 'boxShadow' && Array.isArray(value)) {
      cssObject.boxShadow = shadowsToCSS(value as ShadowValue[]);
    } else if (key === 'backgroundGradient' && typeof value === 'object') {
      cssObject.backgroundImage = gradientToCSS(value as GradientValue);
    } else if ((key === 'padding' || key === 'margin') && typeof value === 'object') {
      (cssObject as any)[key] = spacingToCSS(value as SpacingValue);
    } else if (typeof value === 'number') {
      // React CSSProperties handles numeric values automatically for most properties
      cssObject[key as keyof React.CSSProperties] = value as any;
    } else {
      cssObject[key as keyof React.CSSProperties] = value as any;
    }
  }

  return cssObject;
}

/**
 * Generate CSS class from styles (returns CSS rule)
 */
export function generateCSSRule(selector: string, styles: Partial<ElementStyles>): string {
  const css = stylesToCSS(styles);
  if (!css) return '';
  return `${selector} { ${css} }`;
}

/**
 * Merge multiple style objects (later styles override earlier ones)
 */
export function mergeStyles(...styles: Partial<ElementStyles>[]): Partial<ElementStyles> {
  return Object.assign({}, ...styles);
}

/**
 * Check if a style value is a token reference
 */
export function isTokenReference(value: string): boolean {
  return typeof value === 'string' && value.startsWith('var(--');
}

/**
 * Convert a token name to CSS variable
 */
export function tokenToVariable(tokenName: string): string {
  return `var(--${tokenName})`;
}

/**
 * Extract token name from CSS variable
 */
export function variableToToken(cssVar: string): string | null {
  const match = cssVar.match(/var\(--(.+)\)/);
  return match ? match[1] : null;
}
