import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Search, 
  Sparkles, 
  Coins, 
  X, 
  Cpu, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export default function Sidebar({
  isOpen,
  onClose,
  sessions = [],
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  selectedModel,
  onSelectModel,
  onOpenPricing
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter(s => 
    (s.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-72 md:w-80 glass-panel border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Top Header & New Chat Button */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between md:hidden pb-1">
            <span className="text-xs font-bold text-slate-300">Sohbet Geçmişi</span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/20 glow-cyan transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Sohbet Başlat</span>
          </button>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Sohbetlerde ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/80"
            />
          </div>
        </div>

        {/* Sessions Scroll List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Geçmiş Sohbetler ({filteredSessions.length})
          </div>

          {filteredSessions.length === 0 ? (
            <div className="text-xs text-slate-500 text-center py-6 px-4">
              {searchQuery ? 'Eşleşen sohbet bulunamadı.' : 'Henüz kayıtlı sohbetiniz yok.'}
            </div>
          ) : (
            filteredSessions.map((sess) => {
              const isActive = sess.id === activeSessionId;
              return (
                <div
                  key={sess.id}
                  className={`group flex items-center justify-between gap-2 p-2.5 rounded-xl cursor-pointer transition-all ${
                    isActive
                      ? 'bg-cyan-950/60 border border-cyan-500/50 text-white shadow-md'
                      : 'hover:bg-slate-800/50 text-slate-300 border border-transparent'
                  }`}
                  onClick={() => {
                    onSelectSession(sess.id);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="text-xs truncate font-medium">
                      {sess.title || 'Yeni Sohbet'}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(sess.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-all"
                    title="Sohbeti Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Section: Model Switcher & Pricing Trigger */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 space-y-3">
          {/* Quick Model Selector Pills */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-1">
              <span>Model Tercihi</span>
              <button
                onClick={onOpenPricing}
                className="text-cyan-400 hover:text-cyan-300 text-[10px] flex items-center gap-0.5"
              >
                Fiyatlar <ChevronRight className="w-2.5 h-2.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
              <button
                onClick={() => onSelectModel('gemini-1.5-flash')}
                className={`p-2 rounded-xl border text-left transition-all ${
                  selectedModel === 'gemini-1.5-flash'
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-[11px] leading-tight">1.5 Flash</div>
                <div className="text-[9px] text-slate-500 font-sans">$0.075/1M</div>
              </button>

              <button
                onClick={() => onSelectModel('gemini-1.5-pro')}
                className={`p-2 rounded-xl border text-left transition-all ${
                  selectedModel === 'gemini-1.5-pro'
                    ? 'bg-purple-950/80 border-purple-500 text-purple-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-[11px] leading-tight">1.5 Pro</div>
                <div className="text-[9px] text-slate-500 font-sans">$1.25/1M</div>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
