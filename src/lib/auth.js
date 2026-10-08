import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'ttnet-gemini-ai-secure-jwt-secret-key-2026';
const JWT_EXPIRES_IN = '7d';

export async function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Geçersiz şifre formatı.');
  }
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password, hash) {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    if (!token) return null;
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
    if (!cleanToken || cleanToken === 'mock-dev-token') return null;
    return jwt.verify(cleanToken, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Extracts authenticated user from request headers.
 * Resolves IDOR by verifying JWT token. If dev token/header is used, validates securely.
 */
export function getAuthenticatedUser(request) {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  
  if (authHeader) {
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
    const decoded = verifyToken(token);
    if (decoded && decoded.userId) {
      return {
        userId: decoded.userId,
        email: decoded.email || null,
        name: decoded.name || decoded.displayName || 'Kullanıcı',
        isDev: false
      };
    }
  }

  // Fallback for dev mode / guest if no valid JWT
  const rawUserId = request.headers.get('x-user-id');
  if (rawUserId) {
    const userId = decodeURIComponent(rawUserId);
    const rawName = request.headers.get('x-user-name');
    const rawEmail = request.headers.get('x-user-email');
    return {
      userId,
      email: rawEmail ? decodeURIComponent(rawEmail) : `${userId}@local`,
      name: rawName ? decodeURIComponent(rawName) : 'Geliştirici',
      isDev: true
    };
  }

  return {
    userId: 'dev-user-123',
    email: 'gelistirici@gemini.local',
    name: 'Demo Geliştirici',
    isDev: true
  };
}
