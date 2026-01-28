// ============================================================================
// PHASE 8: VISUAL CSS & PRIMITIVES - PRIMITIVE ELEMENT TYPES
// ============================================================================

/**
 * Primitive element types
 */
export type PrimitiveType =
  // Container Elements
  | 'CONTAINER'      // Generic div with layout controls
  | 'SECTION'        // Semantic section element
  | 'GRID'           // CSS Grid wrapper
  | 'FLEXBOX'        // Flexbox wrapper

  // Content Elements
  | 'TEXT'           // Paragraph/heading text
  | 'RICH_TEXT'      // WYSIWYG text block
  | 'IMAGE'          // Responsive image
  | 'VIDEO'          // Video embed
  | 'ICON'           // Icon from library

  // Interactive Elements
  | 'BUTTON'         // Interactive button
  | 'LINK'           // Anchor element
  | 'EMBED'          // Custom HTML/iFrame

  // Utility Elements
  | 'DIVIDER'        // Horizontal rule
  | 'SPACER'         // Responsive spacing
  | 'LIST';          // UL/OL with styling

/**
 * Container element content
 */
export interface ContainerContent {
  tag?: 'div' | 'section' | 'article' | 'aside' | 'main' | 'header' | 'footer' | 'nav';
}

/**
 * Section element content
 */
export interface SectionContent {
  tag?: 'section' | 'article' | 'aside';
  maxWidth?: string;
  centered?: boolean;
}

/**
 * Text element content
 */
export interface TextContent {
  tag: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'label';
  text: string;
}

/**
 * Rich text element content
 */
export interface RichTextContent {
  html: string;
}

/**
 * Image element content
 */
export interface ImageContent {
  src: string;
  alt: string;
  title?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  srcSet?: string;
}

/**
 * Video element content
 */
export interface VideoContent {
  type: 'youtube' | 'vimeo' | 'self-hosted';
  src: string;
  poster?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  aspectRatio?: '16:9' | '4:3' | '1:1' | 'custom';
}

/**
 * Icon element content
 */
export interface IconContent {
  name: string; // Lucide icon name
  size?: number;
}

/**
 * Button element content
 */
export interface ButtonContent {
  text: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  icon?: string; // Lucide icon name
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  onClick?: string; // Action identifier
}

/**
 * Link element content
 */
export interface LinkContent {
  text: string;
  href: string;
  target?: '_self' | '_blank' | '_parent' | '_top';
  rel?: string;
  type?: 'internal' | 'external' | 'anchor' | 'email' | 'phone';
}

/**
 * Embed element content
 */
export interface EmbedContent {
  type: 'html' | 'iframe' | 'script';
  code: string;
  aspectRatio?: string;
  allowFullscreen?: boolean;
  sandbox?: string[];
}

/**
 * Divider element content
 */
export interface DividerContent {
  orientation?: 'horizontal' | 'vertical';
  thickness?: string;
  style?: 'solid' | 'dashed' | 'dotted';
}

/**
 * Spacer element content
 */
export interface SpacerContent {
  height?: string;
  width?: string;
}

/**
 * List element content
 */
export interface ListContent {
  type: 'ul' | 'ol';
  items: Array<{
    id: string;
    content: string;
  }>;
  marker?: 'disc' | 'circle' | 'square' | 'decimal' | 'lower-alpha' | 'upper-alpha' | 'lower-roman' | 'upper-roman' | 'none';
}

/**
 * Grid element content
 */
export interface GridContent {
  columns?: number;
  rows?: number;
  autoFlow?: 'row' | 'column' | 'dense';
}

/**
 * Flexbox element content
 */
export interface FlexboxContent {
  direction?: 'row' | 'column';
  wrap?: boolean;
}

/**
 * Union type for all element content types
 */
export type ElementContent =
  | ContainerContent
  | SectionContent
  | TextContent
  | RichTextContent
  | ImageContent
  | VideoContent
  | IconContent
  | ButtonContent
  | LinkContent
  | EmbedContent
  | DividerContent
  | SpacerContent
  | ListContent
  | GridContent
  | FlexboxContent
  | Record<string, unknown>; // For custom content

/**
 * Primitive element configuration
 */
export interface PrimitiveConfig {
  type: PrimitiveType;
  name: string;
  icon: string; // Lucide icon name
  category: 'layout' | 'content' | 'interactive' | 'utility';
  defaultContent: ElementContent;
  defaultStyles: Record<string, unknown>;
  description?: string;
}

