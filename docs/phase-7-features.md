# Phase 7: Advanced Features Documentation

This document covers the implementation of Phase 7 advanced features for OptiFlow, including real-time collaboration, version history, personalization, multi-language support, and mobile preview.

## Table of Contents

1. [Overview](#overview)
2. [Real-time Collaboration](#real-time-collaboration)
3. [Version History & Rollback](#version-history--rollback)
4. [Advanced Personalization Engine](#advanced-personalization-engine)
5. [Multi-language Support](#multi-language-support)
6. [Mobile App Preview](#mobile-app-preview)
7. [Setup & Configuration](#setup--configuration)
8. [API Reference](#api-reference)

---

## Overview

Phase 7 introduces advanced features that transform OptiFlow from a single-user page builder into a collaborative, multi-language platform with intelligent personalization.

### Key Features

- **Real-time Collaboration**: Multiple users can edit pages simultaneously with live presence indicators and cursor tracking
- **Version History**: Automatic version tracking with ability to compare and rollback to previous versions
- **Personalization Engine**: Dynamic content personalization based on visitor segments
- **Multi-language Support**: Full i18n with translation management and AI-powered auto-translation
- **Mobile Preview**: Device frame simulator for testing pages on different screen sizes

---

## Real-time Collaboration

### Features

- **Live Presence Indicators**: See who's currently editing the page
- **Live Cursors**: View other users' cursor positions in real-time
- **Automatic Session Management**: Sessions auto-expire after 15 minutes of inactivity
- **Color-coded Users**: Each collaborator gets a unique color for easy identification

### Implementation

#### Services

**Pusher Service** (`src/services/collaboration/pusher.service.ts`):
- Server and client-side Pusher instances
- Channel naming conventions
- Event types for collaboration
- Batch event triggering

**Session Service** (`src/services/collaboration/session.service.ts`):
- Join/leave collaboration sessions
- Cursor position tracking
- Active collaborator management
- Session cleanup and heartbeat

#### API Routes

```
POST /api/collaboration/join      # Join a collaboration session
POST /api/collaboration/leave     # Leave a collaboration session
POST /api/pusher/auth            # Authenticate Pusher channels
```

#### Components

**CollaborationPresence** (`src/components/collaboration/CollaborationPresence.tsx`):
- Displays active collaborators
- Renders live cursors
- Handles real-time events

### Usage Example

```tsx
import { CollaborationPresence } from '@/components/collaboration/CollaborationPresence';

function PageBuilder({ pageId, userId }) {
  return (
    <div>
      <CollaborationPresence pageId={pageId} currentUserId={userId} />
      {/* Your page builder UI */}
    </div>
  );
}
```

### Configuration

Add to your `.env` file:

```bash
PUSHER_APP_ID="your-app-id"
PUSHER_SECRET="your-secret"
NEXT_PUBLIC_PUSHER_KEY="your-key"
NEXT_PUBLIC_PUSHER_CLUSTER="us2"
```

---

## Version History & Rollback

### Features

- **Automatic Version Tracking**: Every save creates a new version
- **Version Comparison**: See what changed between versions
- **Restore Points**: Mark important versions for easy access
- **Rollback**: Restore page to any previous version
- **Change Types**: Manual save, auto-save, published, rollback, collaboration merge

### Database Schema

```prisma
model PageVersion {
  id              String
  pageId          String
  versionNumber   Int
  title           String
  description     String?
  content         Json        // Complete page snapshot
  metadata        Json?       // SEO and settings
  changeType      ChangeType
  changeSummary   String?
  changedBy       String      // User ID
  isRestorePoint  Boolean
  createdAt       DateTime
}
```

### Services

**History Service** (`src/services/version/history.service.ts`):
- Create version snapshots
- Get version history
- Compare versions
- Rollback to previous version
- Mark restore points
- Cleanup old versions

### API Routes

```
GET  /api/versions/[pageId]            # Get version history
POST /api/versions/[pageId]            # Create new version
POST /api/versions/[pageId]/rollback   # Rollback to version
```

### Components

**VersionHistory** (`src/components/version/VersionHistory.tsx`):
- Timeline view of all versions
- Restore point indicators
- One-click rollback

### Usage Example

```tsx
import { VersionHistory } from '@/components/version/VersionHistory';

function PageSettings({ pageId }) {
  const handleRollback = (versionNumber) => {
    console.log('Rolled back to version:', versionNumber);
    // Refresh page data
  };

  return (
    <VersionHistory
      pageId={pageId}
      onRollback={handleRollback}
    />
  );
}
```

### Creating Versions

```typescript
import { createPageVersion } from '@/services/version/history.service';

// Manual save
await createPageVersion(
  pageId,
  userId,
  'MANUAL_SAVE',
  'Updated hero section',
  false
);

// Create restore point
await createPageVersion(
  pageId,
  userId,
  'PUBLISHED',
  'Published version 2.0',
  true
);
```

---

## Advanced Personalization Engine

### Features

- **Segment-based Targeting**: Target visitors by location, device, traffic source, behavior
- **Dynamic Content Swapping**: Replace components based on visitor attributes
- **Rule Priority System**: Apply multiple rules in priority order
- **Action Types**: Swap components, change text/images, show banners, redirect

### Database Schema

```prisma
model PersonalizationRule {
  id          String
  name        String
  segment     Json        // Targeting criteria
  priority    Int
  action      PersonalizationAction
  config      Json        // Action configuration
  isActive    Boolean
}
```

### Services

**Personalization Engine** (`src/services/personalization/engine.service.ts`):
- Evaluate visitor segments
- Apply personalization rules
- Create/update/delete rules
- Get applicable rules for context

### Segment Matching

```typescript
interface PersonalizationContext {
  visitorId: string;
  userId?: string;

  // Geographic
  country?: string;
  city?: string;

  // Device
  device?: 'mobile' | 'tablet' | 'desktop';
  browser?: string;
  os?: string;

  // Traffic source
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;

  // Behavioral
  visitCount?: number;
  pageViews?: number;
  timeOnSite?: number;

  // Custom
  customAttributes?: Record<string, any>;
}
```

### Usage Example

```typescript
import { applyPersonalization } from '@/services/personalization/engine.service';

// Get personalized components
const context: PersonalizationContext = {
  visitorId: 'visitor-123',
  country: 'US',
  device: 'mobile',
  utmSource: 'google',
  visitCount: 5,
};

const { components, result } = await applyPersonalization(
  originalComponents,
  context
);

console.log('Applied rules:', result.rules);
console.log('Modifications:', result.modifications);
```

### Creating Rules

```typescript
import { createPersonalizationRule } from '@/services/personalization/engine.service';

// Show mobile-specific banner
await createPersonalizationRule(
  'Mobile Banner',
  { device: 'mobile' },
  'SHOW_BANNER',
  {
    bannerComponent: {
      type: 'CTA',
      content: { text: 'Download our mobile app!' },
    },
    position: 'top',
  },
  priority: 10
);

// Change CTA for returning visitors
await createPersonalizationRule(
  'Returning Visitor CTA',
  { visitCount: { operator: 'gt', value: 3 } },
  'CHANGE_TEXT',
  {
    componentId: 'cta-hero',
    path: 'content.buttonText',
    newText: 'Welcome back! Continue your journey',
  },
  priority: 5
);
```

---

## Multi-language Support

### Features

- **Multiple Locale Support**: 10 languages out of the box (en, es, fr, de, it, pt, ja, zh, ko, ar)
- **Translation Management**: Create, update, and review translations
- **AI-powered Translation**: Auto-translate pages using AI
- **Translation Status**: Draft, In Review, Approved, Published
- **Completion Tracking**: Monitor translation progress per page

### Database Schema

```prisma
model PageTranslation {
  id              String
  pageId          String
  locale          String
  title           String
  description     String?
  seoTitle        String?
  seoDescription  String?
  components      Json        // Translated component content
  status          TranslationStatus
  translatedBy    String?
  reviewedBy      String?
  createdAt       DateTime
  updatedAt       DateTime
}

model SupportedLocale {
  id          String
  workspaceId String
  code        String
  name        String
  isDefault   Boolean
  isEnabled   Boolean
}
```

### Services

**Translation Service** (`src/services/i18n/translation.service.ts`):
- Manage supported locales
- Create/update translations
- Auto-translate with AI
- Track translation completion
- Update translation status

### API Routes

```
GET  /api/translations/[pageId]              # Get all translations
GET  /api/translations/[pageId]?locale=es    # Get specific translation
POST /api/translations/[pageId]              # Create/update translation
```

### Configuration

**i18n Config** (`src/i18n/config.ts`):
- Supported locales
- Locale names and flags
- Browser locale detection
- URL locale parsing

### Usage Example

```typescript
import {
  getPageTranslation,
  autoTranslatePage
} from '@/services/i18n/translation.service';

// Get Spanish translation
const translation = await getPageTranslation(pageId, 'es');

// Auto-translate to French
const frenchTranslation = await autoTranslatePage(
  pageId,
  'fr',
  userId
);

// Create manual translation
await upsertPageTranslation(pageId, 'de', {
  title: 'Willkommen',
  description: 'Deutsche Beschreibung',
  components: translatedComponents,
  status: 'DRAFT',
  translatedBy: userId,
});
```

### Supported Locales

| Code | Language | Flag |
|------|----------|------|
| en   | English  | 🇺🇸 |
| es   | Español  | 🇪🇸 |
| fr   | Français | 🇫🇷 |
| de   | Deutsch  | 🇩🇪 |
| it   | Italiano | 🇮🇹 |
| pt   | Português| 🇵🇹 |
| ja   | 日本語   | 🇯🇵 |
| zh   | 中文     | 🇨🇳 |
| ko   | 한국어   | 🇰🇷 |
| ar   | العربية  | 🇸🇦 |

---

## Mobile App Preview

### Features

- **Device Frames**: Desktop (1440x900), Tablet (768x1024), Mobile (375x667)
- **Live Preview**: Real-time iframe rendering
- **Zoom Controls**: Scale preview for better viewing
- **Device Simulation**: Accurate viewport sizes and user agents
- **Device Chrome**: Realistic device borders and notches

### Components

**MobilePreview** (`src/components/builder/MobilePreview.tsx`):
- Device selector
- Zoomable preview iframe
- Device frame rendering
- Loading states

**MobilePreviewToggle**: Compact toolbar widget for quick device switching

### Usage Example

```tsx
import { MobilePreview } from '@/components/builder/MobilePreview';

function PagePreview({ pageUrl }) {
  return (
    <MobilePreview
      pageUrl={pageUrl}
      className="h-screen"
    />
  );
}
```

### Quick Toggle

```tsx
import { MobilePreviewToggle } from '@/components/builder/MobilePreview';

function Toolbar() {
  const handlePreview = (device) => {
    console.log('Preview on:', device);
    // Open preview modal or navigate
  };

  return (
    <div className="toolbar">
      <MobilePreviewToggle onPreview={handlePreview} />
    </div>
  );
}
```

---

## Setup & Configuration

### 1. Database Migration

Run the Phase 7 migration to add new tables:

```bash
npx prisma migrate dev --name phase_7_advanced_features
```

This creates:
- `PageVersion` - Version history
- `CollaborationSession` - Real-time sessions
- `PageEdit` - Edit tracking
- `PageTranslation` - Translations
- `SupportedLocale` - Workspace locales

### 2. Install Dependencies

Already installed:
- `pusher` - Server-side WebSocket
- `pusher-js` - Client-side WebSocket
- `next-intl` - Internationalization
- `yjs` - CRDT for conflict resolution
- `y-websocket` - WebSocket provider for Yjs

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
# Pusher (required for collaboration)
PUSHER_APP_ID="your-app-id"
PUSHER_SECRET="your-secret"
NEXT_PUBLIC_PUSHER_KEY="your-key"
NEXT_PUBLIC_PUSHER_CLUSTER="us2"

# Google AI (optional - for auto-translation)
GOOGLE_AI_API_KEY="your-key"

# Feature flags
ENABLE_COLLABORATION="true"
ENABLE_VERSION_HISTORY="true"
ENABLE_PERSONALIZATION="true"
ENABLE_MULTI_LANGUAGE="true"
ENABLE_MOBILE_PREVIEW="true"
```

### 4. Pusher Setup

1. Sign up at [pusher.com](https://pusher.com)
2. Create a new app
3. Copy credentials to `.env.local`
4. Enable "Client Events" in Pusher dashboard

### 5. Feature Flags

Control feature availability via environment variables:

```typescript
const isCollaborationEnabled = process.env.ENABLE_COLLABORATION === 'true';
const isVersionHistoryEnabled = process.env.ENABLE_VERSION_HISTORY === 'true';
// etc.
```

---

## API Reference

### Collaboration API

#### POST /api/collaboration/join

Join a collaboration session.

**Request:**
```json
{
  "pageId": "page_abc123",
  "socketId": "12345.67890"
}
```

**Response:**
```json
{
  "user": {
    "id": "session_123",
    "userId": "user_123",
    "userName": "John Doe",
    "color": "#EF4444"
  },
  "collaborators": [...]
}
```

#### POST /api/collaboration/leave

Leave a collaboration session.

**Request:**
```json
{
  "pageId": "page_abc123"
}
```

### Version History API

#### GET /api/versions/[pageId]

Get version history for a page.

**Query Parameters:**
- `limit` (optional): Number of versions to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "versions": [
    {
      "id": "version_123",
      "versionNumber": 42,
      "title": "Landing Page",
      "changeType": "MANUAL_SAVE",
      "changeSummary": "Updated hero section",
      "changedBy": "user_123",
      "isRestorePoint": false,
      "createdAt": "2026-01-27T10:00:00Z"
    }
  ]
}
```

#### POST /api/versions/[pageId]

Create a new version snapshot.

**Request:**
```json
{
  "changeType": "MANUAL_SAVE",
  "changeSummary": "Updated pricing table",
  "isRestorePoint": false
}
```

#### POST /api/versions/[pageId]/rollback

Rollback to a previous version.

**Request:**
```json
{
  "versionNumber": 42
}
```

### Translation API

#### GET /api/translations/[pageId]

Get translations for a page.

**Query Parameters:**
- `locale` (optional): Get specific locale (e.g., `?locale=es`)

**Response:**
```json
{
  "translations": [
    {
      "id": "trans_123",
      "locale": "es",
      "title": "Página de inicio",
      "status": "PUBLISHED",
      "translatedBy": "user_123",
      "updatedAt": "2026-01-27T10:00:00Z"
    }
  ]
}
```

#### POST /api/translations/[pageId]

Create or update a translation.

**Request:**
```json
{
  "locale": "es",
  "title": "Página de inicio",
  "description": "Descripción en español",
  "components": [...],
  "status": "DRAFT"
}
```

---

## Best Practices

### Collaboration

1. **Clean up sessions**: Run periodic cleanup to remove inactive sessions
2. **Throttle cursor updates**: Limit cursor broadcasts to 10/second
3. **Use presence channels**: For automatic user tracking
4. **Handle disconnections**: Gracefully remove users who disconnect

### Version History

1. **Auto-save frequently**: Create AUTO_SAVE versions every 2-3 minutes
2. **Mark milestones**: Use restore points for important versions
3. **Clean up old versions**: Keep only recent and restore point versions
4. **Add change summaries**: Help users understand what changed

### Personalization

1. **Test rules thoroughly**: Ensure segments match correctly
2. **Use priority wisely**: Higher priority rules override lower ones
3. **Monitor performance**: Personalization adds latency
4. **Cache rule evaluations**: For frequently accessed pages

### Translations

1. **Review AI translations**: Always have human review
2. **Use translation memory**: Reuse common translations
3. **Test RTL languages**: Arabic requires special layout handling
4. **Keep source updated**: Sync translations when source changes

---

## Troubleshooting

### Collaboration not working

- Check Pusher credentials in `.env.local`
- Verify "Client Events" enabled in Pusher dashboard
- Check browser console for WebSocket errors
- Ensure `/api/pusher/auth` endpoint is accessible

### Version history empty

- Verify database migration ran successfully
- Check that versions are being created on save
- Ensure user has proper permissions

### Personalization not applying

- Check rule priority order
- Verify segment criteria matches visitor context
- Test with `console.log` to debug rule matching
- Ensure rules are marked as `isActive: true`

### Translations missing

- Verify locale is in supported locales
- Check translation status (must be PUBLISHED to show)
- Ensure components are properly translated
- Test AI translation API connection

---

## Performance Considerations

### Collaboration

- **WebSocket connections**: 1 connection per user per page
- **Cursor updates**: Throttled to 10/second per user
- **Presence data**: Lightweight JSON payloads
- **Expected load**: Handles 50+ concurrent editors per page

### Version History

- **Storage**: ~50KB per version (average)
- **Query performance**: Indexed on `pageId` and `versionNumber`
- **Cleanup strategy**: Keep 50 recent + restore points
- **Recommended**: Run cleanup weekly

### Personalization

- **Rule evaluation**: < 5ms per request
- **Caching**: Cache applicable rules for 5 minutes
- **Impact**: +10-20ms per request
- **Recommended**: Limit to 10-20 active rules per page

### Translations

- **Storage**: ~1MB per translated page
- **Query performance**: Indexed on `pageId` and `locale`
- **Caching**: Cache published translations for 1 hour
- **AI translation**: 2-5 seconds per page

---

## Future Enhancements

### Collaboration
- Conflict resolution with CRDTs (Yjs integration)
- Component-level locking
- Real-time chat between collaborators
- Edit history per user

### Version History
- Visual diff viewer
- Branch and merge workflows
- Scheduled rollbacks
- Export/import versions

### Personalization
- A/B test integration with personalization
- Machine learning-based recommendations
- Predictive segment targeting
- Personalization analytics

### Translations
- Translation memory system
- Glossary management
- Professional translator portal
- Translation quality scoring

---

## Support

For questions or issues with Phase 7 features:

1. Check this documentation
2. Review API error messages
3. Check browser console for client-side errors
4. Verify environment variables
5. Test with minimal configuration
6. Open an issue on GitHub

---

**Phase 7 Status**: ✅ Implemented
**Last Updated**: 2026-01-27
**Version**: 1.0.0
