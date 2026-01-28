// ============================================================================
// PHASE 8: ELEMENT SERVICE
// ============================================================================

import { prisma } from '@/lib/prisma';
import {
  BuilderElement,
  CreateElementRequest,
  UpdateElementRequest,
} from '@/types/builder';
import { PRIMITIVE_CONFIGS } from '@/types/primitives';

/**
 * Generate materialized path for element hierarchy
 */
function generatePath(parentPath: string | null, elementId: string): string {
  return parentPath ? `${parentPath}/${elementId}` : `/${elementId}`;
}

/**
 * Calculate depth from path
 */
function calculateDepth(path: string): number {
  return path.split('/').filter(Boolean).length - 1;
}

/**
 * Get all elements for a page
 */
export async function getPageElements(pageId: string, variantId?: string) {
  const elements = await prisma.element.findMany({
    where: {
      pageId,
      variantId: variantId || null,
    },
    orderBy: [
      { depth: 'asc' },
      { order: 'asc' },
    ],
  });

  return elements.map(el => ({
    ...el,
    styles: el.styles as any,
    stateStyles: el.stateStyles as any,
    content: el.content as any,
    attributes: el.attributes as any,
  })) as BuilderElement[];
}

/**
 * Get element by ID
 */
export async function getElementById(elementId: string) {
  const element = await prisma.element.findUnique({
    where: { id: elementId },
  });

  if (!element) return null;

  return {
    ...element,
    styles: element.styles as any,
    stateStyles: element.stateStyles as any,
    content: element.content as any,
    attributes: element.attributes as any,
  } as BuilderElement;
}

/**
 * Create a new element
 */
export async function createElement(
  pageId: string,
  request: CreateElementRequest,
  variantId?: string
) {
  const { type, name, parentId = null, order, content, styles } = request;

  // Get parent path if parent exists
  let path = `/${Date.now()}`; // Temporary path
  let depth = 0;

  if (parentId) {
    const parent = await prisma.element.findUnique({
      where: { id: parentId },
    });

    if (parent) {
      depth = parent.depth + 1;
    }
  }

  // Get default content and styles from primitive config if applicable
  const primitiveConfig = PRIMITIVE_CONFIGS[type as keyof typeof PRIMITIVE_CONFIGS];
  const defaultContent = primitiveConfig?.defaultContent || {};
  const defaultStyles = primitiveConfig?.defaultStyles || {};

  const element = await prisma.element.create({
    data: {
      pageId,
      variantId: variantId || null,
      type,
      name,
      parentId,
      order,
      depth,
      path, // Will be updated below
      content: { ...defaultContent, ...content },
      styles: {
        base: { ...defaultStyles, ...styles?.base },
        ...styles,
      },
      stateStyles: {},
    },
  });

  // Update path with actual element ID
  const actualPath = generatePath(
    parentId ? (await prisma.element.findUnique({ where: { id: parentId } }))?.path || null : null,
    element.id
  );

  const updated = await prisma.element.update({
    where: { id: element.id },
    data: { path: actualPath },
  });

  return {
    ...updated,
    styles: updated.styles as any,
    stateStyles: updated.stateStyles as any,
    content: updated.content as any,
    attributes: updated.attributes as any,
  } as BuilderElement;
}

/**
 * Update an element
 */
export async function updateElement(elementId: string, updates: UpdateElementRequest) {
  const existing = await prisma.element.findUnique({
    where: { id: elementId },
  });

  if (!existing) {
    throw new Error('Element not found');
  }

  // Merge styles if provided
  const newStyles = updates.styles
    ? { ...(existing.styles as any), ...updates.styles }
    : existing.styles;

  const newStateStyles = updates.stateStyles
    ? { ...(existing.stateStyles as any), ...updates.stateStyles }
    : existing.stateStyles;

  const newContent = updates.content
    ? { ...(existing.content as any), ...updates.content }
    : existing.content;

  const element = await prisma.element.update({
    where: { id: elementId },
    data: {
      name: updates.name ?? existing.name,
      parentId: updates.parentId !== undefined ? updates.parentId : existing.parentId,
      order: updates.order ?? existing.order,
      content: newContent,
      styles: newStyles,
      stateStyles: newStateStyles,
      locked: updates.locked ?? existing.locked,
      hidden: updates.hidden ?? existing.hidden,
      className: updates.className ?? existing.className,
      attributes: updates.attributes ?? existing.attributes,
    },
  });

  return {
    ...element,
    styles: element.styles as any,
    stateStyles: element.stateStyles as any,
    content: element.content as any,
    attributes: element.attributes as any,
  } as BuilderElement;
}

/**
 * Delete an element and its children
 */
