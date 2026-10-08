import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  isFirebaseConfigured, 
  signInWithPopup, 
  signInAnonymously, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from '../config/firebase';

const AuthContext = createContext(null);

const DEV_USER_STORAGE_KEY = 'ttnet_gemini_dev_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. If Firebase is configured and auth is initialized, listen to auth changes
    if (auth && isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const idToken = await firebaseUser.getIdToken();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Kullanıcı',
              photoURL: firebaseUser.photoURL,
              isAnonymous: firebaseUser.isAnonymous,
              isDevUser: false
            });
            setToken(idToken);
          } catch (err) {
            console.error('Token alma hatası:', err);
          }
        } else {
          // Check for saved local dev user
          restoreDevUser();
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // 2. Firebase not configured, load default developer user
      restoreDevUser();
      setLoading(false);
    }
  }, []);

  const restoreDevUser = () => {
    try {
      const saved = localStorage.getItem(DEV_USER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        setToken('mock-dev-token');
      } else {
        const defaultDev = {
          uid: 'dev-user-123',
          email: 'geliştirici@gemini.local',
          displayName: 'Demo Geliştirici',
          photoURL: null,
          isAnonymous: false,
          isDevUser: true
        };
        setUser(defaultDev);
        setToken('mock-dev-token');
        localStorage.setItem(DEV_USER_STORAGE_KEY, JSON.stringify(defaultDev));
      }
    } catch {
      setUser({
        uid: 'dev-user-123',
        displayName: 'Demo Geliştirici',
        isDevUser: true
      });
      setToken('mock-dev-token');
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    if (!auth || !googleProvider) {
      setError('Firebase kimlik doğrulama yapılandırılmamış. Yerel geliştirici modu ile devam ediliyor.');
      return;
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      setUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        isAnonymous: false,
        isDevUser: false
      });
      setToken(idToken);
      localStorage.removeItem(DEV_USER_STORAGE_KEY);
    } catch (err) {
      console.error('Google Giriş Hatası:', err);
      setError(err.message);
      throw err;
    }
  };

  const loginGuest = async () => {
    setError(null);
    if (auth && isFirebaseConfigured) {
      try {
        const result = await signInAnonymously(auth);
        const idToken = await result.user.getIdToken();
        setUser({
          uid: result.user.uid,
          displayName: 'Misafir Kullanıcı',
          isAnonymous: true,
          isDevUser: false
        });
        setToken(idToken);
        localStorage.removeItem(DEV_USER_STORAGE_KEY);
        return;
      } catch (err) {
        console.warn('Misafir girişi hatası, yerel geliştirici moduna dönülüyor:', err.message);
      }
    }

    // Local guest fallback
    const guestUser = {
      uid: `guest_${Date.now()}`,
      displayName: 'Misafir Kullanıcı',
      email: 'guest@local',
      isAnonymous: true,
      isDevUser: true
    };
    setUser(guestUser);
    setToken('mock-dev-token');
    localStorage.setItem(DEV_USER_STORAGE_KEY, JSON.stringify(guestUser));
  };

  const loginAsCustomUser = (name, email) => {
    const customUser = {
      uid: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      displayName: name || 'Özel Kullanıcı',
      email: email || 'user@local',
      photoURL: null,
      isAnonymous: false,
      isDevUser: true
    };
    setUser(customUser);
    setToken('mock-dev-token');
    localStorage.setItem(DEV_USER_STORAGE_KEY, JSON.stringify(customUser));
  };

  const logout = async () => {
    setError(null);
    if (auth && isFirebaseConfigured) {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        console.error('Çıkış hatası:', err);
      }
    }
    localStorage.removeItem(DEV_USER_STORAGE_KEY);
    restoreDevUser();
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      error,
      isFirebaseConfigured,
      loginWithGoogle,
      loginGuest,
      loginAsCustomUser,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
