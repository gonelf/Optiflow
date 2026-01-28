// ============================================================================
// PHASE 8: RESPONSIVE UTILITIES
// ============================================================================

import { ResponsiveStyles, ElementStyles, Breakpoint } from '@/types/styles';
import { BreakpointTokens } from '@/types/design-tokens';
import { stylesToCSS, generateCSSRule } from './css-generator';

/**
 * Default breakpoint values (matches Tailwind defaults)
 */
export const DEFAULT_BREAKPOINTS: BreakpointTokens = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * Get media query string for a breakpoint
 */
export function getMediaQuery(breakpoint: Breakpoint, breakpoints = DEFAULT_BREAKPOINTS): string {
  if (breakpoint === 'base') return '';

  const width = breakpoints[breakpoint as keyof BreakpointTokens];
  return `@media (min-width: ${width}px)`;
}

/**
 * Generate responsive CSS rules from ResponsiveStyles
 */
export function generateResponsiveCSS(
  selector: string,
  responsiveStyles: ResponsiveStyles,
  breakpoints = DEFAULT_BREAKPOINTS
): string {
  const rules: string[] = [];

  // Base styles (mobile-first)
  if (responsiveStyles.base) {
    const baseRule = generateCSSRule(selector, responsiveStyles.base);
    if (baseRule) rules.push(baseRule);
  }

  // Breakpoint-specific styles
  const breakpointOrder: Array<keyof ResponsiveStyles> = ['sm', 'md', 'lg', 'xl', '2xl'];

  for (const bp of breakpointOrder) {
    const styles = responsiveStyles[bp];
    if (!styles || Object.keys(styles).length === 0) continue;

    const mediaQuery = getMediaQuery(bp as Breakpoint, breakpoints);
    const rule = generateCSSRule(selector, styles);

    if (rule && mediaQuery) {
      rules.push(`${mediaQuery} { ${rule} }`);
    }
  }

  return rules.join('\n');
}

/**
 * Resolve styles for a specific breakpoint (with inheritance)
 */
export function resolveStylesAtBreakpoint(
  responsiveStyles: ResponsiveStyles,
  breakpoint: Breakpoint
): Partial<ElementStyles> {
  const breakpointOrder: Breakpoint[] = ['base', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);

  // Merge styles from base up to current breakpoint
  const merged: Partial<ElementStyles> = { ...responsiveStyles.base };

  for (let i = 1; i <= currentIndex; i++) {
    const bp = breakpointOrder[i];
    const bpStyles = responsiveStyles[bp];
    if (bpStyles) {
      Object.assign(merged, bpStyles);
    }
  }

  return merged;
}

/**
 * Get overridden properties at a specific breakpoint
 */
export function getBreakpointOverrides(
  responsiveStyles: ResponsiveStyles,
  breakpoint: Breakpoint
): Set<string> {
  if (breakpoint === 'base') return new Set();

  const styles = responsiveStyles[breakpoint];
  if (!styles) return new Set();

  return new Set(Object.keys(styles));
}

/**
 * Check if a property is overridden at a breakpoint
 */
export function isPropertyOverridden(
  responsiveStyles: ResponsiveStyles,
  breakpoint: Breakpoint,
  property: string
): boolean {
  const overrides = getBreakpointOverrides(responsiveStyles, breakpoint);
  return overrides.has(property);
}

/**
 * Clear breakpoint overrides for specific properties
 */
export function clearBreakpointOverrides(
  responsiveStyles: ResponsiveStyles,
  breakpoint: Breakpoint,
  properties?: string[]
): ResponsiveStyles {
  if (breakpoint === 'base') return responsiveStyles;

  const newStyles = { ...responsiveStyles };
  const bpStyles = { ...newStyles[breakpoint] };

  if (!bpStyles) return responsiveStyles;

  if (properties) {
    // Clear specific properties
    for (const prop of properties) {
      delete bpStyles[prop as keyof ElementStyles];
    }
  } else {
    // Clear all overrides
    delete newStyles[breakpoint];
    return newStyles;
  }

  newStyles[breakpoint] = bpStyles;
  return newStyles;
}

/**
 * Copy styles from one breakpoint to another
 */
export function copyBreakpointStyles(
  responsiveStyles: ResponsiveStyles,
  fromBreakpoint: Breakpoint,
  toBreakpoint: Breakpoint
): ResponsiveStyles {
  const newStyles = { ...responsiveStyles };
  const sourceStyles = responsiveStyles[fromBreakpoint];

  if (!sourceStyles) return responsiveStyles;

  newStyles[toBreakpoint] = { ...sourceStyles };
  return newStyles;
}

/**
 * Get the current breakpoint based on viewport width
 */
export function getCurrentBreakpoint(
  viewportWidth: number,
  breakpoints = DEFAULT_BREAKPOINTS
): Breakpoint {
  if (viewportWidth >= breakpoints['2xl']) return '2xl';
  if (viewportWidth >= breakpoints.xl) return 'xl';
  if (viewportWidth >= breakpoints.lg) return 'lg';
  if (viewportWidth >= breakpoints.md) return 'md';
  if (viewportWidth >= breakpoints.sm) return 'sm';
  return 'base';
}

/**
 * Get device frame dimensions
 */
export function getDeviceFrameDimensions(device: 'mobile' | 'tablet' | 'desktop'): {
  width: number;
  height: number;
} {
  switch (device) {
    case 'mobile':
      return { width: 375, height: 667 }; // iPhone SE
    case 'tablet':
      return { width: 768, height: 1024 }; // iPad
    case 'desktop':
      return { width: 1440, height: 900 }; // Desktop
    default:
      return { width: 1440, height: 900 };
  }
}

/**
 * Generate responsive style object for React inline styles
 */
export function getResponsiveInlineStyles(
  responsiveStyles: ResponsiveStyles,
  currentBreakpoint: Breakpoint
): React.CSSProperties {
  const resolved = resolveStylesAtBreakpoint(responsiveStyles, currentBreakpoint);
  return resolved as React.CSSProperties;
}

/**
 * Detect if styles have any responsive overrides
 */
export function hasResponsiveOverrides(responsiveStyles: ResponsiveStyles): boolean {
  const breakpoints: Array<keyof ResponsiveStyles> = ['sm', 'md', 'lg', 'xl', '2xl'];
  return breakpoints.some(bp => {
    const styles = responsiveStyles[bp];
    return styles && Object.keys(styles).length > 0;
  });
}
