/**
 * Gemini Models Pricing and Token Cost Calculation Utilities
 * 
 * Pricing Rates (USD per 1 Million Tokens) as per Google AI Studio:
 * - Gemini 1.5 Flash:
 *   - <= 128k context: Input: $0.075 / 1M ($0.000000075/token), Output: $0.30 / 1M ($0.0000003/token)
 *   - > 128k context:  Input: $0.15 / 1M ($0.00000015/token), Output: $0.60 / 1M ($0.0000006/token)
 * - Gemini 1.5 Pro:
 *   - <= 128k context: Input: $1.25 / 1M ($0.00000125/token), Output: $5.00 / 1M ($0.000005/token)
 *   - > 128k context:  Input: $2.50 / 1M ($0.0000025/token), Output: $10.00 / 1M ($0.00001/token)
 * - Gemini 2.0 Flash:
 *   - Standard: Input: $0.10 / 1M ($0.0000001/token), Output: $0.40 / 1M ($0.0000004/token)
 * - Gemini 1.0 Pro:
 *   - Standard: Input: $0.50 / 1M ($0.0000005/token), Output: $1.50 / 1M ($0.0000015/token)
 */

const MODEL_PRICING = {
  'gemini-1.5-flash': {
    name: 'Gemini 1.5 Flash',
    description: 'Yüksek hızlı, maliyet odaklı ve çok modlu model (1M context)',
    maxInputTokens: 1048576,
    maxOutputTokens: 8192,
    pricingTiers: [
      {
        maxThreshold: 128000,
        inputPerMillion: 0.075,
        outputPerMillion: 0.30
      },
      {
        maxThreshold: Infinity,
        inputPerMillion: 0.15,
        outputPerMillion: 0.60
      }
    ],
    recommendedFor: ['Hızlı sohbet', 'Özetleme', 'Yüksek hacimli veri işleme']
  },
  'gemini-1.5-pro': {
    name: 'Gemini 1.5 Pro',
    description: 'Gelişmiş akıl yürütme, karmaşık kod analizi ve büyük bağlam (2M context)',
    maxInputTokens: 2097152,
    maxOutputTokens: 8192,
    pricingTiers: [
      {
        maxThreshold: 128000,
        inputPerMillion: 1.25,
        outputPerMillion: 5.00
      },
      {
        maxThreshold: Infinity,
        inputPerMillion: 2.50,
        outputPerMillion: 10.00
      }
    ],
    recommendedFor: ['Karmaşık kodlama', 'Detaylı analiz', 'Uzun metin işleme']
  },
  'gemini-2.0-flash': {
    name: 'Gemini 2.0 Flash',
    description: 'Yeni nesil ultra hızlı ve üstün multimodal yetenekler',
    maxInputTokens: 1048576,
    maxOutputTokens: 8192,
    pricingTiers: [
      {
        maxThreshold: Infinity,
        inputPerMillion: 0.10,
        outputPerMillion: 0.40
      }
    ],
    recommendedFor: ['Gerçek zamanlı etkileşim', 'Gelişmiş multimodal', 'Ajan görevleri']
  },
  'gemini-2.0-flash-exp': {
    name: 'Gemini 2.0 Flash (Experimental)',
    description: 'Deneysel yeni nesil Flash modeli',
    maxInputTokens: 1048576,
    maxOutputTokens: 8192,
    pricingTiers: [
      {
        maxThreshold: Infinity,
        inputPerMillion: 0.10,
        outputPerMillion: 0.40
      }
    ],
    recommendedFor: ['Deneysel özellikler', 'Test ve önizleme']
  }
};

// Default exchange rate USD to TRY (can be overridden via env or API)
const DEFAULT_USD_TRY_RATE = 35.50;

/**
 * Normalizes model names (e.g. "models/gemini-1.5-flash-latest" -> "gemini-1.5-flash")
 */
function normalizeModelName(modelName = '') {
  const clean = modelName.replace('models/', '').toLowerCase();
  if (clean.includes('1.5-pro')) return 'gemini-1.5-pro';
  if (clean.includes('2.0-flash-exp')) return 'gemini-2.0-flash-exp';
  if (clean.includes('2.0-flash')) return 'gemini-2.0-flash';
  if (clean.includes('1.5-flash')) return 'gemini-1.5-flash';
  return 'gemini-1.5-flash';
}

/**
 * Calculates prompt and candidate costs for given token counts and model.
 * 
 * @param {string} modelName - Model identifier
 * @param {number} promptTokens - Input token count
 * @param {number} candidateTokens - Output token count
 * @param {number} [exchangeRate] - Optional USD/TRY conversion rate
 * @returns {object} Cost breakdown object
 */
function calculateCost(modelName, promptTokens = 0, candidateTokens = 0, exchangeRate = DEFAULT_USD_TRY_RATE) {
  const normalizedKey = normalizeModelName(modelName);
  const modelConfig = MODEL_PRICING[normalizedKey] || MODEL_PRICING['gemini-1.5-flash'];
  
  const totalTokens = (Number(promptTokens) || 0) + (Number(candidateTokens) || 0);
  const safePromptTokens = Math.max(0, Number(promptTokens) || 0);
  const safeCandidateTokens = Math.max(0, Number(candidateTokens) || 0);

  // Find appropriate tier based on prompt tokens
  const tier = modelConfig.pricingTiers.find(t => safePromptTokens <= t.maxThreshold) || modelConfig.pricingTiers[0];

  const promptCostUSD = (safePromptTokens / 1_000_000) * tier.inputPerMillion;
  const candidateCostUSD = (safeCandidateTokens / 1_000_000) * tier.outputPerMillion;
  const totalCostUSD = promptCostUSD + candidateCostUSD;

  const totalCostTRY = totalCostUSD * exchangeRate;

  return {
    model: normalizedKey,
    modelDisplayName: modelConfig.name,
    tokens: {
      promptTokens: safePromptTokens,
      candidateTokens: safeCandidateTokens,
      totalTokens
    },
    pricingRateUSD: {
      inputPerMillion: tier.inputPerMillion,
      outputPerMillion: tier.outputPerMillion
    },
    costUSD: {
      promptCost: Number(promptCostUSD.toFixed(8)),
      candidateCost: Number(candidateCostUSD.toFixed(8)),
      totalCost: Number(totalCostUSD.toFixed(8)),
      formatted: `$${totalCostUSD.toFixed(6)}`
    },
    costTRY: {
      totalCost: Number(totalCostTRY.toFixed(6)),
      exchangeRate,
      formatted: `₺${totalCostTRY.toFixed(4)}`
    }
  };
}

/**
 * Returns full catalogue of available models with metadata & pricing
 */
function getModelsCatalog() {
  return Object.entries(MODEL_PRICING).map(([key, info]) => ({
    id: key,
    name: info.name,
    description: info.description,
    maxInputTokens: info.maxInputTokens,
    maxOutputTokens: info.maxOutputTokens,
    recommendedFor: info.recommendedFor,
    pricing: info.pricingTiers.map(tier => ({
      threshold: tier.maxThreshold === Infinity ? 'Tüm Boyutlar' : `<= ${tier.maxThreshold.toLocaleString()} tokens`,
      inputPer1M: `$${tier.inputPerMillion.toFixed(3)}`,
      outputPer1M: `$${tier.outputPerMillion.toFixed(2)}`
    }))
  }));
}

module.exports = {
  MODEL_PRICING,
  DEFAULT_USD_TRY_RATE,
  normalizeModelName,
  calculateCost,
  getModelsCatalog
};
