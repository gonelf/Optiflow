// ============================================================================
// PHASE 8: VISUAL CSS & PRIMITIVES - BUILDER TYPES
// ============================================================================

import { ComponentType } from '@prisma/client';
import { PrimitiveType, ElementContent } from './primitives';
import { ResponsiveStyles, StateStyles } from './styles';

/**
 * Combined element type (primitives + components)
 */

/**
 * Legacy component definition (flat system)
 */
export interface BuilderComponent {
  id: string;
  type: ComponentType;
  name: string;
  order: number;
  config: Record<string, any>;
  styles: Record<string, any>;
  content: Record<string, any>;
}

/**
 * Page metadata
 */
export interface PageMetadata {
  title: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  favicon?: string;
}

/**
 * Combined element type (primitives + components)
 */
export type ElementType = PrimitiveType | ComponentType | string;

/**
 * Builder element (enhanced component)
 */
export interface BuilderElement {
  id: string;
  type: ElementType;
  name: string;
  pageId: string;
  variantId?: string | null;

  // Hierarchy
  parentId: string | null;
  order: number;
  depth: number;
  path: string;
  children?: string[];

  // Content & Styles
  content: ElementContent;
  styles: ResponsiveStyles;
  stateStyles?: StateStyles;

  // Metadata
  locked?: boolean;
  hidden?: boolean;
  className?: string;
  attributes?: Record<string, string>;

  // AI
  aiPrompt?: string | null;
  aiGenerated?: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Element creation request
 */
export interface CreateElementRequest {
  type: ElementType;
  name: string;
  parentId?: string | null;
  order: number;
  content?: Partial<ElementContent>;
  styles?: Partial<ResponsiveStyles>;
}

/**
 * Element update request
 */
export interface UpdateElementRequest {
  name?: string;
  parentId?: string | null;
  order?: number;
  content?: Partial<ElementContent>;
  styles?: Partial<ResponsiveStyles>;
  stateStyles?: Partial<StateStyles>;
  locked?: boolean;
  hidden?: boolean;
  className?: string;
  attributes?: Record<string, string>;
}

/**
 * Element tree node (for tree view)
 */
export interface ElementTreeNode {
  element: BuilderElement;
  children: ElementTreeNode[];
  isExpanded?: boolean;
  isSelected?: boolean;
}

/**
 * Element clipboard data
 */
export interface ElementClipboard {
  type: 'copy' | 'cut';
  element: BuilderElement;
  children?: BuilderElement[];
}

/**
 * Element operation types
 */
export type ElementOperation =
  | { type: 'add'; element: BuilderElement }
  | { type: 'update'; id: string; changes: Partial<BuilderElement> }
  | { type: 'delete'; id: string }
  | { type: 'reorder'; id: string; newOrder: number; newParentId?: string }
  | { type: 'duplicate'; id: string }
  | { type: 'move'; id: string; newParentId: string | null; newOrder: number };

/**
 * Element filter options
 */
export interface ElementFilter {
  type?: ElementType;
  parentId?: string | null;
  hidden?: boolean;
  locked?: boolean;
  search?: string;
}

/**
 * Element sort options
 */
export interface ElementSort {
  field: 'order' | 'name' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

/**
 * Canvas selection state
 */
export interface CanvasSelection {
  selectedElementIds: string[];
  hoveredElementId: string | null;
  focusedElementId: string | null;
}

/**
 * Canvas viewport state
 */
export interface CanvasViewport {
  zoom: number;
  panX: number;
  panY: number;
  breakpoint: 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  deviceFrame?: 'mobile' | 'tablet' | 'desktop' | 'none';
}

/**
 * Builder mode
 */
export type BuilderMode = 'edit' | 'preview' | 'comment';

/**
 * Builder panel visibility
 */
export interface PanelVisibility {
  leftSidebar: boolean;
  rightPanel: boolean;
  toolbar: boolean;
  elementTree: boolean;
}

/**
 * Complete builder state
 */
export interface BuilderState {
  // Page & Elements
  pageId: string;
  elements: BuilderElement[];
  elementMap: Map<string, BuilderElement>;

  // Selection & Focus
  selection: CanvasSelection;

  // Viewport
  viewport: CanvasViewport;

  // UI State
  mode: BuilderMode;
  panels: PanelVisibility;

  // Clipboard
  clipboard: ElementClipboard | null;

  // History
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Element validation result
 */
export interface ElementValidation {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Element metrics (for analytics)
 */
export interface ElementMetrics {
  elementId: string;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionRate: number;
  averageTimeVisible: number; // seconds
}

/**
 * Element event types
 */
export type ElementEventType =
  | 'element:created'
  | 'element:updated'
  | 'element:deleted'
  | 'element:reordered'
  | 'element:duplicated'
  | 'element:moved'
  | 'element:selected'
  | 'element:deselected'
  | 'style:updated'
  | 'content:updated';

/**
 * Element event payload
 */
export interface ElementEvent {
  type: ElementEventType;
  elementId: string;
  userId: string;
  timestamp: Date;
  data?: unknown;
}
