# Phase 10: CMS System

## Overview

**Objective**: Build a powerful content management system that enables dynamic content, collections, and templates - the backbone of blogs, portfolios, e-commerce catalogs, and directories.

**Duration**: 4-5 weeks
**Priority**: High (P1) - Required for real-world website use cases
**Dependencies**: Phase 8 (Visual CSS & Primitives)

---

## Goals

1. **Collections** - Define custom content types with schemas
2. **Collection Items** - CRUD for content entries
3. **Dynamic Pages** - Template pages bound to collections
4. **Collection Lists** - Display filtered/sorted content in pages
5. **Reference Fields** - Link between collections
6. **Content API** - Headless CMS capabilities
7. **Content Workflow** - Draft/publish/schedule

---

## Technical Architecture

### Core Concepts

```typescript
// Collection Schema Definition
interface Collection {
  id: string;
  workspaceId: string;
  name: string;                    // Display name: "Blog Posts"
  slug: string;                    // URL-safe: "blog-posts"
  description?: string;
  icon?: string;                   // Lucide icon name

  // Schema Definition
  fields: CollectionField[];

  // Settings
  settings: {
    // URL Structure
    slugField: string;             // Which field to use for item URLs
    slugPrefix?: string;           // e.g., "/blog/" + slug

    // Display
    titleField: string;            // Field to show as item title
    previewFields?: string[];      // Fields to show in list view

    // Sorting
    defaultSort?: {
      field: string;
      direction: 'asc' | 'desc';
    };

    // Features
    enableDrafts: boolean;
    enableScheduling: boolean;
    enableVersioning: boolean;

    // SEO
    autoGenerateSEO: boolean;      // Auto-fill from content
    seoTitleField?: string;
    seoDescriptionField?: string;
    seoImageField?: string;
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Field Types
type FieldType =
  | 'TEXT'              // Single line text
  | 'RICH_TEXT'         // WYSIWYG editor
  | 'NUMBER'            // Integer or decimal
  | 'BOOLEAN'           // True/false toggle
  | 'DATE'              // Date only
  | 'DATETIME'          // Date and time
  | 'EMAIL'             // Email with validation
  | 'URL'               // URL with validation
  | 'PHONE'             // Phone number
  | 'COLOR'             // Color picker
  | 'IMAGE'             // Single image
  | 'GALLERY'           // Multiple images
  | 'FILE'              // File upload
  | 'VIDEO'             // Video URL or upload
  | 'SELECT'            // Single select dropdown
  | 'MULTI_SELECT'      // Multiple select
  | 'REFERENCE'         // Link to another collection
  | 'MULTI_REFERENCE'   // Multiple links
  | 'JSON'              // Raw JSON
  | 'MARKDOWN'          // Markdown editor
  | 'SLUG'              // URL slug (auto-generated)
  | 'LOCATION';         // Geographic coordinates

interface CollectionField {
  id: string;
  name: string;                    // Display name
  slug: string;                    // Field identifier
  type: FieldType;
  required: boolean;
  unique?: boolean;
  localized?: boolean;             // Per-language values

  // Type-specific configuration
  config?: FieldConfig;

  // Default value
  defaultValue?: any;

  // Help text
  description?: string;
  placeholder?: string;

  // Validation
  validation?: FieldValidation;

  // Display
  order: number;
  group?: string;                  // Field grouping
  hidden?: boolean;                // Hide from editor
  readonly?: boolean;              // Can't be edited after creation
}

interface FieldConfig {
  // TEXT
  minLength?: number;
  maxLength?: number;
  pattern?: string;                // Regex pattern

  // NUMBER
  min?: number;
  max?: number;
  precision?: number;              // Decimal places
  step?: number;

  // RICH_TEXT
  allowedFormats?: string[];       // bold, italic, links, etc.
  allowImages?: boolean;
  allowEmbeds?: boolean;

  // DATE/DATETIME
  minDate?: string;
  maxDate?: string;
  defaultToNow?: boolean;

  // SELECT/MULTI_SELECT
  options?: { label: string; value: string; color?: string }[];

  // REFERENCE/MULTI_REFERENCE
  collectionId?: string;           // Target collection
  displayField?: string;           // Field to show when selecting

  // IMAGE/GALLERY
  allowedTypes?: string[];         // image/jpeg, image/png, etc.
  maxSize?: number;                // Max file size in bytes
  dimensions?: {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    aspectRatio?: string;          // e.g., "16:9"
  };

  // FILE
  allowedExtensions?: string[];
  maxFileSize?: number;

  // SLUG
  sourceField?: string;            // Auto-generate from this field
  prefix?: string;
  suffix?: string;
}

interface FieldValidation {
  required?: { message?: string };
  minLength?: { value: number; message?: string };
  maxLength?: { value: number; message?: string };
  min?: { value: number; message?: string };
  max?: { value: number; message?: string };
  pattern?: { value: string; message?: string };
  custom?: { validator: string; message?: string };
}

// Collection Item
interface CollectionItem {
  id: string;
  collectionId: string;
  workspaceId: string;

  // Content
  data: Record<string, any>;       // Field values

  // Slug for URL
  slug: string;

  // Status
  status: ItemStatus;
  publishedAt?: Date;
  scheduledAt?: Date;              // Future publish date

  // Versioning
  version: number;
  publishedVersion?: number;

  // Metadata
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

type ItemStatus =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'ARCHIVED';

// Dynamic Page Template
interface CollectionTemplate {
  id: string;
  collectionId: string;
  pageId: string;                  // Base page used as template

  // URL Configuration
  urlPattern: string;              // e.g., "/blog/{slug}"

  // Field Bindings
  bindings: TemplateBinding[];

  // SEO Bindings
  seoBindings?: {
    title?: string;                // Field slug or static text
    description?: string;
    ogImage?: string;
  };

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TemplateBinding {
  elementId: string;               // Element in the template page
  property: string;                // Which property to bind (text, src, href)
  fieldSlug: string;               // Collection field to use
  transform?: BindingTransform;    // Optional transformation
}

type BindingTransform =
  | { type: 'DATE_FORMAT'; format: string }
  | { type: 'TRUNCATE'; length: number; suffix?: string }
  | { type: 'UPPERCASE' | 'LOWERCASE' | 'CAPITALIZE' }
  | { type: 'NUMBER_FORMAT'; locale?: string; options?: Intl.NumberFormatOptions }
  | { type: 'CURRENCY'; currency: string }
  | { type: 'CUSTOM'; expression: string };

// Collection List Component
interface CollectionListConfig {
  collectionId: string;

  // Filtering
  filters?: ListFilter[];
  dynamicFilters?: boolean;        // Allow user to filter

  // Sorting
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  dynamicSort?: boolean;           // Allow user to sort

  // Pagination
  limit?: number;
  pagination?: 'NONE' | 'NUMBERED' | 'LOAD_MORE' | 'INFINITE';
  pageSize?: number;

  // Layout
  layout: 'GRID' | 'LIST' | 'MASONRY' | 'CAROUSEL';
  columns?: ResponsiveValue<number>;
  gap?: string;

  // Item Template
  itemTemplate: {
    elementId: string;             // Reference to saved component
    bindings: TemplateBinding[];
  };

  // Empty State
  emptyState?: {
    title: string;
    description?: string;
    showWhen: 'ALWAYS' | 'FILTERED';
  };

  // Loading State
  loadingTemplate?: string;        // Skeleton component ID
}

interface ListFilter {
  id: string;
  field: string;
  operator: FilterOperator;
  value: any;
  isActive: boolean;
}

type FilterOperator =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'CONTAINS'
  | 'NOT_CONTAINS'
  | 'STARTS_WITH'
  | 'ENDS_WITH'
  | 'GREATER_THAN'
  | 'LESS_THAN'
  | 'GREATER_OR_EQUAL'
  | 'LESS_OR_EQUAL'
  | 'IN'
  | 'NOT_IN'
  | 'IS_EMPTY'
  | 'IS_NOT_EMPTY'
  | 'BETWEEN';

type ResponsiveValue<T> = {
  base: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
};
```

