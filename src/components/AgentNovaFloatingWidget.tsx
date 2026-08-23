import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { 
  Bot, 
  X, 
  Send, 
  Maximize2, 
  Sparkles, 
  RefreshCw, 
  Check, 
  Copy,
  Lightbulb
} from 'lucide-react';
import { UserProfile, Memory, ChatMessage } from '../types';
import { api } from '../services/api';

interface AgentNovaFloatingWidgetProps {
  user: UserProfile | null;
  memories: Memory[];
  onExpandToFullChat: () => void;
  theme?: 'dark' | 'light';
}

export const AgentNovaFloatingWidget: React.FC<AgentNovaFloatingWidgetProps> = ({
  user,
  memories,
  onExpandToFullChat,
  theme = 'dark'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isDark = theme === 'dark';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_float_init',
      sender: 'nova',
      text: `Hi **${user?.name || 'there'}**! I'm **Agent Nova**, your AI Career Coach. 

Ask me anything about internships, skill roadmaps, resume tips, or interview prep!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedQuestions: [
        'How do I prepare for AI/ML interviews?',
        'What projects should I build for my resume?'
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (customText?: string) => {
    const query = (customText || inputQuery).trim();
    if (!query || isLoading) return;

    const userMessageId = `msg_user_${Date.now()}`;
    const newUserMsg: ChatMessage = {
      id: userMessageId,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setInputQuery('');
    setIsLoading(true);

    try {
      const apiMessages = updatedMessages.map(m => ({
        role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.text
      }));

      const res = await api.chatWithAgentNova(user?.id || 'usr_rahul_001', apiMessages);

      const novaMessageId = `msg_nova_${Date.now()}`;
      const newNovaMsg: ChatMessage = {
        id: novaMessageId,
        sender: 'nova',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: res.suggestedQuestions || []
      };

      setMessages(prev => [...prev, newNovaMsg]);
    } catch (err: any) {
      console.error('Floating chat error:', err);
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'nova',
        text: "I ran into a quick timeout. You can ask again or expand to full chat!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
        suggestedQuestions: ['What skills should I prioritize this semester?']
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Drawer / Popover Window */}
      {isOpen && (
        <div className={`mb-3 w-[360px] sm:w-[420px] h-[520px] rounded-2xl border shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
          isDark 
            ? 'bg-slate-900 border-indigo-900/60 shadow-slate-950/80 text-white' 
            : 'bg-white border-indigo-100 shadow-xl text-slate-900'
        }`}>
          {/* Drawer Header */}
          <div className={`px-4 py-3 border-b flex items-center justify-between ${
            isDark 
              ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-slate-800' 
              : 'bg-gradient-to-r from-indigo-50 to-cyan-50 border-indigo-100'
          }`}>
            <div className="flex items-center space-x-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isDark ? 'bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white' : 'bg-indigo-600 text-white'
              }`}>
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-sm font-bold">Agent Nova</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  AI Career Coach • Synced
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                id="expand-chat-btn"
                onClick={() => {
                  setIsOpen(false);
                  onExpandToFullChat();
                }}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-white'
                }`}
                title="Expand to Full Agent Nova Chat"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                id="close-chat-floating-btn"
                onClick={() => setIsOpen(false)}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-white'
                }`}
                title="Close chat overlay"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className={`flex-1 p-3.5 overflow-y-auto space-y-4 text-xs ${
            isDark ? 'bg-slate-900/60' : 'bg-slate-50/50'
          }`}>
            {messages.map((msg) => {
              const isNova = msg.sender === 'nova';
              return (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${isNova ? 'items-start' : 'items-end'}`}
                >
                  <div className={`p-3 rounded-2xl max-w-[88%] leading-relaxed ${
                    isNova 
                      ? isDark 
                        ? 'bg-slate-800 border border-slate-700 text-slate-200 shadow-xs' 
                        : 'bg-white border border-slate-200 text-slate-800 shadow-xs'
                      : 'bg-indigo-600 text-white'
                  }`}>
                    {isNova ? (
                      <div className="markdown-body space-y-1.5 text-xs font-normal">
                        <Markdown
                          components={{
                            h3: ({ children }) => <strong className="block text-xs font-bold text-cyan-300 mt-1 mb-0.5">{children}</strong>,
                            h4: ({ children }) => <strong className="block text-xs font-semibold text-indigo-300 mt-1">{children}</strong>,
                            ul: ({ children }) => <ul className="list-disc pl-4 space-y-0.5 my-1">{children}</ul>,
                            li: ({ children }) => <li>{children}</li>,
                            p: ({ children }) => <p className="my-1">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>
                          }}
                        >
                          {msg.text}
                        </Markdown>
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleCopyText(msg.id, msg.text)}
                            className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center space-x-1"
                          >
                            {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>

                  {/* Suggestion Chips */}
                  {isNova && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1 max-w-[90%]">
                      {msg.suggestedQuestions.map((sq, sqIdx) => (
                        <button
                          key={sqIdx}
                          onClick={() => handleSendMessage(sq)}
                          className={`text-[10px] px-2 py-1 rounded-full border transition-colors text-left ${
                            isDark 
                              ? 'bg-slate-800/80 text-slate-300 hover:text-cyan-300 border-slate-700 hover:border-cyan-700' 
                              : 'bg-white text-slate-600 hover:text-indigo-600 border-slate-200 hover:border-indigo-200'
                          }`}
                        >
                          💡 {sq}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center space-x-2 text-xs text-indigo-400 p-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Agent Nova is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className={`p-2.5 border-t ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                id="floating-chat-input"
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder="Ask Agent Nova..."
                className={`flex-1 bg-transparent px-3 py-1.5 text-xs focus:outline-none ${
                  isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'
                }`}
              />
              <button
                id="floating-chat-send-btn"
                onClick={() => handleSendMessage()}
                disabled={!inputQuery.trim() || isLoading}
                className={`p-2 rounded-xl text-white transition-all ${
                  !inputQuery.trim() || isLoading
                    ? 'opacity-40 bg-slate-700'
                    : isDark ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          id="open-agent-nova-floating-btn"
          onClick={() => setIsOpen(true)}
          className={`flex items-center space-x-2.5 px-4 py-3 rounded-full shadow-2xl border transition-all duration-300 group hover:scale-105 ${
            isDark 
              ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 text-white border-indigo-400/40 shadow-indigo-950/80 hover:shadow-indigo-500/20' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-400 shadow-indigo-300'
          }`}
          title="Chat with Agent Nova AI Coach"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
            </span>
          </div>
          <span className="text-xs font-bold tracking-wide">Ask Agent Nova</span>
          <Sparkles className="w-3.5 h-3.5 text-cyan-300 opacity-90 group-hover:rotate-12 transition-transform" />
        </button>
      )}
    </div>
  );
};
