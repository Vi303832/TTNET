'use client';

import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { 
  Code2, 
  Bot, 
  Layers, 
  Coins, 
  ArrowRight,
  Sparkles 
} from 'lucide-react';

const CAPABILITIES = [
  {
    icon: Code2,
    title: 'Yazılım Mühendisliği & Kod Analizi',
    desc: 'TypeScript, Next.js 14 ve tam kapsamlı temiz kod mimarileri oluşturun.',
    prompt: 'Next.js 14 App Router ile Server-Sent Events (SSE) streaming API ve token maliyet hesaplayıcı örneği yaz.'
  },
  {
    icon: Coins,
    title: 'Mikro Token & Maliyet Takibi',
    desc: 'Her yanıtta anlık girdi-çıktı token ve kuruş seviyesinde şeffaf maliyet.',
    prompt: 'LLM token tüketimini optimize etme ve mikro-maliyet hesaplama stratejilerini açıkla.'
  },
  {
    icon: Layers,
    title: 'Geniş Bağlam Analizi',
    desc: 'Uzun dokümanlar, log çıktıları ve karmaşık veri analizi.',
    prompt: 'Büyük ölçekli bir web uygulamasında performans darboğazlarını analiz eden bir kontrol listesi hazırla.'
  },
  {
    icon: Bot,
    title: 'Otonom Ajanlar & İş Akışları',
    desc: 'Çok adımlı görev planlama ve sistem entegrasyonu.',
    prompt: 'TürkTicaret.net benzeri bir platform için müşteri destek süreçlerini otomatikleştiren bir yapay zekâ ajanı tasarla.'
  }
];

export default function ChatView({
  messages,
  streamingMessage,
  isStreaming,
  onSendMessage,
  onStopStreaming,
  selectedModel,
  onOpenSettings
}) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const isEmpty = messages.length === 0 && !streamingMessage;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-paper font-mono">
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
        {isEmpty ? (
          <div className="h-full min-h-[480px] flex flex-col items-center justify-center max-w-3xl mx-auto text-center py-8">
            
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-paper border-2 border-ink text-ink text-[11px] font-bold uppercase tracking-widest mb-4">
              <span className="w-2 h-2 rounded-full bg-signal animate-pulse" />
              <span>TOKEN TRACK · GEMINI AI</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black font-grotesk text-ink uppercase tighten mb-3">
              TOKEN <span className="text-signal">TRACK</span> AI STUDIO
            </h1>

            <p className="text-xs md:text-sm text-ink/70 max-w-xl mb-8 leading-relaxed font-mono">
              Google Gemini Flash modelleriyle gerçek zamanlı yanıt akışı ve anlık kuruş seviyesinde token maliyet takip konsolu.
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left">
              {CAPABILITIES.map((cap, idx) => {
                const Icon = cap.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(cap.prompt)}
                    className="group relative p-4 bg-paper hover:bg-smoke border-2 border-ink hardshadow-sm hover:hardshadow transition-all duration-150 text-left flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="w-8 h-8 bg-signal text-paper border-2 border-ink flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-ink group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h2 className="text-xs font-black font-grotesk text-ink uppercase tighten mb-1">
                        {cap.title}
                      </h2>
                      <p className="text-[11px] text-ink/70 leading-relaxed font-mono">
                        {cap.desc}
                      </p>
                    </div>
                    <span className="text-[10px] text-signal font-bold uppercase tracking-widest mt-3 flex items-center gap-1">
                      Örnek komutu çalıştır →
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg, index) => (
              <ChatMessage key={msg.id || index} message={msg} />
            ))}

            {isStreaming && (
              <ChatMessage
                message={{
                  role: 'model',
                  content: streamingMessage,
                  model: selectedModel
                }}
                isStreaming={true}
              />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="p-3 md:p-4 bg-paper border-t-2 border-ink">
        <ChatInput
          onSendMessage={onSendMessage}
          onStopStreaming={onStopStreaming}
          isStreaming={isStreaming}
          selectedModel={selectedModel}
          onOpenSettings={onOpenSettings}
        />
      </div>
    </div>
  );
}
