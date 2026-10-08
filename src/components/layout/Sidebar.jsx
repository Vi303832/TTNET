'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  X, 
  Sparkles, 
  Zap, 
  Cpu, 
  Feather 
} from 'lucide-react';

const AVAILABLE_MODELS = [
  {
    id: 'gemini-3.7-flash',
    shortName: '3.7 Flash',
    fullName: 'Gemini 3.7 Flash',
    tag: 'Flagship $0.10',
    icon: Zap
  },
  {
    id: 'gemini-3.8-flash',
    shortName: '3.8 Flash',
    fullName: 'Gemini 3.8 Flash',
    tag: 'Yeni Nesil $0.10',
    icon: Sparkles
  },
  {
    id: 'gemini-3.5-flash',
    shortName: '3.5 Flash',
    fullName: 'Gemini 3.5 Flash',
    tag: 'Dengeli $0.08',
    icon: Cpu
  },
  {
    id: 'gemini-flash-lite-latest',
    shortName: 'Flash Lite',
    fullName: 'Gemini Lite',
    tag: 'Mikro $0.05',
    icon: Feather
  }
];

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
          className="fixed inset-0 z-40 bg-ink/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 md:w-72 bg-paper border-r-2 border-ink flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 font-mono ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Top: New Chat & Search */}
        <div className="p-3.5 space-y-2.5 border-b-2 border-ink">
          <div className="flex items-center justify-between md:hidden pb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-ink">Sohbetler</span>
            <button
              onClick={onClose}
              className="p-1 border-2 border-ink bg-paper text-ink hover:bg-ink hover:text-paper transition-colors"
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
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-ink text-paper border-2 border-ink font-bold text-xs uppercase tracking-wider hover:bg-signal hover:border-signal transition-colors shadow-none"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Yeni Sohbet</span>
          </button>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-ink/60 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Sohbetlerde ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-paper border-2 border-ink rounded-none pl-8 pr-2.5 py-1.5 text-xs text-ink placeholder-ink/40 outline-none font-mono focus:bg-smoke font-medium"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredSessions.length === 0 ? (
            <div className="text-xs text-ink/50 text-center py-8 font-bold uppercase tracking-widest">
              {searchQuery ? 'Sonuç yok' : 'Henüz sohbet yok'}
            </div>
          ) : (
            filteredSessions.map((sess) => {
              const isActive = sess.id === activeSessionId;
              return (
                <div
                  key={sess.id}
                  className={`group flex items-center justify-between gap-2 px-3 py-2 cursor-pointer text-xs transition-all border-2 ${
                    isActive
                      ? 'bg-ink text-paper border-ink font-bold hardshadow-sm'
                      : 'bg-paper text-ink border-transparent hover:border-ink hover:bg-smoke font-medium'
                  }`}
                  onClick={() => {
                    onSelectSession(sess.id);
                    onClose();
                  }}
                >
                  <span className="truncate flex-1">
                    {sess.title || 'Yeni Sohbet'}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(sess.id);
                    }}
                    className={`opacity-0 group-hover:opacity-100 p-0.5 transition-opacity ${
                      isActive ? 'text-paper/70 hover:text-signal' : 'text-ink/60 hover:text-signal'
                    }`}
                    title="Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom: Model Selection */}
        <div className="p-3.5 border-t-2 border-ink bg-paper">
          <div className="flex items-center justify-between text-xs text-ink mb-2">
            <span className="font-bold flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-signal" />
              Yapay Zekâ Modeli
            </span>
            <button
              onClick={onOpenPricing}
              className="text-signal hover:underline text-[10px] uppercase font-bold tracking-widest"
            >
              Tarife
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {AVAILABLE_MODELS.map((model) => {
              const isSelected = selectedModel === model.id || (
                model.id === 'gemini-3.7-flash' && (!selectedModel || selectedModel.includes('3.7') || selectedModel.includes('1.5-flash'))
              );
              const Icon = model.icon;
              
              return (
                <button
                  key={model.id}
                  onClick={() => onSelectModel(model.id)}
                  className={`relative p-2 border-2 text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-signal text-paper border-ink hardshadow-sm'
                      : 'bg-paper text-ink border-ink hover:bg-smoke'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-[10px] font-black tracking-tight truncate uppercase">
                      {model.shortName}
                    </span>
                    <Icon className={`w-3 h-3 ${isSelected ? 'text-paper' : 'text-ink'}`} />
                  </div>
                  <span className={`text-[8px] uppercase tracking-widest px-1 py-0.2 border w-fit font-bold ${
                    isSelected 
                      ? 'bg-ink text-paper border-paper/40' 
                      : 'bg-smoke text-ink border-ink'
                  }`}>
                    {model.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}
