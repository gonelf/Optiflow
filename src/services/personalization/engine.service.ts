/**
 * Personalization Engine Service
 * Applies dynamic personalization rules to page content
 */

import { prisma } from '@/lib/prisma';

export interface PersonalizationContext {
  visitorId: string;
  sessionId?: string;
  userId?: string;

  // Geographic
  country?: string;
  city?: string;

  // Device
  device?: 'mobile' | 'tablet' | 'desktop';
  browser?: string;
  os?: string;

  // Traffic source
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;

  // Behavioral
  visitCount?: number;
  pageViews?: number;
  timeOnSite?: number;
  previousPages?: string[];

  // Custom
  customAttributes?: Record<string, any>;
}

export interface PersonalizationRule {
  id: string;
  name: string;
  segment: any;
  action: string;
  config: any;
  priority: number;
  isActive: boolean;
}

export interface PersonalizationResult {
  applied: boolean;
  rules: string[];
  modifications: Array<{
    ruleId: string;
    action: string;
    componentId?: string;
    changes: any;
  }>;
}

/**
 * Evaluate if a visitor matches a segment
 */
function matchesSegment(
  context: PersonalizationContext,
  segment: any
): boolean {
  // Geographic matching
  if (segment.country && context.country !== segment.country) {
    return false;
  }

  if (segment.city && context.city !== segment.city) {
    return false;
  }

  // Device matching
  if (segment.device && context.device !== segment.device) {
    return false;
  }

  if (segment.browser && context.browser !== segment.browser) {
    return false;
  }

  if (segment.os && context.os !== segment.os) {
    return false;
  }

  // Traffic source matching
  if (segment.utmSource && context.utmSource !== segment.utmSource) {
    return false;
  }

  if (segment.utmMedium && context.utmMedium !== segment.utmMedium) {
    return false;
  }

  if (segment.utmCampaign && context.utmCampaign !== segment.utmCampaign) {
    return false;
  }

  // Behavioral matching
  if (segment.visitCount) {
    const { operator, value } = segment.visitCount;
    const visitCount = context.visitCount || 0;

    if (operator === 'eq' && visitCount !== value) return false;
    if (operator === 'gt' && visitCount <= value) return false;
    if (operator === 'lt' && visitCount >= value) return false;
    if (operator === 'gte' && visitCount < value) return false;
    if (operator === 'lte' && visitCount > value) return false;
  }

  if (segment.pageViews) {
    const { operator, value } = segment.pageViews;
    const pageViews = context.pageViews || 0;

    if (operator === 'eq' && pageViews !== value) return false;
    if (operator === 'gt' && pageViews <= value) return false;
    if (operator === 'lt' && pageViews >= value) return false;
    if (operator === 'gte' && pageViews < value) return false;
    if (operator === 'lte' && pageViews > value) return false;
  }

  // Custom attribute matching
  if (segment.customAttributes) {
    for (const [key, expectedValue] of Object.entries(segment.customAttributes)) {
      const actualValue = context.customAttributes?.[key];
      if (actualValue !== expectedValue) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Get applicable personalization rules for a visitor
 */
export async function getApplicableRules(
  context: PersonalizationContext
): Promise<PersonalizationRule[]> {
  // Get all active rules
  const rules = await prisma.personalizationRule.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      priority: 'desc',
    },
  });

  // Filter rules that match the visitor's segment
  const applicableRules = rules.filter(rule => {
    const segment = rule.segment as any;
    return matchesSegment(context, segment);
  });

  return applicableRules.map(rule => ({
    id: rule.id,
    name: rule.name,
    segment: rule.segment as any,
    action: rule.action,
    config: rule.config as any,
    priority: rule.priority,
    isActive: rule.isActive,
  }));
}

/**
 * Apply personalization rules to page components
 */
export async function applyPersonalization(
  components: any[],
  context: PersonalizationContext
): Promise<{ components: any[]; result: PersonalizationResult }> {
  const applicableRules = await getApplicableRules(context);

  if (applicableRules.length === 0) {
    return {
      components,
      result: {
        applied: false,
        rules: [],
        modifications: [],
      },
    };
  }

  let modifiedComponents = [...components];
  const modifications: PersonalizationResult['modifications'] = [];

  // Apply rules in priority order
  for (const rule of applicableRules) {
    const modification = applyRule(modifiedComponents, rule);

    if (modification) {
      modifiedComponents = modification.components;
      modifications.push({
        ruleId: rule.id,
        action: rule.action,
        componentId: modification.componentId,
        changes: modification.changes,
      });
    }
  }

  return {
    components: modifiedComponents,
    result: {
      applied: modifications.length > 0,
      rules: applicableRules.map(r => r.id),
      modifications,
    },
  };
}

