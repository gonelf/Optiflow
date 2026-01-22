/**
 * Bayesian Statistics for A/B Testing
 *
 * Implements Bayesian methods for:
 * - Early stopping decisions
 * - Probability of being best
 * - Expected loss calculation
 */

/**
 * Beta distribution parameters
 */
interface BetaDistribution {
  alpha: number; // successes + 1
  beta: number; // failures + 1
}

/**
 * Calculates Beta distribution parameters from conversion data
 */
function getBetaParams(conversions: number, impressions: number): BetaDistribution {
  const failures = impressions - conversions;
  return {
    alpha: conversions + 1, // Add 1 for prior (uniform prior)
    beta: failures + 1,
  };
}

/**
 * Gamma function approximation (Stirling's approximation for large numbers)
 */
function logGamma(z: number): number {
  // Lanczos approximation
  const g = 7;
  const coef = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];

  if (z < 0.5) {
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
  }

  z -= 1;
  let x = coef[0];
  for (let i = 1; i < g + 2; i++) {
    x += coef[i] / (z + i);
  }

  const t = z + g + 0.5;
  return Math.log(Math.sqrt(2 * Math.PI)) + Math.log(t) * (z + 0.5) - t + Math.log(x);
}

/**
 * Beta function
 */
function logBeta(a: number, b: number): number {
  return logGamma(a) + logGamma(b) - logGamma(a + b);
}

/**
 * Calculates the probability that variant A has a higher conversion rate than B
 * using Monte Carlo simulation
 */
export function probabilityToBeBest(
  variantA: { conversions: number; impressions: number },
  variantB: { conversions: number; impressions: number },
  simulations: number = 10000
): number {
  const betaA = getBetaParams(variantA.conversions, variantA.impressions);
  const betaB = getBetaParams(variantB.conversions, variantB.impressions);

  let wins = 0;

  // Monte Carlo simulation
  for (let i = 0; i < simulations; i++) {
    const sampleA = sampleBeta(betaA.alpha, betaA.beta);
    const sampleB = sampleBeta(betaB.alpha, betaB.beta);

    if (sampleA > sampleB) {
      wins++;
    }
  }

  return wins / simulations;
}

/**
 * Samples from a Beta distribution using the ratio of Gamma variates method
 */
function sampleBeta(alpha: number, beta: number): number {
  const gammaA = sampleGamma(alpha);
  const gammaB = sampleGamma(beta);
  return gammaA / (gammaA + gammaB);
}

/**
 * Samples from a Gamma distribution using Marsaglia and Tsang's method
 */
function sampleGamma(shape: number, scale: number = 1): number {
  if (shape < 1) {
    // For shape < 1, use the method of Ahrens and Dieter
    const u = Math.random();
    return sampleGamma(1 + shape, scale) * Math.pow(u, 1 / shape);
  }

  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);

  while (true) {
    let x, v;
    do {
      x = randomNormal();
      v = 1 + c * x;
    } while (v <= 0);

    v = v * v * v;
    const u = Math.random();
    const xSquared = x * x;

    if (u < 1 - 0.0331 * xSquared * xSquared) {
      return d * v * scale;
    }

    if (Math.log(u) < 0.5 * xSquared + d * (1 - v + Math.log(v))) {
      return d * v * scale;
    }
  }
}

/**
 * Generates a random number from a standard normal distribution
 * using the Box-Muller transform
 */