### Database Schema

```prisma
// Add to schema.prisma

model Collection {
  id            String    @id @default(cuid())
  workspaceId   String
  name          String
  slug          String
  description   String?
  icon          String?

  // Schema
  fields        Json      @db.JsonB  // CollectionField[]

  // Settings
  settings      Json      @db.JsonB

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  workspace     Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  items         CollectionItem[]
  templates     CollectionTemplate[]

  @@unique([workspaceId, slug])
  @@index([workspaceId])
}

model CollectionItem {
  id            String      @id @default(cuid())
  collectionId  String
  workspaceId   String
  slug          String

  // Content
  data          Json        @db.JsonB
  localizedData Json?       @db.JsonB  // Per-locale content

  // Status
  status        String      @default("DRAFT")
  publishedAt   DateTime?
  scheduledAt   DateTime?

  // Versioning
  version       Int         @default(1)
  publishedVersion Int?

  // Audit
  createdBy     String
  updatedBy     String
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  // Relations
  collection    Collection  @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  versions      CollectionItemVersion[]

  @@unique([collectionId, slug])
  @@index([collectionId])
  @@index([workspaceId])
  @@index([status])
  @@index([collectionId, status])
  @@index([scheduledAt])
}

model CollectionItemVersion {
  id            String    @id @default(cuid())
  itemId        String
  version       Int

  // Snapshot
  data          Json      @db.JsonB
  status        String

  // Audit
  changedBy     String
  changeReason  String?
  createdAt     DateTime  @default(now())

  // Relations
  item          CollectionItem @relation(fields: [itemId], references: [id], onDelete: Cascade)

  @@unique([itemId, version])
  @@index([itemId])
}

model CollectionTemplate {
  id            String    @id @default(cuid())
  collectionId  String
  pageId        String

  // URL Config
  urlPattern    String

  // Bindings
  bindings      Json      @db.JsonB
  seoBindings   Json?     @db.JsonB

  isActive      Boolean   @default(true)

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  collection    Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)

  @@index([collectionId])
}

// Update Workspace model
model Workspace {
  // ... existing fields
  collections   Collection[]
}
```

