/**
 * Statistical Significance Calculator
 *
 * Implements statistical tests for A/B testing:
 * - Z-test for proportions
 * - P-value calculation
 * - Confidence intervals
 */

/**
 * Calculates the standard error for proportion difference
 */
function calculateStandardError(
  n1: number,
  p1: number,
  n2: number,
  p2: number
): number {
  return Math.sqrt((p1 * (1 - p1)) / n1 + (p2 * (1 - p2)) / n2);
}

/**
 * Calculates the pooled proportion for two samples
 */
function calculatePooledProportion(
  conversions1: number,
  total1: number,
  conversions2: number,
  total2: number
): number {
  return (conversions1 + conversions2) / (total1 + total2);
}

/**
 * Standard normal cumulative distribution function
 * Uses an approximation for the CDF
 */
function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

  return z > 0 ? 1 - p : p;
}

/**
 * Calculates Z-score for two proportions
 */
function calculateZScore(
  conversions1: number,
  total1: number,
  conversions2: number,
  total2: number
): number {
  const p1 = conversions1 / total1;
  const p2 = conversions2 / total2;
  const pooledP = calculatePooledProportion(conversions1, total1, conversions2, total2);

  const se = Math.sqrt(pooledP * (1 - pooledP) * (1 / total1 + 1 / total2));

  if (se === 0) return 0;

  return (p1 - p2) / se;
}

/**
 * Calculates two-tailed p-value from z-score
 */
function calculatePValue(zScore: number): number {
  return 2 * (1 - normalCDF(Math.abs(zScore)));
}

/**
 * Calculates confidence interval for the difference in proportions
 */
export function calculateConfidenceInterval(
  conversions1: number,
  total1: number,
  conversions2: number,
  total2: number,
  confidenceLevel: number = 0.95
): [number, number] {
  const p1 = conversions1 / total1;
  const p2 = conversions2 / total2;
  const diff = p1 - p2;

  const se = calculateStandardError(total1, p1, total2, p2);

  // Z-score for confidence level (e.g., 1.96 for 95%)
  const alpha = 1 - confidenceLevel;
  const zCritical = getZCritical(confidenceLevel);

  const marginOfError = zCritical * se;

  return [diff - marginOfError, diff + marginOfError];
}

/**
 * Gets critical Z value for a given confidence level
 */
function getZCritical(confidenceLevel: number): number {
  // Common Z-critical values
  const zTable: Record<number, number> = {
    0.90: 1.645,
    0.95: 1.96,
    0.99: 2.576,
    0.999: 3.291,
  };

  return zTable[confidenceLevel] || 1.96; // Default to 95%
}

/**
 * Tests statistical significance between two variants
 */
export interface SignificanceTestResult {
  hasSignificance: boolean;
  pValue: number;
  zScore: number;
  confidenceInterval: [number, number];
  conversionRateDiff: number;
  relativeImprovement: number;
  sampleSizeReached: boolean;
}

export function testSignificance(
  variantA: { conversions: number; impressions: number },
  variantB: { conversions: number; impressions: number },
  options: {
    confidenceLevel?: number;
    minimumSampleSize?: number;
  } = {}
): SignificanceTestResult {
  const confidenceLevel = options.confidenceLevel || 0.95;
  const minimumSampleSize = options.minimumSampleSize || 100;

  const { conversions: convA, impressions: impA } = variantA;
  const { conversions: convB, impressions: impB } = variantB;

  // Check if minimum sample size is reached
  const sampleSizeReached = impA >= minimumSampleSize && impB >= minimumSampleSize;

  // Calculate conversion rates
  const rateA = impA > 0 ? convA / impA : 0;
  const rateB = impB > 0 ? convB / impB : 0;
  const conversionRateDiff = rateA - rateB;
  const relativeImprovement = rateB > 0 ? (conversionRateDiff / rateB) * 100 : 0;

  // If sample size not reached, return early
  if (!sampleSizeReached) {
    return {
      hasSignificance: false,
      pValue: 1,
      zScore: 0,
      confidenceInterval: [0, 0],
      conversionRateDiff,
      relativeImprovement,
      sampleSizeReached: false,
    };
  }

  // Calculate z-score and p-value
  const zScore = calculateZScore(convA, impA, convB, impB);
  const pValue = calculatePValue(zScore);
  const confidenceInterval = calculateConfidenceInterval(
    convA,
    impA,
    convB,
    impB,
    confidenceLevel
  );

  // Determine significance
  const alpha = 1 - confidenceLevel;
  const hasSignificance = pValue < alpha;

  return {
    hasSignificance,
    pValue,
    zScore,
    confidenceInterval,
    conversionRateDiff,
    relativeImprovement,
    sampleSizeReached,
  };
}

/**
 * Calculates required sample size for a given effect size and power
 */
export function calculateRequiredSampleSize(
  baselineConversionRate: number,
  minimumDetectableEffect: number, // Relative improvement (e.g., 0.1 for 10%)
  confidenceLevel: number = 0.95,
  statisticalPower: number = 0.8
): number {
  const p1 = baselineConversionRate;
  const p2 = baselineConversionRate * (1 + minimumDetectableEffect);

  const alpha = 1 - confidenceLevel;
  const beta = 1 - statisticalPower;

  // Z-scores for alpha and beta
  const zAlpha = getZCritical(confidenceLevel);
  const zBeta = getZCritical(statisticalPower);

  // Calculate sample size per variant
  const numerator =
    Math.pow(zAlpha * Math.sqrt(2 * p1 * (1 - p1)) + zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)), 2);
  const denominator = Math.pow(p2 - p1, 2);

  const sampleSize = Math.ceil(numerator / denominator);

  return sampleSize;
}

/**
 * Compares multiple variants and determines the best performer
 */
export interface MultiVariantTestResult {
  winningVariantId: string | null;
  hasSignificance: boolean;
  comparisons: Array<{
    variantId: string;
    vsControl: SignificanceTestResult;
  }>;
}

export function testMultipleVariants(
  controlVariant: { id: string; conversions: number; impressions: number },
  testVariants: Array<{ id: string; conversions: number; impressions: number }>,
  options: {
    confidenceLevel?: number;
    minimumSampleSize?: number;
  } = {}
): MultiVariantTestResult {
  const comparisons = testVariants.map((variant) => ({
    variantId: variant.id,
    vsControl: testSignificance(variant, controlVariant, options),
  }));

  // Find the best performing variant with statistical significance
  let winningVariantId: string | null = null;
  let maxImprovement = 0;

  for (const comparison of comparisons) {
    if (
      comparison.vsControl.hasSignificance &&
      comparison.vsControl.relativeImprovement > maxImprovement
    ) {
      maxImprovement = comparison.vsControl.relativeImprovement;
      winningVariantId = comparison.variantId;
    }
  }

  // If no variant beats control significantly, control wins
  const hasSignificance = winningVariantId !== null;

  return {
    winningVariantId: hasSignificance ? winningVariantId : controlVariant.id,
    hasSignificance,
    comparisons,
  };
}
