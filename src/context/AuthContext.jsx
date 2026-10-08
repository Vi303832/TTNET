'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  auth, 
  googleProvider, 
  isFirebaseConfigured, 
  signInWithPopup, 
  signInAnonymously, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from '../config/firebase';
import { apiRegister, apiLogin, apiFetchMe } from '../services/api';

const AuthContext = createContext(null);

const AUTH_TOKEN_KEY = 'ttnet_jwt_token';
const DEV_USER_STORAGE_KEY = 'ttnet_gemini_dev_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const restoreDevUser = () => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(DEV_USER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        setToken(localStorage.getItem(AUTH_TOKEN_KEY) || 'mock-dev-token');
      } else {
        const defaultDev = {
          uid: 'dev-user-123',
          id: 'dev-user-123',
          email: 'gelistirici@gemini.local',
          displayName: 'Demo Geliştirici',
          balanceLimit: 10.00,
          totalSpentUSD: 0.00,
          remainingBudgetUSD: 10.00,
          isDevUser: true
        };
        setUser(defaultDev);
        setToken('mock-dev-token');
        localStorage.setItem(DEV_USER_STORAGE_KEY, JSON.stringify(defaultDev));
      }
    } catch {
      setUser({
        uid: 'dev-user-123',
        id: 'dev-user-123',
        email: 'gelistirici@gemini.local',
        displayName: 'Demo Geliştirici',
        balanceLimit: 10.00,
        totalSpentUSD: 0.00,
        remainingBudgetUSD: 10.00,
        isDevUser: true
      });
      setToken('mock-dev-token');
    }
  };

  const refreshUserData = useCallback(async () => {
    const currentToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (currentToken && currentToken !== 'mock-dev-token') {
      try {
        const me = await apiFetchMe(currentToken);
        if (me) {
          setUser(prev => ({
            ...prev,
            ...me,
            uid: me.uid || me.id,
            displayName: me.displayName || me.name
          }));
        }
      } catch (e) {
        console.warn('refreshUserData error:', e);
      }
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
      
      if (savedToken && savedToken !== 'mock-dev-token') {
        try {
          const me = await apiFetchMe(savedToken);
          if (me) {
            setUser({
              ...me,
              uid: me.uid || me.id,
              displayName: me.displayName || me.name,
              isDevUser: false
            });
            setToken(savedToken);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Token validation failed:', e);
          localStorage.removeItem(AUTH_TOKEN_KEY);
        }
      }

      if (auth && isFirebaseConfigured) {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            try {
              const idToken = await firebaseUser.getIdToken();
              setUser({
                uid: firebaseUser.uid,
                id: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Kullanıcı',
                photoURL: firebaseUser.photoURL,
                balanceLimit: 5.00,
                totalSpentUSD: 0.00,
                remainingBudgetUSD: 5.00,
                isAnonymous: firebaseUser.isAnonymous,
                isDevUser: false
              });
              setToken(idToken);
              localStorage.setItem(AUTH_TOKEN_KEY, idToken);
            } catch (err) {
              console.error('Firebase token error:', err);
              restoreDevUser();
            }
          } else {
            restoreDevUser();
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } else {
        restoreDevUser();
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const registerWithEmail = async ({ email, password, name }) => {
    setError(null);
    try {
      const res = await apiRegister({ email, password, name });
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem(AUTH_TOKEN_KEY, res.token);
      localStorage.removeItem(DEV_USER_STORAGE_KEY);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const loginWithEmail = async ({ email, password }) => {
    setError(null);
    try {
      const res = await apiLogin({ email, password });
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem(AUTH_TOKEN_KEY, res.token);
      localStorage.removeItem(DEV_USER_STORAGE_KEY);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    if (!auth || !googleProvider) {
      setError('Firebase kimlik doğrulama yapılandırılmamış. Lütfen e-posta/şifre veya yerel geliştirici modu ile devam edin.');
      return;
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      setUser({
        uid: result.user.uid,
        id: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        balanceLimit: 5.00,
        totalSpentUSD: 0.00,
        remainingBudgetUSD: 5.00,
        isAnonymous: false,
        isDevUser: false
      });
      setToken(idToken);
      localStorage.setItem(AUTH_TOKEN_KEY, idToken);
      localStorage.removeItem(DEV_USER_STORAGE_KEY);
    } catch (err) {
      console.error('Google Giriş Hatası:', err);
      setError(err.message);
      throw err;
    }
  };

  const loginGuest = async () => {
    setError(null);
    const guestUser = {
      uid: `guest_${Date.now()}`,
      id: `guest_${Date.now()}`,
      displayName: 'Misafir Kullanıcı',
      email: 'guest@local',
      balanceLimit: 2.00,
      totalSpentUSD: 0.00,
      remainingBudgetUSD: 2.00,
      isAnonymous: true,
      isDevUser: true
    };
    setUser(guestUser);
    setToken('mock-dev-token');
    localStorage.setItem(DEV_USER_STORAGE_KEY, JSON.stringify(guestUser));
    localStorage.removeItem(AUTH_TOKEN_KEY);
  };

  const loginAsCustomUser = (name, email) => {
    const customUser = {
      uid: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      displayName: name || 'Özel Kullanıcı',
      email: email || 'user@local',
      photoURL: null,
      balanceLimit: 5.00,
      totalSpentUSD: 0.00,
      remainingBudgetUSD: 5.00,
      isAnonymous: false,
      isDevUser: true
    };
    setUser(customUser);
    setToken('mock-dev-token');
    localStorage.setItem(DEV_USER_STORAGE_KEY, JSON.stringify(customUser));
    localStorage.removeItem(AUTH_TOKEN_KEY);
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
    localStorage.removeItem(AUTH_TOKEN_KEY);
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
      registerWithEmail,
      loginWithEmail,
      loginWithGoogle,
      loginGuest,
      loginAsCustomUser,
      refreshUserData,
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
