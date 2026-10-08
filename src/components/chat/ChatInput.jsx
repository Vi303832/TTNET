'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Square, 
  Sparkles, 
  Calculator, 
  SlidersHorizontal,
  CornerDownLeft
} from 'lucide-react';

export default function ChatInput({
  onSendMessage,
  onStopStreaming,
  isStreaming,
  selectedModel,
  onOpenSettings,
  disabled = false
}) {
  const [prompt, setPrompt] = useState('');
  const [estimatedTokens, setEstimatedTokens] = useState(0);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }

    const tokenEst = prompt.trim() ? Math.max(1, Math.ceil(prompt.trim().length / 3.5)) : 0;
    setEstimatedTokens(tokenEst);
  }, [prompt]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!prompt.trim() || isStreaming || disabled) return;
    onSendMessage(prompt.trim());
    setPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const modelBadgeLabel = selectedModel 
    ? selectedModel.replace('gemini-', '').replace('-latest', '').replace('-preview', '') 
    : '3.8 Flash';

  return (
    <div className="relative w-full max-w-3xl mx-auto font-mono">
      <div className="bg-paper border-2 border-ink hardshadow-sm focus-within:hardshadow p-2.5 md:p-3 transition-all">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Gemini AI'a bir talimat verin veya soru sorun... (Göndermek için Enter)"
          disabled={disabled}
          rows={1}
          className="w-full bg-transparent text-ink placeholder-ink/40 text-sm outline-none resize-none px-2 py-1 min-h-[44px] max-h-[180px] leading-relaxed font-mono font-medium"
        />

        <div className="flex items-center justify-between pt-2.5 px-1 border-t-2 border-ink text-xs">
          <div className="flex items-center gap-2 text-ink flex-wrap">
            {/* Active Model Pill */}
            <span className="text-[11px] px-2 py-0.5 bg-smoke border border-ink text-ink font-mono font-bold flex items-center gap-1.5 uppercase">
              <Sparkles className="w-3 h-3 text-signal" />
              <span>{modelBadgeLabel}</span>
            </span>

            {/* Token Counter */}
            {estimatedTokens > 0 && (
              <span className="hidden sm:flex items-center gap-1 text-ink font-mono text-[11px] bg-paper px-2 py-0.5 border border-ink font-bold">
                <Calculator className="w-3 h-3 text-signal" />
                ~{estimatedTokens} token
              </span>
            )}

            {/* Quick Settings */}
            <button
              onClick={onOpenSettings}
              type="button"
              className="text-ink hover:bg-smoke text-[11px] flex items-center gap-1 px-2 py-0.5 border border-ink font-bold transition-colors uppercase"
              title="Model Parametreleri ve Sistem Talimatı"
            >
              <SlidersHorizontal className="w-3 h-3 text-ink" />
              <span className="hidden sm:inline">Parametreler</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isStreaming ? (
              <button
                onClick={onStopStreaming}
                type="button"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-signal text-paper border-2 border-ink font-bold text-xs uppercase tracking-wider hover:bg-ink hover:border-ink transition-all"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Durdur</span>
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!prompt.trim() || disabled}
                type="button"
                className={`flex items-center gap-1.5 px-4 py-2 border-2 border-ink font-bold text-xs uppercase tracking-wider transition-all ${
                  prompt.trim() && !disabled
                    ? 'bg-ink text-paper hover:bg-signal hover:border-signal cursor-pointer shadow-none'
                    : 'bg-smoke text-ink/40 cursor-not-allowed border-ink/40'
                }`}
              >
                <span>Gönder</span>
                <CornerDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
