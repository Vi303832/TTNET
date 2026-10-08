const { getDb, isMock, inMemoryStore } = require('../config/firebase');

/**
 * Firebase Firestore & In-Memory Database Service
 */
class FirebaseService {
  /**
   * Save a chat message to the session
   */
  async saveMessage(userId, sessionId, message) {
    const messageDoc = {
      id: message.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      role: message.role, // 'user' | 'model' | 'system'
      content: message.content,
      model: message.model || null,
      tokens: message.tokens || { promptTokens: 0, candidateTokens: 0, totalTokens: 0 },
      cost: message.cost || { totalCostUSD: 0, totalCostTRY: 0 },
      latencyMs: message.latencyMs || 0,
      createdAt: new Date().toISOString()
    };

    const db = getDb();

    if (db && !isMock()) {
      try {
        const sessionRef = db.collection('users').doc(userId).collection('sessions').doc(sessionId);
        
        // Ensure session metadata is updated
        await sessionRef.set({
          lastUpdated: new Date().toISOString(),
          title: message.sessionTitle || undefined
        }, { merge: true });

        // Add message to subcollection
        await sessionRef.collection('messages').doc(messageDoc.id).set(messageDoc);
        return messageDoc;
      } catch (err) {
        console.error('Firestore saveMessage error:', err.message);
      }
    }

    // Fallback: In-Memory Store
    const sessionKey = `${userId}:${sessionId}`;
    if (!inMemoryStore.messages.has(sessionKey)) {
      inMemoryStore.messages.set(sessionKey, []);
    }
    inMemoryStore.messages.get(sessionKey).push(messageDoc);

    // Update session metadata in memory
    const userSessions = inMemoryStore.sessions.get(userId) || [];
    const existingIndex = userSessions.findIndex(s => s.id === sessionId);
    const sessionMeta = {
      id: sessionId,
      title: message.sessionTitle || (existingIndex >= 0 ? userSessions[existingIndex].title : (message.role === 'user' ? message.content.slice(0, 35) + '...' : 'Yeni Sohbet')),
      lastUpdated: new Date().toISOString(),
      messageCount: inMemoryStore.messages.get(sessionKey).length
    };

    if (existingIndex >= 0) {
      userSessions[existingIndex] = { ...userSessions[existingIndex], ...sessionMeta };
    } else {
      userSessions.unshift(sessionMeta);
    }
    inMemoryStore.sessions.set(userId, userSessions);

    return messageDoc;
  }