function randomNormal(): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Calculates expected loss for choosing a variant
 * (how much conversion rate we'd lose if we pick the wrong one)
 */
export function expectedLoss(
  variantA: { conversions: number; impressions: number },
  variantB: { conversions: number; impressions: number },
  simulations: number = 10000
): { lossA: number; lossB: number } {
  const betaA = getBetaParams(variantA.conversions, variantA.impressions);
  const betaB = getBetaParams(variantB.conversions, variantB.impressions);

  let totalLossA = 0;
  let totalLossB = 0;

  for (let i = 0; i < simulations; i++) {
    const sampleA = sampleBeta(betaA.alpha, betaA.beta);
    const sampleB = sampleBeta(betaB.alpha, betaB.beta);

    // Loss for choosing A when B is better
    if (sampleB > sampleA) {
      totalLossA += sampleB - sampleA;
    }

    // Loss for choosing B when A is better
    if (sampleA > sampleB) {
      totalLossB += sampleA - sampleB;
    }
  }

  return {
    lossA: totalLossA / simulations,
    lossB: totalLossB / simulations,
  };
}

/**
 * Bayesian A/B test result with early stopping recommendation
 */
export interface BayesianTestResult {
  probabilityABetter: number;
  probabilityBBetter: number;
  expectedLossA: number;
  expectedLossB: number;
  recommendStop: boolean;
  recommendedVariant: 'A' | 'B' | null;
  confidence: number;
}

/**
 * Performs a Bayesian A/B test and provides stopping recommendations
 */
export function bayesianABTest(
  variantA: { conversions: number; impressions: number },
  variantB: { conversions: number; impressions: number },
  options: {
    simulations?: number;
    probabilityThreshold?: number; // Minimum probability to declare winner (e.g., 0.95)
    lossThreshold?: number; // Maximum acceptable expected loss (e.g., 0.001 = 0.1%)
  } = {}
): BayesianTestResult {
  const simulations = options.simulations || 10000;
  const probabilityThreshold = options.probabilityThreshold || 0.95;
  const lossThreshold = options.lossThreshold || 0.001;

  const probABetter = probabilityToBeBest(variantA, variantB, simulations);
  const probBBetter = 1 - probABetter;

  const { lossA, lossB } = expectedLoss(variantA, variantB, simulations);

  // Determine if we should stop the test
  let recommendStop = false;
  let recommendedVariant: 'A' | 'B' | null = null;

  if (probABetter >= probabilityThreshold && lossA <= lossThreshold) {
    recommendStop = true;
    recommendedVariant = 'A';
  } else if (probBBetter >= probabilityThreshold && lossB <= lossThreshold) {
    recommendStop = true;
    recommendedVariant = 'B';
  }

  const confidence = Math.max(probABetter, probBBetter);

  return {
    probabilityABetter: probABetter,
    probabilityBBetter: probBBetter,
    expectedLossA: lossA,
    expectedLossB: lossB,
    recommendStop,
    recommendedVariant,
    confidence,
  };
}

/**
 * Multi-variant Bayesian test
 */
export interface MultiVariantBayesianResult {
  probabilities: Record<string, number>;
  expectedLosses: Record<string, number>;
  recommendedVariant: string | null;
  recommendStop: boolean;
}

export function bayesianMultiVariantTest(
  variants: Array<{
    id: string;
    conversions: number;
    impressions: number;
  }>,
  options: {
    simulations?: number;
    probabilityThreshold?: number;
    lossThreshold?: number;
  } = {}
): MultiVariantBayesianResult {
  const simulations = options.simulations || 10000;
  const probabilityThreshold = options.probabilityThreshold || 0.95;
  const lossThreshold = options.lossThreshold || 0.001;

  // Get beta parameters for all variants
  const betaParams = variants.map((v) => ({
    id: v.id,
    params: getBetaParams(v.conversions, v.impressions),
  }));

  const probabilities: Record<string, number> = {};
  const expectedLosses: Record<string, number> = {};

  // Initialize counters
  variants.forEach((v) => {
    probabilities[v.id] = 0;
    expectedLosses[v.id] = 0;
  });

  // Monte Carlo simulation
  const samples: number[][] = [];
  for (let i = 0; i < simulations; i++) {
    const currentSamples = betaParams.map((bp) =>
      sampleBeta(bp.params.alpha, bp.params.beta)
    );
    samples.push(currentSamples);

    // Find best in this simulation
    const maxSample = Math.max(...currentSamples);
    const bestIndex = currentSamples.indexOf(maxSample);
    probabilities[variants[bestIndex].id]++;

    // Calculate losses
    currentSamples.forEach((sample, idx) => {
      expectedLosses[variants[idx].id] += Math.max(0, maxSample - sample);
    });
  }

  // Normalize probabilities and losses
  Object.keys(probabilities).forEach((id) => {
    probabilities[id] /= simulations;
    expectedLosses[id] /= simulations;
  });

  // Find recommended variant
  let recommendedVariant: string | null = null;
  let maxProb = 0;

  for (const [id, prob] of Object.entries(probabilities)) {
    if (prob >= probabilityThreshold && expectedLosses[id] <= lossThreshold) {
      if (prob > maxProb) {
        maxProb = prob;
        recommendedVariant = id;
      }
    }
  }

  const recommendStop = recommendedVariant !== null;

  return {
    probabilities,
    expectedLosses,
    recommendedVariant,
    recommendStop,
  };
}

/**
 * Calculates the value remaining in continuing the test
 */
export function valueOfInformation(
  variantA: { conversions: number; impressions: number },
  variantB: { conversions: number; impressions: number },
  futureTraffic: number // Expected number of future visitors
): number {
  const { lossA, lossB } = expectedLoss(variantA, variantB);
  const probABetter = probabilityToBeBest(variantA, variantB);

  // Expected loss if we stop now
  const expectedLossNow = probABetter * lossA + (1 - probABetter) * lossB;

  // Value = expected loss now * future traffic
  // This represents how much we could potentially lose by making the wrong decision
  return expectedLossNow * futureTraffic;
}
