import { describe, it, expect } from 'vitest';
import { calculateCost, normalizeModelName, mapToLiveModel, MODEL_PRICING } from '../src/lib/pricing';

describe('Pricing Engine Unit Tests (Faz 4 QA & Deterministic Costing)', () => {
  it('should correctly normalize model names', () => {
    expect(normalizeModelName('models/gemini-1.5-flash')).toBe('gemini-1.5-flash');
    expect(normalizeModelName('gemini-1.5-pro')).toBe('gemini-1.5-pro');
    expect(normalizeModelName('1.5-flash')).toBe('gemini-1.5-flash');
    expect(normalizeModelName('1.5-pro')).toBe('gemini-1.5-pro');
    expect(normalizeModelName('gemini-3.8-flash')).toBe('gemini-3.8-flash');
    expect(normalizeModelName('gemini-3.7-flash')).toBe('gemini-3.7-flash');
    expect(normalizeModelName('gemini-3.5-flash')).toBe('gemini-3.5-flash');
    expect(normalizeModelName('flash-lite')).toBe('gemini-flash-lite-latest');
  });

  it('should map legacy/deprecated models to live active model for API safety', () => {
    expect(mapToLiveModel('gemini-1.5-flash')).toBe('gemini-3.7-flash');
    expect(mapToLiveModel('gemini-1.5-pro')).toBe('gemini-3.7-flash');
    expect(mapToLiveModel('gemini-3.8-flash')).toBe('gemini-3.8-flash');
    expect(mapToLiveModel('gemini-3.7-flash')).toBe('gemini-3.7-flash');
  });

  it('should calculate Gemini 3.7 Flash cost exactly ($0.10 input / $0.40 output)', () => {
    // 100,000 prompt tokens = $0.01
    // 10,000 candidate tokens = $0.004
    // Total = $0.014
    const result = calculateCost('gemini-3.7-flash', 100_000, 10_000, 35.50);
    expect(result.model).toBe('gemini-3.7-flash');
    expect(result.tokens.promptTokens).toBe(100_000);
    expect(result.tokens.candidateTokens).toBe(10_000);
    expect(result.tokens.totalTokens).toBe(110_000);
    expect(result.costUSD.promptCost).toBe(0.0100);
    expect(result.costUSD.candidateCost).toBe(0.0040);
    expect(result.costUSD.totalCost).toBe(0.0140);
    expect(result.costTRY.totalCost).toBeCloseTo(0.0140 * 35.50, 4);
  });

  it('should calculate Gemini 1.5 Flash cost exactly according to spec formula (<= 128k tokens)', () => {
    // Spec Formula: (prompt_tokens * 0.075 / 10^6) + (candidate_tokens * 0.300 / 10^6)
    // For 100,000 prompt tokens and 10,000 candidate tokens:
    // Prompt cost = (100,000 * 0.075 / 10^6) = $0.0075
    // Candidate cost = (10,000 * 0.300 / 10^6) = $0.0030
    // Total = $0.0105
    const result = calculateCost('gemini-1.5-flash', 100_000, 10_000, 35.50);
    
    expect(result.model).toBe('gemini-1.5-flash');
    expect(result.tokens.promptTokens).toBe(100_000);
    expect(result.tokens.candidateTokens).toBe(10_000);
    expect(result.tokens.totalTokens).toBe(110_000);
    expect(result.costUSD.promptCost).toBe(0.0075);
    expect(result.costUSD.candidateCost).toBe(0.0030);
    expect(result.costUSD.totalCost).toBe(0.0105);
    expect(result.costTRY.totalCost).toBeCloseTo(0.0105 * 35.50, 4);
  });

  it('should calculate Gemini 1.5 Pro cost correctly (<= 128k tokens)', () => {
    // For Gemini 1.5 Pro (<=128k): $3.50 input / 1M, $10.50 output / 1M
    // 100,000 prompt tokens = (100,000 * 3.5 / 10^6) = $0.35
    // 10,000 candidate tokens = (10,000 * 10.5 / 10^6) = $0.105
    // Total = $0.455
    const result = calculateCost('gemini-1.5-pro', 100_000, 10_000, 35.00);
    
    expect(result.costUSD.promptCost).toBe(0.35);
    expect(result.costUSD.candidateCost).toBe(0.105);
    expect(result.costUSD.totalCost).toBe(0.455);
    expect(result.costTRY.totalCost).toBeCloseTo(0.455 * 35.00, 4);
  });

  it('should handle zero token edge case safely', () => {
    const result = calculateCost('gemini-3.7-flash', 0, 0);
    expect(result.tokens.promptTokens).toBe(0);
    expect(result.tokens.candidateTokens).toBe(0);
    expect(result.tokens.totalTokens).toBe(0);
    expect(result.costUSD.totalCost).toBe(0);
    expect(result.costTRY.totalCost).toBe(0);
  });

  it('should handle micro token counts (e.g. single short prompt)', () => {
    // 50 prompt tokens, 10 candidate tokens
    const result = calculateCost('gemini-3.7-flash', 50, 10);
    expect(result.costUSD.totalCost).toBeGreaterThan(0);
    expect(result.costUSD.totalCost).toBeLessThan(0.001);
  });

  it('should handle negative or invalid token inputs safely', () => {
    const result = calculateCost('gemini-3.7-flash', -100, 'invalid');
    expect(result.tokens.promptTokens).toBe(0);
    expect(result.tokens.candidateTokens).toBe(0);
    expect(result.costUSD.totalCost).toBe(0);
  });
});