---

## Implementation Tasks

### 10.1 Collection Management (5 days)

#### 10.1.1 Collection CRUD
- [ ] Create collection with name and slug
- [ ] List collections in workspace
- [ ] Update collection settings
- [ ] Delete collection (with confirmation)
- [ ] Duplicate collection

**Files to Create:**
```
src/app/(dashboard)/[workspaceSlug]/cms/page.tsx
src/app/(dashboard)/[workspaceSlug]/cms/collections/page.tsx
src/app/(dashboard)/[workspaceSlug]/cms/collections/new/page.tsx
src/app/(dashboard)/[workspaceSlug]/cms/collections/[collectionSlug]/page.tsx
src/services/cms/collection.service.ts
```

#### 10.1.2 Schema Builder UI
- [ ] Field list with drag-to-reorder
- [ ] Add field modal with type selector
- [ ] Field configuration panel
- [ ] Field validation settings
- [ ] Field groups/sections
- [ ] Preview schema as form

**Files to Create:**
```
src/components/cms/SchemaBuilder.tsx
src/components/cms/FieldList.tsx
src/components/cms/AddFieldModal.tsx
src/components/cms/FieldTypeSelector.tsx
src/components/cms/FieldConfigPanel.tsx
src/components/cms/fields/TextFieldConfig.tsx
src/components/cms/fields/RichTextFieldConfig.tsx
src/components/cms/fields/NumberFieldConfig.tsx
src/components/cms/fields/SelectFieldConfig.tsx
src/components/cms/fields/ReferenceFieldConfig.tsx
src/components/cms/fields/ImageFieldConfig.tsx
src/components/cms/fields/DateFieldConfig.tsx
```

#### 10.1.3 Collection Settings
- [ ] URL pattern configuration
- [ ] Title/preview field selection
- [ ] Default sort settings
- [ ] Enable/disable features (drafts, scheduling, versioning)
- [ ] SEO field mapping

