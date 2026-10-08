const { calculateCost, normalizeModelName, MODEL_PRICING } = require('../src/utils/pricing');

describe('Gemini Pricing Utility Tests', () => {
  test('normalizeModelName maps variations correctly', () => {
    expect(normalizeModelName('gemini-1.5-flash')).toBe('gemini-1.5-flash');
    expect(normalizeModelName('models/gemini-1.5-flash-latest')).toBe('gemini-1.5-flash');
    expect(normalizeModelName('gemini-1.5-pro')).toBe('gemini-1.5-pro');
    expect(normalizeModelName('models/gemini-2.0-flash')).toBe('gemini-2.0-flash');
  });

  test('calculateCost computes Gemini 1.5 Flash costs accurately for standard context (<= 128k)', () => {
    // 10,000 prompt tokens: (10,000 / 1,000,000) * 0.075 = $0.00075
    // 2,000 candidate tokens: (2,000 / 1,000,000) * 0.30 = $0.00060
    // Total = $0.00135
    const result = calculateCost('gemini-1.5-flash', 10000, 2000, 35.0);

    expect(result.model).toBe('gemini-1.5-flash');
    expect(result.tokens.promptTokens).toBe(10000);
    expect(result.tokens.candidateTokens).toBe(2000);
    expect(result.tokens.totalTokens).toBe(12000);

    expect(result.costUSD.promptCost).toBeCloseTo(0.00075, 5);
    expect(result.costUSD.candidateCost).toBeCloseTo(0.00060, 5);
    expect(result.costUSD.totalCost).toBeCloseTo(0.00135, 5);
    expect(result.costTRY.totalCost).toBeCloseTo(0.00135 * 35.0, 4);
  });

  test('calculateCost computes Gemini 1.5 Pro tier higher than 128k', () => {
    // 200,000 prompt tokens (Tier > 128k): (200,000 / 1,000,000) * $2.50 = $0.50
    // 5,000 candidate tokens: (5,000 / 1,000,000) * $10.00 = $0.05
    // Total = $0.55
    const result = calculateCost('gemini-1.5-pro', 200000, 5000);
    expect(result.costUSD.promptCost).toBeCloseTo(0.50, 4);
    expect(result.costUSD.candidateCost).toBeCloseTo(0.05, 4);
    expect(result.costUSD.totalCost).toBeCloseTo(0.55, 4);
  });

  test('handles zero or negative tokens gracefully', () => {
    const result = calculateCost('gemini-1.5-flash', 0, 0);
    expect(result.tokens.totalTokens).toBe(0);
    expect(result.costUSD.totalCost).toBe(0);
  });
});
