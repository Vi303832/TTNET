import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const globalForStorage = globalThis;
if (!globalForStorage.__ttnet_store) {
  globalForStorage.__ttnet_store = {
    users: new Map(), // email -> User, and id -> User
    sessions: new Map(), // userId -> Array of Sessions
    messages: new Map(), // `${userId}:${sessionId}` -> Array of Messages
    usageLogs: [] // Array of UsageLog entries
  };

  // Seed default dev user
  const defaultDevUser = {
    id: 'dev-user-123',
    email: 'gelistirici@gemini.local',
    name: 'Demo Geliştirici',
    password_hash: null,
    balance_limit: 10.00, // $10 quota
    total_spent_usd: 0.00,
    created_at: new Date().toISOString()
  };
  globalForStorage.__ttnet_store.users.set(defaultDevUser.id, defaultDevUser);
  globalForStorage.__ttnet_store.users.set(defaultDevUser.email, defaultDevUser);
}

const memoryStore = globalForStorage.__ttnet_store;

let firestoreDb = null;
let isInitialized = false;

function initFirebaseAdmin() {
  if (isInitialized) return firestoreDb;
  isInitialized = true;

  try {
    if (admin.apps.length > 0) {
      firestoreDb = admin.firestore();
      return firestoreDb;
    }

    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    const resolvedPath = serviceAccountPath ? path.resolve(process.cwd(), serviceAccountPath) : null;

    if (resolvedPath && fs.existsSync(resolvedPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id
      });
      firestoreDb = admin.firestore();
    } else if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
      firestoreDb = admin.firestore();
    }
  } catch (err) {
    console.warn('Firebase Admin initialization warning:', err.message);
  }

  return firestoreDb;
}

export class StorageService {
  static getDb() {
    return initFirebaseAdmin();
  }

  static isUsingFirestore() {
    return Boolean(this.getDb());
  }

  // --- USER MANAGEMENT & QUOTA ---

  static async createUser({ email, password_hash, name, balance_limit = 5.00 }) {
    const cleanEmail = email.toLowerCase().trim();
    const existing = await this.findUserByEmail(cleanEmail);
    if (existing) {
      throw new Error('Bu e-posta adresi ile kayıtlı bir kullanıcı zaten mevcut.');
    }

    const user = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: cleanEmail,
      name: name || cleanEmail.split('@')[0],
      password_hash: password_hash || null,
      balance_limit: Number(balance_limit) || 5.00,
      total_spent_usd: 0.00,
      created_at: new Date().toISOString()
    };

    const db = this.getDb();
    if (db) {
      try {
        await db.collection('users').doc(user.id).set(user);
        await db.collection('user_emails').doc(cleanEmail).set({ userId: user.id });
      } catch (err) {
        console.error('Firestore createUser error:', err.message);
      }
    }

