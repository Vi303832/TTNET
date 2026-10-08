import { describe, it, expect } from 'vitest';
import { StorageService } from '../src/lib/storage';

describe('Quota & Budget Management Tests (Faz 2 Core Logic)', () => {
  it('should allow requests within balance limit and enforce quota when exceeded', async () => {
    const testUser = await StorageService.createUser({
      email: `test_quota_${Date.now()}@example.com`,
      name: 'Quota Test User',
      balance_limit: 1.00 // $1.00 quota limit
    });

    expect(testUser.balance_limit).toBe(1.00);
    expect(testUser.total_spent_usd).toBe(0.00);

    // Initial check: Should be allowed
    let quotaCheck = await StorageService.checkUserQuota(testUser.id);
    expect(quotaCheck.allowed).toBe(true);
    expect(quotaCheck.remainingBudget).toBe(1.00);

    // Record usage: $0.40 spent
    await StorageService.recordUsage(testUser.id, {
      model: 'gemini-1.5-flash',
      promptTokens: 1000,
      candidateTokens: 1000,
      costUSD: { totalCost: 0.40 }
    });

    quotaCheck = await StorageService.checkUserQuota(testUser.id);
    expect(quotaCheck.allowed).toBe(true);
    expect(quotaCheck.totalSpent).toBe(0.40);
    expect(quotaCheck.remainingBudget).toBeCloseTo(0.60, 2);

    // Record usage that exceeds quota: $0.70 spent (Total: $1.10 > $1.00)
    await StorageService.recordUsage(testUser.id, {
      model: 'gemini-1.5-flash',
      promptTokens: 1000,
      candidateTokens: 1000,
      costUSD: { totalCost: 0.70 }
    });

    quotaCheck = await StorageService.checkUserQuota(testUser.id);
    expect(quotaCheck.allowed).toBe(false); // Quota exceeded!
    expect(quotaCheck.totalSpent).toBeCloseTo(1.10, 2);
    expect(quotaCheck.remainingBudget).toBe(0);
  });
});
