# A/B Test Types Migration Guide

This document describes the changes needed to support two types of A/B tests: **Page Redirect** and **Element Test**.

## Overview

We've enhanced the A/B testing system to support two distinct test types:

1. **Page Redirect Test**: Compare two different pages against each other by redirecting visitors
2. **Element Test**: Use a visual editor to create variants with element-level changes (text, styles, visibility)

## Database Changes

### Prisma Schema Updates

The following changes were made to `prisma/schema.prisma`:

1. **New Enum**: `ABTestType`
```prisma
enum ABTestType {
  PAGE_REDIRECT
  ELEMENT_TEST
}
```

2. **ABTest Model Updates**:
   - Added `testType` field (default: `ELEMENT_TEST`)
   - Added index on `testType`

3. **PageVariant Model Updates**:
   - Added `redirectUrl` field (nullable, for PAGE_REDIRECT tests)
   - Added `elementChanges` field (nullable JSON, for ELEMENT_TEST tests)

### Migration Command

To apply these database changes, run:

```bash
npx prisma migrate dev --name add_ab_test_types
```

Or in production:

```bash
npx prisma migrate deploy
```

After migration, generate the Prisma client:

```bash
npx prisma generate
```

## API Changes

### Updated Validation Schemas

**File**: `src/lib/validations/api-schemas.ts`

- `createABTestSchema` now includes `testType` field
- `createVariantSchema` now includes `redirectUrl` and `elementChanges` fields

### Updated API Endpoints

**File**: `src/app/api/ab-tests/route.ts`

- POST `/api/ab-tests` now accepts `testType` and `variantConfigs` parameters
- Handles creation of both test types with appropriate variant data
- GET endpoint now returns `testType` in response

## UI Components

### New Components

1. **TestTypeSelector** (`src/components/ab-testing/TestTypeSelector.tsx`)
   - Visual selector for choosing between PAGE_REDIRECT and ELEMENT_TEST
   - Shows features and benefits of each test type

2. **PageRedirectTestSetup** (`src/components/ab-testing/PageRedirectTestSetup.tsx`)
   - Configure page redirect tests
   - Select 2+ pages to test against each other
   - Auto-fill redirect URLs from published pages

3. **ElementTestEditor** (`src/components/ab-testing/ElementTestEditor.tsx`)
   - Visual editor for creating element-based variants
   - Define changes: text, styles, visibility, add/remove elements
   - Uses CSS selectors to target elements

### Updated Components

**TestCreator** (`src/components/ab-testing/TestCreator.tsx`)
- Now supports both test types
- Conditionally renders appropriate setup component based on test type
- Handles form submission for both test types

## How It Works

### Page Redirect Tests

1. User selects "Page Redirect" test type
2. Chooses 2 or more published pages to test
3. System redirects visitors to selected pages based on traffic split
4. Analytics track performance of each page variant

**Data Flow**:
```
User → Select Pages → Configure Test → Create Test
                                      ↓
                    variantConfigs: [
                      { name, pageId, redirectUrl },
                      { name, pageId, redirectUrl }
                    ]
```

### Element Tests

1. User selects "Element Test" test type
2. Chooses a base page to test on
3. Creates variants with element changes using visual editor
4. Defines changes: text updates, style changes, hide/show/remove elements
5. System applies changes dynamically based on variant assignment

**Data Flow**:
```
User → Select Page → Define Variants → Add Element Changes → Create Test
                                                            ↓
                              elementChanges: {
                                changes: [
                                  { elementSelector, changeType, oldValue, newValue }
                                ]
                              }
```

## Testing the Implementation

### Test Page Redirect

1. Navigate to A/B Tests page
2. Click "Create A/B Test"
3. Enter test name and description
4. Select "Page Redirect" test type
5. Choose 2 published pages
6. Configure test settings (goal, conversion event, etc.)
7. Create test
8. Verify test appears in list with correct type

### Test Element Test

1. Navigate to A/B Tests page
2. Click "Create A/B Test"
3. Enter test name and description
4. Select "Element Test" test type
5. Choose a page
6. Add variants and define element changes
7. Configure test settings
8. Create test
9. Verify test appears in list with correct type

## Backward Compatibility

- Existing tests will default to `ELEMENT_TEST` type
- All existing functionality remains intact
- No breaking changes to API or data structure

## Future Enhancements

Potential improvements for the future:

1. **Visual Editor Enhancement**: Add WYSIWYG preview for element changes
2. **Live Preview**: Show real-time preview of variants
3. **Element Selector**: Click-to-select elements on page instead of CSS selectors
4. **Advanced Analytics**: Test-type-specific metrics and insights
5. **A/B Test Templates**: Pre-configured test setups for common scenarios

## Rollback Instructions

If you need to rollback these changes:

1. Revert code changes:
   ```bash
   git revert <commit-hash>
   ```

2. Create and apply a migration to remove the new fields:
   ```bash
   npx prisma migrate dev --name rollback_ab_test_types
   ```

   The rollback migration should:
   - Remove `testType` field from `ABTest`
   - Remove `redirectUrl` and `elementChanges` from `PageVariant`
   - Drop `ABTestType` enum

## Support

For questions or issues with this migration, please contact the development team or create an issue in the repository.
