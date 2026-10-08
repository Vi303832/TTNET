const API_BASE_URL = '/api';

function sanitizeHeader(val) {
  if (val === null || val === undefined) return '';
  return encodeURIComponent(String(val));
}

function getHeaders(token, user) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    const cleanToken = String(token).replace(/[^\x20-\x7E]/g, '');
    headers['Authorization'] = `Bearer ${cleanToken}`;
  }

  if (user) {
    if (user.uid || user.id) headers['x-user-id'] = sanitizeHeader(user.uid || user.id);
    if (user.displayName || user.name) headers['x-user-name'] = sanitizeHeader(user.displayName || user.name);
    if (user.email) headers['x-user-email'] = sanitizeHeader(user.email);
  }

  return headers;
}

// --- AUTH SERVICES ---

export async function apiRegister({ email, password, name, balance_limit }) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, balance_limit })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Kayıt başarısız');
  return data;
}

export async function apiLogin({ email, password }) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Giriş başarısız');
  return data;
}

export async function apiFetchMe(token) {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user;
}

// --- STREAM & CHAT SERVICES ---

export async function streamChatMessage({
  prompt,
  model = 'gemini-3.7-flash',
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
      buffer = lines.pop();

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
            console.warn('SSE parse warning:', e);
          }
        }
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      return;
    }
    console.error('Akış hatası:', err);
    if (onError) onError(err);
  }
}

export async function fetchModels() {
  const res = await fetch(`${API_BASE_URL}/models`);
  if (!res.ok) throw new Error('Modeller getirilemedi');
  const data = await res.json();
  return data.models || [];
}

export async function fetchCostStats(token, user) {
  const res = await fetch(`${API_BASE_URL}/cost/stats`, {
    headers: getHeaders(token, user)
  });
  if (!res.ok) throw new Error('Maliyet istatistikleri getirilemedi');
  const data = await res.json();
  return data.stats;
}

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

export async function fetchSessions(token, user) {
  const res = await fetch(`${API_BASE_URL}/chat/sessions`, {
    headers: getHeaders(token, user)
  });
  if (!res.ok) throw new Error('Oturumlar getirilemedi');
  const data = await res.json();
  return data.sessions || [];
}

export async function fetchSessionMessages(sessionId, token, user) {
  const res = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}/messages`, {
    headers: getHeaders(token, user)
  });
  if (!res.ok) throw new Error('Mesajlar getirilemedi');
  const data = await res.json();
  return data.messages || [];
}

export async function deleteSession(sessionId, token, user) {
  const res = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: getHeaders(token, user)
  });
  if (!res.ok) throw new Error('Oturum silinemedi');
  return await res.json();
}

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}
