'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2,
  Zap,
  Cpu,
  Feather
} from 'lucide-react';
import { fetchModels } from '@/services/api';

export default function PricingModal({ isOpen, onClose, selectedModel, onSelectModel }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchModels()
        .then(data => setModels(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xs font-mono">
      <div className="bg-paper border-2 border-ink hardshadow w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8 relative text-ink">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 border-2 border-ink bg-paper text-ink hover:bg-ink hover:text-paper transition-colors"
          aria-label="Kapat"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-signal text-xs font-bold uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Google Gemini AI Modelleri & Tarifeler</span>
          </div>
          <h2 className="text-xl md:text-3xl font-black font-grotesk uppercase tighten text-ink">
            Model Seçimi ve Token Tarifeleri
          </h2>
          <p className="text-xs md:text-sm text-ink/70 mt-1">
            Google AI Studio resmi tarifesi üzerinden 1 Milyon Token (1M) başına maliyet tablosu.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {models.map((m) => {
            const isSelected = selectedModel === m.id || (m.id === 'gemini-3.7-flash' && (!selectedModel || selectedModel.includes('3.7') || selectedModel.includes('1.5-flash')));

            return (
              <div
                key={m.id}
                className={`p-4 border-2 border-ink transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-signal text-paper hardshadow-sm'
                    : 'bg-paper text-ink hover:bg-smoke'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 border uppercase tracking-wider font-mono ${
                      isSelected
                        ? 'bg-ink text-paper border-paper/40'
                        : 'bg-smoke text-ink border-ink'
                    }`}>
                      {m.badge || m.id.replace('gemini-', '')}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-paper">
                        <CheckCircle2 className="w-3.5 h-3.5" /> SEÇİLİ
                      </span>
                    )}
                  </div>

                  <h3 className={`text-sm font-black font-grotesk uppercase tighten mb-1 ${isSelected ? 'text-paper' : 'text-ink'}`}>
                    {m.name}
                  </h3>
                  <p className={`text-[11px] mb-3 leading-relaxed line-clamp-2 ${isSelected ? 'text-paper/80' : 'text-ink/70'}`}>
                    {m.description}
                  </p>

                  <div className={`space-y-1.5 mb-3 p-2.5 border-2 border-ink text-[11px] font-mono font-bold ${
                    isSelected ? 'bg-ink text-paper' : 'bg-smoke text-ink'
                  }`}>
                    <span className="text-[9px] uppercase tracking-wider block opacity-70">
                      Tarife (1M Token)
                    </span>
                    {m.pricing?.map((tier, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between">
                          <span className="opacity-70">Girdi:</span>
                          <strong className={isSelected ? 'text-signal' : 'text-ink'}>{tier.inputPer1M}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-70">Çıktı:</span>
                          <strong className={isSelected ? 'text-paper' : 'text-signal'}>{tier.outputPer1M}</strong>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={`text-[10px] space-y-0.5 mb-3 font-mono font-bold ${isSelected ? 'text-paper/80' : 'text-ink/60'}`}>
                    <div className="flex justify-between uppercase">
                      <span>Maks. Bağlam:</span>
                      <span className={isSelected ? 'text-paper' : 'text-ink'}>{(m.maxInputTokens / 1000).toLocaleString()}k token</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectModel(m.id);
                    onClose();
                  }}
                  className={`w-full py-2 px-2.5 border-2 border-ink font-bold text-xs uppercase tracking-wider transition-all ${
                    isSelected
                      ? 'bg-ink text-paper hover:bg-paper hover:text-ink'
                      : 'bg-ink text-paper hover:bg-signal hover:border-signal'
                  }`}
                >
                  {isSelected ? 'Aktif Model' : 'Bu Modeli Seç'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-smoke border-2 border-ink text-xs text-ink flex items-start gap-2.5 font-medium">
          <ShieldCheck className="w-5 h-5 text-signal shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-bold text-ink">Otomatik Mikro Maliyet Hesabı:</strong> Gönderilen her komut ve dönen her yanıt için girdi/çıktı tokenları anlık olarak sayılır, güncel döviz kuru ile kuruş karşılığı hesaplanarak hafızaya kaydedilir.
          </div>
        </div>
      </div>
    </div>
  );
}
