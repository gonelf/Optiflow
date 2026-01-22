/**
 * Traffic Splitter Service
 *
 * Handles visitor bucketing and variant assignment for A/B tests.
 * Uses consistent hashing to ensure visitors see the same variant throughout the test.
 */

import crypto from 'crypto';

export interface TrafficSplit {
  [variantId: string]: number; // Percentage allocation (0-100)
}

export interface VariantAssignment {
  variantId: string;
  variantName: string;
  isControl: boolean;
}

/**
 * Generates a hash from visitor ID and test ID for consistent bucketing
 */
function generateBucketHash(visitorId: string, testId: string): number {
  const hash = crypto
    .createHash('md5')
    .update(`${visitorId}:${testId}`)
    .digest('hex');

  // Convert first 8 characters of hex to decimal and normalize to 0-100
  const decimal = parseInt(hash.substring(0, 8), 16);
  return (decimal % 10000) / 100; // Returns a value between 0 and 100
}

/**
 * Assigns a visitor to a variant based on traffic split configuration
 */
export function assignVariant(
  visitorId: string,
  testId: string,
  trafficSplit: TrafficSplit,
  variants: Array<{ id: string; name: string; isControl: boolean }>
): VariantAssignment | null {
  if (!visitorId || !testId || !trafficSplit || variants.length === 0) {
    return null;
  }

  // Generate consistent hash for this visitor/test combination
  const bucketValue = generateBucketHash(visitorId, testId);

  // Build cumulative distribution
  let cumulative = 0;
  const distribution: Array<{ variantId: string; min: number; max: number }> = [];

  for (const [variantId, percentage] of Object.entries(trafficSplit)) {
    const min = cumulative;
    const max = cumulative + percentage;
    distribution.push({ variantId, min, max });
    cumulative = max;
  }

  // Find which bucket the visitor falls into
  for (const bucket of distribution) {
    if (bucketValue >= bucket.min && bucketValue < bucket.max) {
      const variant = variants.find((v) => v.id === bucket.variantId);
      if (variant) {
        return {
          variantId: variant.id,
          variantName: variant.name,
          isControl: variant.isControl,
        };
      }
    }
  }

  // Fallback to control variant if something went wrong
  const controlVariant = variants.find((v) => v.isControl) || variants[0];
  return {
    variantId: controlVariant.id,
    variantName: controlVariant.name,
    isControl: controlVariant.isControl,
  };
}

/**
 * Validates traffic split configuration
 */
export function validateTrafficSplit(trafficSplit: TrafficSplit): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check if object is empty
  if (Object.keys(trafficSplit).length === 0) {
    errors.push('Traffic split cannot be empty');
    return { valid: false, errors };
  }

  // Sum all percentages
  const total = Object.values(trafficSplit).reduce((sum, val) => sum + val, 0);

  // Check if total is approximately 100
  if (Math.abs(total - 100) > 0.01) {
    errors.push(`Traffic split must sum to 100% (currently ${total.toFixed(2)}%)`);
  }

  // Check for negative or invalid values
  for (const [variantId, percentage] of Object.entries(trafficSplit)) {
    if (percentage < 0) {
      errors.push(`Variant ${variantId} has negative percentage: ${percentage}`);
    }
    if (percentage > 100) {
      errors.push(`Variant ${variantId} exceeds 100%: ${percentage}`);
    }
    if (isNaN(percentage)) {
      errors.push(`Variant ${variantId} has invalid percentage: ${percentage}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Creates an even traffic split for multiple variants
 */
export function createEvenSplit(variantIds: string[]): TrafficSplit {
  if (variantIds.length === 0) {
    return {};
  }

  const percentagePerVariant = 100 / variantIds.length;
  const split: TrafficSplit = {};

  variantIds.forEach((id) => {
    split[id] = Math.round(percentagePerVariant * 100) / 100; // Round to 2 decimals
  });

  // Adjust the last variant to ensure total is exactly 100
  const total = Object.values(split).reduce((sum, val) => sum + val, 0);
  const lastId = variantIds[variantIds.length - 1];
  split[lastId] = Math.round((split[lastId] + (100 - total)) * 100) / 100;

  return split;
}

/**
 * Simulates traffic distribution for testing purposes
 */
export function simulateTrafficDistribution(
  testId: string,
  trafficSplit: TrafficSplit,
  variants: Array<{ id: string; name: string; isControl: boolean }>,
  sampleSize: number = 10000
): Record<string, { count: number; percentage: number }> {
  const distribution: Record<string, number> = {};

  // Initialize counters
  variants.forEach((v) => {
    distribution[v.id] = 0;
  });

  // Simulate assignments
  for (let i = 0; i < sampleSize; i++) {
    const visitorId = `visitor-${i}`;
    const assignment = assignVariant(visitorId, testId, trafficSplit, variants);
    if (assignment) {
      distribution[assignment.variantId]++;
    }
  }

  // Convert to percentages
  const result: Record<string, { count: number; percentage: number }> = {};
  for (const [variantId, count] of Object.entries(distribution)) {
    result[variantId] = {
      count,
      percentage: (count / sampleSize) * 100,
    };
  }

  return result;
}
