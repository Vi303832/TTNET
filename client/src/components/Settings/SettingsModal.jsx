import React from 'react';
import { 
  X, 
  Sliders, 
  Sparkles, 
  RotateCcw, 
  DollarSign,
  Cpu,
  Info
} from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  systemInstruction,
  setSystemInstruction,
  generationConfig,
  setGenerationConfig,
  exchangeRate,
  setExchangeRate
}) {
  if (!isOpen) return null;

  const handleReset = () => {
    setSystemInstruction('');
    setGenerationConfig({
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 4096
    });
    setExchangeRate(35.50);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-700/80 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4" />
            <span>Model & Sistem Yapılandırması</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Üretim Parametreleri ve Sistem Talimatı
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gemini modelinin yanıt verme tarzını ve maliyet hesaplama kurallarını özelleştirin.
          </p>
        </div>

        <div className="space-y-5 text-xs">
          {/* System Instruction */}
          <div>
            <label className="text-slate-200 font-semibold block mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Sistem Talimatı (System Instruction)
            </label>
            <textarea
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              placeholder="Örn: Sen kıdemli bir yazılım mimarısın. Kod örneklerini temiz, modüler ve Türkçe açıklamalarla sun."
              rows={3}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500 resize-none font-sans"
            />
            <span className="text-[10px] text-slate-500 block mt-1">
              Modelin rolünü, uzmanlığını ve tonunu belirler.
            </span>
          </div>

          {/* Temperature Slider */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center text-slate-300 font-medium">
              <span>Sıcaklık (Temperature):</span>
              <span className="font-mono text-cyan-400 font-bold">{generationConfig.temperature}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={generationConfig.temperature}
              onChange={(e) => setGenerationConfig({ ...generationConfig, temperature: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0.0 (Daha Tutarlı & Net)</span>
              <span>1.0 (Daha Yaratıcı & Esnek)</span>
            </div>
          </div>

          {/* Top-P Slider */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center text-slate-300 font-medium">
              <span>Top-P (Çekirdek Örnekleme):</span>
              <span className="font-mono text-cyan-400 font-bold">{generationConfig.topP}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={generationConfig.topP}
              onChange={(e) => setGenerationConfig({ ...generationConfig, topP: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* Max Output Tokens */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center text-slate-300 font-medium">
              <span>Maksimum Çıktı Tokenı:</span>
              <span className="font-mono text-cyan-400 font-bold">{generationConfig.maxOutputTokens}</span>
            </div>
            <input
              type="range"
              min="512"
              max="8192"
              step="512"
              value={generationConfig.maxOutputTokens}
              onChange={(e) => setGenerationConfig({ ...generationConfig, maxOutputTokens: parseInt(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* USD / TRY Rate */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                USD / TRY Döviz Kuru Çarpanı:
              </span>
              <span className="font-mono text-amber-400 font-bold">₺{exchangeRate}</span>
            </div>
            <input
              type="number"
              step="0.1"
              min="1"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 35.50)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 outline-none focus:border-amber-400 font-mono"
            />
            <span className="text-[10px] text-slate-500 block">
              Maliyetlerin TL cinsinden anlık gösterimi için kullanılır.
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={handleReset}
            type="button"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Varsayılanlara Sıfırla</span>
          </button>

          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/20"
          >
            Kaydet ve Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
