const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Creates standard HTTP headers with authentication
 */
function getHeaders(token, user) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (user) {
    if (user.uid) headers['x-user-id'] = user.uid;
    if (user.displayName) headers['x-user-name'] = encodeURIComponent(user.displayName);
    if (user.email) headers['x-user-email'] = user.email;
  }

  return headers;
}

/**
 * Real-time SSE Chat Streamer
 */
export async function streamChatMessage({
  prompt,
  model = 'gemini-1.5-flash',
  systemInstruction,
  history = [],
  sessionId,
  generationConfig,
  exchangeRate,
  token,
  user,
  signal,
  onChunk,
  onDone,
  onError
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: getHeaders(token, user),
      body: JSON.stringify({
        prompt,
        model,
        systemInstruction,
        history,
        sessionId,
        generationConfig,
        exchangeRate
      }),
      signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      let parsed;
      try { parsed = JSON.parse(errorText); } catch { parsed = { error: errorText }; }
      throw new Error(parsed.error || `HTTP ${response.status}: Akış başlatılamadı.`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep last partial line

      let currentEvent = 'message';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith('event: ')) {
          currentEvent = trimmed.slice(7).trim();
          continue;
        }

        if (trimmed.startsWith('data: ')) {
          const dataStr = trimmed.slice(6).trim();
          try {
            const data = JSON.parse(dataStr);
            if (currentEvent === 'chunk' || data.type === 'chunk') {
              if (onChunk) onChunk(data.text);
            } else if (currentEvent === 'done' || data.type === 'done') {
              if (onDone) onDone(data);
            } else if (currentEvent === 'error' || data.type === 'error') {
              if (onError) onError(new Error(data.error || 'Akış hatası'));
            }
          } catch (e) {
            console.warn('SSE ayrıştırma hatası:', e, dataStr);
          }
        }
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('Kullanıcı akışı durdurdu.');
      return;
    }
    console.error('Akış hatası:', err);
    if (onError) onError(err);
  }
}

/**
 * Fetch available models
 */
export async function fetchModels() {
  const res = await fetch(`${API_BASE_URL}/models`);
  if (!res.ok) throw new Error('Modeller getirilemedi');
  const data = await res.json();
  return data.models || [];
}

/**
 * Fetch usage stats for current user
 */
export async function fetchCostStats(token, user) {
  const res = await fetch(`${API_BASE_URL}/cost/stats`, {
    headers: getHeaders(token, user)
  });
  if (!res.ok) throw new Error('Maliyet istatistikleri getirilemedi');
  const data = await res.json();
  return data.stats;
}

/**
 * Estimate token cost
 */
export async function estimateTokenCost(params) {
  const res = await fetch(`${API_BASE_URL}/cost/estimate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('Maliyet tahmini yapılamadı');
  const data = await res.json();
  return data.calculation;
}

/**
 * Fetch user chat sessions
 */
export async function fetchSessions(token, user) {
  const res = await fetch(`${API_BASE_URL}/chat/sessions`, {
    headers: getHeaders(token, user)
  });
  if (!res.ok) throw new Error('Oturumlar getirilemedi');
  const data = await res.json();
  return data.sessions || [];
}

/**
 * Fetch messages for a session
 */
export async function fetchSessionMessages(sessionId, token, user) {
  const res = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}/messages`, {
    headers: getHeaders(token, user)
  });
  if (!res.ok) throw new Error('Mesajlar getirilemedi');
  const data = await res.json();
  return data.messages || [];
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId, token, user) {
  const res = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: getHeaders(token, user)
  });
  if (!res.ok) throw new Error('Oturum silinemedi');
  return await res.json();
}

/**
 * Health check
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}
