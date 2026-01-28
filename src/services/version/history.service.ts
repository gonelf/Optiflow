/**
 * Version History Service
 * Manages page versions and rollback functionality
 */

import { prisma } from '@/lib/prisma';

export interface PageVersionData {
  id: string;
  versionNumber: number;
  title: string;
  description: string | null;
  content: any;
  metadata: any;
  changeType: string;
  changeSummary: string | null;
  changedBy: string;
  isRestorePoint: boolean;
  createdAt: Date;
}

export interface PageVersionDiff {
  added: any[];
  removed: any[];
  modified: Array<{
    id: string;
    field: string;
    oldValue: any;
    newValue: any;
  }>;
}

/**
 * Create a new page version snapshot
 */
export async function createPageVersion(
  pageId: string,
  userId: string,
  changeType: 'MANUAL_SAVE' | 'AUTO_SAVE' | 'PUBLISHED' | 'ROLLBACK' | 'COLLABORATION_MERGE',
  changeSummary?: string,
  isRestorePoint = false
): Promise<PageVersionData> {
  // Get the current page and its components
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: {
      components: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!page) {
    throw new Error('Page not found');
  }

  // Get the next version number
  const lastVersion = await prisma.pageVersion.findFirst({
    where: { pageId },
    orderBy: { versionNumber: 'desc' },
  });

  const versionNumber = (lastVersion?.versionNumber || 0) + 1;

  // Create the version snapshot
  const version = await prisma.pageVersion.create({
    data: {
      pageId,
      versionNumber,
      title: page.title,
      description: page.description,
      content: {
        components: page.components,
        componentCount: page.components.length,
      },
      metadata: {
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        ogImage: page.ogImage,
        favicon: page.favicon,
        customHead: page.customHead,
        status: page.status,
        slug: page.slug,
      },
      changeType,
      changeSummary,
      changedBy: userId,
      isRestorePoint,
    },
  });

  return {
    id: version.id,
    versionNumber: version.versionNumber,
    title: version.title,
    description: version.description,
    content: version.content as any,
    metadata: version.metadata as any,
    changeType: version.changeType,
    changeSummary: version.changeSummary,
    changedBy: version.changedBy,
    isRestorePoint: version.isRestorePoint,
    createdAt: version.createdAt,
  };
}

/**
 * Get version history for a page
 */
export async function getPageVersionHistory(
  pageId: string,
  limit = 50,
  offset = 0
): Promise<PageVersionData[]> {
  const versions = await prisma.pageVersion.findMany({
    where: { pageId },
    orderBy: { versionNumber: 'desc' },
    take: limit,
    skip: offset,
  });

  return versions.map(v => ({
    id: v.id,
    versionNumber: v.versionNumber,
    title: v.title,
    description: v.description,
    content: v.content as any,
    metadata: v.metadata as any,
    changeType: v.changeType,
    changeSummary: v.changeSummary,
    changedBy: v.changedBy,
    isRestorePoint: v.isRestorePoint,
    createdAt: v.createdAt,
  }));
}

/**
 * Get a specific version
 */
export async function getPageVersion(
  pageId: string,
  versionNumber: number
): Promise<PageVersionData | null> {
  const version = await prisma.pageVersion.findUnique({
    where: {
      pageId_versionNumber: {
        pageId,
        versionNumber,
      },
    },
  });

  if (!version) {
    return null;
  }

  return {
    id: version.id,
    versionNumber: version.versionNumber,
    title: version.title,
    description: version.description,
    content: version.content as any,
    metadata: version.metadata as any,
    changeType: version.changeType,
    changeSummary: version.changeSummary,
    changedBy: version.changedBy,
    isRestorePoint: version.isRestorePoint,
    createdAt: version.createdAt,
  };
}

/**
 * Rollback page to a previous version
 */
