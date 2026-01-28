# Phase 8: Visual CSS & Primitives (Foundation)

## Overview

**Objective**: Transform Optiflow from a component-only builder into a true visual design tool with element-level control, matching Webflow's core capability.

**Duration**: 3-4 weeks
**Priority**: Critical (P0) - Foundation for all future builder enhancements
**Dependencies**: Phase 7 completion (current state)

---

## Goals

1. **Visual Style Panel** - Full CSS control without writing code
2. **Primitive Elements** - Basic building blocks (containers, text, images)
3. **Element Nesting** - Hierarchical component tree structure
4. **Responsive Design System** - Breakpoint-based style overrides
5. **Design Tokens** - Global style variables for consistency

---

## Technical Architecture

### New Data Structures

```typescript
// Enhanced Style System
interface ElementStyles {
  // Layout
  display: 'block' | 'flex' | 'grid' | 'inline' | 'inline-block' | 'none';
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

  // Effects
  boxShadow?: ShadowValue[];
  opacity?: number;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  cursor?: string;
  transition?: string;
  transform?: string;
  filter?: string;
}

interface ResponsiveStyles {
  base: ElementStyles;      // Mobile-first default
  sm?: ElementStyles;       // 640px+
  md?: ElementStyles;       // 768px+
  lg?: ElementStyles;       // 1024px+
  xl?: ElementStyles;       // 1280px+
  '2xl'?: ElementStyles;    // 1536px+
}

interface ShadowValue {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  inset?: boolean;
}

interface GradientValue {
  type: 'linear' | 'radial';
  angle?: number;
  stops: { color: string; position: number }[];
}

// Primitive Element Types
type PrimitiveType =
  | 'CONTAINER'      // Generic div with layout controls
  | 'SECTION'        // Semantic section element
  | 'GRID'           // CSS Grid wrapper
  | 'FLEXBOX'        // Flexbox wrapper
  | 'TEXT'           // Paragraph/heading text
  | 'RICH_TEXT'      // WYSIWYG text block
  | 'IMAGE'          // Responsive image
  | 'VIDEO'          // Video embed
  | 'BUTTON'         // Interactive button
  | 'LINK'           // Anchor element
  | 'ICON'           // Icon from library
  | 'DIVIDER'        // Horizontal rule
  | 'SPACER'         // Responsive spacing
  | 'EMBED'          // Custom HTML/iFrame
  | 'LIST';          // UL/OL with styling

interface BuilderElement {
  id: string;
  type: PrimitiveType | ComponentType;
  name: string;
  parentId: string | null;      // For nesting
  order: number;
  children?: string[];          // Child element IDs

  // Element-specific content
  content: ElementContent;

  // Responsive styles
  styles: ResponsiveStyles;

  // States (hover, focus, active)
  stateStyles?: {
    hover?: Partial<ElementStyles>;
    focus?: Partial<ElementStyles>;
    active?: Partial<ElementStyles>;
  };

  // Metadata
  locked?: boolean;
  hidden?: boolean;
  className?: string;           // Custom classes
  attributes?: Record<string, string>;
}

// Design Tokens
interface DesignTokens {
  colors: {
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
    custom: Record<string, string>;
  };
  typography: {
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
    };
    fontWeights: Record<string, number>;
    lineHeights: Record<string, string>;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: ShadowValue[];
    md: ShadowValue[];
    lg: ShadowValue[];
    xl: ShadowValue[];
  };
  breakpoints: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
  };
}
```

### Database Schema Updates

