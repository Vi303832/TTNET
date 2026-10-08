'use client';

import React from 'react';
import { 
  X, 
  Sliders, 
  Sparkles, 
  RotateCcw, 
  DollarSign,
  Code2,
  Bot,
  Compass
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

  const applyPreset = (type) => {
    if (type === 'coding') {
      setSystemInstruction('Sen kıdemli bir tam donanımlı yazılım mimarısın (Staff Software Engineer). Kod örneklerini modüler, temiz, TypeScript/JavaScript ve Next.js en iyi pratiklerine uygun şekilde üret. Kod bloklarında detaylı açıklamalar sağla.');
      setGenerationConfig({ temperature: 0.2, topP: 0.9, maxOutputTokens: 8192 });
    } else if (type === 'agent') {
      setSystemInstruction('Sen otonom kararlar alabilen, çok adımlı görevleri planlayıp adım adım uygulayan bir Yapay Zekâ Ajanısın (Autonomous Agent). Çıktılarını yapılandırılmış, net ve eyleme geçirilebilir formatta hazırla.');
      setGenerationConfig({ temperature: 0.4, topP: 0.95, maxOutputTokens: 4096 });
    } else if (type === 'creative') {
      setSystemInstruction('Sen yaratıcı, ilham verici ve çözüm odaklı bir inovasyon danışmanısın. Zengin metaforlar ve yenilikçi fikirler sun.');
      setGenerationConfig({ temperature: 0.9, topP: 0.98, maxOutputTokens: 4096 });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xs font-mono">
      <div className="bg-paper border-2 border-ink hardshadow w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 relative text-ink">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 border-2 border-ink bg-paper text-ink hover:bg-ink hover:text-paper transition-colors"
          aria-label="Kapat"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-signal text-xs font-bold uppercase tracking-widest mb-1">
            <Sliders className="w-4 h-4" />
            <span>Model & Sistem Parametreleri</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black font-grotesk uppercase tighten text-ink">
            Google Gemini AI Yapılandırması
          </h2>
          <p className="text-xs text-ink/70 mt-1">
            Modelin yanıt verme tarzını, yaratıcılık düzeyini ve maliyet hesaplama çarpanlarını belirleyin.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="mb-5 p-3.5 bg-smoke border-2 border-ink">
          <span className="text-[11px] font-black uppercase tracking-wider text-ink block mb-2 font-grotesk">Hızlı Rol Şablonları:</span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => applyPreset('coding')}
              className="p-2.5 bg-paper border-2 border-ink hover:bg-ink hover:text-paper text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 text-signal text-xs font-bold mb-0.5 uppercase">
                <Code2 className="w-3.5 h-3.5" />
                <span>Yazılım</span>
              </div>
              <span className="text-[10px] text-ink/70 group-hover:text-paper/70 block font-medium">Düşük sıcaklık</span>
            </button>

            <button
              onClick={() => applyPreset('agent')}
              className="p-2.5 bg-paper border-2 border-ink hover:bg-ink hover:text-paper text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 text-signal text-xs font-bold mb-0.5 uppercase">
                <Bot className="w-3.5 h-3.5" />
                <span>Ajan</span>
              </div>
              <span className="text-[10px] text-ink/70 group-hover:text-paper/70 block font-medium">Planlama</span>
            </button>

            <button
              onClick={() => applyPreset('creative')}
              className="p-2.5 bg-paper border-2 border-ink hover:bg-ink hover:text-paper text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 text-signal text-xs font-bold mb-0.5 uppercase">
                <Compass className="w-3.5 h-3.5" />
                <span>Yaratıcı</span>
              </div>
              <span className="text-[10px] text-ink/70 group-hover:text-paper/70 block font-medium">Yüksek esneklik</span>
            </button>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="text-ink font-bold block mb-1.5 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-signal" />
              Sistem Talimatı (System Instruction)
            </label>
            <textarea
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              placeholder="Örn: Sen kıdemli bir yazılım mimarısın. Kod örneklerini modüler ve Türkçe açıklamalarla sun."
              rows={3}
              className="w-full bg-paper border-2 border-ink p-3 text-ink placeholder-ink/40 outline-none font-mono focus:bg-smoke resize-none font-medium"
            />
          </div>

          <div className="p-3.5 bg-smoke border-2 border-ink space-y-2">
            <div className="flex justify-between items-center text-ink font-bold uppercase">
              <span>Sıcaklık (Temperature):</span>
              <span className="font-mono text-signal text-sm">{generationConfig.temperature}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={generationConfig.temperature}
              onChange={(e) => setGenerationConfig({ ...generationConfig, temperature: parseFloat(e.target.value) })}
              className="w-full accent-signal"
            />
            <div className="flex justify-between text-[10px] text-ink/60 font-bold uppercase">
              <span>0.0 (Deterministik)</span>
              <span>1.0 (Yaratıcı)</span>
            </div>
          </div>

          <div className="p-3.5 bg-smoke border-2 border-ink space-y-2">
            <div className="flex justify-between items-center text-ink font-bold uppercase">
              <span>Maksimum Çıktı Tokenı (Max Tokens):</span>
              <span className="font-mono text-signal text-sm">{generationConfig.maxOutputTokens}</span>
            </div>
            <input
              type="range"
              min="512"
              max="8192"
              step="512"
              value={generationConfig.maxOutputTokens}
              onChange={(e) => setGenerationConfig({ ...generationConfig, maxOutputTokens: parseInt(e.target.value) })}
              className="w-full accent-signal"
            />
          </div>

          <div className="p-3.5 bg-smoke border-2 border-ink space-y-2">
            <div className="flex justify-between items-center text-ink font-bold uppercase">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-signal" />
                USD / TRY Döviz Kuru Çarpanı:
              </span>
              <span className="font-mono text-signal text-sm font-bold">₺{exchangeRate}</span>
            </div>
            <input
              type="number"
              step="0.1"
              min="1"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 35.50)}
              className="w-full bg-paper border-2 border-ink px-3 py-1.5 text-ink outline-none font-mono font-bold"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t-2 border-ink">
          <button
            onClick={handleReset}
            type="button"
            className="flex items-center gap-1.5 text-xs text-ink/70 hover:text-signal font-bold uppercase tracking-wider transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Sıfırla</span>
          </button>

          <button
            onClick={onClose}
            type="button"
            className="px-6 py-2.5 bg-ink text-paper hover:bg-signal border-2 border-ink font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Kaydet ve Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