export async function rollbackToVersion(
  pageId: string,
  versionNumber: number,
  userId: string
): Promise<void> {
  // Get the version to restore
  const version = await getPageVersion(pageId, versionNumber);

  if (!version) {
    throw new Error('Version not found');
  }

  // Start a transaction
  await prisma.$transaction(async (tx) => {
    // Update page metadata
    await tx.page.update({
      where: { id: pageId },
      data: {
        title: version.title,
        description: version.description,
        seoTitle: version.metadata?.seoTitle,
        seoDescription: version.metadata?.seoDescription,
        ogImage: version.metadata?.ogImage,
        favicon: version.metadata?.favicon,
        customHead: version.metadata?.customHead,
      },
    });

    // Delete current components
    await tx.component.deleteMany({
      where: { pageId },
    });

    // Restore components from version
    const components = version.content?.components || [];
    if (components.length > 0) {
      await tx.component.createMany({
        data: components.map((comp: any) => ({
          pageId,
          type: comp.type,
          name: comp.name,
          order: comp.order,
          config: comp.config,
          styles: comp.styles,
          content: comp.content,
          aiPrompt: comp.aiPrompt,
          aiGenerated: comp.aiGenerated || false,
        })),
      });
    }

    // Create a new version marking this rollback
    await tx.pageVersion.create({
      data: {
        pageId,
        versionNumber: version.versionNumber + 1000, // Offset to avoid conflicts
        title: version.title,
        description: version.description,
        content: version.content,
        metadata: version.metadata,
        changeType: 'ROLLBACK',
        changeSummary: `Rolled back to version ${versionNumber}`,
        changedBy: userId,
        isRestorePoint: true,
      },
    });
  });
}

/**
 * Compare two versions and get the diff
 */
export async function compareVersions(
  pageId: string,
  fromVersion: number,
  toVersion: number
): Promise<PageVersionDiff> {
  const [from, to] = await Promise.all([
    getPageVersion(pageId, fromVersion),
    getPageVersion(pageId, toVersion),
  ]);

  if (!from || !to) {
    throw new Error('One or both versions not found');
  }

  const fromComponents = from.content?.components || [];
  const toComponents = to.content?.components || [];

  // Create maps for easier comparison
  const fromMap = new Map(fromComponents.map((c: any) => [c.id, c]));
  const toMap = new Map(toComponents.map((c: any) => [c.id, c]));

  const added: any[] = [];
  const removed: any[] = [];
  const modified: any[] = [];

  // Find added and modified components
  for (const comp of toComponents) {
    if (!fromMap.has(comp.id)) {
      added.push(comp);
    } else {
      const oldComp = fromMap.get(comp.id);
      const changes = findComponentChanges(oldComp, comp);
      if (changes.length > 0) {
        modified.push(...changes.map(change => ({
          id: comp.id,
          ...change,
        })));
      }
    }
  }

  // Find removed components
  for (const comp of fromComponents) {
    if (!toMap.has(comp.id)) {
      removed.push(comp);
    }
  }

  return { added, removed, modified };
}

/**
 * Find changes between two component versions
 */
function findComponentChanges(oldComp: any, newComp: any): any[] {
  const changes: any[] = [];

  // Compare main fields
  const fieldsToCompare = ['name', 'order', 'type'];
  for (const field of fieldsToCompare) {
    if (oldComp[field] !== newComp[field]) {
      changes.push({
        field,
        oldValue: oldComp[field],
        newValue: newComp[field],
      });
    }
  }

  // Compare JSON fields
  const jsonFieldsToCompare = ['config', 'styles', 'content'];
  for (const field of jsonFieldsToCompare) {
    const oldJson = JSON.stringify(oldComp[field]);
    const newJson = JSON.stringify(newComp[field]);
    if (oldJson !== newJson) {
      changes.push({
        field,
        oldValue: oldComp[field],
        newValue: newComp[field],
      });
    }
  }

  return changes;
}

/**
 * Mark a version as a restore point
 */
export async function markAsRestorePoint(
  pageId: string,
  versionNumber: number
): Promise<void> {
  await prisma.pageVersion.update({
    where: {
      pageId_versionNumber: {
        pageId,
        versionNumber,
      },
    },
    data: {
      isRestorePoint: true,
    },
  });
}

/**
 * Clean up old versions (keep only restore points and recent versions)
 */
export async function cleanupOldVersions(
  pageId: string,
  keepRecentCount = 50
): Promise<number> {
  // Get all versions
  const allVersions = await prisma.pageVersion.findMany({
    where: { pageId },
    orderBy: { versionNumber: 'desc' },
  });

  // Keep restore points and recent versions
  const versionsToKeep = new Set<string>();

  // Keep recent versions
  allVersions.slice(0, keepRecentCount).forEach(v => versionsToKeep.add(v.id));

  // Keep restore points
  allVersions.filter(v => v.isRestorePoint).forEach(v => versionsToKeep.add(v.id));

  // Delete old versions
  const versionsToDelete = allVersions
    .filter(v => !versionsToKeep.has(v.id))
    .map(v => v.id);

  if (versionsToDelete.length === 0) {
    return 0;
  }

  const result = await prisma.pageVersion.deleteMany({
    where: {
      id: { in: versionsToDelete },
    },
  });

  return result.count;
}