**Files to Create:**
```
src/components/cms/CollectionSettings.tsx
src/components/cms/UrlPatternEditor.tsx
src/components/cms/SEOFieldMapping.tsx
```

---

### 10.2 Content Editor (5 days)

#### 10.2.1 Item List View
- [ ] Table/grid view of items
- [ ] Column customization
- [ ] Filtering by status
- [ ] Search across fields
- [ ] Bulk actions (publish, archive, delete)
- [ ] Quick edit inline

**Files to Create:**
```
src/app/(dashboard)/[workspaceSlug]/cms/collections/[collectionSlug]/items/page.tsx
src/components/cms/ItemList.tsx
src/components/cms/ItemTable.tsx
src/components/cms/ItemFilters.tsx
src/components/cms/BulkActions.tsx
```

#### 10.2.2 Item Editor
- [ ] Dynamic form from schema
- [ ] Field components for each type
- [ ] Auto-save drafts
- [ ] Validation feedback
- [ ] Side-by-side preview
- [ ] Revision history

**Files to Create:**
```
src/app/(dashboard)/[workspaceSlug]/cms/collections/[collectionSlug]/items/[itemId]/page.tsx
src/app/(dashboard)/[workspaceSlug]/cms/collections/[collectionSlug]/items/new/page.tsx
src/components/cms/ItemEditor.tsx
src/components/cms/DynamicForm.tsx
src/components/cms/ItemPreview.tsx
src/components/cms/RevisionHistory.tsx
```

#### 10.2.3 Field Input Components
- [ ] Text input (with character count)
- [ ] Rich text editor (TipTap)
- [ ] Number input (with increment/decrement)
- [ ] Boolean toggle
- [ ] Date/datetime picker
- [ ] Select/multi-select dropdown
- [ ] Image uploader with preview
- [ ] Gallery manager (drag to reorder)
- [ ] File uploader
- [ ] Video embed/upload
- [ ] Color picker
- [ ] Reference selector (search and select)
- [ ] Location picker (map integration)
- [ ] Markdown editor
- [ ] JSON editor

**Files to Create:**
```
src/components/cms/inputs/TextField.tsx
src/components/cms/inputs/RichTextField.tsx
src/components/cms/inputs/NumberField.tsx
src/components/cms/inputs/BooleanField.tsx
src/components/cms/inputs/DateField.tsx
src/components/cms/inputs/SelectField.tsx
src/components/cms/inputs/ImageField.tsx
src/components/cms/inputs/GalleryField.tsx
src/components/cms/inputs/FileField.tsx
src/components/cms/inputs/VideoField.tsx
src/components/cms/inputs/ColorField.tsx
src/components/cms/inputs/ReferenceField.tsx
src/components/cms/inputs/LocationField.tsx
src/components/cms/inputs/MarkdownField.tsx
src/components/cms/inputs/JSONField.tsx
src/components/cms/inputs/SlugField.tsx
```

#### 10.2.4 Publishing Workflow
- [ ] Save as draft
- [ ] Submit for review
- [ ] Publish immediately
- [ ] Schedule publish date
- [ ] Unpublish
- [ ] Archive
- [ ] Status indicators

**Files to Create:**
```
src/components/cms/PublishControls.tsx
src/components/cms/ScheduleModal.tsx
src/components/cms/StatusBadge.tsx
src/services/cms/publishing.service.ts
```

---

### 10.3 Dynamic Pages (4 days)

#### 10.3.1 Collection Template Setup
- [ ] Create template from existing page
- [ ] URL pattern configuration
- [ ] Bind elements to collection fields
- [ ] Preview with sample data
- [ ] Template inheritance

**Files to Create:**
```
src/app/(dashboard)/[workspaceSlug]/cms/collections/[collectionSlug]/template/page.tsx
src/components/cms/TemplateSetup.tsx
src/components/cms/FieldBindingPanel.tsx
src/components/cms/TemplatePreview.tsx
```

