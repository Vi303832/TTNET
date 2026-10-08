import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateCost, normalizeModelName, mapToLiveModel, DEFAULT_MODEL_ID } from './pricing';

let genAIInstance = null;

export function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY bulunamadı. Lütfen .env.local dosyanıza geçerli bir Google Gemini API anahtarı ekleyin.');
  }
  if (!genAIInstance) {
    genAIInstance = new GoogleGenerativeAI(apiKey);
  }
  return genAIInstance;
}

export function formatHistory(history = []) {
  return history
    .filter(msg => msg && msg.content && (msg.role === 'user' || msg.role === 'assistant' || msg.role === 'model'))
    .map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));
}

export async function countTokens(modelName, contents, systemInstruction) {
  try {
    const ai = getGenAI();
    const targetModel = mapToLiveModel(modelName);
    const model = ai.getGenerativeModel({
      model: targetModel,
      systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
    });

    const result = await model.countTokens({ contents });
    return result.totalTokens || 0;
  } catch (error) {
    console.warn('Token sayımı fallback:', error.message);
    const totalChars = typeof contents === 'string' ? contents.length : JSON.stringify(contents).length;
    return Math.max(1, Math.ceil(totalChars / 3.5));
  }
}
