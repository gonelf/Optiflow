// ============================================================================
// PHASE 8: VISUAL CSS & PRIMITIVES - STYLE TYPE DEFINITIONS
// ============================================================================

/**
 * Unit types for CSS values
 */
export type CSSUnit = 'px' | 'rem' | 'em' | '%' | 'vw' | 'vh' | 'auto';

/**
 * Spacing value with shorthand support
 */
export type SpacingValue = string | {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
};

/**
 * Shadow configuration
 */
export interface ShadowValue {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  inset?: boolean;
}

/**
 * Gradient configuration
 */
export interface GradientValue {
  type: 'linear' | 'radial';
  angle?: number;
  stops: Array<{
    color: string;
    position: number; // 0-100
  }>;
}

/**
 * Comprehensive element style properties
 */
export interface ElementStyles {
  // Layout
  display?: 'block' | 'flex' | 'grid' | 'inline' | 'inline-block' | 'none';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  gap?: string;
  flexWrap?: 'wrap' | 'nowrap' | 'wrap-reverse';

  // Grid
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridColumn?: string;
  gridRow?: string;
  gridAutoFlow?: 'row' | 'column' | 'dense' | 'row dense' | 'column dense';
  gridAutoColumns?: string;
  gridAutoRows?: string;

  // Sizing
  width?: string;
  height?: string;
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;

  // Spacing (Box Model)
  padding?: SpacingValue;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  margin?: SpacingValue;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;

  // Position
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number;

  // Typography
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  color?: string;

  // Background
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto' | string;
  backgroundPosition?: string;
  backgroundRepeat?: 'repeat' | 'no-repeat' | 'repeat-x' | 'repeat-y';
  backgroundGradient?: GradientValue;

  // Border
  borderWidth?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderColor?: string;
  borderRadius?: string;
  borderTopLeftRadius?: string;
  borderTopRightRadius?: string;
  borderBottomLeftRadius?: string;
  borderBottomRightRadius?: string;
  borderTopWidth?: string;
  borderRightWidth?: string;
  borderBottomWidth?: string;
  borderLeftWidth?: string;

  // Effects
  boxShadow?: ShadowValue[];
  opacity?: number;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowX?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowY?: 'visible' | 'hidden' | 'scroll' | 'auto';
  cursor?: string;
  transition?: string;
  transform?: string;
  filter?: string;

  // Additional properties
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  aspectRatio?: string;
  pointerEvents?: 'auto' | 'none';
  userSelect?: 'auto' | 'none' | 'text' | 'all';

  // List styles
  listStyleType?: string;
}

/**
 * Responsive style breakpoints
 */
export type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Responsive styles configuration
 */
export interface ResponsiveStyles {
  base: ElementStyles;      // Mobile-first default
  sm?: ElementStyles;       // 640px+
  md?: ElementStyles;       // 768px+
  lg?: ElementStyles;       // 1024px+
  xl?: ElementStyles;       // 1280px+
  '2xl'?: ElementStyles;    // 1536px+
}

/**
 * State-based styles (pseudo-classes)
 */
export interface StateStyles {
  hover?: Partial<ElementStyles>;
  focus?: Partial<ElementStyles>;
  active?: Partial<ElementStyles>;
  disabled?: Partial<ElementStyles>;
}

/**
 * Complete style definition for an element
 */
export interface ElementStyleDefinition {
  responsive: ResponsiveStyles;
  states?: StateStyles;
}