#### 10.3.2 Field Binding UI
- [ ] Select element in canvas
- [ ] Choose field to bind
- [ ] Configure transform (date format, truncate, etc.)
- [ ] Binding indicators in canvas
- [ ] Unbind field

**Files to Create:**
```
src/components/builder/FieldBindingPanel.tsx
src/components/builder/BindingIndicator.tsx
src/components/builder/TransformConfig.tsx
src/lib/cms/binding-transforms.ts
```

#### 10.3.3 Dynamic Page Rendering
- [ ] Fetch item by slug at request time
- [ ] Apply field bindings to template
- [ ] Handle missing/invalid items (404)
- [ ] ISR for published items
- [ ] Preview mode for drafts

**Files to Create:**
```
src/app/[workspaceSlug]/[...slug]/page.tsx  // Dynamic route
src/lib/cms/dynamic-renderer.ts
src/lib/cms/binding-resolver.ts
src/services/cms/item-fetcher.service.ts
```

#### 10.3.4 SEO for Dynamic Pages
- [ ] Auto-generate meta from bindings
- [ ] Dynamic og:image
- [ ] Structured data (JSON-LD)
- [ ] Canonical URLs
- [ ] Sitemap generation

**Files to Create:**
```
src/lib/cms/seo-generator.ts
src/lib/cms/structured-data.ts
src/app/sitemap.ts
```

---

### 10.4 Collection Lists (3 days)

#### 10.4.1 Collection List Component
- [ ] Add to component palette
- [ ] Collection selector
- [ ] Layout options (grid, list, masonry, carousel)
- [ ] Column configuration per breakpoint
- [ ] Gap/spacing controls

**Files to Create:**
```
src/components/builder/components/CollectionList.tsx
src/components/builder/properties/CollectionListProperties.tsx
```

#### 10.4.2 Filtering & Sorting
- [ ] Filter builder UI
- [ ] Multiple filter conditions (AND/OR)
- [ ] Dynamic filter inputs (user can filter)
- [ ] Sort field selector
- [ ] Sort direction toggle
- [ ] Dynamic sort (user can sort)

**Files to Create:**
```
src/components/cms/FilterBuilder.tsx
src/components/cms/FilterCondition.tsx
src/components/cms/SortConfig.tsx
src/components/cms/DynamicFilters.tsx
```

#### 10.4.3 Pagination
- [ ] No pagination (show all)
- [ ] Numbered pagination
- [ ] Load more button
- [ ] Infinite scroll
- [ ] Items per page setting
- [ ] Page indicator

**Files to Create:**
```
src/components/cms/Pagination.tsx
src/components/cms/LoadMoreButton.tsx
src/components/cms/InfiniteScroll.tsx
```

#### 10.4.4 Item Template Editor
- [ ] Design item card layout
- [ ] Bind fields to card elements
- [ ] Save as reusable template
- [ ] Empty state design
- [ ] Loading skeleton design

**Files to Create:**
```
src/components/cms/ItemTemplateEditor.tsx
src/components/cms/EmptyStateEditor.tsx
src/components/cms/LoadingSkeletonEditor.tsx
```

---

### 10.5 References & Relations (2 days)

#### 10.5.1 Reference Fields
- [ ] Single reference selector
- [ ] Multi-reference selector
- [ ] Search within reference collection
- [ ] Create new item inline
- [ ] Reference preview card

**Files to Create:**
```
src/components/cms/inputs/SingleReference.tsx
src/components/cms/inputs/MultiReference.tsx
src/components/cms/ReferenceSearch.tsx
src/components/cms/ReferencePreview.tsx
```

#### 10.5.2 Reverse References
- [ ] Show items that reference current item
- [ ] Backlink display in editor
- [ ] Navigate to referencing items

**Files to Create:**
```
src/components/cms/ReverseReferences.tsx
src/services/cms/reference.service.ts
```

#### 10.5.3 Nested References in Lists
- [ ] Display reference field data in lists
- [ ] Nested bindings (reference.field)
- [ ] Reference count/summary

**Files to Create:**
```
src/lib/cms/nested-binding-resolver.ts
```

---