```prisma
// Add to schema.prisma

// Enhanced Component model for elements
model Element {
  id            String      @id @default(cuid())
  pageId        String
  variantId     String?

  // Element Definition
  type          String      // PrimitiveType or ComponentType
  name          String
  order         Int

  // Hierarchy
  parentId      String?     // Parent element ID for nesting
  depth         Int         @default(0)
  path          String      // Materialized path for tree queries

  // Content & Styles
  content       Json        @db.JsonB
  styles        Json        @db.JsonB  // ResponsiveStyles
  stateStyles   Json?       @db.JsonB  // Hover/focus/active styles

  // Metadata
  locked        Boolean     @default(false)
  hidden        Boolean     @default(false)
  className     String?
  attributes    Json?

  // AI
  aiPrompt      String?     @db.Text
  aiGenerated   Boolean     @default(false)

  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  // Relations
  page          Page        @relation(fields: [pageId], references: [id], onDelete: Cascade)
  variant       PageVariant? @relation(fields: [variantId], references: [id], onDelete: Cascade)
  parent        Element?    @relation("ElementHierarchy", fields: [parentId], references: [id])
  children      Element[]   @relation("ElementHierarchy")

  @@index([pageId])
  @@index([parentId])
  @@index([pageId, order])
  @@index([path])
}

// Design Tokens per workspace
model DesignSystem {
  id            String    @id @default(cuid())
  workspaceId   String    @unique
  name          String    @default("Default")

  // Token Values
  colors        Json      @db.JsonB
  typography    Json      @db.JsonB
  spacing       Json      @db.JsonB
  borderRadius  Json      @db.JsonB
  shadows       Json      @db.JsonB
  breakpoints   Json      @db.JsonB

  // Custom CSS Variables
  customTokens  Json?     @db.JsonB

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  workspace     Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
}

// Custom Fonts
model CustomFont {
  id            String    @id @default(cuid())
  workspaceId   String
  name          String
  family        String
  weight        Int[]
  style         String[]  // normal, italic

  // Font Files
  woff2Url      String?
  woffUrl       String?
  ttfUrl        String?

  createdAt     DateTime  @default(now())

  @@unique([workspaceId, family])
  @@index([workspaceId])
}
```

---

## Implementation Tasks

### 8.1 Visual Style Panel (5 days)

#### 8.1.1 Box Model Editor
- [ ] Create visual box model diagram component
- [ ] Interactive margin/padding controls with drag handles
- [ ] Individual side controls (top, right, bottom, left)
- [ ] Shorthand toggle (all sides, vertical/horizontal, individual)
- [ ] Unit selector (px, rem, em, %, vw, vh, auto)
- [ ] Live preview as values change

**Files to Create:**
```
src/components/builder/style-panel/BoxModelEditor.tsx
src/components/builder/style-panel/SpacingControl.tsx
src/components/builder/style-panel/UnitSelector.tsx
```

#### 8.1.2 Layout Controls (Flexbox/Grid)
- [ ] Display mode selector (block, flex, grid, inline)
- [ ] Flexbox controls panel
  - [ ] Direction (row, column, reverse)
  - [ ] Justify content visual selector
  - [ ] Align items visual selector
  - [ ] Gap control
  - [ ] Wrap toggle
- [ ] Grid controls panel
  - [ ] Column/row template builder
  - [ ] Visual grid editor
  - [ ] Gap controls
  - [ ] Auto-fit/auto-fill options
- [ ] Position controls (relative, absolute, fixed, sticky)
- [ ] Z-index slider

**Files to Create:**
```
src/components/builder/style-panel/LayoutPanel.tsx
src/components/builder/style-panel/FlexboxControls.tsx
src/components/builder/style-panel/GridControls.tsx
src/components/builder/style-panel/PositionControls.tsx
```

#### 8.1.3 Typography Panel
- [ ] Font family dropdown with preview
- [ ] Font size control with presets
- [ ] Font weight selector
- [ ] Line height control
- [ ] Letter spacing control
- [ ] Text alignment buttons
- [ ] Text decoration options
- [ ] Text transform options
- [ ] Color picker with token support

**Files to Create:**
```
src/components/builder/style-panel/TypographyPanel.tsx
src/components/builder/style-panel/FontSelector.tsx
src/components/builder/style-panel/TextStyleControls.tsx
```

#### 8.1.4 Background & Fill
- [ ] Color picker with opacity
- [ ] Gradient builder (linear/radial)
  - [ ] Angle/position control
  - [ ] Color stops editor
  - [ ] Preview
- [ ] Background image uploader
  - [ ] Size controls (cover, contain, custom)
  - [ ] Position controls
  - [ ] Repeat options
- [ ] Multiple backgrounds support

**Files to Create:**
```
src/components/builder/style-panel/BackgroundPanel.tsx
src/components/builder/style-panel/ColorPicker.tsx
src/components/builder/style-panel/GradientEditor.tsx
src/components/builder/style-panel/BackgroundImageControls.tsx
```

#### 8.1.5 Border & Effects
- [ ] Border width/style/color controls
- [ ] Individual border side controls
- [ ] Border radius controls (per corner)
- [ ] Box shadow editor
  - [ ] Multiple shadows support
  - [ ] X/Y offset, blur, spread, color
  - [ ] Inset toggle
- [ ] Opacity slider
- [ ] CSS filter controls (blur, brightness, etc.)

