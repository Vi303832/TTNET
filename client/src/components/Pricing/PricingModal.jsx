import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  Zap, 
  BrainCircuit, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { fetchModels } from '../../services/api';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-700/80 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2.5 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Google Gemini AI Fiyatlandırma & Modeller</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white">
            Model Seçimi & Token Fiyatlandırma Kataloğu
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Google AI Studio resmi fiyat tarifesi (1 Milyon Token Başına USD).
          </p>
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {models.map((m) => {
            const isSelected = selectedModel === m.id;
            const isFlash = m.id.includes('flash');
            const isPro = m.id.includes('pro');

            return (
              <div
                key={m.id}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-950/50 to-slate-900 border-cyan-500 shadow-xl shadow-cyan-500/10'
                    : 'glass-card border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Model Header Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono ${
                      isFlash 
                        ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' 
                        : isPro 
                        ? 'bg-purple-950 text-purple-400 border border-purple-800'
                        : 'bg-blue-950 text-blue-400 border border-blue-800'
                    }`}>
                      {m.id}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] text-cyan-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Seçili
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{m.name}</h3>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">{m.description}</p>

                  {/* Pricing Tiers Table */}
                  <div className="space-y-2 mb-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800/70 text-xs font-mono">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-sans font-semibold">
                      Tarife (1M Token Başına)
                    </span>
                    {m.pricing?.map((tier, idx) => (
                      <div key={idx} className="border-t border-slate-900 pt-1.5 first:border-0 first:pt-0">
                        <div className="text-[10px] text-slate-400 font-sans">{tier.threshold}</div>
                        <div className="flex justify-between text-slate-300">
                          <span>Girdi: <strong className="text-cyan-300">{tier.inputPer1M}</strong></span>
                          <span>Çıktı: <strong className="text-blue-300">{tier.outputPer1M}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Limits */}
                  <div className="text-[11px] text-slate-400 space-y-1 mb-4 font-mono">
                    <div className="flex justify-between">
                      <span>Maks. Bağlam:</span>
                      <span className="text-slate-200">{(m.maxInputTokens / 1000).toLocaleString()}k token</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Maks. Çıktı:</span>
                      <span className="text-slate-200">{(m.maxOutputTokens / 1000).toLocaleString()}k token</span>
                    </div>
                  </div>

                  {/* Recommended For */}
                  {m.recommendedFor && (
                    <div className="space-y-1 mb-5">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                        Kullanım Alanları:
                      </span>
                      {m.recommendedFor.map((rec, i) => (
                        <div key={i} className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    onSelectModel(m.id);
                    onClose();
                  }}
                  className={`w-full py-2 px-3 rounded-xl font-medium text-xs transition-all ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {isSelected ? 'Aktif Model' : 'Bu Modeli Kullan'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Info Banner */}
        <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-slate-300 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-cyan-200">Tam Maliyet Şeffaflığı:</span> Her istekte tüketilen prompt ve candidate tokenları anlık olarak hesaplanır ve geçmişinizde saklanır.
          </div>
        </div>
      </div>
    </div>
  );
}