### 10.6 Content API (Headless) (3 days)

#### 10.6.1 REST API Endpoints
- [ ] List items with filtering/sorting/pagination
- [ ] Get single item by ID or slug
- [ ] Get collection schema
- [ ] Preview unpublished items (with token)
- [ ] Webhooks on content changes

**Files to Create:**
```
src/app/api/cms/collections/route.ts
src/app/api/cms/collections/[collectionSlug]/route.ts
src/app/api/cms/collections/[collectionSlug]/items/route.ts
src/app/api/cms/collections/[collectionSlug]/items/[itemSlug]/route.ts
src/app/api/cms/preview/route.ts
```

#### 10.6.2 GraphQL API (Optional)
- [ ] Schema generation from collections
- [ ] Query resolver
- [ ] Filtering arguments
- [ ] Pagination (cursor-based)
- [ ] Nested references

**Files to Create:**
```
src/app/api/graphql/route.ts
src/lib/cms/graphql/schema-generator.ts
src/lib/cms/graphql/resolvers.ts
```

#### 10.6.3 API Key Management
- [ ] Create API keys for CMS access
- [ ] Scope to specific collections
- [ ] Read-only vs read-write
- [ ] Usage tracking
- [ ] Rate limiting

**Files to Create:**
```
src/app/(dashboard)/[workspaceSlug]/settings/api-keys/page.tsx
src/components/cms/ApiKeyManager.tsx
src/services/cms/api-auth.service.ts
```

---

### 10.7 Import/Export (2 days)

#### 10.7.1 CSV Import
- [ ] Upload CSV file
- [ ] Map columns to fields
- [ ] Preview import
- [ ] Handle duplicates
- [ ] Import progress indicator

**Files to Create:**
```
src/components/cms/CSVImport.tsx
src/components/cms/ColumnMapper.tsx
src/components/cms/ImportPreview.tsx
src/services/cms/import.service.ts
```

#### 10.7.2 Export
- [ ] Export to CSV
- [ ] Export to JSON
- [ ] Select fields to export
- [ ] Include references (flatten or nested)

**Files to Create:**
```
src/components/cms/ExportModal.tsx
src/services/cms/export.service.ts
```

#### 10.7.3 Migration Tools
- [ ] Import from Webflow CMS
- [ ] Import from Contentful
- [ ] Import from Airtable
- [ ] Schema migration assistant

**Files to Create:**
```
src/services/cms/migrations/webflow.ts
src/services/cms/migrations/contentful.ts
src/services/cms/migrations/airtable.ts
```

---

## API Endpoints Summary

```typescript
// Collections
GET    /api/workspaces/[id]/collections
POST   /api/workspaces/[id]/collections
GET    /api/workspaces/[id]/collections/[slug]
PATCH  /api/workspaces/[id]/collections/[slug]
DELETE /api/workspaces/[id]/collections/[slug]
POST   /api/workspaces/[id]/collections/[slug]/duplicate

// Collection Items
GET    /api/collections/[id]/items
POST   /api/collections/[id]/items
GET    /api/collections/[id]/items/[itemId]
PATCH  /api/collections/[id]/items/[itemId]
DELETE /api/collections/[id]/items/[itemId]
POST   /api/collections/[id]/items/[itemId]/publish
POST   /api/collections/[id]/items/[itemId]/unpublish
POST   /api/collections/[id]/items/[itemId]/schedule
POST   /api/collections/[id]/items/bulk-action

// Templates
GET    /api/collections/[id]/templates
POST   /api/collections/[id]/templates
PATCH  /api/collections/[id]/templates/[templateId]
DELETE /api/collections/[id]/templates/[templateId]

// Import/Export
POST   /api/collections/[id]/import
GET    /api/collections/[id]/export

// Public Content API
GET    /api/cms/[collectionSlug]
GET    /api/cms/[collectionSlug]/[itemSlug]
```

---

## Component Hierarchy

