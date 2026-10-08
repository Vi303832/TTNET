'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Menu, 
  SlidersHorizontal, 
  Sparkles, 
  User,
  Coins,
  Cpu,
  ShieldCheck,
  Wallet
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Header({
  activeTab,
  setActiveTab,
  selectedModel,
  onOpenPricing,
  onOpenSettings,
  onOpenAuth,
  onToggleSidebar,
  currentChatCostUSD = 0,
  backendStatus = 'online'
}) {
  const { user } = useAuth();
  
  const modelDisplayName = selectedModel 
    ? selectedModel.replace('gemini-', '').replace('-latest', '').replace('-preview', '') 
    : '3.7-flash';

  const balanceLimit = user?.balanceLimit || 5.00;
  const totalSpent = user?.totalSpentUSD || 0.00;
  const remainingBudget = Math.max(0, balanceLimit - totalSpent);
  const isQuotaCritical = remainingBudget < 0.20;

  return (
    <header className="h-14 md:h-16 px-4 md:px-6 bg-paper border-b-2 border-ink flex items-center justify-between gap-3 shrink-0 z-30 font-mono">
      {/* Left: Mobile Toggle & Brand Lockup */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-1.5 border-2 border-ink bg-paper text-ink hover:bg-ink hover:text-paper transition-colors"
          aria-label="Menü"
        >
          <Menu className="w-4 h-4" />
        </button>

        <Link href="/" className="flex items-center gap-2 group" title="Landing Page'e Dön">
          <span className="w-7 h-7 inline-flex items-center justify-center bg-signal text-paper font-mono font-black text-xs border-2 border-ink transition-transform group-hover:-translate-y-0.5">
            TT²
          </span>
          <span className="font-mono font-extrabold tracking-tight text-sm md:text-base text-ink hidden sm:inline">
            TOKEN TRACK<span className="text-signal font-black">®</span>
          </span>
        </Link>
      </div>

      {/* Center: Main Navigation Tabs */}
      <div className="flex items-center p-1 bg-paper border-2 border-ink text-xs font-bold">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-3.5 py-1.5 transition-all ${
            activeTab === 'chat'
              ? 'bg-ink text-paper font-bold'
              : 'text-ink hover:bg-smoke'
          }`}
        >
          Sohbet
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3.5 py-1.5 transition-all flex items-center gap-1.5 ${
            activeTab === 'analytics'
              ? 'bg-signal text-paper font-bold'
              : 'text-ink hover:bg-smoke'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Maliyet & Token</span>
        </button>
      </div>

      {/* Right: Model Tag, Quota, Settings & Auth */}
      <div className="flex items-center gap-2">
        {/* User Quota & Balance Indicator */}
        <button
          onClick={onOpenAuth}
          className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 border-2 border-ink text-xs font-mono font-bold transition-all ${
            isQuotaCritical ? 'bg-signal text-paper animate-pulse' : 'bg-smoke text-ink hover:bg-ink hover:text-paper'
          }`}
          title="Kullanıcı Bakiye Kotası"
        >
          <Wallet className="w-3.5 h-3.5 text-signal" />
          <span>Kota: <strong>${remainingBudget.toFixed(2)}</strong> / ${balanceLimit.toFixed(0)}</span>
        </button>

        {/* Model Badge */}
        <button
          onClick={onOpenPricing}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 border-2 border-ink bg-paper hover:bg-ink hover:text-paper text-xs text-ink font-bold transition-all group"
          title="Model Tarifesi ve Seçimi"
        >
          <Cpu className="w-3.5 h-3.5 text-signal group-hover:rotate-45 transition-transform" />
          <span className="uppercase">{modelDisplayName}</span>
        </button>

        {/* Current Chat Cost */}
        {currentChatCostUSD > 0 && (
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 border-2 border-ink bg-smoke text-xs font-mono text-ink font-bold">
            <Coins className="w-3.5 h-3.5 text-signal" />
            ${currentChatCostUSD < 0.0001 ? '<$0.0001' : currentChatCostUSD.toFixed(5)}
          </span>
        )}

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 md:p-2 border-2 border-ink bg-paper hover:bg-ink hover:text-paper text-ink transition-colors"
          title="Ayarlar & Parametreler"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* User Profile Button */}
        <button
          onClick={onOpenAuth}
          className="flex items-center gap-2 p-1 pl-1.5 border-2 border-ink bg-paper hover:bg-ink hover:text-paper text-ink text-xs font-bold transition-colors"
          title="Kullanıcı Profili ve Kota"
        >
          <div className="w-6 h-6 bg-signal text-paper flex items-center justify-center text-[11px] font-black border border-ink">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
          </div>
          {user?.displayName && (
            <span className="hidden md:inline font-bold max-w-[90px] truncate text-xs">
              {user.displayName}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
