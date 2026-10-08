import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
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

  // Auto-resize textarea & calculate rough token count
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }

    // Heuristic estimate: ~3.5 characters per token
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

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Input Outer Container */}
      <div className="glass-panel p-2.5 md:p-3 rounded-2xl shadow-2xl border border-slate-700/60 focus-within:border-cyan-500/80 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all duration-200">
        {/* Text Input Area */}
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Gemini'ye bir soru sorun veya görev verin... (Göndermek için Enter)"
          disabled={disabled}
          rows={1}
          className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-sm md:text-base outline-none resize-none px-3 py-1.5 min-h-[44px] max-h-[180px] leading-relaxed"
        />

        {/* Bottom Bar inside Input */}
        <div className="flex items-center justify-between pt-2 px-2 border-t border-slate-800/70 text-xs">
          {/* Left: Token Estimator & Model Info */}
          <div className="flex items-center gap-3 text-slate-400">
            {estimatedTokens > 0 ? (
              <span className="flex items-center gap-1.5 text-cyan-400 font-mono text-[11px] bg-cyan-950/40 px-2 py-0.5 rounded-md border border-cyan-800/40">
                <Calculator className="w-3 h-3" />
                ~{estimatedTokens} tahmini girdi tokenı
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 hidden sm:inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                {selectedModel}
              </span>
            )}

            <button
              onClick={onOpenSettings}
              type="button"
              className="text-slate-400 hover:text-slate-200 text-[11px] flex items-center gap-1 hover:bg-slate-800/60 px-2 py-0.5 rounded transition-colors"
              title="Parametreler ve Sistem Talimatı"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span className="hidden sm:inline">Parametreler</span>
            </button>
          </div>

          {/* Right: Send / Stop Buttons */}
          <div className="flex items-center gap-2">
            {isStreaming ? (
              <button
                onClick={onStopStreaming}
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow-lg shadow-rose-600/20 transition-all active:scale-95"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Durdur</span>
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!prompt.trim() || disabled}
                type="button"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-medium text-xs shadow-lg transition-all active:scale-95 ${
                  prompt.trim() && !disabled
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/25 glow-cyan'
                    : 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700/50'
                }`}
              >
                <span>Gönder</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="text-[10px] text-slate-400 text-center mt-2 flex items-center justify-center gap-3">
        <span>Google Gemini 1.5/2.0 API & Gerçek Zamanlı Token Takibi</span>
        <span>•</span>
        <span>Shift + Enter ile yeni satır</span>
      </div>
    </div>
  );
}
