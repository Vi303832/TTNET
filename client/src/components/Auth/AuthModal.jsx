import React, { useState } from 'react';
import { 
  X, 
  User, 
  Sparkles, 
  KeyRound, 
  ShieldCheck, 
  LogIn, 
  UserCircle2,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { 
    user, 
    isFirebaseConfigured, 
    loginWithGoogle, 
    loginGuest, 
    loginAsCustomUser, 
    logout 
  } = useAuth();

  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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

  const handleCustomProfile = (e) => {
    e.preventDefault();
    if (!customName.trim()) {
      setError('Lütfen bir isim girin.');
      return;
    }
    loginAsCustomUser(customName.trim(), customEmail.trim() || `${customName.toLowerCase().replace(/\s+/g, '')}@test.local`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-700/80 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 mx-auto flex items-center justify-center text-white mb-3 shadow-lg shadow-cyan-500/25 glow-cyan">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">
            Kullanıcı Oturumu & Profil
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Token harcamalarınızı ve geçmişinizi kişiselleştirin
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Current Active User Status */}
        {user && (
          <div className="mb-6 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-cyan-900/60 border border-cyan-700 flex items-center justify-center text-cyan-300 font-bold text-xs uppercase">
                {user.displayName?.charAt(0) || 'U'}
              </div>
              <div>
                <div className="text-xs font-semibold text-white">{user.displayName}</div>
                <div className="text-[10px] text-slate-400">{user.email || 'Misafir Hesap'}</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-xs text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded-lg hover:bg-rose-950/30 transition-colors"
            >
              Çıkış Yap
            </button>
          </div>
        )}

        <div className="space-y-3 text-xs">
          {/* Google Sign In (if Firebase configured) */}
          {isFirebaseConfigured && (
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold shadow-md transition-all active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Google ile Giriş Yap</span>
            </button>
          )}

          {/* Guest Login */}
          <button
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl glass-card hover:bg-slate-800 text-slate-200 font-medium border border-slate-700 transition-all active:scale-95"
          >
            <UserCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Misafir Olarak Devam Et</span>
          </button>

          {/* Custom Dev Profile Divider */}
          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <span className="relative px-2 bg-[#0d1321] text-[10px] text-slate-500 uppercase tracking-wider">
              Veya Özel Geliştirici Profili
            </span>
          </div>

          {/* Quick Custom Dev Profile Form */}
          <form onSubmit={handleCustomProfile} className="space-y-2.5">
            <div>
              <input
                type="text"
                placeholder="Görünen İsim (Örn: Mehmet Yılmaz)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500 text-xs"
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="E-posta (Opsiyonel)"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500 text-xs"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-medium text-xs shadow-md transition-all active:scale-95"
            >
              Bu Profille Geçiş Yap
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
