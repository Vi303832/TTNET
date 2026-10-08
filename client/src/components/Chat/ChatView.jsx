import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { 
  Sparkles, 
  Code2, 
  Coins, 
  Zap, 
  Lightbulb,
  ArrowDown
} from 'lucide-react';

const STARTER_PROMPTS = [
  {
    icon: <Code2 className="w-4 h-4 text-cyan-400" />,
    title: 'React Performans & Memoization',
    prompt: 'React uygulamasında useMemo, useCallback ve React.memo kullanımının doğru zamanlarını ve maliyetlerini örneklerle açıkla.'
  },
  {
    icon: <Coins className="w-4 h-4 text-emerald-400" />,
    title: 'LLM Token Optimizasyonu',
    prompt: 'Büyük dil modellerinde (LLM) prompt token tüketimini ve API maliyetlerini %50 oranında düşürmek için en etkili 5 stratejiyi listele.'
  },
  {
    icon: <Zap className="w-4 h-4 text-amber-400" />,
    title: 'Node.js SSE & Canlı Akış',
    prompt: 'Node.js Express üzerinde Server-Sent Events (SSE) ile gerçek zamanlı yapay zekâ yanıt akışı sağlayan sağlam bir backend mimarisi tasarla.'
  },
  {
    icon: <Lightbulb className="w-4 h-4 text-purple-400" />,
    title: 'Modern UI & Glassmorphism',
    prompt: 'Tailwind CSS ve modern CSS ile göz alıcı bir Glassmorphism kart tasarımı ve mikro animasyonlar oluştur.'
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
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
        {isEmpty ? (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center py-8">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center mb-5 glow-cyan">
              <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-cyan-400" />
            </div>

            <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
              Gemini AI Chat & Anlık Maliyet Takibi
            </h2>
            
            <p className="text-sm text-slate-400 mt-2 mb-8 max-w-lg leading-relaxed">
              Google Gemini modelleri ile gerçek zamanlı sohbet edin, harcadığınız her bir girdi ve çıktı tokenını anlık olarak izleyin.
            </p>

            {/* Quick Starter Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
              {STARTER_PROMPTS.map((starter, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(starter.prompt)}
                  className="glass-card p-3.5 rounded-xl text-left border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-800/40 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {starter.icon}
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                      {starter.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {starter.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Message List */
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((msg, index) => (
              <ChatMessage key={msg.id || index} message={msg} />
            ))}

            {/* Live Streaming Message Bubble */}
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

      {/* Input Section at bottom */}
      <div className="p-4 md:p-6 bg-gradient-to-t from-[#080d1a] via-[#080d1a]/95 to-transparent">
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