export async function deleteElement(elementId: string) {
  // Get all children to delete recursively
  const element = await prisma.element.findUnique({
    where: { id: elementId },
  });

  if (!element) {
    throw new Error('Element not found');
  }

  // Delete all elements that have this element in their path (children and descendants)
  await prisma.element.deleteMany({
    where: {
      path: {
        startsWith: element.path,
      },
    },
  });

  return { success: true };
}

/**
 * Reorder elements
 */
export async function reorderElements(updates: Array<{ id: string; order: number }>) {
  const promises = updates.map(({ id, order }) =>
    prisma.element.update({
      where: { id },
      data: { order },
    })
  );

  await Promise.all(promises);
  return { success: true };
}

/**
 * Move element to new parent
 */
export async function moveElement(
  elementId: string,
  newParentId: string | null,
  newOrder: number
) {
  const element = await prisma.element.findUnique({
    where: { id: elementId },
  });

  if (!element) {
    throw new Error('Element not found');
  }

  // Calculate new depth and path
  let newDepth = 0;
  let newPath = `/${elementId}`;

  if (newParentId) {
    const newParent = await prisma.element.findUnique({
      where: { id: newParentId },
    });

    if (!newParent) {
      throw new Error('Parent element not found');
    }

    newDepth = newParent.depth + 1;
    newPath = generatePath(newParent.path, elementId);
  }

  // Update element
  await prisma.element.update({
    where: { id: elementId },
    data: {
      parentId: newParentId,
      order: newOrder,
      depth: newDepth,
      path: newPath,
    },
  });

  // Update all children paths and depths
  const children = await prisma.element.findMany({
    where: {
      path: {
        startsWith: element.path,
      },
      id: {
        not: elementId,
      },
    },
  });

  const depthDiff = newDepth - element.depth;

  for (const child of children) {
    const childPathSuffix = child.path.replace(element.path, '');
    const updatedPath = `${newPath}${childPathSuffix}`;
    const updatedDepth = child.depth + depthDiff;

    await prisma.element.update({
      where: { id: child.id },
      data: {
        path: updatedPath,
        depth: updatedDepth,
      },
    });
  }

  return { success: true };
}

/**
 * Duplicate an element (with or without children)
 */
export async function duplicateElement(elementId: string, includeChildren = true) {
  const original = await prisma.element.findUnique({
    where: { id: elementId },
  });

  if (!original) {
    throw new Error('Element not found');
  }

  // Create duplicate at same level
  const duplicate = await prisma.element.create({
    data: {
      pageId: original.pageId,
      variantId: original.variantId,
      type: original.type,
      name: `${original.name} (Copy)`,
      parentId: original.parentId,
      order: original.order + 1,
      depth: original.depth,
      path: '', // Will be updated
      content: original.content,
      styles: original.styles,
      stateStyles: original.stateStyles,
      locked: original.locked,
      hidden: original.hidden,
      className: original.className,
      attributes: original.attributes,
    },
  });

  // Update path
  const newPath = generatePath(
    original.parentId
      ? (await prisma.element.findUnique({ where: { id: original.parentId } }))?.path || null
      : null,
    duplicate.id
  );

  await prisma.element.update({
    where: { id: duplicate.id },
    data: { path: newPath },
  });

  // Duplicate children if requested
  if (includeChildren) {
    const children = await prisma.element.findMany({
      where: {
        parentId: elementId,
      },
      orderBy: { order: 'asc' },
    });

    for (const child of children) {
      await duplicateElementRecursive(child, duplicate.id);
    }
  }

  return duplicate.id;
}

/**
 * Recursive helper for duplicating children
 */
async function duplicateElementRecursive(element: any, newParentId: string) {
  const newElement = await prisma.element.create({
    data: {
      pageId: element.pageId,
      variantId: element.variantId,
      type: element.type,
      name: element.name,
      parentId: newParentId,
      order: element.order,
      depth: element.depth,
      path: '', // Will be updated
      content: element.content,
      styles: element.styles,
      stateStyles: element.stateStyles,
      locked: element.locked,
      hidden: element.hidden,
      className: element.className,
      attributes: element.attributes,
    },
  });

  // Update path
  const parent = await prisma.element.findUnique({ where: { id: newParentId } });
  const newPath = generatePath(parent?.path || null, newElement.id);

  await prisma.element.update({
    where: { id: newElement.id },
    data: { path: newPath },
  });

  // Duplicate children
  const children = await prisma.element.findMany({
    where: { parentId: element.id },
    orderBy: { order: 'asc' },
  });

  for (const child of children) {
    await duplicateElementRecursive(child, newElement.id);
  }

  return newElement.id;
}
