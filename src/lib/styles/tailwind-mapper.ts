// ============================================================================
// PHASE 8: TAILWIND CLASS MAPPER
// ============================================================================

import { ElementStyles } from '@/types/styles';

/**
 * Mapping of common CSS values to Tailwind classes
 */
const TAILWIND_MAPPINGS: Record<string, Record<string, string>> = {
  display: {
    block: 'block',
    flex: 'flex',
    grid: 'grid',
    inline: 'inline',
    'inline-block': 'inline-block',
    none: 'hidden',
  },
  flexDirection: {
    row: 'flex-row',
    column: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'column-reverse': 'flex-col-reverse',
  },
  justifyContent: {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  },
  alignItems: {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  },
  flexWrap: {
    wrap: 'flex-wrap',
    nowrap: 'flex-nowrap',
    'wrap-reverse': 'flex-wrap-reverse',
  },
  position: {
    static: 'static',
    relative: 'relative',
    absolute: 'absolute',
    fixed: 'fixed',
    sticky: 'sticky',
  },
  textAlign: {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  },
  textTransform: {
    none: 'normal-case',
    uppercase: 'uppercase',
    lowercase: 'lowercase',
    capitalize: 'capitalize',
  },
  overflow: {
    visible: 'overflow-visible',
    hidden: 'overflow-hidden',
    scroll: 'overflow-scroll',
    auto: 'overflow-auto',
  },
  objectFit: {
    contain: 'object-contain',
    cover: 'object-cover',
    fill: 'object-fill',
    none: 'object-none',
    'scale-down': 'object-scale-down',
  },
  cursor: {
    auto: 'cursor-auto',
    pointer: 'cursor-pointer',
    'not-allowed': 'cursor-not-allowed',
    wait: 'cursor-wait',
    text: 'cursor-text',
    move: 'cursor-move',
  },
};

/**
 * Spacing scale mapping (Tailwind units)
 */
const SPACING_SCALE: Record<string, string> = {
  '0': '0',
  '0.125rem': '0.5',
  '0.25rem': '1',
  '0.5rem': '2',
  '0.75rem': '3',
  '1rem': '4',
  '1.25rem': '5',
  '1.5rem': '6',
  '2rem': '8',
  '2.5rem': '10',
  '3rem': '12',
  '4rem': '16',
  '5rem': '20',
  '6rem': '24',
  '8rem': '32',
};

/**
 * Try to map a CSS property/value to a Tailwind class
 */
export function mapToTailwindClass(property: string, value: unknown): string | null {
  const valueStr = String(value);

  // Direct mappings
  if (TAILWIND_MAPPINGS[property]?.[valueStr]) {
    return TAILWIND_MAPPINGS[property][valueStr];
  }

  // Spacing properties (padding, margin)
  if (property.startsWith('padding') || property.startsWith('margin')) {
    const spacing = SPACING_SCALE[valueStr];
    if (spacing) {
      const prefix = property.startsWith('padding') ? 'p' : 'm';
      const side = property.replace('padding', '').replace('margin', '').toLowerCase();

      const sideMap: Record<string, string> = {
        top: 't',
        right: 'r',
        bottom: 'b',
        left: 'l',
        '': '', // For just 'padding' or 'margin'
      };

      const suffix = sideMap[side] || '';
      return `${prefix}${suffix}-${spacing}`;
    }
  }

  // Width/Height
  if (property === 'width' || property === 'height') {
    const prefix = property === 'width' ? 'w' : 'h';

    const sizeMap: Record<string, string> = {
      '100%': 'full',
      '50%': '1/2',
      '33.333333%': '1/3',
      '66.666667%': '2/3',
      '25%': '1/4',
      '75%': '3/4',
      'auto': 'auto',
      'min-content': 'min',
      'max-content': 'max',
      'fit-content': 'fit',
    };

    if (sizeMap[valueStr]) {
      return `${prefix}-${sizeMap[valueStr]}`;
    }

    // Screen units
    if (valueStr === '100vw') return 'w-screen';
    if (valueStr === '100vh') return 'h-screen';

    // Spacing scale
    const spacing = SPACING_SCALE[valueStr];
    if (spacing) return `${prefix}-${spacing}`;
  }

  // Font size
  if (property === 'fontSize') {
    const fontSizeMap: Record<string, string> = {
      '0.75rem': 'text-xs',
      '0.875rem': 'text-sm',
      '1rem': 'text-base',
      '1.125rem': 'text-lg',
      '1.25rem': 'text-xl',
      '1.5rem': 'text-2xl',
      '1.875rem': 'text-3xl',
      '2.25rem': 'text-4xl',
      '3rem': 'text-5xl',
    };
    return fontSizeMap[valueStr] || null;
  }

  // Font weight
  if (property === 'fontWeight') {
    const weightMap: Record<string, string> = {
      '100': 'font-thin',
      '200': 'font-extralight',
      '300': 'font-light',
      '400': 'font-normal',
      '500': 'font-medium',
      '600': 'font-semibold',
      '700': 'font-bold',
      '800': 'font-extrabold',
      '900': 'font-black',
    };
    return weightMap[valueStr] || null;
  }

  // Border radius
  if (property === 'borderRadius') {
    const radiusMap: Record<string, string> = {
      '0': 'rounded-none',
      '0.125rem': 'rounded-sm',
      '0.25rem': 'rounded',
      '0.375rem': 'rounded-md',
      '0.5rem': 'rounded-lg',
      '0.75rem': 'rounded-xl',
      '1rem': 'rounded-2xl',
      '9999px': 'rounded-full',
    };
    return radiusMap[valueStr] || null;
  }

  // Opacity
  if (property === 'opacity') {
    const opacityValue = Math.round(Number(value) * 100);
    if (!isNaN(opacityValue)) {
      return `opacity-${opacityValue}`;
    }
  }

  return null;
}

/**
 * Convert ElementStyles to Tailwind classes where possible
 */
export function stylesToTailwindClasses(styles: Partial<ElementStyles>): {
  classes: string[];
  inlineStyles: Partial<ElementStyles>;
} {
  const classes: string[] = [];
  const inlineStyles: Partial<ElementStyles> = {};

  for (const [key, value] of Object.entries(styles)) {
    if (value === undefined || value === null) continue;

    const tailwindClass = mapToTailwindClass(key, value);
    if (tailwindClass) {
      classes.push(tailwindClass);
    } else {
      // If we can't map to Tailwind, use inline styles
      (inlineStyles as any)[key] = value;
    }
  }

  return { classes, inlineStyles };
}

/**
 * Combine custom className with generated Tailwind classes
 */
export function combineClasses(...classNames: (string | undefined | null | false)[]): string {
  return classNames.filter(Boolean).join(' ');
}

/**
 * Check if a value can be represented as a Tailwind class
 */
export function canMapToTailwind(property: string, value: unknown): boolean {
  return mapToTailwindClass(property, value) !== null;
}
