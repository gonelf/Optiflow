# OptiFlow API Documentation

**Version**: 1.0.0
**Base URL**: `https://api.optiflow.app` (or `https://yourinstance.com/api`)

## Table of Contents

1. [Authentication](#authentication)
2. [Rate Limiting](#rate-limiting)
3. [Error Handling](#error-handling)
4. [API Endpoints](#api-endpoints)
   - [Pages](#pages)
   - [Components](#components)
   - [A/B Tests](#ab-tests)
   - [Analytics](#analytics)
   - [AI](#ai)
   - [Integrations](#integrations)
   - [Webhooks](#webhooks)

---

## Authentication

All API requests require authentication using an API key.

### Getting Your API Key

1. Log in to OptiFlow
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Copy and store securely

### Using Your API Key

Include your API key in the `Authorization` header:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.optiflow.app/pages
```

### API Key Permissions

API keys can have different permission levels:
- **Read**: View resources only
- **Write**: Create and update resources
- **Admin**: Full access including deletion

---

## Rate Limiting

Rate limits protect the API from abuse:

| Endpoint Type | Limit |
|--------------|-------|
| Authentication | 5 requests/minute |
| AI Endpoints | 10 requests/minute |
| Analytics | 1000 requests/minute |
| General API | 100 requests/minute |

### Rate Limit Headers

Responses include rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Handling Rate Limits

When rate limited, you'll receive a `429` response:

```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Try again in 42 seconds.",
  "retryAfter": 42
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid API key |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "error": "Validation Error",
  "message": "Invalid page title",
  "details": {
    "field": "title",
    "issue": "Title is required"
  }
}
```

---

## API Endpoints

### Pages

#### List Pages

Get all pages in a workspace.

**Endpoint**: `GET /api/pages`

**Query Parameters**:
- `workspaceId` (required): Workspace ID
- `status` (optional): Filter by status (`DRAFT`, `PUBLISHED`, `ARCHIVED`)
- `search` (optional): Search by title or description
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20, max: 100)

**Example Request**:
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://api.optiflow.app/pages?workspaceId=ws_123&status=PUBLISHED&limit=10"
```

**Example Response**:
```json
{
  "pages": [
    {
      "id": "page_abc123",
      "title": "Product Launch",
      "slug": "product-launch",
      "status": "PUBLISHED",
      "publishedUrl": "https://optiflow.app/p/product-launch",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T14:22:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

#### Get Page

Get a single page by ID.

**Endpoint**: `GET /api/pages/:id`

**Example Request**:
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.optiflow.app/pages/page_abc123
```

**Example Response**:
```json
{
  "id": "page_abc123",
  "title": "Product Launch",
  "slug": "product-launch",
  "description": "Our amazing product launch page",
  "status": "PUBLISHED",
  "seoTitle": "Launch Your Product | MyCompany",
  "seoDescription": "Discover the future of productivity",
  "components": [
    {
      "id": "comp_xyz",
      "type": "HERO",
      "order": 0,
      "content": {
        "headline": "Welcome to the Future",
        "subheadline": "Revolutionize your workflow"
      }
    }
  ],
  "publishedUrl": "https://optiflow.app/p/product-launch",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### Create Page

Create a new page.

**Endpoint**: `POST /api/pages`

**Request Body**:
```json
{
  "workspaceId": "ws_123",
  "title": "New Product Page",
  "slug": "new-product",
  "description": "Description of the page",
  "isTemplate": false
}
```

**Example Response**:
```json
{
  "id": "page_new123",
  "title": "New Product Page",
  "slug": "new-product",
  "status": "DRAFT",
  "createdAt": "2024-01-22T11:00:00Z"
}
```

#### Update Page

Update an existing page.

**Endpoint**: `PATCH /api/pages/:id`

**Request Body**:
```json
{
  "title": "Updated Product Page",
  "seoTitle": "Buy Our Product | MyCompany",
  "seoDescription": "The best product on the market"
}
```

#### Publish Page

Publish a draft page.

**Endpoint**: `POST /api/pages/:id/publish`

**Example Response**:
```json
{
  "id": "page_abc123",
  "status": "PUBLISHED",
  "publishedUrl": "https://optiflow.app/p/product-launch",
  "publishedAt": "2024-01-22T12:00:00Z"
}
```

#### Delete Page

Delete a page.

**Endpoint**: `DELETE /api/pages/:id`

**Example Response**:
```json
{
  "message": "Page deleted successfully"
}
```

---

### Components

#### Add Component

Add a component to a page.

**Endpoint**: `POST /api/components`

**Request Body**:
```json
{
  "pageId": "page_abc123",
  "type": "HERO",
  "name": "Main Hero",
  "order": 0,
  "content": {
    "headline": "Welcome",
    "subheadline": "To our product",
    "ctaText": "Get Started",
    "ctaLink": "/signup"
  },
  "styles": {
    "backgroundColor": "#1a1a1a",
    "textColor": "#ffffff"
  },
  "config": {
    "layout": "centered"
  }
}
```

#### Update Component

Update component properties.

**Endpoint**: `PATCH /api/components/:id`

#### Delete Component

Remove a component.

**Endpoint**: `DELETE /api/components/:id`

---

### A/B Tests

#### Create A/B Test

Start a new A/B test.

**Endpoint**: `POST /api/ab-tests`

**Request Body**:
```json
{
  "name": "Headline Test Q1",
  "description": "Testing different headlines",
  "pageId": "page_abc123",
  "primaryGoal": "form_submit",
  "conversionEvent": "signup_completed",
  "trafficSplit": {
    "control": 50,
    "variant_a": 50
  },
  "minimumSampleSize": 1000,
  "confidenceLevel": 0.95
}
```

#### Get Test Results

Retrieve A/B test statistics.

**Endpoint**: `GET /api/ab-tests/:id/stats`

**Example Response**:
```json
{
  "testId": "test_123",
  "status": "RUNNING",
  "variants": [
    {
      "id": "var_control",
      "name": "Control",
      "impressions": 5234,
      "conversions": 312,
      "conversionRate": 0.0596,
      "confidence": 0.98
    },
    {
      "id": "var_a",
      "name": "Variant A",
      "impressions": 5198,
      "conversions": 389,
      "conversionRate": 0.0749,
      "confidence": 0.98
    }
  ],
  "winner": "var_a",
  "recommendation": "Variant A has a statistically significant improvement"
}
```

---

### Analytics

#### Track Event

Track a custom event.

**Endpoint**: `POST /api/analytics/track`

**Request Body**:
```json
{
  "pageId": "page_abc123",
  "eventType": "CLICK",
  "eventName": "cta_clicked",
  "elementId": "btn_signup",
  "elementType": "button",
  "elementText": "Get Started",
  "eventData": {
    "section": "hero",
    "variant": "A"
  },
  "isConversion": true
}
```

#### Get Analytics

Retrieve analytics data.

**Endpoint**: `GET /api/analytics/stats`

**Query Parameters**:
- `workspaceId` (required)
- `pageId` (optional)
- `startDate` (required): ISO 8601 date
- `endDate` (required): ISO 8601 date
- `eventType` (optional)

**Example Response**:
```json
{
  "summary": {
    "pageviews": 12543,
    "uniqueVisitors": 8234,
    "conversions": 734,
    "conversionRate": 0.0891,
    "bounceRate": 0.42,
    "avgTimeOnPage": 145
  },
  "topPages": [
    {
      "pageId": "page_abc",
      "title": "Product Launch",
      "views": 5234,
      "conversions": 312
    }
  ],
  "trafficSources": {
    "organic": 4521,
    "direct": 3012,
    "social": 2341,
    "referral": 1234
  }
}
```

---

### AI

#### Generate Page

Generate a page using AI.

**Endpoint**: `POST /api/ai/generate`

**Request Body**:
```json
{
  "description": "A landing page for a B2B SaaS project management tool",
  "pageType": "landing",
  "industry": "Software",
  "targetAudience": "Project managers and team leads",
  "brandVoice": "Professional and helpful",
  "workspaceId": "ws_123"
}
```

**Example Response**:
```json
{
  "page": {
    "title": "Transform Your Project Management",
    "description": "AI-generated landing page",
    "components": [
      {
        "type": "HERO",
        "content": {
          "headline": "Streamline Your Projects",
          "subheadline": "Boost team productivity by 40%"
        }
      },
      {
        "type": "FEATURES",
        "content": {
          "features": [
            {
              "title": "Real-time Collaboration",
              "description": "Work together seamlessly"
            }
          ]
        }
      }
    ]
  },
  "metadata": {
    "seoTitle": "Project Management Software | YourBrand",
    "seoDescription": "Powerful project management for modern teams"
  }
}
```

#### Get Optimization Suggestions

Get AI-powered optimization suggestions.

**Endpoint**: `POST /api/ai/optimize`

**Request Body**:
```json
{
  "type": "headline",
  "content": "Our Amazing Product",
  "goal": "Increase conversions by highlighting benefits",
  "workspaceId": "ws_123"
}
```

---

### Integrations

#### Create Integration

Connect a third-party service.

**Endpoint**: `POST /api/integrations`

**Request Body**:
```json
{
  "workspaceId": "ws_123",
  "type": "STRIPE",
  "name": "Stripe Production",
  "config": {
    "apiKey": "sk_live_...",
    "webhookSecret": "whsec_..."
  }
}
```

---

### Webhooks

#### Create Webhook

Register a webhook endpoint.

**Endpoint**: `POST /api/webhooks`

**Request Body**:
```json
{
  "workspaceId": "ws_123",
  "url": "https://yourapp.com/webhooks/optiflow",
  "events": [
    "page.published",
    "conversion.created",
    "ab_test.winner_declared"
  ],
  "secret": "your_webhook_secret"
}
```

#### Webhook Event Format

When an event occurs, OptiFlow sends a POST request:

```json
{
  "event": "conversion.created",
  "timestamp": "2024-01-22T15:30:00Z",
  "data": {
    "pageId": "page_abc123",
    "sessionId": "sess_xyz",
    "conversionValue": 99.00
  }
}
```

**Signature Verification**:

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

---

## SDKs

### JavaScript/TypeScript

```bash
npm install @optiflow/sdk
```

```typescript
import OptiFlow from '@optiflow/sdk';

const client = new OptiFlow({
  apiKey: 'YOUR_API_KEY'
});

// List pages
const pages = await client.pages.list({
  workspaceId: 'ws_123',
  status: 'PUBLISHED'
});

// Create page
const page = await client.pages.create({
  workspaceId: 'ws_123',
  title: 'New Page',
  slug: 'new-page'
});

// Track event
await client.analytics.track({
  pageId: 'page_abc',
  eventType: 'CONVERSION',
  eventName: 'purchase_completed',
  conversionValue: 99.00
});
```

### Python

```bash
pip install optiflow
```

```python
from optiflow import OptiFlow

client = OptiFlow(api_key='YOUR_API_KEY')

# List pages
pages = client.pages.list(
    workspace_id='ws_123',
    status='PUBLISHED'
)

# Create page
page = client.pages.create(
    workspace_id='ws_123',
    title='New Page',
    slug='new-page'
)
```

---

## Support

- **Documentation**: [docs.optiflow.app](https://docs.optiflow.app)
- **API Status**: [status.optiflow.app](https://status.optiflow.app)
- **Support**: support@optiflow.app
- **Discord**: [discord.gg/optiflow](https://discord.gg/optiflow)

---

**Last Updated**: 2026-01-24
