// ============================================================================
// PHASE 8: VISUAL CSS & PRIMITIVES - DESIGN TOKEN TYPES
// ============================================================================

import { ShadowValue } from './styles';

/**
 * Color palette configuration
 */
export interface ColorTokens {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  custom: Record<string, string>;
}

/**
 * Typography configuration
 */
export interface TypographyTokens {
  fontFamilies: {
    heading: string;
    body: string;
    mono: string;
    custom: Record<string, string>;
  };
  fontSizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
  };
  fontWeights: {
    thin: number;
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
    black: number;
  };
  lineHeights: {
    none: string;
    tight: string;
    snug: string;
    normal: string;
    relaxed: string;
    loose: string;
  };
}

/**
 * Spacing scale configuration
 */
export interface SpacingTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
}

/**
 * Border radius configuration
 */
export interface BorderRadiusTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

/**
 * Shadow presets configuration
 */
export interface ShadowTokens {
  none: ShadowValue[];
  sm: ShadowValue[];
  md: ShadowValue[];
  lg: ShadowValue[];
  xl: ShadowValue[];
  '2xl': ShadowValue[];
  inner: ShadowValue[];
}

/**
 * Breakpoint configuration
 */
export interface BreakpointTokens {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

/**
 * Complete design token system
 */
export interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  borderRadius: BorderRadiusTokens;
  shadows: ShadowTokens;
  breakpoints: BreakpointTokens;
}

/**
 * Default design token values
 */
export const DEFAULT_DESIGN_TOKENS: DesignTokens = {
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#f59e0b',
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#111827',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    custom: {},
  },
  typography: {
    fontFamilies: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
      mono: 'ui-monospace, monospace',
      custom: {},
    },
    fontSizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
      '6xl': '3.75rem', // 60px
    },
    fontWeights: {
      thin: 100,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    lineHeights: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
  },
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
    '5xl': '8rem',   // 128px
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',  // 2px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px',
  },
  shadows: {
    none: [],
    sm: [
      { x: 0, y: 1, blur: 2, spread: 0, color: 'rgba(0, 0, 0, 0.05)' },
    ],
    md: [
      { x: 0, y: 4, blur: 6, spread: -1, color: 'rgba(0, 0, 0, 0.1)' },
      { x: 0, y: 2, blur: 4, spread: -1, color: 'rgba(0, 0, 0, 0.06)' },
    ],
    lg: [
      { x: 0, y: 10, blur: 15, spread: -3, color: 'rgba(0, 0, 0, 0.1)' },
      { x: 0, y: 4, blur: 6, spread: -2, color: 'rgba(0, 0, 0, 0.05)' },
    ],
    xl: [
      { x: 0, y: 20, blur: 25, spread: -5, color: 'rgba(0, 0, 0, 0.1)' },
      { x: 0, y: 10, blur: 10, spread: -5, color: 'rgba(0, 0, 0, 0.04)' },
    ],
    '2xl': [
      { x: 0, y: 25, blur: 50, spread: -12, color: 'rgba(0, 0, 0, 0.25)' },
    ],
    inner: [
      { x: 0, y: 2, blur: 4, spread: 0, color: 'rgba(0, 0, 0, 0.06)', inset: true },
    ],
  },
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
};

/**
 * Custom font configuration
 */
export interface CustomFont {
  id: string;
  workspaceId: string;
  name: string;
  family: string;
  weight: number[];
  style: string[]; // 'normal', 'italic'
  woff2Url?: string;
  woffUrl?: string;
  ttfUrl?: string;
  createdAt: Date;
}

/**
 * Font format types
 */
export type FontFormat = 'woff2' | 'woff' | 'ttf';

/**
 * Font upload request
 */
export interface FontUploadRequest {
  name: string;
  family: string;
  weight: number[];
  style: string[];
  files: {
    woff2?: File;
    woff?: File;
    ttf?: File;
  };
}

/**
 * Design system with custom fonts
 */
export interface DesignSystemWithFonts {
  id: string;
  workspaceId: string;
  name: string;
  tokens: DesignTokens;
  customTokens?: Record<string, unknown>;
  customFonts: CustomFont[];
  createdAt: Date;
  updatedAt: Date;
}
