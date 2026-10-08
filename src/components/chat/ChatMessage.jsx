'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Bot, 
  User, 
  Copy, 
  Check, 
  Coins, 
  Clock, 
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
    <div className={`flex gap-3 md:gap-4 p-4 md:p-5 border-2 border-ink transition-all font-mono ${
      isUser 
        ? 'bg-smoke hardshadow-sm ml-auto max-w-[90%] md:max-w-[82%]' 
        : 'bg-paper hardshadow mr-auto w-full'
    }`}>
      {/* Avatar */}
      <div className={`w-8 h-8 md:w-9 md:h-9 border-2 border-ink flex items-center justify-center shrink-0 font-bold ${
        isUser 
          ? 'bg-ink text-paper' 
          : 'bg-signal text-paper'
      }`}>
        {isUser ? <User className="w-4 h-4 md:w-5 md:h-5" /> : <Bot className="w-4 h-4 md:w-5 md:h-5" />}
      </div>

      {/* Content Body */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b-2 border-ink/20">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black uppercase tracking-wider text-ink font-grotesk">
              {isUser ? 'Kullanıcı' : 'Token Track AI'}
            </span>
            {!isUser && message.model && (
              <span className="text-[10px] px-2 py-0.2 bg-paper border border-ink text-ink font-mono font-bold uppercase">
                {message.model.replace('gemini-', '')}
              </span>
            )}
            {message.latencyMs > 0 && (
              <span className="text-[10px] text-ink/60 font-bold flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {message.latencyMs} ms
              </span>
            )}
          </div>

          <button
            onClick={handleCopy}
            className="text-ink hover:text-signal p-1 transition-colors"
            title="Mesajı Kopyala"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Message Content */}
        <div className="text-sm md:text-base leading-relaxed break-words text-ink">
          {message.content ? (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                h1: ({ children }) => <h1 className="font-grotesk font-black text-xl uppercase tighten mt-4 mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="font-grotesk font-black text-lg uppercase tighten mt-3 mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="font-grotesk font-bold text-base uppercase tighten mt-2 mb-1">{children}</h3>,
                ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                blockquote: ({ children }) => <blockquote className="border-l-4 border-signal pl-3 italic my-3 text-ink/80">{children}</blockquote>,
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeText = String(children).replace(/\n$/, '');
                  
                  if (!inline) {
                    return (
                      <div className="relative group my-3 border-2 border-ink hardshadow-sm bg-ink text-paper overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-[#181818] border-b-2 border-ink text-[11px] text-paper font-mono uppercase font-bold">
                          <span>{match ? match[1] : 'CODE'}</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(codeText)}
                            className="flex items-center gap-1 text-paper hover:text-signal text-[10px] px-2 py-0.5 border border-paper/40 bg-ink transition-colors uppercase font-bold"
                          >
                            <Copy className="w-2.5 h-2.5" /> Kopyala
                          </button>
                        </div>
                        <pre className="p-3.5 overflow-x-auto text-xs font-mono text-paper leading-relaxed m-0">
                          <code>{codeText}</code>
                        </pre>
                      </div>
                    );
                  }
                  return (
                    <code className="bg-smoke border border-ink px-1.5 py-0.5 text-xs font-mono font-bold text-ink" {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          ) : isStreaming ? (
            <span className="text-ink/60 italic text-sm flex items-center gap-2 font-bold">
              <span className="w-2 h-2 rounded-full bg-signal animate-ping" />
              Yanıt oluşturuluyor...
            </span>
          ) : null}

          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-signal animate-pulse align-middle" />
          )}
        </div>

        {/* Token & Cost Metadata */}
        {!isUser && !isStreaming && (hasTokens || costUSD > 0) && (
          <div className="mt-3 pt-2.5 border-t-2 border-ink">
            <button
              onClick={() => setShowCostDetails(!showCostDetails)}
              className="flex items-center gap-2 text-xs text-ink font-mono font-bold transition-colors group w-full text-left"
            >
              <Coins className="w-3.5 h-3.5 text-signal" />
              <span>
                <strong>{message.tokens?.totalTokens || 0}</strong> TOKEN
              </span>
              <span className="text-ink/40">|</span>
              <span className="text-ink font-bold">
                ${costUSD < 0.00001 ? '<$0.00001' : costUSD.toFixed(6)}
              </span>
              <span className="text-signal font-bold">
                (₺{costTRY.toFixed(4)})
              </span>
              {showCostDetails ? (
                <ChevronUp className="w-3.5 h-3.5 text-ink ml-auto" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-ink ml-auto" />
              )}
            </button>

            {showCostDetails && (
              <div className="mt-2.5 p-3 bg-smoke border-2 border-ink text-xs font-mono grid grid-cols-2 md:grid-cols-4 gap-2 text-ink">
                <div>
                  <span className="text-ink/60 block text-[10px] font-bold uppercase">Girdi Token:</span>
                  <span className="text-ink font-extrabold">{message.tokens?.promptTokens || 0}</span>
                </div>
                <div>
                  <span className="text-ink/60 block text-[10px] font-bold uppercase">Çıktı Token:</span>
                  <span className="text-ink font-extrabold">{message.tokens?.candidateTokens || 0}</span>
                </div>
                <div>
                  <span className="text-ink/60 block text-[10px] font-bold uppercase">Maliyet (USD):</span>
                  <span className="text-ink font-extrabold">${costUSD.toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-ink/60 block text-[10px] font-bold uppercase">Maliyet (TRY):</span>
                  <span className="text-signal font-extrabold">₺{costTRY.toFixed(4)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
