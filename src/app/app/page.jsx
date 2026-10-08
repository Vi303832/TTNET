'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import ChatView from '@/components/chat/ChatView';
import CostDashboard from '@/components/analytics/CostDashboard';
import PricingModal from '@/components/pricing/PricingModal';
import SettingsModal from '@/components/settings/SettingsModal';
import AuthModal from '@/components/auth/AuthModal';
import { useAuth } from '@/context/AuthContext';
import { 
  streamChatMessage, 
  fetchSessions, 
  fetchSessionMessages, 
  deleteSession as apiDeleteSession, 
  checkBackendHealth 
} from '@/services/api';

export default function ChatAppPage() {
  const { user, token, refreshUserData } = useAuth();

  // Navigation & UI State
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'analytics'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Model & Configuration State (Default to Gemini 3.7 Flash)
  const [selectedModel, setSelectedModel] = useState('gemini-3.7-flash');
  const [systemInstruction, setSystemInstruction] = useState('');
  const [generationConfig, setGenerationConfig] = useState({
    temperature: 0.7,
    topP: 0.95,
    maxOutputTokens: 4096
  });
  const [exchangeRate, setExchangeRate] = useState(35.50);

  // Chat & History State
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(() => `sess_${Date.now()}`);
  const [messages, setMessages] = useState([]);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [backendHealth, setBackendHealth] = useState(null);

  const abortControllerRef = useRef(null);

  useEffect(() => {
    checkBackendHealth().then(status => {
      setBackendHealth(status);
    });
  }, []);

  useEffect(() => {
    if (user) {
      loadSessions();
      if (refreshUserData) refreshUserData();
    }
  }, [user, token]);

  useEffect(() => {
    if (activeSessionId && user) {
      loadSessionMessages(activeSessionId);
    }
  }, [activeSessionId]);

  const loadSessions = async () => {
    try {
      const list = await fetchSessions(token, user);
      setSessions(list || []);
    } catch (err) {
      console.warn('Oturum listesi alınamadı:', err);
    }
  };

  const loadSessionMessages = async (sessionId) => {
    try {
      const history = await fetchSessionMessages(sessionId, token, user);
      setMessages(history || []);
    } catch (err) {
      console.warn('Oturum mesajları alınamadı:', err);
    }
  };

  const handleNewChat = () => {
    const newId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setActiveSessionId(newId);
    setMessages([]);
    setStreamingMessage('');
    setActiveTab('chat');
  };

  const handleSelectSession = (sessionId) => {
    setActiveSessionId(sessionId);
    setActiveTab('chat');
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await apiDeleteSession(sessionId, token, user);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Oturum silinemedi:', err);
    }
  };

  const handleSendMessage = async (promptText) => {
    if (!promptText.trim() || isStreaming) return;

    const userMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: promptText.trim(),
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setStreamingMessage('');
    setIsStreaming(true);

    abortControllerRef.current = new AbortController();

    const historyPayload = messages.map(m => ({
      role: m.role === 'model' ? 'model' : 'user',
      content: m.content
    }));

    await streamChatMessage({
      prompt: promptText.trim(),
      model: selectedModel,
      systemInstruction,
      history: historyPayload,
      sessionId: activeSessionId,
      generationConfig,
      exchangeRate,
      token,
      user,
      signal: abortControllerRef.current.signal,
      onChunk: (chunkText) => {
        setStreamingMessage(prev => prev + chunkText);
      },
      onDone: (doneData) => {
        const assistantMessage = {
          id: doneData.messageId || `msg_ai_${Date.now()}`,
          role: 'model',
          content: doneData.content,
          model: doneData.model,
          tokens: doneData.tokens,
          cost: {
            totalCostUSD: doneData.costUSD?.totalCost || 0,
            totalCostTRY: doneData.costTRY?.totalCost || 0
          },
          costUSD: doneData.costUSD,
          costTRY: doneData.costTRY,
          latencyMs: doneData.latencyMs,
          createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, assistantMessage]);
        setStreamingMessage('');
        setIsStreaming(false);
        loadSessions();
        if (refreshUserData) refreshUserData();
      },
      onError: (err) => {
        console.error('Akış hatası:', err);
        const errorMessage = {
          id: `msg_err_${Date.now()}`,
          role: 'model',
          content: `⚠️ **Hata:** ${err.message || 'Gemini API ile iletişim sırasında bir sorun oluştu.'}`,
          createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
        setStreamingMessage('');
        setIsStreaming(false);
        if (refreshUserData) refreshUserData();
      }
    });
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (streamingMessage) {
      const partialMessage = {
        id: `msg_ai_stopped_${Date.now()}`,
        role: 'model',
        content: streamingMessage + '\n\n*(Durduruldu)*',
        model: selectedModel,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, partialMessage]);
    }
    setStreamingMessage('');
    setIsStreaming(false);
    if (refreshUserData) refreshUserData();
  };

  const currentChatCostUSD = messages.reduce((acc, msg) => {
    return acc + (msg.cost?.totalCostUSD || msg.costUSD?.totalCost || 0);
  }, 0);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-paper text-ink font-mono selection:bg-signal selection:text-paper">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        onOpenPricing={() => setIsPricingOpen(true)}
      />

      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedModel={selectedModel}
          onOpenPricing={() => setIsPricingOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          currentChatCostUSD={currentChatCostUSD}
          backendStatus={backendHealth?.status}
        />

        <main className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] overflow-hidden bg-paper">
          {activeTab === 'chat' ? (
            <ChatView
              messages={messages}
              streamingMessage={streamingMessage}
              isStreaming={isStreaming}
              onSendMessage={handleSendMessage}
              onStopStreaming={handleStopStreaming}
              selectedModel={selectedModel}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          ) : (
            <CostDashboard exchangeRate={exchangeRate} />
          )}
        </main>
      </div>

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        systemInstruction={systemInstruction}
        setSystemInstruction={setSystemInstruction}
        generationConfig={generationConfig}
        setGenerationConfig={setGenerationConfig}
        exchangeRate={exchangeRate}
        setExchangeRate={setExchangeRate}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
}
