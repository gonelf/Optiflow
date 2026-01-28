// ============================================================================
// PHASE 8: DESIGN SYSTEM SERVICE
// ============================================================================

import { prisma } from '@/lib/prisma';
import { DesignTokens, DEFAULT_DESIGN_TOKENS } from '@/types/design-tokens';

/**
 * Get design system for a workspace
 */
export async function getDesignSystem(workspaceId: string) {
  const designSystem = await prisma.designSystem.findUnique({
    where: { workspaceId },
  });

  if (!designSystem) {
    // Return default design system if none exists
    return {
      id: null,
      workspaceId,
      name: 'Default',
      ...DEFAULT_DESIGN_TOKENS,
      customTokens: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return {
    id: designSystem.id,
    workspaceId: designSystem.workspaceId,
    name: designSystem.name,
    colors: designSystem.colors as unknown as DesignTokens['colors'],
    typography: designSystem.typography as unknown as DesignTokens['typography'],
    spacing: designSystem.spacing as unknown as DesignTokens['spacing'],
    borderRadius: designSystem.borderRadius as unknown as DesignTokens['borderRadius'],
    shadows: designSystem.shadows as unknown as DesignTokens['shadows'],
    breakpoints: designSystem.breakpoints as unknown as DesignTokens['breakpoints'],
    customTokens: designSystem.customTokens as any,
    createdAt: designSystem.createdAt,
    updatedAt: designSystem.updatedAt,
  };
}

/**
 * Create or update design system for a workspace
 */
export async function upsertDesignSystem(
  workspaceId: string,
  tokens: Partial<DesignTokens>,
  name = 'Default'
) {
  const existingSystem = await prisma.designSystem.findUnique({
    where: { workspaceId },
  });

  const mergedTokens = {
    ...DEFAULT_DESIGN_TOKENS,
    ...tokens,
  };

  if (existingSystem) {
    return await prisma.designSystem.update({
      where: { workspaceId },
      data: {
        name,
        colors: mergedTokens.colors as any,
        typography: mergedTokens.typography as any,
        spacing: mergedTokens.spacing as any,
        borderRadius: mergedTokens.borderRadius as any,
        shadows: mergedTokens.shadows as any,
        breakpoints: mergedTokens.breakpoints as any,
      },
    });
  }

  return await prisma.designSystem.create({
    data: {
      workspaceId,
      name,
      colors: mergedTokens.colors as any,
      typography: mergedTokens.typography as any,
      spacing: mergedTokens.spacing as any,
      borderRadius: mergedTokens.borderRadius as any,
      shadows: mergedTokens.shadows as any,
      breakpoints: mergedTokens.breakpoints as any,
    },
  });
}

/**
 * Update specific token category
 */
export async function updateTokenCategory<K extends keyof DesignTokens>(
  workspaceId: string,
  category: K,
  tokens: DesignTokens[K]
) {
  const designSystem = await getDesignSystem(workspaceId);

  return await prisma.designSystem.upsert({
    where: { workspaceId },
    create: {
      workspaceId,
      name: designSystem.name,
      colors: (category === 'colors' ? tokens : designSystem.colors) as any,
      typography: (category === 'typography' ? tokens : designSystem.typography) as any,
      spacing: (category === 'spacing' ? tokens : designSystem.spacing) as any,
      borderRadius: (category === 'borderRadius' ? tokens : designSystem.borderRadius) as any,
      shadows: (category === 'shadows' ? tokens : designSystem.shadows) as any,
      breakpoints: (category === 'breakpoints' ? tokens : designSystem.breakpoints) as any,
    },
    update: {
      [category]: tokens,
    },
  });
}

/**
 * Import design tokens from JSON
 */
export async function importDesignTokens(
  workspaceId: string,
  tokensJson: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const tokens = JSON.parse(tokensJson) as Partial<DesignTokens>;

    // Validate structure
    const validCategories = ['colors', 'typography', 'spacing', 'borderRadius', 'shadows', 'breakpoints'];
    const hasValidCategory = Object.keys(tokens).some(key => validCategories.includes(key));

    if (!hasValidCategory) {
      return {
        success: false,
        error: 'Invalid token structure. Must contain at least one valid category.',
      };
    }

    await upsertDesignSystem(workspaceId, tokens);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to import tokens',
    };
  }
}

/**
 * Export design tokens as JSON
 */
export async function exportDesignTokens(workspaceId: string): Promise<string> {
  const designSystem = await getDesignSystem(workspaceId);

  const tokens: DesignTokens = {
    colors: designSystem.colors,
    typography: designSystem.typography,
    spacing: designSystem.spacing,
    borderRadius: designSystem.borderRadius,
    shadows: designSystem.shadows,
    breakpoints: designSystem.breakpoints,
  };

  return JSON.stringify(tokens, null, 2);
}

/**
 * Reset design system to defaults
 */
export async function resetDesignSystem(workspaceId: string) {
  return await upsertDesignSystem(workspaceId, DEFAULT_DESIGN_TOKENS);
}

/**
 * Get custom fonts for a workspace
 */
export async function getCustomFonts(workspaceId: string) {
  return await prisma.customFont.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Add custom font
 */
export async function addCustomFont(data: {
  workspaceId: string;
  name: string;
  family: string;
  weight: number[];
  style: string[];
  woff2Url?: string;
  woffUrl?: string;
  ttfUrl?: string;
}) {
  return await prisma.customFont.create({
    data,
  });
}

/**
 * Delete custom font
 */
export async function deleteCustomFont(fontId: string) {
  return await prisma.customFont.delete({
    where: { id: fontId },
  });
}

/**
 * Generate CSS variables from design tokens
 */
export function generateCSSVariables(tokens: DesignTokens): string {
  const vars: string[] = [':root {'];

  // Colors
  Object.entries(tokens.colors).forEach(([key, value]) => {
    if (key !== 'custom' && typeof value === 'string') {
      vars.push(`  --color-${key}: ${value};`);
    }
  });

  if (tokens.colors.custom) {
    Object.entries(tokens.colors.custom).forEach(([key, value]) => {
      vars.push(`  --color-${key}: ${value};`);
    });
  }

  // Typography - Font Families
  Object.entries(tokens.typography.fontFamilies).forEach(([key, value]) => {
    if (key !== 'custom' && typeof value === 'string') {
      vars.push(`  --font-${key}: ${value};`);
    }
  });

  if (tokens.typography.fontFamilies.custom) {
    Object.entries(tokens.typography.fontFamilies.custom).forEach(([key, value]) => {
      vars.push(`  --font-${key}: ${value};`);
    });
  }

  // Typography - Font Sizes
  Object.entries(tokens.typography.fontSizes).forEach(([key, value]) => {
    vars.push(`  --text-${key}: ${value};`);
  });

  // Spacing
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    vars.push(`  --spacing-${key}: ${value};`);
  });

  // Border Radius
  Object.entries(tokens.borderRadius).forEach(([key, value]) => {
    vars.push(`  --radius-${key}: ${value};`);
  });

  // Breakpoints
  Object.entries(tokens.breakpoints).forEach(([key, value]) => {
    vars.push(`  --breakpoint-${key}: ${value}px;`);
  });

  vars.push('}');

  return vars.join('\n');
}
