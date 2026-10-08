import { getGenAI, formatHistory, countTokens } from '@/lib/gemini';
import { calculateCost, normalizeModelName, mapToLiveModel, DEFAULT_MODEL_ID, DEFAULT_USD_TRY_RATE } from '@/lib/pricing';
import { StorageService } from '@/lib/storage';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const CASCADE_FALLBACK_MODELS = [
  'gemini-3.7-flash',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-flash-lite-latest',
  'gemini-3.8-flash'
];

export async function POST(request) {
  const encoder = new TextEncoder();
  const startTime = Date.now();

  try {
    const authUser = getAuthenticatedUser(request);
    const userId = authUser.userId;

    // --- FAZ 2: Bütçe ve Kota Kontrolü (Pre-check Middleware) ---
    const quotaCheck = await StorageService.checkUserQuota(userId);
    if (!quotaCheck.allowed) {
      return new Response(JSON.stringify({
        error: `Bütçe limiti aşıldı! Tanımlı bakiye kotanız ($${quotaCheck.balanceLimit.toFixed(2)}) dolmuştur. Toplam harcamanız: $${quotaCheck.totalSpent.toFixed(4)}. Lütfen kotanızı yükseltiniz.`,
        code: 'QUOTA_EXCEEDED',
        balanceLimit: quotaCheck.balanceLimit,
        totalSpent: quotaCheck.totalSpent
      }), {
        status: 402,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    const body = await request.json();
    const {
      prompt,
      model = DEFAULT_MODEL_ID,
      systemInstruction,
      history = [],
      sessionId = `sess_${Date.now()}`,
      generationConfig = {},
      exchangeRate = DEFAULT_USD_TRY_RATE
    } = body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return new Response(JSON.stringify({ error: 'Prompt metni zorunludur.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const cleanPrompt = prompt.trim();
    const normalizedModel = normalizeModelName(model);
    let requestedLiveModel = mapToLiveModel(normalizedModel);
    const ai = getGenAI();

    const formattedHistory = formatHistory(history);
    const currentMessagePart = { role: 'user', parts: [{ text: cleanPrompt }] };
    const allContents = [...formattedHistory, currentMessagePart];

    // Save User Message
    await StorageService.saveMessage(userId, sessionId, {
      role: 'user',
      content: cleanPrompt,
      sessionTitle: cleanPrompt.slice(0, 35) + '...'
    });

    const createModelInstance = (targetModel) => {
      return ai.getGenerativeModel({
        model: targetModel,
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        generationConfig: {
          temperature: generationConfig.temperature ?? 0.7,
          topP: generationConfig.topP ?? 0.95,
          topK: generationConfig.topK ?? 40,
          maxOutputTokens: generationConfig.maxOutputTokens ?? 4096
        }
      });
    };

    // Model Çağrısı ve Akıllı Fallback Cascade
    const candidateModels = [
      requestedLiveModel,
      ...CASCADE_FALLBACK_MODELS.filter(m => m !== requestedLiveModel)
    ];

    let generativeModel = null;
    let chat = null;
    let result = null;
    let activeModel = requestedLiveModel;
    let lastError = null;

    for (const m of candidateModels) {
      try {
        generativeModel = createModelInstance(m);
        chat = generativeModel.startChat({ history: formattedHistory });
        result = await chat.sendMessageStream(cleanPrompt);
        activeModel = m;
        break;
      } catch (err) {
        lastError = err;
        console.warn(`Model ${m} çağrısı hatası (${err.message}), sıradaki modele geçiliyor...`);
      }
    }

    if (!result) {
      throw lastError || new Error('Uygun yapay zeka modeline bağlanılamadı.');
    }

    // Count Input (Prompt) Tokens for the active model
    const promptTokens = await countTokens(activeModel, allContents, systemInstruction);

    let isStreamAborted = false;
    let accumulatedText = '';

    // Handle Client Stream Disconnect / Abort (Faz 4)
    request.signal.addEventListener('abort', async () => {
      isStreamAborted = true;
      if (accumulatedText) {
        const latencyMs = Date.now() - startTime;
        const candidateTokens = Math.max(1, Math.ceil(accumulatedText.length / 3.5));
        const costBreakdown = calculateCost(activeModel, promptTokens, candidateTokens, exchangeRate);
        
        try {
          const abortedMsg = await StorageService.saveMessage(userId, sessionId, {
            role: 'model',
            content: accumulatedText + '\n\n*(Bağlantı kesildi)*',
            model: activeModel,
            tokens: { promptTokens, candidateTokens, totalTokens: promptTokens + candidateTokens },
            costUSD: costBreakdown.costUSD,
            costTRY: costBreakdown.costTRY,
            latencyMs
          });

          await StorageService.recordUsage(userId, {
            messageId: abortedMsg.id,
            sessionId,
            model: activeModel,
            tokens: { promptTokens, candidateTokens, totalTokens: promptTokens + candidateTokens },
            costUSD: costBreakdown.costUSD,
            costTRY: costBreakdown.costTRY,
            latencyMs
          });
        } catch (e) {
          console.error('Abort recording error:', e);
        }
      }
    });

    const stream = new ReadableStream({
      async start(controller) {
        let usageMetadataExtracted = null;

        try {
          for await (const chunk of result.stream) {
            if (isStreamAborted) break;

            const chunkText = chunk.text();
            accumulatedText += chunkText;

            if (chunk.usageMetadata) {
              usageMetadataExtracted = chunk.usageMetadata;
            }

            const payload = `event: chunk\ndata: ${JSON.stringify({ type: 'chunk', text: chunkText })}\n\n`;
            controller.enqueue(encoder.encode(payload));
          }

          if (isStreamAborted) {
            controller.close();
            return;
          }

          // Try getting usageMetadata from the final response object if available
          try {
            const responseObj = await result.response;
            if (responseObj && responseObj.usageMetadata) {
              usageMetadataExtracted = responseObj.usageMetadata;
            }
          } catch {
            // response resolution fallback
          }

          const latencyMs = Date.now() - startTime;

          // Determine final candidate tokens
          let candidateTokens = 0;
          let officialPromptTokens = promptTokens;

          if (usageMetadataExtracted) {
            if (usageMetadataExtracted.promptTokenCount) officialPromptTokens = usageMetadataExtracted.promptTokenCount;
            if (usageMetadataExtracted.candidatesTokenCount) candidateTokens = usageMetadataExtracted.candidatesTokenCount;
          }

          if (!candidateTokens) {
            try {
              const outputCountResult = await generativeModel.countTokens({
                contents: [{ role: 'model', parts: [{ text: accumulatedText }] }]
              });
              candidateTokens = outputCountResult.totalTokens || Math.ceil(accumulatedText.length / 3.5);
            } catch {
              candidateTokens = Math.max(1, Math.ceil(accumulatedText.length / 3.5));
            }
          }

          // Deterministic Cost Calculation (Faz 2)
          const costBreakdown = calculateCost(activeModel, officialPromptTokens, candidateTokens, exchangeRate);

          // Save Assistant Message
          const assistantMsg = await StorageService.saveMessage(userId, sessionId, {
            role: 'model',
            content: accumulatedText,
            model: activeModel,
            tokens: {
              promptTokens: officialPromptTokens,
              candidateTokens,
              totalTokens: officialPromptTokens + candidateTokens
            },
            cost: {
              totalCostUSD: costBreakdown.costUSD.totalCost,
              totalCostTRY: costBreakdown.costTRY.totalCost
            },
            costUSD: costBreakdown.costUSD,
            costTRY: costBreakdown.costTRY,
            latencyMs
          });

          // Record Usage Log & Update User Quota
          await StorageService.recordUsage(userId, {
            messageId: assistantMsg.id,
            sessionId,
            model: activeModel,
            tokens: {
              promptTokens: officialPromptTokens,
              candidateTokens,
              totalTokens: officialPromptTokens + candidateTokens
            },
            costUSD: costBreakdown.costUSD,
            costTRY: costBreakdown.costTRY,
            latencyMs
          });

          // Fetch updated quota stats
          const updatedQuota = await StorageService.checkUserQuota(userId);

          const donePayload = `event: done\ndata: ${JSON.stringify({
            type: 'done',
            messageId: assistantMsg.id,
            content: accumulatedText,
            model: activeModel,
            tokens: {
              promptTokens: officialPromptTokens,
              candidateTokens,
              totalTokens: officialPromptTokens + candidateTokens
            },
            costUSD: costBreakdown.costUSD,
            costTRY: costBreakdown.costTRY,
            pricingRateUSD: costBreakdown.pricingRateUSD,
            latencyMs,
            quota: {
              balanceLimit: updatedQuota.balanceLimit,
              totalSpentUSD: updatedQuota.totalSpent,
              remainingBudgetUSD: updatedQuota.remainingBudget
            }
          })}\n\n`;

          controller.enqueue(encoder.encode(donePayload));
          controller.close();
        } catch (streamErr) {
          console.error('SSE stream error:', streamErr);
          const errorPayload = `event: error\ndata: ${JSON.stringify({ type: 'error', error: streamErr.message })}\n\n`;
          controller.enqueue(encoder.encode(errorPayload));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
      }
    });
  } catch (err) {
    console.error('Stream route error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Akış başlatılamadı' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