**Files to Create:**
```
src/components/builder/style-panel/BorderPanel.tsx
src/components/builder/style-panel/BorderRadiusEditor.tsx
src/components/builder/style-panel/ShadowEditor.tsx
src/components/builder/style-panel/EffectsPanel.tsx
```

#### 8.1.6 Sizing Controls
- [ ] Width/height controls with units
- [ ] Min/max width/height
- [ ] Aspect ratio lock
- [ ] Overflow controls
- [ ] Object fit (for images)

**Files to Create:**
```
src/components/builder/style-panel/SizingPanel.tsx
src/components/builder/style-panel/DimensionControl.tsx
```

---

### 8.2 Primitive Elements (4 days)

#### 8.2.1 Container Elements
- [ ] **Container** - Generic div with all layout options
- [ ] **Section** - Full-width semantic section
- [ ] **Grid** - CSS Grid with visual editor
- [ ] **Flexbox** - Flex container with controls

**Files to Create:**
```
src/components/builder/primitives/Container.tsx
src/components/builder/primitives/Section.tsx
src/components/builder/primitives/Grid.tsx
src/components/builder/primitives/Flexbox.tsx
src/components/builder/primitives/index.ts
```

#### 8.2.2 Content Elements
- [ ] **Text** - Paragraph/heading with tag selector (p, h1-h6, span)
- [ ] **Rich Text** - WYSIWYG editor (TipTap integration)
- [ ] **Image** - Responsive with lazy loading, alt text, object-fit
- [ ] **Video** - YouTube, Vimeo, self-hosted, background video
- [ ] **Icon** - Lucide icon picker with color/size

**Files to Create:**
```
src/components/builder/primitives/Text.tsx
src/components/builder/primitives/RichText.tsx
src/components/builder/primitives/Image.tsx
src/components/builder/primitives/Video.tsx
src/components/builder/primitives/Icon.tsx
```

#### 8.2.3 Interactive Elements
- [ ] **Button** - With variants, sizes, icons, loading state
- [ ] **Link** - Internal, external, anchor, email, phone
- [ ] **Embed** - Custom HTML, iFrame, script injection

**Files to Create:**
```
src/components/builder/primitives/Button.tsx
src/components/builder/primitives/Link.tsx
src/components/builder/primitives/Embed.tsx
```

#### 8.2.4 Utility Elements
- [ ] **Divider** - Horizontal/vertical with styling
- [ ] **Spacer** - Responsive spacing block
- [ ] **List** - UL/OL with custom bullet/number styles

**Files to Create:**
```
src/components/builder/primitives/Divider.tsx
src/components/builder/primitives/Spacer.tsx
src/components/builder/primitives/List.tsx
```

#### 8.2.5 Element Property Editors
- [ ] Create property editors for each primitive type
- [ ] Content editing panels
- [ ] Element-specific settings

**Files to Create:**
```
src/components/builder/properties/ContainerProperties.tsx
src/components/builder/properties/TextProperties.tsx
src/components/builder/properties/ImageProperties.tsx
src/components/builder/properties/ButtonProperties.tsx
src/components/builder/properties/VideoProperties.tsx
src/components/builder/properties/LinkProperties.tsx
src/components/builder/properties/EmbedProperties.tsx
```

---

### 8.3 Element Nesting & Tree Structure (3 days)

#### 8.3.1 Element Tree Navigator
- [ ] Hierarchical tree view in left sidebar
- [ ] Expand/collapse nested elements
- [ ] Drag to reorder and re-parent
- [ ] Right-click context menu (copy, paste, duplicate, delete)
- [ ] Search/filter elements
- [ ] Visual indicators for hidden/locked elements

**Files to Create:**
```
src/components/builder/ElementTree.tsx
src/components/builder/ElementTreeNode.tsx
src/components/builder/ElementContextMenu.tsx
```

#### 8.3.2 Canvas Updates for Nesting
- [ ] Render nested elements recursively
- [ ] Drop zones within containers
- [ ] Visual depth indicators
- [ ] Parent selection mode (Cmd+click)
- [ ] Breadcrumb navigation for deep nesting

**Files to Create:**
```
src/components/builder/NestedCanvas.tsx
src/components/builder/DropZone.tsx
src/components/builder/ElementBreadcrumb.tsx
```

#### 8.3.3 State Management Updates
- [ ] Update Zustand store for tree structure
- [ ] Parent-child relationship management
- [ ] Bulk operations on nested elements
- [ ] Copy/paste with children
- [ ] Undo/redo for tree operations

