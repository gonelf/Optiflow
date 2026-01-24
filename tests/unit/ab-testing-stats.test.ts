/**
 * Unit tests for A/B Testing Statistical Calculations
 * Tests statistical significance calculations, confidence intervals, and winner determination
 */

import { describe, test, expect } from '@jest/globals';

// Statistical functions to test (should match implementation in services)
interface ABTestStats {
  variant: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
}

/**
 * Calculate conversion rate
 */
function calculateConversionRate(conversions: number, impressions: number): number {
  if (impressions === 0) return 0;
  return conversions / impressions;
}

/**
 * Calculate standard error for conversion rate
 */
function calculateStandardError(conversionRate: number, sampleSize: number): number {
  if (sampleSize === 0) return 0;
  return Math.sqrt((conversionRate * (1 - conversionRate)) / sampleSize);
}

/**
 * Calculate Z-score for two proportions
 */
function calculateZScore(
  rate1: number,
  rate2: number,
  n1: number,
  n2: number
): number {
  const pooledRate = (rate1 * n1 + rate2 * n2) / (n1 + n2);
  const se = Math.sqrt(pooledRate * (1 - pooledRate) * (1 / n1 + 1 / n2));

  if (se === 0) return 0;
  return (rate1 - rate2) / se;
}

/**
 * Calculate p-value from Z-score (two-tailed test)
 */
function calculatePValue(zScore: number): number {
  const z = Math.abs(zScore);
  // Approximation of the cumulative distribution function
  const t = 1 / (1 + 0.2316419 * z);
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return 2 * probability; // Two-tailed
}

/**
 * Calculate confidence interval
 */
function calculateConfidenceInterval(
  conversionRate: number,
  sampleSize: number,
  confidenceLevel: number = 0.95
): { lower: number; upper: number } {
  const z = confidenceLevel === 0.95 ? 1.96 : confidenceLevel === 0.99 ? 2.576 : 1.645;
  const se = calculateStandardError(conversionRate, sampleSize);

  return {
    lower: Math.max(0, conversionRate - z * se),
    upper: Math.min(1, conversionRate + z * se),
  };
}

/**
 * Determine if test has statistical significance
 */
function isStatisticallySignificant(pValue: number, alpha: number = 0.05): boolean {
  return pValue < alpha;
}

/**
 * Calculate minimum sample size needed for test
 */
function calculateMinimumSampleSize(
  baselineRate: number,
  minimumDetectableEffect: number,
  alpha: number = 0.05,
  power: number = 0.8
): number {
  const zAlpha = 1.96; // for 95% confidence
  const zBeta = 0.84; // for 80% power

  const p1 = baselineRate;
  const p2 = baselineRate * (1 + minimumDetectableEffect);
  const pBar = (p1 + p2) / 2;

  const numerator = Math.pow(zAlpha * Math.sqrt(2 * pBar * (1 - pBar)) + zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)), 2);
  const denominator = Math.pow(p2 - p1, 2);

  return Math.ceil(numerator / denominator);
}

