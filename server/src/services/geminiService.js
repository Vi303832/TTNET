const { GoogleGenerativeAI } = require('@google/generative-ai');
const { calculateCost, normalizeModelName } = require('../utils/pricing');

let genAI = null;

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY ortam değişkeni ayarlanmamış. Lütfen server/.env dosyasına geçerli bir Google Gemini API anahtarı ekleyin.');
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Formats chat history array for Gemini SDK
 * Input history format: [{ role: 'user' | 'assistant' | 'model', content: '...' }]
 * Gemini format: [{ role: 'user' | 'model', parts: [{ text: '...' }] }]
 */
function formatHistory(history = []) {
  return history
    .filter(msg => msg && msg.content && (msg.role === 'user' || msg.role === 'assistant' || msg.role === 'model'))
    .map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));
}

/**
 * Counts tokens for given contents using Gemini API
 */
async function countTokens(modelName, contents, systemInstruction) {
  try {
    const ai = getGenAI();
    const normalized = normalizeModelName(modelName);
    const model = ai.getGenerativeModel({
      model: normalized,
      systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
    });

    const result = await model.countTokens({ contents });
    return result.totalTokens || 0;
  } catch (error) {
    console.warn('Token sayma uyarısı, yaklaşık hesaplama yapılıyor:', error.message);
    // Fallback heuristic: roughly 1 token per 3.5 characters
    const totalChars = JSON.stringify(contents).length;
    return Math.max(1, Math.ceil(totalChars / 3.5));
  }
}

/**
 * Initiates a streaming conversation with Gemini
 * 
 * @param {object} params
 * @param {string} params.prompt - Current user message
 * @param {string} [params.model] - Model name (e.g. gemini-1.5-flash)
 * @param {string} [params.systemInstruction] - System prompt / instruction
 * @param {Array} [params.history] - Previous messages [{ role, content }]
 * @param {object} [params.generationConfig] - Temperature, topP, etc.
 * @param {number} [params.exchangeRate] - USD/TRY exchange rate
 * @param {function} params.onChunk - Callback for each incoming text delta
 * @returns {Promise<object>} Complete response metadata with token counts and costs
 */
async function streamChat({
  prompt,
  model = 'gemini-1.5-flash',
  systemInstruction,
  history = [],
  generationConfig = {},
  exchangeRate,
  onChunk
}) {
  const startTime = Date.now();
  const normalizedModel = normalizeModelName(model);
  const ai = getGenAI();

  const formattedHistory = formatHistory(history);
  const currentMessagePart = { role: 'user', parts: [{ text: prompt }] };
  const allContents = [...formattedHistory, currentMessagePart];

  // 1. Calculate prompt / input tokens
  const promptTokens = await countTokens(normalizedModel, allContents, systemInstruction);

  // 2. Initialize generative model
  const generativeModel = ai.getGenerativeModel({
    model: normalizedModel,
    systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
    generationConfig: {
      temperature: generationConfig.temperature ?? 0.7,
      topP: generationConfig.topP ?? 0.95,
      topK: generationConfig.topK ?? 40,
      maxOutputTokens: generationConfig.maxOutputTokens ?? 4096
    }
  });

  // 3. Start chat session
  const chat = generativeModel.startChat({
    history: formattedHistory
  });

  // 4. Send message and stream chunks
  const result = await chat.sendMessageStream(prompt);
  let accumulatedText = '';

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    accumulatedText += chunkText;
    if (typeof onChunk === 'function') {
      onChunk(chunkText);
    }
  }

  const latencyMs = Date.now() - startTime;

  // 5. Calculate output / candidate tokens
  let candidateTokens = 0;
  try {
    const outputCountResult = await generativeModel.countTokens({
      contents: [{ role: 'model', parts: [{ text: accumulatedText }] }]
    });
    candidateTokens = outputCountResult.totalTokens || Math.ceil(accumulatedText.length / 3.5);
  } catch {
    candidateTokens = Math.max(1, Math.ceil(accumulatedText.length / 3.5));
  }

  // 6. Calculate accurate cost
  const costBreakdown = calculateCost(normalizedModel, promptTokens, candidateTokens, exchangeRate);

  return {
    content: accumulatedText,
    model: normalizedModel,
    tokens: {
      promptTokens,
      candidateTokens,
      totalTokens: promptTokens + candidateTokens
    },
    costUSD: costBreakdown.costUSD,
    costTRY: costBreakdown.costTRY,
    pricingRateUSD: costBreakdown.pricingRateUSD,
    latencyMs
  };
}

/**
 * Standard non-streaming chat completion
 */
async function generateChat({
  prompt,
  model = 'gemini-1.5-flash',
  systemInstruction,
  history = [],
  generationConfig = {},
  exchangeRate
}) {
  let fullText = '';
  return await streamChat({
    prompt,
    model,
    systemInstruction,
    history,
    generationConfig,
    exchangeRate,
    onChunk: (chunk) => {
      fullText += chunk;
    }
  });
}

module.exports = {
  streamChat,
  generateChat,
  countTokens
};