**Files to Update:**
```
src/store/builder.store.ts
src/store/element-tree.store.ts (new)
```

---

### 8.4 Responsive Design System (3 days)

#### 8.4.1 Breakpoint Selector
- [ ] Device preview buttons (mobile, tablet, desktop)
- [ ] Custom breakpoint editor
- [ ] Current breakpoint indicator
- [ ] Responsive preview mode

**Files to Create:**
```
src/components/builder/BreakpointSelector.tsx
src/components/builder/DeviceFrame.tsx
src/components/builder/ResponsivePreview.tsx
```

#### 8.4.2 Per-Breakpoint Styling
- [ ] Style panel shows current breakpoint styles
- [ ] Inheritance indicator (showing inherited vs overridden)
- [ ] Clear breakpoint override button
- [ ] Copy styles between breakpoints
- [ ] Visual diff between breakpoints

**Files to Create:**
```
src/components/builder/style-panel/ResponsiveStylePanel.tsx
src/components/builder/style-panel/BreakpointIndicator.tsx
src/lib/styles/responsive-utils.ts
```

#### 8.4.3 Responsive Preview
- [ ] Side-by-side multi-device preview
- [ ] Actual device dimensions
- [ ] Orientation toggle (portrait/landscape)
- [ ] Interactive preview mode

**Files to Create:**
```
src/components/builder/MultiDevicePreview.tsx
src/components/builder/DeviceEmulator.tsx
```

---

### 8.5 Design Tokens System (2 days)

#### 8.5.1 Token Management UI
- [ ] Design system settings page
- [ ] Color palette editor with swatches
- [ ] Typography scale editor
- [ ] Spacing scale editor
- [ ] Shadow presets editor
- [ ] Import/export design tokens (JSON)

**Files to Create:**
```
src/app/(dashboard)/[workspaceSlug]/settings/design-system/page.tsx
src/components/design-system/ColorPaletteEditor.tsx
src/components/design-system/TypographyScaleEditor.tsx
src/components/design-system/SpacingScaleEditor.tsx
src/components/design-system/ShadowPresetsEditor.tsx
src/components/design-system/TokenImportExport.tsx
```

#### 8.5.2 Token Integration in Style Panel
- [ ] Color picker with token dropdown
- [ ] Font family with token support
- [ ] Spacing with token presets
- [ ] "Use token" vs "Custom value" toggle
- [ ] Token search and filter

**Files to Create:**
```
src/components/builder/style-panel/TokenSelector.tsx
src/components/builder/style-panel/ColorTokenPicker.tsx
src/hooks/use-design-tokens.ts
```

#### 8.5.3 Custom Font Upload
- [ ] Font file upload (woff2, woff, ttf)
- [ ] Font metadata extraction
- [ ] Font preview
- [ ] Font family management

**Files to Create:**
```
src/app/api/fonts/upload/route.ts
src/components/design-system/FontUploader.tsx
src/services/font.service.ts
```

---

### 8.6 Style Generation & Runtime (2 days)

#### 8.6.1 CSS Generation
- [ ] Convert style objects to CSS
- [ ] Generate Tailwind classes where possible
- [ ] Inline styles for custom values
- [ ] CSS variables for tokens
- [ ] Media query generation for responsive styles

**Files to Create:**
```
src/lib/styles/css-generator.ts
src/lib/styles/tailwind-mapper.ts
src/lib/styles/media-query-generator.ts
```

#### 8.6.2 Runtime Style Application
- [ ] Style injection in canvas
- [ ] Hot reloading on style changes
- [ ] Published page style bundling
- [ ] Critical CSS extraction

**Files to Create:**
```
src/lib/styles/style-injector.ts
src/lib/styles/style-bundler.ts
```

---

## API Endpoints

### New Endpoints

```typescript
// Design System
GET    /api/workspaces/[id]/design-system
PUT    /api/workspaces/[id]/design-system
POST   /api/workspaces/[id]/design-system/import
GET    /api/workspaces/[id]/design-system/export

// Custom Fonts
GET    /api/workspaces/[id]/fonts
POST   /api/workspaces/[id]/fonts
DELETE /api/workspaces/[id]/fonts/[fontId]

// Elements (extends Components API)
GET    /api/pages/[id]/elements
POST   /api/pages/[id]/elements
PATCH  /api/pages/[id]/elements/[elementId]
DELETE /api/pages/[id]/elements/[elementId]
POST   /api/pages/[id]/elements/reorder
POST   /api/pages/[id]/elements/[elementId]/duplicate
POST   /api/pages/[id]/elements/[elementId]/move  // Change parent
```