/**
 * Apply a single rule to components
 */
function applyRule(
  components: any[],
  rule: PersonalizationRule
): { components: any[]; componentId?: string; changes: any } | null {
  const { action, config } = rule;

  switch (action) {
    case 'SWAP_COMPONENT': {
      const { componentId, replacementComponent } = config;
      const index = components.findIndex(c => c.id === componentId);

      if (index === -1) return null;

      const newComponents = [...components];
      newComponents[index] = {
        ...newComponents[index],
        ...replacementComponent,
      };

      return {
        components: newComponents,
        componentId,
        changes: { replaced: true },
      };
    }

    case 'CHANGE_TEXT': {
      const { componentId, path, newText } = config;
      const component = components.find(c => c.id === componentId);

      if (!component) return null;

      const newComponents = components.map(c => {
        if (c.id !== componentId) return c;

        const updated = { ...c };
        setNestedProperty(updated, path, newText);

        return updated;
      });

      return {
        components: newComponents,
        componentId,
        changes: { path, newText },
      };
    }

    case 'CHANGE_IMAGE': {
      const { componentId, path, newImageUrl } = config;
      const component = components.find(c => c.id === componentId);

      if (!component) return null;

      const newComponents = components.map(c => {
        if (c.id !== componentId) return c;

        const updated = { ...c };
        setNestedProperty(updated, path, newImageUrl);

        return updated;
      });

      return {
        components: newComponents,
        componentId,
        changes: { path, newImageUrl },
      };
    }

    case 'SHOW_BANNER': {
      const { bannerComponent, position } = config;
      const newComponents = [...components];

      if (position === 'top') {
        newComponents.unshift(bannerComponent);
      } else {
        newComponents.push(bannerComponent);
      }

      return {
        components: newComponents,
        changes: { bannerAdded: true, position },
      };
    }

    default:
      return null;
  }
}

/**
 * Set a nested property on an object using a dot-notation path
 */
function setNestedProperty(obj: any, path: string, value: any): void {
  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    if (!(parts[i] in current)) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }

  current[parts[parts.length - 1]] = value;
}

/**
 * Create a new personalization rule
 */
export async function createPersonalizationRule(
  name: string,
  segment: any,
  action: 'SWAP_COMPONENT' | 'CHANGE_TEXT' | 'CHANGE_IMAGE' | 'REDIRECT' | 'SHOW_BANNER',
  config: any,
  priority = 0
): Promise<PersonalizationRule> {
  const rule = await prisma.personalizationRule.create({
    data: {
      name,
      segment,
      action,
      config,
      priority,
      isActive: true,
    },
  });

  return {
    id: rule.id,
    name: rule.name,
    segment: rule.segment as any,
    action: rule.action,
    config: rule.config as any,
    priority: rule.priority,
    isActive: rule.isActive,
  };
}

/**
 * Update a personalization rule
 */
export async function updatePersonalizationRule(
  ruleId: string,
  updates: Partial<{
    name: string;
    segment: any;
    action: string;
    config: any;
    priority: number;
    isActive: boolean;
  }>
): Promise<PersonalizationRule> {
  const rule = await prisma.personalizationRule.update({
    where: { id: ruleId },
    data: updates,
  });

  return {
    id: rule.id,
    name: rule.name,
    segment: rule.segment as any,
    action: rule.action,
    config: rule.config as any,
    priority: rule.priority,
    isActive: rule.isActive,
  };
}

/**
 * Delete a personalization rule
 */
export async function deletePersonalizationRule(ruleId: string): Promise<void> {
  await prisma.personalizationRule.delete({
    where: { id: ruleId },
  });
}

/**
 * Get all personalization rules
 */
export async function getAllPersonalizationRules(): Promise<PersonalizationRule[]> {
  const rules = await prisma.personalizationRule.findMany({
    orderBy: {
      priority: 'desc',
    },
  });

  return rules.map(rule => ({
    id: rule.id,
    name: rule.name,
    segment: rule.segment as any,
    action: rule.action,
    config: rule.config as any,
    priority: rule.priority,
    isActive: rule.isActive,
  }));
}