```
CMS Dashboard
├── CollectionList
│   └── CollectionCard
│       ├── ItemCount
│       └── QuickActions
├── CollectionEditor
│   ├── SchemaBuilder
│   │   ├── FieldList
│   │   │   └── FieldItem (draggable)
│   │   ├── AddFieldModal
│   │   │   ├── FieldTypeSelector
│   │   │   └── FieldConfigForm
│   │   └── SchemaPreview
│   └── CollectionSettings
│       ├── UrlPatternEditor
│       └── SEOFieldMapping
└── ItemManager
    ├── ItemList
    │   ├── ItemFilters
    │   ├── ItemTable/Grid
    │   │   └── ItemRow
    │   │       ├── StatusBadge
    │   │       └── QuickActions
    │   ├── Pagination
    │   └── BulkActions
    └── ItemEditor
        ├── DynamicForm
        │   └── FieldInput (by type)
        ├── PublishControls
        ├── RevisionHistory
        └── ItemPreview
```

---

## Testing Requirements

### Unit Tests
- [ ] Field validation logic
- [ ] Binding transforms
- [ ] Filter query building
- [ ] Slug generation

### Integration Tests
- [ ] Create collection with schema
- [ ] CRUD operations on items
- [ ] Publishing workflow
- [ ] Reference integrity

### E2E Tests
- [ ] Full content creation flow
- [ ] Dynamic page rendering
- [ ] Collection list filtering
- [ ] API access with key

---

## Performance Considerations

1. **Lazy Field Loading** - Load heavy fields (images, rich text) on demand
2. **Virtual Scrolling** - For large item lists
3. **Query Optimization** - Indexed fields for filtering
4. **CDN Caching** - Cache published content at edge
5. **Incremental Generation** - Only rebuild changed pages

```typescript
// Prisma query optimization example
const items = await prisma.collectionItem.findMany({
  where: {
    collectionId,
    status: 'PUBLISHED',
    data: {
      path: ['category'],
      equals: 'technology'
    }
  },
  select: {
    id: true,
    slug: true,
    data: true,
    publishedAt: true
  },
  orderBy: { publishedAt: 'desc' },
  take: 20,
  skip: page * 20
});
```

---

## Security Considerations

1. **Field-level Permissions** - Who can edit which fields
2. **Content Approval** - Review workflow for sensitive content
3. **API Rate Limiting** - Prevent abuse of public API
4. **Input Sanitization** - XSS prevention in rich text
5. **File Upload Validation** - Type and size restrictions

---

## Dependencies

### NPM Packages
```json
{
  "@tiptap/react": "^2.x",           // Rich text editor
  "@tiptap/starter-kit": "^2.x",
  "react-dropzone": "^14.x",         // File uploads
  "date-fns": "^3.x",                // Date formatting
  "react-map-gl": "^7.x",            // Location picker (optional)
  "papaparse": "^5.x",               // CSV parsing
  "graphql": "^16.x",                // GraphQL (optional)
  "graphql-yoga": "^5.x"             // GraphQL server (optional)
}
```

---

## Success Metrics

- [ ] Create collection in < 5 minutes
- [ ] Support 20+ field types
- [ ] Handle 10,000+ items per collection
- [ ] Dynamic page load < 200ms (ISR)
- [ ] API response < 100ms for list queries
- [ ] Import 1,000 records in < 30 seconds

---

## Migration from Existing Systems

### Webflow CMS Migration
1. Export Webflow collections as JSON
2. Map Webflow field types to OptiVibe types
3. Import items with transformed data
4. Recreate collection list bindings

### WordPress Migration
1. Export posts/pages/custom types
2. Map taxonomies to references
3. Import media library
4. Recreate templates

---

## Definition of Done

- [ ] All field types implemented
- [ ] Collection CRUD complete
- [ ] Item editor with validation
- [ ] Publishing workflow functional
- [ ] Dynamic pages rendering
- [ ] Collection lists with filtering
- [ ] Reference fields working
- [ ] Content API documented
- [ ] Import/export functional
- [ ] Performance benchmarks met
- [ ] Security audit passed

---

**Last Updated**: 2026-01-28
**Version**: 1.0.0
**Status**: Ready for Development