---

## Component Hierarchy

```
PropertyPanel (updated)
├── ElementInfo
├── Tabs
│   ├── Content Tab
│   │   └── [ElementType]Properties
│   ├── Style Tab
│   │   ├── BreakpointSelector
│   │   ├── LayoutPanel
│   │   │   ├── DisplayModeSelector
│   │   │   ├── FlexboxControls
│   │   │   └── GridControls
│   │   ├── SizingPanel
│   │   ├── SpacingPanel (BoxModelEditor)
│   │   ├── PositionControls
│   │   ├── TypographyPanel
│   │   ├── BackgroundPanel
│   │   ├── BorderPanel
│   │   └── EffectsPanel
│   └── Advanced Tab
│       ├── CustomClasses
│       ├── CustomAttributes
│       ├── StateStyles (hover, focus)
│       └── Visibility Settings

LeftSidebar (updated)
├── ComponentPalette
│   ├── Sections (components)
│   ├── Primitives (new)
│   └── Saved Components
├── ElementTree (new)
└── AssetLibrary (future)
```

---

## Testing Requirements

### Unit Tests
- [ ] CSS generation functions
- [ ] Style merging and inheritance
- [ ] Tree manipulation utilities
- [ ] Responsive style resolution
- [ ] Token parsing

### Integration Tests
- [ ] Style panel updates element correctly
- [ ] Breakpoint changes persist
- [ ] Element nesting operations
- [ ] Design token application

### E2E Tests
- [ ] Create nested layout (container > grid > elements)
- [ ] Apply styles across breakpoints
- [ ] Publish page with custom styles
- [ ] Design token changes propagate to pages

---

## Migration Plan

### Backward Compatibility
1. Existing `Component` model continues to work
2. Gradual migration path from components to elements
3. Auto-convert legacy component styles to new format
4. Support both systems during transition

### Data Migration
```typescript
// Migration script
async function migrateComponentToElement(component: Component): Promise<Element> {
  return {
    id: component.id,
    type: component.type,
    name: component.name,
    parentId: null,  // Top-level by default
    order: component.order,
    depth: 0,
    path: `/${component.id}`,
    content: component.content,
    styles: {
      base: convertLegacyStyles(component.styles),
    },
    // ... rest of mapping
  };
}
```

---

## Performance Considerations

1. **Virtual Rendering** - Only render visible elements in tree
2. **Style Memoization** - Cache generated CSS
3. **Debounced Updates** - Batch rapid style changes
4. **Lazy Loading** - Load style panel sections on demand
5. **Code Splitting** - Separate chunks for each primitive

---

## Success Metrics

- [ ] Style panel supports 90%+ of CSS properties
- [ ] Element nesting works to 10+ levels deep
- [ ] Responsive preview matches real device rendering
- [ ] Style changes reflect in < 100ms
- [ ] Design tokens reduce redundant color definitions by 80%
- [ ] Migration completes without data loss

---

## Dependencies

### NPM Packages
```json
{
  "@tiptap/react": "^2.x",        // Rich text editor
  "@tiptap/starter-kit": "^2.x",
  "react-colorful": "^5.x",       // Color picker
  "use-resize-observer": "^9.x",  // For responsive preview
  "framer-motion": "^11.x"        // For smooth transitions
}
```

### External Resources
- Google Fonts API for font loading
- Lucide icons (already installed)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Performance with deeply nested elements | High | Virtual tree, memoization, pagination |
| Style conflicts with existing components | Medium | Scoped styles, CSS modules |
| Complex state management for tree | Medium | Normalized store, optimistic updates |
| Browser compatibility for CSS features | Low | Feature detection, fallbacks |

---

## Definition of Done

- [ ] All primitive elements implemented and documented
- [ ] Style panel covers all CSS properties
- [ ] Responsive design works across breakpoints
- [ ] Design tokens integrated throughout builder
- [ ] Element nesting supports complex layouts
- [ ] Existing pages continue to work (backward compatible)
- [ ] Unit test coverage > 80%
- [ ] E2E tests passing
- [ ] Performance benchmarks met
- [ ] Documentation updated

---

**Last Updated**: 2026-01-28
**Version**: 1.0.0
**Status**: Ready for Development
