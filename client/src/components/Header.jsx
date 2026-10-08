import React from 'react';
import { 
  Bot, 
  Sparkles, 
  Coins, 
  Layers, 
  Menu, 
  SlidersHorizontal, 
  User, 
  Activity,
  Circle,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({
  activeTab,
  setActiveTab,
  selectedModel,
  onOpenPricing,
  onOpenSettings,
  onOpenAuth,
  onToggleSidebar,
  currentChatCostUSD = 0,
  currentChatCostTRY = 0,
  backendStatus = 'online'
}) {
  const { user } = useAuth();

  return (
    <header className="h-16 px-4 md:px-6 glass-panel border-b border-slate-800/80 flex items-center justify-between gap-3 shrink-0 z-30">
      {/* Left: Mobile Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 glow-cyan">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-300 bg-clip-text text-transparent leading-none">
              Gemini AI Chat
            </h1>
            <span className="text-[10px] text-cyan-400/80 font-mono">
              Micro-Cost & Token Tracker
            </span>
          </div>
        </div>
      </div>

      {/* Center: Main View Tabs */}
      <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'chat'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Sohbet</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'analytics'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Maliyet Paneli</span>
        </button>
      </div>

      {/* Right: Model Tag, Cost Chip, Profile & Settings */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Active Model Pill */}
        <button
          onClick={onOpenPricing}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-xl glass-card hover:border-cyan-500/50 text-xs text-slate-300 font-mono transition-all group"
          title="Model Değiştir veya Fiyatlandırmayı İncele"
        >
          <Bot className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="text-cyan-300 font-semibold">{selectedModel}</span>
        </button>

        {/* Current Conversation Cost Pill */}
        {currentChatCostUSD > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-950/40 border border-amber-800/40 text-[11px] font-mono text-amber-300">
            <Coins className="w-3 h-3 text-amber-400" />
            <span>${currentChatCostUSD.toFixed(5)}</span>
            <span className="text-slate-500">(₺{currentChatCostTRY.toFixed(3)})</span>
          </div>
        )}

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
          title="Parametreler ve Sistem Talimatı"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* Profile / Auth Button */}
        <button
          onClick={onOpenAuth}
          className="flex items-center gap-2 p-1.5 md:px-3 md:py-1.5 rounded-xl glass-card hover:border-slate-700 text-xs transition-colors"
          title="Profil ve Oturum"
        >
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold uppercase">
            {user?.displayName?.charAt(0) || 'U'}
          </div>
          <span className="hidden md:inline text-slate-200 font-medium max-w-[90px] truncate">
            {user?.displayName || 'Giriş Yap'}
          </span>
        </button>
      </div>
    </header>
  );
}
