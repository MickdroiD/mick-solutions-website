'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  Bot,
  User,
  Minimize2,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';

// ============================================
// TYPES
// ============================================

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  siteName?: string;
  industry?: string;
  services?: string[];
  welcomeMessage?: string;
  placeholder?: string;
  avatarUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  position?: 'bottom-right' | 'bottom-left';
  provider?: 'openai' | 'anthropic';
  systemPrompt?: string;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function AIAssistant({
  siteName = 'Mon Site',
  industry,
  services = [],
  welcomeMessage = 'Bonjour ! Comment puis-je vous aider ?',
  placeholder = 'Posez votre question...',
  avatarUrl,
  primaryColor = '#06b6d4',
  accentColor = '#a855f7',
  position = 'bottom-right',
  provider = 'openai',
  systemPrompt,
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  // ============================================
  // ENVOI DE MESSAGE
  // ============================================

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: input.trim() },
          ],
          provider,
          systemPrompt,
          siteContext: {
            siteName,
            industry,
            services,
          },
        }),
      });

      const data = await response.json();

      if (data.content) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.content,
            timestamp: new Date(),
          },
        ]);
      } else {
        throw new Error(data.error || 'Erreur de réponse');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // POSITION STYLES
  // ============================================

  const positionClass =
    position === 'bottom-right' ? 'right-4 bottom-4' : 'left-4 bottom-4';

  // ============================================
  // RENDER FLOATING BUTTON
  // ============================================

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed ${positionClass} z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all`}
        style={{
          background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
        }}
      >
        <MessageSquare className="w-6 h-6 text-white" />
        <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
      </motion.button>
    );
  }

  // ============================================
  // RENDER CHAT WINDOW
  // ============================================

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          height: isMinimized ? 'auto' : undefined,
        }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className={`fixed ${positionClass} z-50 w-[360px] ${
          isMinimized ? '' : 'h-[500px]'
        } bg-slate-900 rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b border-white/10"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}20, ${accentColor}20)`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="AI"
                  width={40}
                  height={40}
                  className="w-full h-full rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <Bot className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">
                Assistant {siteName}
              </h3>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-slate-400 text-xs">En ligne</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-cyan-500 text-white rounded-tr-none'
                        : 'bg-white/10 text-white rounded-tl-none'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.role === 'assistant' && (
                        <Sparkles className="w-4 h-4 mt-0.5 text-cyan-400 flex-shrink-0" />
                      )}
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      {message.role === 'user' && (
                        <User className="w-4 h-4 mt-0.5 text-white/70 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                      <span className="text-slate-400 text-sm">
                        En train de réfléchir...
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={placeholder}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all text-sm"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="p-3 rounded-xl bg-cyan-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-400 transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-center text-slate-600 text-xs mt-2">
                Propulsé par l&apos;IA
              </p>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

