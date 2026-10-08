'use client';

import React, { useState } from 'react';
import { X, User, Lock, Mail, ShieldAlert, CheckCircle2, UserCircle2, Coins, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { 
    user, 
    isFirebaseConfigured, 
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle, 
    loginGuest, 
    logout 
  } = useAuth();

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authMode === 'register') {
        if (!name.trim()) throw new Error('Lütfen adınızı ve soyadınızı giriniz.');
        if (!email.trim() || !email.includes('@')) throw new Error('Geçerli bir e-posta adresi giriniz.');
        if (password.length < 6) throw new Error('Şifre en az 6 karakter olmalıdır.');

        await registerWithEmail({ email: email.trim(), password, name: name.trim() });
      } else {
        if (!email.trim() || !password) throw new Error('E-posta ve şifre zorunludur.');
        await loginWithEmail({ email: email.trim(), password });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Kimlik doğrulama işlemi başarısız.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await loginWithGoogle();
      onClose();
    } catch (err) {
      setError(err.message || 'Google girişi başarısız.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await loginGuest();
      onClose();
    } catch (err) {
      setError(err.message || 'Misafir girişi başarısız.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xs font-mono">
      <div className="bg-paper border-2 border-ink hardshadow w-full max-w-md p-6 relative text-ink max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-ink mb-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-signal text-paper flex items-center justify-center font-bold text-xs border border-ink">
              TT²
            </span>
            <h2 className="text-base font-black font-grotesk uppercase tracking-wider text-ink">
              {user && !user.isDevUser ? 'Kullanıcı Hesabı & Kota' : (authMode === 'login' ? 'Giriş Yap' : 'Kayıt Ol')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 border-2 border-ink bg-paper text-ink hover:bg-ink hover:text-paper transition-colors"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-signal text-paper border-2 border-ink text-xs font-bold flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Logged in User Profile Card */}
        {user && (
          <div className="mb-5 p-4 bg-smoke border-2 border-ink space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-signal text-paper flex items-center justify-center font-black border-2 border-ink text-sm">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="text-xs font-black uppercase text-ink font-grotesk truncate max-w-[200px]">
                    {user.displayName || user.name}
                  </div>
                  <div className="text-[10px] text-ink/70 truncate font-mono">
                    {user.email || 'Hesap: Geliştirici / Misafir'}
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                className="px-2.5 py-1 bg-paper border border-ink hover:bg-signal hover:text-paper text-xs font-bold uppercase transition-colors"
              >
                Çıkış
              </button>
            </div>

            {/* Quota Stats Box */}
            <div className="p-2.5 bg-paper border-2 border-ink text-xs space-y-1.5 font-bold">
              <div className="flex justify-between items-center text-[10px] uppercase text-ink/70">
                <span className="flex items-center gap-1">
                  <Coins className="w-3 h-3 text-signal" /> Tanımlı Bütçe Kotası:
                </span>
                <span className="text-ink font-mono font-extrabold">${(user.balanceLimit || 5.00).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] uppercase text-ink/70">
                <span>Toplam Harcanan:</span>
                <span className="text-signal font-mono font-extrabold">${(user.totalSpentUSD || 0).toFixed(4)}</span>
              </div>
              <div className="w-full h-2 bg-smoke border border-ink overflow-hidden">
                <div 
                  className="h-full bg-signal transition-all"
                  style={{ 
                    width: `${Math.min(100, ((user.totalSpentUSD || 0) / (user.balanceLimit || 5.00)) * 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Auth Mode Toggle Tabs */}
        <div className="flex border-2 border-ink mb-4">
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-black uppercase tracking-wider transition-colors ${
              authMode === 'login' ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-smoke'
            }`}
          >
            Giriş Yap
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('register'); setError(''); }}
            className={`flex-1 py-2 text-xs font-black uppercase tracking-wider transition-colors ${
              authMode === 'register' ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-smoke'
            }`}
          >
            Yeni Kayıt
          </button>
        </div>

        {/* Registration / Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {authMode === 'register' && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/70 mb-1">
                Ad Soyad:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-ink/50 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Kaan Çelik"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-paper border-2 border-ink pl-8 pr-3 py-2 text-ink outline-none font-mono font-medium focus:bg-smoke"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/70 mb-1">
              E-Posta Adresi:
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-ink/50 absolute left-2.5 top-2.5" />
              <input
                type="email"
                placeholder="kaan.celik@ttnet.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-paper border-2 border-ink pl-8 pr-3 py-2 text-ink outline-none font-mono font-medium focus:bg-smoke"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/70 mb-1">
              Şifre (Min 6 Karakter):
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink/50 absolute left-2.5 top-2.5" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-paper border-2 border-ink pl-8 pr-3 py-2 text-ink outline-none font-mono font-medium focus:bg-smoke"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-ink text-paper hover:bg-signal border-2 border-ink font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'İşleniyor...' : (authMode === 'login' ? 'Giriş Yap' : 'Kayıt Ol ve Giriş Yap')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-ink"></div>
          </div>
          <span className="relative px-2 bg-paper text-[10px] uppercase font-bold text-ink/70">
            veya alternatif
          </span>
        </div>

        {/* Secondary Auth Options */}
        <div className="space-y-2">
          {isFirebaseConfigured && (
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-paper hover:bg-smoke text-ink border-2 border-ink font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <span>Google ile Giriş</span>
            </button>
          )}

          <button
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-paper hover:bg-smoke text-ink border-2 border-ink font-bold text-xs uppercase tracking-wider transition-colors"
          >
            <UserCircle2 className="w-4 h-4 text-signal" />
            <span>Misafir Olarak Devam Et ($2.00 Kota)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