    memoryStore.users.set(user.id, user);
    memoryStore.users.set(cleanEmail, user);
    return user;
  }

  static async findUserByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.toLowerCase().trim();

    const db = this.getDb();
    if (db) {
      try {
        const emailDoc = await db.collection('user_emails').doc(cleanEmail).get();
        if (emailDoc.exists) {
          const userId = emailDoc.data().userId;
          const userDoc = await db.collection('users').doc(userId).get();
          if (userDoc.exists) return userDoc.data();
        }
      } catch (err) {
        console.error('Firestore findUserByEmail error:', err.message);
      }
    }

    return memoryStore.users.get(cleanEmail) || null;
  }

  static async findUserById(userId) {
    if (!userId) return null;

    const db = this.getDb();
    if (db) {
      try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) return userDoc.data();
      } catch (err) {
        console.error('Firestore findUserById error:', err.message);
      }
    }

    return memoryStore.users.get(userId) || null;
  }

  static async checkUserQuota(userId) {
    const user = await this.findUserById(userId);
    const balanceLimit = user ? (Number(user.balance_limit) || 5.00) : 5.00;
    const totalSpent = user ? (Number(user.total_spent_usd) || 0.00) : 0.00;
    const remainingBudget = Math.max(0, balanceLimit - totalSpent);
    const allowed = totalSpent < balanceLimit;

    return {
      allowed,
      balanceLimit,
      totalSpent,
      remainingBudget,
      user
    };
  }

  // --- MESSAGES & CONVERSATIONS ---

  static async saveMessage(userId, sessionId, message) {
    const safeUserId = userId || 'dev-user-123';
    const messageDoc = {
      id: message.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      conversation_id: sessionId,
      role: message.role || 'user',
      content: message.content || '',
      model_name: message.model || null,
      tokens: message.tokens || { promptTokens: 0, candidateTokens: 0, totalTokens: 0 },
      cost: message.cost || { totalCostUSD: 0, totalCostTRY: 0 },
      costUSD: message.costUSD || null,
      costTRY: message.costTRY || null,
      latencyMs: message.latencyMs || 0,
      createdAt: message.createdAt || new Date().toISOString()
    };

    const sessionTitle = message.sessionTitle || (message.role === 'user' ? message.content.slice(0, 35) + '...' : 'Sohbet');

    const db = this.getDb();
    if (db) {
      try {
        const sessionRef = db.collection('users').doc(safeUserId).collection('sessions').doc(sessionId);
        await sessionRef.set({
          id: sessionId,
          user_id: safeUserId,
          title: sessionTitle,
          model_name: message.model || 'gemini-3.7-flash',
          updated_at: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        }, { merge: true });

        await sessionRef.collection('messages').doc(messageDoc.id).set(messageDoc);
        return messageDoc;
      } catch (err) {
        console.error('Firestore saveMessage error:', err.message);
      }
    }

    const sessionKey = `${safeUserId}:${sessionId}`;
    if (!memoryStore.messages.has(sessionKey)) {
      memoryStore.messages.set(sessionKey, []);
    }
    memoryStore.messages.get(sessionKey).push(messageDoc);

    const userSessions = memoryStore.sessions.get(safeUserId) || [];
    const existingIndex = userSessions.findIndex(s => s.id === sessionId);

    const sessionMeta = {
      id: sessionId,
      user_id: safeUserId,
      title: sessionTitle,
      model_name: message.model || 'gemini-3.7-flash',
      lastUpdated: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messageCount: memoryStore.messages.get(sessionKey).length
    };

    if (existingIndex >= 0) {
      userSessions[existingIndex] = { ...userSessions[existingIndex], ...sessionMeta };
    } else {
      userSessions.unshift({ ...sessionMeta, created_at: new Date().toISOString() });
    }
    memoryStore.sessions.set(safeUserId, userSessions);

    return messageDoc;
  }

  // --- TOKEN TRANSACTIONS / USAGE LOGS ---

  static async recordUsage(userId, usageData) {
    const safeUserId = userId || 'dev-user-123';
    const costUSD = usageData.costUSD?.totalCost || usageData.total_cost_usd || 0;
    const promptCostUSD = usageData.costUSD?.promptCost || usageData.prompt_cost || 0;
    const candidateCostUSD = usageData.costUSD?.candidateCost || usageData.candidate_cost || 0;
    const costTRY = usageData.costTRY?.totalCost || usageData.total_cost_try || 0;

    const record = {
      id: `usage_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      message_id: usageData.messageId || usageData.message_id || null,
      session_id: usageData.sessionId || 'default',
      user_id: safeUserId,
      userId: safeUserId,
      model: usageData.model || 'gemini-3.7-flash',
      prompt_tokens: usageData.tokens?.promptTokens ?? usageData.promptTokens ?? 0,
      candidate_tokens: usageData.tokens?.candidateTokens ?? usageData.candidateTokens ?? 0,
      total_tokens: usageData.tokens?.totalTokens ?? usageData.totalTokens ?? 0,
      prompt_cost: promptCostUSD,
      candidate_cost: candidateCostUSD,
      total_cost_usd: costUSD,
      total_cost_try: costTRY,
      costUSD: costUSD,
      costTRY: costTRY,
      promptTokens: usageData.tokens?.promptTokens ?? usageData.promptTokens ?? 0,
      candidateTokens: usageData.tokens?.candidateTokens ?? usageData.candidateTokens ?? 0,
      totalTokens: usageData.tokens?.totalTokens ?? usageData.totalTokens ?? 0,
      latencyMs: usageData.latencyMs || 0,
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
      dateKey: new Date().toISOString().split('T')[0]
    };

    // Update User Total Spent
    const user = await this.findUserById(safeUserId);
    if (user) {
      user.total_spent_usd = Number(((user.total_spent_usd || 0) + costUSD).toFixed(8));
    }

    const db = this.getDb();
    if (db) {
      try {
        await db.collection('users').doc(safeUserId).collection('usage').doc(record.id).set(record);
        if (user) {
          await db.collection('users').doc(safeUserId).update({
            total_spent_usd: user.total_spent_usd
          });
        }
        return record;
      } catch (err) {
        console.error('Firestore recordUsage error:', err.message);
      }
    }

    memoryStore.usageLogs.push(record);
    return record;
  }

  static async getSessionMessages(userId, sessionId) {
    const safeUserId = userId || 'dev-user-123';
    const db = this.getDb();

    if (db) {
      try {
        const snapshot = await db.collection('users').doc(safeUserId).collection('sessions').doc(sessionId).collection('messages').orderBy('createdAt', 'asc').get();
        return snapshot.docs.map(doc => doc.data());
      } catch (err) {
        console.error('Firestore getSessionMessages error:', err.message);
      }
    }

    const sessionKey = `${safeUserId}:${sessionId}`;
    return memoryStore.messages.get(sessionKey) || [];
  }

  static async getUserSessions(userId) {
    const safeUserId = userId || 'dev-user-123';
    const db = this.getDb();

    if (db) {
      try {
        const snapshot = await db.collection('users').doc(safeUserId).collection('sessions').orderBy('lastUpdated', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.error('Firestore getUserSessions error:', err.message);
      }
    }

    return memoryStore.sessions.get(safeUserId) || [];
  }

  static async deleteSession(userId, sessionId) {
    const safeUserId = userId || 'dev-user-123';
    const db = this.getDb();

    if (db) {
      try {
        const sessionRef = db.collection('users').doc(safeUserId).collection('sessions').doc(sessionId);
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

    const sessionKey = `${safeUserId}:${sessionId}`;
    memoryStore.messages.delete(sessionKey);

    const userSessions = memoryStore.sessions.get(safeUserId) || [];
    memoryStore.sessions.set(safeUserId, userSessions.filter(s => s.id !== sessionId));
    return true;
  }

  static async getUserStats(userId) {
    const safeUserId = userId || 'dev-user-123';
    let logs = [];
    const db = this.getDb();

    if (db) {
      try {
        const snapshot = await db.collection('users').doc(safeUserId).collection('usage').get();
        logs = snapshot.docs.map(doc => doc.data());
      } catch (err) {
        console.error('Firestore getUserStats error:', err.message);
      }
    } else {
      logs = memoryStore.usageLogs.filter(log => log.user_id === safeUserId || log.userId === safeUserId || safeUserId === 'all');
    }

    let totalPromptTokens = 0;
    let totalCandidateTokens = 0;
    let totalCostUSD = 0;
    let totalCostTRY = 0;
    let totalRequests = logs.length;

    const modelStats = {};
    const dailyStats = {};

    logs.forEach(log => {
      const pTokens = log.prompt_tokens ?? log.promptTokens ?? 0;
      const cTokens = log.candidate_tokens ?? log.candidateTokens ?? 0;
      const cUSD = log.total_cost_usd ?? log.costUSD ?? 0;
      const cTRY = log.total_cost_try ?? log.costTRY ?? 0;

      totalPromptTokens += pTokens;
      totalCandidateTokens += cTokens;
      totalCostUSD += cUSD;
      totalCostTRY += cTRY;

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
      modelStats[model].promptTokens += pTokens;
      modelStats[model].candidateTokens += cTokens;
      modelStats[model].totalTokens += (pTokens + cTokens);
      modelStats[model].costUSD += cUSD;
      modelStats[model].costTRY += cTRY;

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
      dailyStats[dateKey].tokens += (pTokens + cTokens);
      dailyStats[dateKey].costUSD += cUSD;
      dailyStats[dateKey].costTRY += cTRY;
    });

    const userQuota = await this.checkUserQuota(safeUserId);

    return {
      user: {
        id: safeUserId,
        balanceLimit: userQuota.balanceLimit,
        totalSpentUSD: userQuota.totalSpent,
        remainingBudgetUSD: userQuota.remainingBudget,
        isQuotaExceeded: !userQuota.allowed
      },
      summary: {
        totalRequests,
        totalTokens: totalPromptTokens + totalCandidateTokens,
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
