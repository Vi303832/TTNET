import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Bot, 
  User, 
  Copy, 
  Check, 
  Coins, 
  Clock, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  Cpu
} from 'lucide-react';

export default function ChatMessage({ message, isStreaming = false }) {
  const [copied, setCopied] = useState(false);
  const [showCostDetails, setShowCostDetails] = useState(false);

  const isUser = message.role === 'user';
  const hasTokens = message.tokens && message.tokens.totalTokens > 0;
  const costUSD = message.cost?.totalCostUSD || message.costUSD?.totalCost || 0;
  const costTRY = message.cost?.totalCostTRY || message.costTRY?.totalCost || 0;

  const handleCopy = () => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 md:gap-4 p-4 md:p-5 rounded-2xl transition-all duration-200 ${
      isUser 
        ? 'bg-blue-950/25 border border-blue-800/30 ml-auto max-w-[88%] md:max-w-[80%]' 
        : 'glass-panel border-slate-800/80 mr-auto w-full'
    }`}>
      {/* Avatar */}
      <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
        isUser 
          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/20' 
          : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-cyan-500/20'
      }`}>
        {isUser ? <User className="w-4 h-4 md:w-5 md:h-5" /> : <Bot className="w-4 h-4 md:w-5 md:h-5" />}
      </div>

      {/* Content Body */}
      <div className="flex-1 min-w-0">
        {/* Header (Role & Model Badge) */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-300">
              {isUser ? 'Siz' : 'Gemini AI'}
            </span>
            {!isUser && message.model && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 font-mono flex items-center gap-1">
                <Cpu className="w-2.5 h-2.5" />
                {message.model}
              </span>
            )}
            {message.latencyMs > 0 && (
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {message.latencyMs} ms
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleCopy}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
            title="Mesajı Kopyala"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Message Content */}
        <div className="prose-dark text-sm md:text-base leading-relaxed break-words">
          {message.content ? (
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeText = String(children).replace(/\n$/, '');
                  
                  if (!inline) {
                    return (
                      <div className="relative group my-3 rounded-xl overflow-hidden border border-slate-800 bg-[#0c1220]">
                        <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900/90 border-b border-slate-800/80 text-[11px] text-slate-400 font-mono">
                          <span>{match ? match[1] : 'code'}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(codeText);
                            }}
                            className="flex items-center gap-1 hover:text-slate-200 text-slate-400 text-[10px] px-1.5 py-0.5 rounded bg-slate-800/60 hover:bg-slate-700/80 transition-colors"
                          >
                            <Copy className="w-2.5 h-2.5" /> Kopyala
                          </button>
                        </div>
                        <pre className="p-3.5 overflow-x-auto text-xs font-mono text-cyan-200/90 leading-relaxed m-0">
                          <code>{codeText}</code>
                        </pre>
                      </div>
                    );
                  }
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          ) : isStreaming ? (
            <span className="text-slate-400 italic text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              Yanıt oluşturuluyor...
            </span>
          ) : null}

          {/* Glowing cursor during streaming */}
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 rounded-sm animate-blink align-middle" />
          )}
        </div>

        {/* Token & Cost Metadata Badge for Assistant responses */}
        {!isUser && !isStreaming && (hasTokens || costUSD > 0) && (
          <div className="mt-3 pt-2.5 border-t border-slate-800/70">
            <button
              onClick={() => setShowCostDetails(!showCostDetails)}
              className="flex items-center gap-2 text-[11px] text-slate-400 hover:text-cyan-300 font-mono transition-colors group"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>
                <strong className="text-slate-300">{message.tokens?.totalTokens || 0}</strong> token
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-semibold">
                ${costUSD < 0.00001 ? '<$0.00001' : costUSD.toFixed(6)}
              </span>
              <span className="text-slate-500">
                (₺{costTRY.toFixed(4)})
              </span>
              {showCostDetails ? (
                <ChevronUp className="w-3 h-3 text-slate-500 ml-auto" />
              ) : (
                <ChevronDown className="w-3 h-3 text-slate-500 ml-auto" />
              )}
            </button>

            {/* Expanded Cost Breakdown */}
            {showCostDetails && (
              <div className="mt-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-400">
                <div>
                  <span className="text-slate-500 block text-[10px]">Girdi Token:</span>
                  <span className="text-slate-200 font-medium">{message.tokens?.promptTokens || 0}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Çıktı Token:</span>
                  <span className="text-slate-200 font-medium">{message.tokens?.candidateTokens || 0}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Maliyet (USD):</span>
                  <span className="text-emerald-400 font-medium">${costUSD.toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Maliyet (TRY):</span>
                  <span className="text-amber-400 font-medium">₺{costTRY.toFixed(4)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
