const { getAuth, isMock } = require('../config/firebase');

/**
 * Middleware to authenticate requests using Firebase ID tokens
 * Supports seamless development fallback.
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split('Bearer ')[1].trim();
    }

    const auth = getAuth();

    // 1. If Firebase Auth is active and a real token is provided
    if (auth && !isMock() && token && token !== 'mock-dev-token') {
      try {
        const decodedToken = await auth.verifyIdToken(token);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name || decodedToken.email?.split('@')[0] || 'Kullanıcı',
          picture: decodedToken.picture || null,
          isAnonymous: decodedToken.firebase?.sign_in_provider === 'anonymous'
        };
        return next();
      } catch (tokenError) {
        console.warn('Firebase ID Token doğrulanamadı:', tokenError.message);
        return res.status(401).json({
          success: false,
          error: 'Geçersiz veya süresi dolmuş oturum jetonu.',
          details: tokenError.message
        });
      }
    }

    // 2. Development Mode / Fallback Authentication
    const devUserId = req.headers['x-user-id'] || 'dev-user-123';
    const devEmail = req.headers['x-user-email'] || 'demo@ttnet-gemini.local';
    const devName = req.headers['x-user-name'] || 'Demo Geliştirici';

    req.user = {
      uid: devUserId,
      email: devEmail,
      name: devName,
      isAnonymous: false,
      isDevFallback: true
    };

    return next();
  } catch (error) {
    console.error('Kimlik doğrulama ara yazılımı hatası:', error);
    return res.status(500).json({
      success: false,
      error: 'Kimlik doğrulama sunucu hatası.'
    });
  }
}

/**
 * Optional Authentication: Attaches req.user if available, proceeds either way
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1].trim();
      const auth = getAuth();
      if (auth && !isMock() && token && token !== 'mock-dev-token') {
        const decodedToken = await auth.verifyIdToken(token);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name || 'Kullanıcı'
        };
      }
    }
    
    if (!req.user) {
      req.user = {
        uid: req.headers['x-user-id'] || 'anonymous-user',
        email: 'anon@local',
        name: 'Misafir Kullanıcı'
      };
    }
  } catch {
    req.user = {
      uid: 'anonymous-user',
      name: 'Misafir Kullanıcı'
    };
  }
  next();
}

module.exports = {
  requireAuth,
  optionalAuth
};
