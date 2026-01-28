// ============================================================================
// PHASE 8: STYLE INJECTION UTILITIES
// ============================================================================

import { ResponsiveStyles, StateStyles } from '@/types/styles';
import { generateResponsiveCSS, DEFAULT_BREAKPOINTS } from './responsive-utils';
import { stylesToCSS } from './css-generator';

/**
 * Style injection options
 */
export interface StyleInjectionOptions {
  elementId: string;
  responsiveStyles: ResponsiveStyles;
  stateStyles?: StateStyles;
  className?: string;
  breakpoints?: typeof DEFAULT_BREAKPOINTS;
}

/**
 * Generate unique style ID for an element
 */
export function getElementStyleId(elementId: string): string {
  return `element-style-${elementId}`;
}

/**
 * Generate CSS for an element including responsive and state styles
 */
export function generateElementCSS(options: StyleInjectionOptions): string {
  const { elementId, responsiveStyles, stateStyles, className, breakpoints } = options;

  // Use className if provided, otherwise use data attribute selector
  const selector = className
    ? `.${className}`
    : `[data-element-id="${elementId}"]`;

  const rules: string[] = [];

  // Generate responsive styles
  const responsiveCSS = generateResponsiveCSS(selector, responsiveStyles, breakpoints);
  if (responsiveCSS) {
    rules.push(responsiveCSS);
  }

  // Generate state styles (hover, focus, active, disabled)
  if (stateStyles) {
    if (stateStyles.hover) {
      const hoverCSS = stylesToCSS(stateStyles.hover);
      if (hoverCSS) {
        rules.push(`${selector}:hover { ${hoverCSS} }`);
      }
    }

    if (stateStyles.focus) {
      const focusCSS = stylesToCSS(stateStyles.focus);
      if (focusCSS) {
        rules.push(`${selector}:focus { ${focusCSS} }`);
      }
    }

    if (stateStyles.active) {
      const activeCSS = stylesToCSS(stateStyles.active);
      if (activeCSS) {
        rules.push(`${selector}:active { ${activeCSS} }`);
      }
    }

    if (stateStyles.disabled) {
      const disabledCSS = stylesToCSS(stateStyles.disabled);
      if (disabledCSS) {
        rules.push(`${selector}:disabled { ${disabledCSS} }`);
      }
    }
  }

  return rules.join('\n');
}

/**
 * Inject styles for an element into the DOM
 */
export function injectElementStyles(options: StyleInjectionOptions): void {
  if (typeof document === 'undefined') return; // SSR guard

  const styleId = getElementStyleId(options.elementId);
  const css = generateElementCSS(options);

  // Remove existing style tag if present
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }

  // Don't inject if no CSS
  if (!css) return;

  // Create and inject new style tag
  const styleTag = document.createElement('style');
  styleTag.id = styleId;
  styleTag.textContent = css;
  document.head.appendChild(styleTag);
}

/**
 * Remove injected styles for an element
 */
export function removeElementStyles(elementId: string): void {
  if (typeof document === 'undefined') return;

  const styleId = getElementStyleId(elementId);
  const styleTag = document.getElementById(styleId);
  if (styleTag) {
    styleTag.remove();
  }
}

/**
 * Update element styles (removes old, injects new)
 */
export function updateElementStyles(options: StyleInjectionOptions): void {
  removeElementStyles(options.elementId);
  injectElementStyles(options);
}

/**
 * Batch inject styles for multiple elements
 */
export function batchInjectStyles(elements: StyleInjectionOptions[]): void {
  if (typeof document === 'undefined') return;

  const css = elements
    .map(options => generateElementCSS(options))
    .filter(Boolean)
    .join('\n\n');

  if (!css) return;

  // Use a single style tag for all elements
  const styleId = 'builder-elements-styles';
  let styleTag = document.getElementById(styleId) as HTMLStyleElement;

  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = styleId;
    document.head.appendChild(styleTag);
  }

  styleTag.textContent = css;
}

/**
 * Clear all builder element styles
 */
export function clearAllBuilderStyles(): void {
  if (typeof document === 'undefined') return;

  const styleTag = document.getElementById('builder-elements-styles');
  if (styleTag) {
    styleTag.remove();
  }

  // Also remove individual element styles
  const individualStyles = document.querySelectorAll('style[id^="element-style-"]');
  individualStyles.forEach(style => style.remove());
}

/**
 * Generate scoped CSS class name for an element
 */
export function generateScopedClassName(elementId: string, type: string): string {
  // Create a short hash of the element ID for the class name
  const hash = elementId.slice(0, 8);
  return `el-${type.toLowerCase()}-${hash}`;
}
