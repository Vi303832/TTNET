export const MODEL_PRICING = {
  'gemini-3.7-flash': {
    name: 'Gemini 3.7 Flash',
    badge: 'Flagship Flash',
    description: 'Yüksek işlem hızı, hibrit akıl yürütme ve gelişmiş kodlama yeteneğine sahip güncel amiral gemisi model.',
    maxInputTokens: 1048576,
    maxOutputTokens: 65536,
    pricingTiers: [
      {
        maxThreshold: Infinity,
        inputPerMillion: 0.10,
        outputPerMillion: 0.40
      }
    ],
    recommendedFor: ['Hızlı Akıl Yürütme', 'Kod Üretimi', 'Veri Analizi', 'Genel Sohbet']
  },
  'gemini-3.8-flash': {
    name: 'Gemini 3.8 Flash',
    badge: 'Yeni Nesil',
    description: 'En gelişmiş Flash model; uzun soluklu yazılım mimarisi, otonom ajanlar ve kurumsal iş akışları için optimize edilmiştir.',
    maxInputTokens: 1048576,
    maxOutputTokens: 65536,
    pricingTiers: [
      {
        maxThreshold: Infinity,
        inputPerMillion: 0.10,
        outputPerMillion: 0.40
      }
    ],
    recommendedFor: ['Yazılım Mühendisliği', 'Otonom Ajanlar', 'Kurumsal İş Akışları']
  },
  'gemini-3.5-flash': {
    name: 'Gemini 3.5 Flash',
    badge: 'Dengeli & Hızlı',
    description: 'Düşük gecikme süreli, multimodal destekli, yüksek verimli ve dengeli genel amaçlı model.',
    maxInputTokens: 1048576,
    maxOutputTokens: 65536,
    pricingTiers: [
      {
        maxThreshold: Infinity,
        inputPerMillion: 0.08,
        outputPerMillion: 0.30
      }
    ],
    recommendedFor: ['Hızlı Sohbet', 'Metin Özetleme', 'İçerik Üretimi']
  },
  'gemini-flash-lite-latest': {
    name: 'Gemini Flash Lite',
    badge: 'Mikro Maliyet',
    description: 'Ultra düşük maliyet ve yüksek hacimli operasyonlar için tasarlanmış hafif ve seri model.',
    maxInputTokens: 1048576,
    maxOutputTokens: 65536,
    pricingTiers: [
      {
        maxThreshold: Infinity,
        inputPerMillion: 0.05,
        outputPerMillion: 0.20
      }
    ],
    recommendedFor: ['Düşük Maliyet', 'Yüksek Hacimli Görevler', 'Mikro Sorgular']
  },
  // Geriye dönük uyumluluk ve arşiv kayıtları için
  'gemini-1.5-flash': {
    name: 'Gemini 1.5 Flash (Arşiv)',
    badge: 'Legacy',
    description: 'Eski nesil 1.5 Flash tarifesi (canlı sistemde otomatik 3.7 Flash olarak işlenir).',
    maxInputTokens: 1048576,
    maxOutputTokens: 8192,
    pricingTiers: [
      {
        maxThreshold: 128000,
        inputPerMillion: 0.075,
        outputPerMillion: 0.300
      },
      {
        maxThreshold: Infinity,
        inputPerMillion: 0.150,
        outputPerMillion: 0.600
      }
    ],
    recommendedFor: ['Eski Kayıtlar']
  },
  'gemini-1.5-pro': {
    name: 'Gemini 1.5 Pro (Arşiv)',
    badge: 'Legacy',
    description: 'Eski nesil 1.5 Pro tarifesi.',
    maxInputTokens: 2097152,
    maxOutputTokens: 8192,
    pricingTiers: [
      {
        maxThreshold: 128000,
        inputPerMillion: 3.500,
        outputPerMillion: 10.500
      },
      {
        maxThreshold: Infinity,
        inputPerMillion: 7.000,
        outputPerMillion: 21.000
      }
    ],
    recommendedFor: ['Eski Kayıtlar']
  }
};

export const DEFAULT_USD_TRY_RATE = 35.50;
export const DEFAULT_MODEL_ID = 'gemini-3.7-flash';