  /**
   * Record a token and cost transaction
   */
  async recordUsage(userId, usageData) {
    const record = {
      id: `usage_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      sessionId: usageData.sessionId || 'default',
      model: usageData.model,
      promptTokens: usageData.tokens?.promptTokens || 0,
      candidateTokens: usageData.tokens?.candidateTokens || 0,
      totalTokens: usageData.tokens?.totalTokens || 0,
      costUSD: usageData.costUSD?.totalCost || 0,
      costTRY: usageData.costTRY?.totalCost || 0,
      latencyMs: usageData.latencyMs || 0,
      timestamp: new Date().toISOString(),
      dateKey: new Date().toISOString().split('T')[0] // YYYY-MM-DD
    };

    const db = getDb();

    if (db && !isMock()) {
      try {
        await db.collection('users').doc(userId).collection('usage').doc(record.id).set(record);
        return record;
      } catch (err) {
        console.error('Firestore recordUsage error:', err.message);
      }
    }

    // Fallback: In-Memory Store
    inMemoryStore.usageLogs.push(record);
    return record;
  }

  /**
   * Get messages for a given session
   */
  async getSessionMessages(userId, sessionId) {
    const db = getDb();

    if (db && !isMock()) {
      try {
        const snapshot = await db.collection('users').doc(userId).collection('sessions').doc(sessionId).collection('messages').orderBy('createdAt', 'asc').get();
        return snapshot.docs.map(doc => doc.data());
      } catch (err) {
        console.error('Firestore getSessionMessages error:', err.message);
      }
    }

    const sessionKey = `${userId}:${sessionId}`;
    return inMemoryStore.messages.get(sessionKey) || [];
  }

  /**
   * List user sessions
   */
  async getUserSessions(userId) {
    const db = getDb();

    if (db && !isMock()) {
      try {
        const snapshot = await db.collection('users').doc(userId).collection('sessions').orderBy('lastUpdated', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.error('Firestore getUserSessions error:', err.message);
      }
    }

    return inMemoryStore.sessions.get(userId) || [];
  }

  /**
   * Delete a session and all its messages
   */
  async deleteSession(userId, sessionId) {
    const db = getDb();

    if (db && !isMock()) {
      try {
        const sessionRef = db.collection('users').doc(userId).collection('sessions').doc(sessionId);
        const messages = await sessionRef.collection('messages').get();
        const batch = db.batch();
        messages.forEach(m => batch.delete(m.ref));
        batch.delete(sessionRef);
        await batch.commit();
        return true;
      } catch (err) {
        console.error('Firestore deleteSession error:', err.message);
      }
    }

    const sessionKey = `${userId}:${sessionId}`;
    inMemoryStore.messages.delete(sessionKey);

    const userSessions = inMemoryStore.sessions.get(userId) || [];
    inMemoryStore.sessions.set(userId, userSessions.filter(s => s.id !== sessionId));
    return true;
  }

  /**
   * Compute aggregated usage statistics (total tokens, total cost, breakdown by model, daily breakdown)
   */
  async getUserStats(userId) {
    let logs = [];
    const db = getDb();

    if (db && !isMock()) {
      try {
        const snapshot = await db.collection('users').doc(userId).collection('usage').get();
        logs = snapshot.docs.map(doc => doc.data());
      } catch (err) {
        console.error('Firestore getUserStats error:', err.message);
      }
    } else {
      logs = inMemoryStore.usageLogs.filter(log => log.userId === userId || userId === 'all' || userId === 'dev-user-123');
    }

    let totalPromptTokens = 0;
    let totalCandidateTokens = 0;
    let totalCostUSD = 0;
    let totalCostTRY = 0;
    let totalRequests = logs.length;

    const modelStats = {};
    const dailyStats = {};

    logs.forEach(log => {
      totalPromptTokens += log.promptTokens || 0;
      totalCandidateTokens += log.candidateTokens || 0;
      totalCostUSD += log.costUSD || 0;
      totalCostTRY += log.costTRY || 0;

      // Model breakdown
      const model = log.model || 'unknown';
      if (!modelStats[model]) {
        modelStats[model] = {
          count: 0,
          promptTokens: 0,
          candidateTokens: 0,
          totalTokens: 0,
          costUSD: 0,
          costTRY: 0
        };
      }
      modelStats[model].count += 1;
      modelStats[model].promptTokens += log.promptTokens || 0;
      modelStats[model].candidateTokens += log.candidateTokens || 0;
      modelStats[model].totalTokens += log.totalTokens || 0;
      modelStats[model].costUSD += log.costUSD || 0;
      modelStats[model].costTRY += log.costTRY || 0;

      // Daily breakdown
      const dateKey = log.dateKey || (log.timestamp ? log.timestamp.split('T')[0] : 'today');
      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = {
          date: dateKey,
          requests: 0,
          tokens: 0,
          costUSD: 0,
          costTRY: 0
        };
      }
      dailyStats[dateKey].requests += 1;
      dailyStats[dateKey].tokens += log.totalTokens || 0;
      dailyStats[dateKey].costUSD += log.costUSD || 0;
      dailyStats[dateKey].costTRY += log.costTRY || 0;
    });

    const totalTokens = totalPromptTokens + totalCandidateTokens;

    return {
      summary: {
        totalRequests,
        totalTokens,
        totalPromptTokens,
        totalCandidateTokens,
        totalCostUSD: Number(totalCostUSD.toFixed(6)),
        totalCostTRY: Number(totalCostTRY.toFixed(4)),
        avgCostPerRequestUSD: totalRequests > 0 ? Number((totalCostUSD / totalRequests).toFixed(6)) : 0,
        formattedUSD: `$${totalCostUSD.toFixed(5)}`,
        formattedTRY: `₺${totalCostTRY.toFixed(3)}`
      },
      byModel: modelStats,
      dailyTrend: Object.values(dailyStats).sort((a, b) => a.date.localeCompare(b.date))
    };
  }
}

module.exports = new FirebaseService();