/**
 * Primitive element registry
 */
export const PRIMITIVE_CONFIGS: Record<PrimitiveType, PrimitiveConfig> = {
  CONTAINER: {
    type: 'CONTAINER',
    name: 'Container',
    icon: 'Box',
    category: 'layout',
    defaultContent: { tag: 'div' },
    defaultStyles: { display: 'block' },
    description: 'Generic container with layout controls',
  },
  SECTION: {
    type: 'SECTION',
    name: 'Section',
    icon: 'LayoutTemplate',
    category: 'layout',
    defaultContent: { tag: 'section', centered: true },
    defaultStyles: { display: 'block', width: '100%' },
    description: 'Full-width semantic section',
  },
  GRID: {
    type: 'GRID',
    name: 'Grid',
    icon: 'LayoutGrid',
    category: 'layout',
    defaultContent: { columns: 2, rows: 2 },
    defaultStyles: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' },
    description: 'CSS Grid layout container',
  },
  FLEXBOX: {
    type: 'FLEXBOX',
    name: 'Flexbox',
    icon: 'Columns',
    category: 'layout',
    defaultContent: { direction: 'row', wrap: false },
    defaultStyles: { display: 'flex', gap: '1rem' },
    description: 'Flexbox layout container',
  },
  TEXT: {
    type: 'TEXT',
    name: 'Text',
    icon: 'Type',
    category: 'content',
    defaultContent: { tag: 'p', text: 'Enter your text here' },
    defaultStyles: {},
    description: 'Text element (paragraph, heading, etc.)',
  },
  RICH_TEXT: {
    type: 'RICH_TEXT',
    name: 'Rich Text',
    icon: 'FileText',
    category: 'content',
    defaultContent: { html: '<p>Enter rich text here</p>' },
    defaultStyles: {},
    description: 'WYSIWYG rich text editor',
  },
  IMAGE: {
    type: 'IMAGE',
    name: 'Image',
    icon: 'Image',
    category: 'content',
    defaultContent: { src: '', alt: '', loading: 'lazy' },
    defaultStyles: { maxWidth: '100%', height: 'auto' },
    description: 'Responsive image',
  },
  VIDEO: {
    type: 'VIDEO',
    name: 'Video',
    icon: 'Video',
    category: 'content',
    defaultContent: { type: 'youtube', src: '', aspectRatio: '16:9' },
    defaultStyles: { width: '100%' },
    description: 'Video embed (YouTube, Vimeo, self-hosted)',
  },
  ICON: {
    type: 'ICON',
    name: 'Icon',
    icon: 'Smile',
    category: 'content',
    defaultContent: { name: 'star', size: 24 },
    defaultStyles: {},
    description: 'Icon from Lucide library',
  },
  BUTTON: {
    type: 'BUTTON',
    name: 'Button',
    icon: 'MousePointer',
    category: 'interactive',
    defaultContent: { text: 'Click me', variant: 'primary', size: 'md' },
    defaultStyles: {},
    description: 'Interactive button',
  },
  LINK: {
    type: 'LINK',
    name: 'Link',
    icon: 'Link',
    category: 'interactive',
    defaultContent: { text: 'Link text', href: '#', type: 'internal' },
    defaultStyles: {},
    description: 'Anchor link element',
  },
  EMBED: {
    type: 'EMBED',
    name: 'Embed',
    icon: 'Code',
    category: 'interactive',
    defaultContent: { type: 'html', code: '' },
    defaultStyles: {},
    description: 'Custom HTML, iFrame, or script',
  },
  DIVIDER: {
    type: 'DIVIDER',
    name: 'Divider',
    icon: 'Minus',
    category: 'utility',
    defaultContent: { orientation: 'horizontal', style: 'solid' },
    defaultStyles: { width: '100%', borderTopWidth: '1px' },
    description: 'Horizontal or vertical divider',
  },
  SPACER: {
    type: 'SPACER',
    name: 'Spacer',
    icon: 'Space',
    category: 'utility',
    defaultContent: { height: '2rem' },
    defaultStyles: {},
    description: 'Responsive spacing element',
  },
  LIST: {
    type: 'LIST',
    name: 'List',
    icon: 'List',
    category: 'utility',
    defaultContent: { type: 'ul', items: [], marker: 'disc' },
    defaultStyles: {},
    description: 'Ordered or unordered list',
  },
};