export function normalizeModelName(modelName = '') {
  const clean = String(modelName).replace('models/', '').toLowerCase().trim();
  if (!clean) return DEFAULT_MODEL_ID;

  if (clean.includes('3.8-flash') || clean === '3.8' || clean === 'gemini-3.8') return 'gemini-3.8-flash';
  if (clean.includes('3.7-flash') || clean === '3.7' || clean === 'gemini-3.7') return 'gemini-3.7-flash';
  if (clean.includes('3.5-flash-lite') || clean.includes('3.1-flash-lite') || clean.includes('flash-lite') || clean.includes('lite')) return 'gemini-flash-lite-latest';
  if (clean.includes('3.5-flash') || clean === '3.5' || clean === 'gemini-3.5') return 'gemini-3.5-flash';
  if (clean.includes('3.6-flash') || clean === '3.6') return 'gemini-3.7-flash';

  // Explicit legacy keys
  if (clean === 'gemini-1.5-flash' || clean === '1.5-flash') return 'gemini-1.5-flash';
  if (clean === 'gemini-1.5-pro' || clean === '1.5-pro') return 'gemini-1.5-pro';

  if (clean.includes('flash')) return 'gemini-3.7-flash';
  if (clean.includes('pro')) return 'gemini-3.8-flash';

  return DEFAULT_MODEL_ID;
}

/**
 * Canlı API çağrısı yaparken eski/kullanımdan kalkan modelleri güncel modellere yönlendirir.
 */
export function mapToLiveModel(modelName = '') {
  const normalized = normalizeModelName(modelName);
  if (
    normalized === 'gemini-1.5-flash' || 
    normalized === 'gemini-1.5-pro' || 
    normalized.includes('2.0') || 
    normalized.includes('2.5')
  ) {
    return DEFAULT_MODEL_ID;
  }
  return normalized;
}

export function calculateCost(modelName, promptTokens = 0, candidateTokens = 0, exchangeRate = DEFAULT_USD_TRY_RATE) {
  const normalizedKey = normalizeModelName(modelName);
  const modelConfig = MODEL_PRICING[normalizedKey] || MODEL_PRICING[DEFAULT_MODEL_ID];
  
  const safePromptTokens = Math.max(0, Number(promptTokens) || 0);
  const safeCandidateTokens = Math.max(0, Number(candidateTokens) || 0);
  const totalTokens = safePromptTokens + safeCandidateTokens;

  const tier = modelConfig.pricingTiers.find(t => safePromptTokens <= t.maxThreshold) || modelConfig.pricingTiers[0];

  // Spec Formula: (prompt_tokens * prompt_rate / 10^6) + (candidate_tokens * candidate_rate / 10^6)
  const promptCostUSD = (safePromptTokens * tier.inputPerMillion) / 1_000_000;
  const candidateCostUSD = (safeCandidateTokens * tier.outputPerMillion) / 1_000_000;
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
      formatted: totalCostUSD < 0.00001 && totalCostUSD > 0 ? `<$0.00001` : `$${totalCostUSD.toFixed(6)}`
    },
    costTRY: {
      promptCostTRY: Number((promptCostUSD * exchangeRate).toFixed(6)),
      candidateCostTRY: Number((candidateCostUSD * exchangeRate).toFixed(6)),
      totalCost: Number(totalCostTRY.toFixed(6)),
      exchangeRate,
      formatted: `₺${totalCostTRY.toFixed(4)}`
    }
  };
}

export function getModelsCatalog() {
  // Sadece aktif ve modern modelleri kataloga sun
  const activeKeys = ['gemini-3.7-flash', 'gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-flash-lite-latest'];
  return activeKeys.map(key => {
    const info = MODEL_PRICING[key];
    return {
      id: key,
      name: info.name,
      badge: info.badge,
      description: info.description,
      maxInputTokens: info.maxInputTokens,
      maxOutputTokens: info.maxOutputTokens,
      recommendedFor: info.recommendedFor,
      pricing: info.pricingTiers.map(tier => ({
        threshold: tier.maxThreshold === Infinity ? 'Tüm Boyutlar' : `<= ${(tier.maxThreshold / 1000).toLocaleString()}k tokens`,
        inputPer1M: `$${tier.inputPerMillion.toFixed(3)}`,
        outputPer1M: `$${tier.outputPerMillion.toFixed(3)}`
      }))
    };
  });
}