describe('A/B Testing Statistics', () => {
  describe('Conversion Rate Calculation', () => {
    test('should calculate conversion rate correctly', () => {
      expect(calculateConversionRate(50, 1000)).toBe(0.05);
      expect(calculateConversionRate(100, 2000)).toBe(0.05);
      expect(calculateConversionRate(0, 1000)).toBe(0);
    });

    test('should handle zero impressions', () => {
      expect(calculateConversionRate(0, 0)).toBe(0);
      expect(calculateConversionRate(10, 0)).toBe(0);
    });

    test('should calculate percentage correctly', () => {
      const rate = calculateConversionRate(150, 1000);
      expect(rate * 100).toBe(15);
    });
  });

  describe('Standard Error Calculation', () => {
    test('should calculate standard error correctly', () => {
      const se = calculateStandardError(0.05, 1000);
      expect(se).toBeCloseTo(0.0069, 3);
    });

    test('should handle zero sample size', () => {
      expect(calculateStandardError(0.05, 0)).toBe(0);
    });

    test('should handle extreme conversion rates', () => {
      const se1 = calculateStandardError(0, 1000);
      expect(se1).toBe(0);

      const se2 = calculateStandardError(1, 1000);
      expect(se2).toBe(0);
    });
  });

  describe('Z-Score Calculation', () => {
    test('should calculate Z-score for significant difference', () => {
      const zScore = calculateZScore(0.06, 0.05, 1000, 1000);
      expect(Math.abs(zScore)).toBeGreaterThan(0);
    });

    test('should return zero for identical rates', () => {
      const zScore = calculateZScore(0.05, 0.05, 1000, 1000);
      expect(zScore).toBeCloseTo(0, 5);
    });

    test('should handle different sample sizes', () => {
      const zScore = calculateZScore(0.06, 0.05, 500, 1500);
      expect(Math.abs(zScore)).toBeGreaterThan(0);
    });
  });

  describe('P-Value Calculation', () => {
    test('should calculate p-value for Z-score', () => {
      const pValue = calculatePValue(1.96);
      expect(pValue).toBeCloseTo(0.05, 2);
    });

    test('should return high p-value for low Z-score', () => {
      const pValue = calculatePValue(0.5);
      expect(pValue).toBeGreaterThan(0.05);
    });

    test('should return low p-value for high Z-score', () => {
      const pValue = calculatePValue(3);
      expect(pValue).toBeLessThan(0.01);
    });

    test('should handle negative Z-scores', () => {
      const pValue1 = calculatePValue(1.96);
      const pValue2 = calculatePValue(-1.96);
      expect(pValue1).toBeCloseTo(pValue2, 5);
    });
  });

  describe('Statistical Significance', () => {
    test('should identify statistically significant results', () => {
      const pValue = 0.01;
      expect(isStatisticallySignificant(pValue)).toBe(true);
    });

    test('should identify non-significant results', () => {
      const pValue = 0.10;
      expect(isStatisticallySignificant(pValue)).toBe(false);
    });

    test('should handle edge cases at significance threshold', () => {
      expect(isStatisticallySignificant(0.049)).toBe(true);
      expect(isStatisticallySignificant(0.051)).toBe(false);
    });
  });

  describe('Confidence Interval Calculation', () => {
    test('should calculate 95% confidence interval', () => {
      const ci = calculateConfidenceInterval(0.05, 1000, 0.95);
      expect(ci.lower).toBeLessThan(0.05);
      expect(ci.upper).toBeGreaterThan(0.05);
      expect(ci.lower).toBeGreaterThanOrEqual(0);
      expect(ci.upper).toBeLessThanOrEqual(1);
    });

    test('should calculate 99% confidence interval (wider)', () => {
      const ci95 = calculateConfidenceInterval(0.05, 1000, 0.95);
      const ci99 = calculateConfidenceInterval(0.05, 1000, 0.99);

      expect(ci99.upper - ci99.lower).toBeGreaterThan(ci95.upper - ci95.lower);
    });

    test('should handle small sample sizes (wider intervals)', () => {
      const ciLarge = calculateConfidenceInterval(0.05, 1000);
      const ciSmall = calculateConfidenceInterval(0.05, 100);

      expect(ciSmall.upper - ciSmall.lower).toBeGreaterThan(ciLarge.upper - ciLarge.lower);
    });

    test('should constrain to [0, 1] range', () => {
      const ci = calculateConfidenceInterval(0.95, 100);
      expect(ci.lower).toBeGreaterThanOrEqual(0);
      expect(ci.upper).toBeLessThanOrEqual(1);
    });
  });

  describe('Minimum Sample Size Calculation', () => {
    test('should calculate minimum sample size for 20% lift', () => {
      const sampleSize = calculateMinimumSampleSize(0.05, 0.2);
      expect(sampleSize).toBeGreaterThan(0);
      expect(sampleSize).toBeLessThan(10000); // Reasonable upper bound
    });

    test('should require larger sample for smaller effects', () => {
      const size10 = calculateMinimumSampleSize(0.05, 0.1);
      const size20 = calculateMinimumSampleSize(0.05, 0.2);

      expect(size10).toBeGreaterThan(size20);
    });

    test('should require larger sample for lower baseline rates', () => {
      const size5 = calculateMinimumSampleSize(0.05, 0.2);
      const size1 = calculateMinimumSampleSize(0.01, 0.2);

      expect(size1).toBeGreaterThan(size5);
    });
  });

  describe('Real-world Scenario Tests', () => {
    test('should identify clear winner with 10% improvement', () => {
      const control = { impressions: 10000, conversions: 500 }; // 5% conversion
      const variant = { impressions: 10000, conversions: 600 }; // 6% conversion

      const controlRate = calculateConversionRate(control.conversions, control.impressions);
      const variantRate = calculateConversionRate(variant.conversions, variant.impressions);

      const zScore = calculateZScore(
        variantRate,
        controlRate,
        variant.impressions,
        control.impressions
      );

      const pValue = calculatePValue(zScore);

      expect(isStatisticallySignificant(pValue)).toBe(true);
    });

    test('should not declare winner with insufficient data', () => {
      const control = { impressions: 100, conversions: 5 }; // 5% conversion
      const variant = { impressions: 100, conversions: 7 }; // 7% conversion

      const controlRate = calculateConversionRate(control.conversions, control.impressions);
      const variantRate = calculateConversionRate(variant.conversions, variant.impressions);

      const zScore = calculateZScore(
        variantRate,
        controlRate,
        variant.impressions,
        control.impressions
      );

      const pValue = calculatePValue(zScore);

      expect(isStatisticallySignificant(pValue)).toBe(false);
    });

    test('should handle ties (equal conversion rates)', () => {
      const control = { impressions: 1000, conversions: 50 };
      const variant = { impressions: 1000, conversions: 50 };

      const controlRate = calculateConversionRate(control.conversions, control.impressions);
      const variantRate = calculateConversionRate(variant.conversions, variant.impressions);

      expect(controlRate).toBe(variantRate);
    });
  });
});
