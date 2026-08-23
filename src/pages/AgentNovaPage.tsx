import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  ArrowRight, 
  Brain, 
  User, 
  Lightbulb, 
  Compass, 
  Briefcase, 
  Code2, 
  GraduationCap,
  RefreshCw
} from 'lucide-react';
import { UserProfile, Memory, ChatMessage } from '../types';
import { api } from '../services/api';

interface AgentNovaPageProps {
  user: UserProfile | null;
  memories: Memory[];
  onNavigateToDashboardWithGoal?: (goal: string) => void;
  theme?: 'dark' | 'light';
}

const STARTER_PROMPTS = [
  {
    category: 'Career Strategy',
    icon: Compass,
    title: 'AI/ML Career Roadmap',
    prompt: 'What is a realistic 6-month roadmap for a 3rd-year engineering student to land an AI/ML internship in India?'
  },
  {
    category: 'Resume & Portfolio',
    icon: Code2,
    title: 'High-Impact Resume Projects',
    prompt: 'What full-stack AI projects will make my resume stand out to top tech recruiters and startups?'
  },
  {
    category: 'Interview Prep',
    icon: Briefcase,
    title: 'Amazon & Google Technical Prep',
    prompt: 'How should I structure my preparation for DSA, System Design basics, and CS fundamentals for upcoming internship seasons?'
  },
  {
    category: 'Research & Labs',
    icon: GraduationCap,
    title: 'Research Internships at IITs',
    prompt: 'How do I reach out to professors for summer research internships in machine learning and computer vision?'
  }
];

export const AgentNovaPage: React.FC<AgentNovaPageProps> = ({
  user,
  memories,
  onNavigateToDashboardWithGoal,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Initial welcome message from Agent Nova
    return [
      {
        id: 'msg_welcome',
        sender: 'nova',
        text: `### 👋 Hello! I'm Agent Nova, your AI Career Intelligence Mentor.

I have full contextual awareness of your student profile (**${user?.degree || 'B.Tech'} in ${user?.branch || 'CSE'}, Year ${user?.year || 3}**) and your **${memories.length} saved preferences in Memory Bank**.

You can ask me anything about:
* **Career path roadmaps** (AI/ML, Full Stack, Cloud, Research, Data Science)
* **High-impact resume projects & portfolio strategies**
* **Technical interview & DSA preparation blueprints**
* **Finding & evaluating internships and research fellowships**

What would you like to explore or strategize today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: [
          'What are the highest-demand skills for 2026 tech internships?',
          'How do I bridge my skill gaps for AI/ML roles?',
          'What projects should I build for my resume?'
        ]
      }
    ];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
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
      // Build conversation history for API
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
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'nova',
        text: "I experienced a brief connection hiccup. Here's a tactical suggestion based on your profile: keep practicing your core projects and check out upcoming deadlines in the Opportunities tab!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
        suggestedQuestions: [
          'What skills should I prioritize this semester?',
          'How do I crack technical interviews?',
          'What are top summer internships for 3rd year students?'
        ]
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

  const handleClearChat = () => {
    setMessages([
      {
        id: `msg_welcome_${Date.now()}`,
        sender: 'nova',
        text: `### 🔄 Chat cleared. I'm ready for your next career question!

Ask me anything about role roadmaps, interview tactics, or opportunity recommendations for your profile.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: [
          'How do I transition from beginner to advanced in AI/ML?',
          'What resume projects stand out for 3rd-year CS internships?',
          'What companies in Hyderabad hire for Python & ML?'
        ]
      }
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border transition-all duration-300 ${
        isDark 
          ? 'bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-indigo-900/40 shadow-xl' 
          : 'bg-gradient-to-r from-white via-indigo-50/50 to-white border-indigo-100 shadow-md'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center relative shadow-lg ${
              isDark 
                ? 'bg-gradient-to-br from-indigo-500 via-cyan-500 to-blue-600 text-white' 
                : 'bg-gradient-to-br from-indigo-600 to-cyan-600 text-white'
            }`}>
              <Bot className="w-8 h-8" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold tracking-tight">Agent Nova</h1>
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  isDark 
                    ? 'bg-cyan-950/80 text-cyan-400 border-cyan-800/60' 
                    : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                }`}>
                  AI Career Coach
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Personalized career guidance grounded in your profile, skills, and memory preferences
              </p>
            </div>
          </div>

          {/* Context Sync Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border ${
              isDark 
                ? 'bg-slate-800/80 text-slate-300 border-slate-700/80' 
                : 'bg-white text-slate-700 border-slate-200'
            }`}>
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>{user?.name || 'Student'} ({user?.branch || 'CSE'}, Year {user?.year || 3})</span>
            </div>

            <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border ${
              isDark 
                ? 'bg-slate-800/80 text-cyan-300 border-slate-700/80' 
                : 'bg-white text-cyan-700 border-slate-200'
            }`}>
              <Brain className="w-3.5 h-3.5 text-cyan-400" />
              <span>{memories.length} Memories Synced</span>
            </div>

            <button
              id="clear-chat-btn"
              onClick={handleClearChat}
              className={`p-2 rounded-xl border text-xs font-medium transition-colors ${
                isDark 
                  ? 'bg-slate-800/80 text-slate-400 hover:text-rose-400 border-slate-700/80 hover:border-rose-900/50' 
                  : 'bg-white text-slate-500 hover:text-rose-600 border-slate-200 hover:border-rose-200'
              }`}
              title="Clear chat history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Starter Prompts Grid (Shown when conversation is short) */}
      {messages.length <= 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {STARTER_PROMPTS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                id={`starter-prompt-${idx}`}
                onClick={() => handleSendMessage(item.prompt)}
                className={`p-4 rounded-xl border text-left transition-all duration-200 group flex items-start space-x-3.5 ${
                  isDark 
                    ? 'bg-slate-900/60 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/60' 
                    : 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 shadow-xs'
                }`}
              >
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  isDark 
                    ? 'bg-indigo-950/70 text-indigo-400 group-hover:bg-indigo-900/70' 
                    : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      isDark ? 'text-indigo-400' : 'text-indigo-600'
                    }`}>
                      {item.category}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
                  </div>
                  <h4 className={`text-xs font-semibold mt-0.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {item.title}
                  </h4>
                  <p className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {item.prompt}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Chat Messages Log */}
      <div className={`p-4 sm:p-6 rounded-2xl border min-h-[450px] space-y-6 ${
        isDark ? 'bg-slate-900/40 border-slate-800/80' : 'bg-slate-50/50 border-slate-200/80 shadow-inner'
      }`}>
        {messages.map((msg) => {
          const isNova = msg.sender === 'nova';

          return (
            <div 
              key={msg.id}
              className={`flex items-start space-x-3.5 ${isNova ? '' : 'flex-row-reverse space-x-reverse'}`}
            >
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                isNova 
                  ? isDark 
                    ? 'bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white' 
                    : 'bg-indigo-600 text-white'
                  : isDark 
                    ? 'bg-slate-700 text-slate-200' 
                    : 'bg-slate-300 text-slate-800'
              }`}>
                {isNova ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>

              {/* Message Bubble Container */}
              <div className={`flex-1 max-w-3xl space-y-2`}>
                <div className="flex items-center space-x-2 px-1">
                  <span className="text-xs font-bold">
                    {isNova ? 'Agent Nova' : (user?.name || 'You')}
                  </span>
                  <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                <div className={`p-4 sm:p-5 rounded-2xl border text-sm leading-relaxed ${
                  isNova 
                    ? isDark 
                      ? 'bg-slate-800/90 border-slate-700/80 text-slate-200 shadow-md' 
                      : 'bg-white border-slate-200 text-slate-800 shadow-xs'
                    : isDark 
                      ? 'bg-indigo-600 text-white border-indigo-500' 
                      : 'bg-indigo-600 text-white border-indigo-600'
                }`}>
                  {isNova ? (
                    <div className="markdown-body space-y-3 font-normal leading-relaxed text-sm">
                      <Markdown
                        components={{
                          h3: ({ children }) => (
                            <h3 className={`text-base font-bold pb-1 border-b mb-2 ${
                              isDark ? 'text-cyan-300 border-slate-700' : 'text-indigo-900 border-slate-200'
                            }`}>
                              {children}
                            </h3>
                          ),
                          h4: ({ children }) => (
                            <h4 className={`text-sm font-semibold mt-3 mb-1 ${
                              isDark ? 'text-indigo-300' : 'text-indigo-800'
                            }`}>
                              {children}
                            </h4>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-5 space-y-1 my-2">
                              {children}
                            </ul>
                          ),
                          li: ({ children }) => (
                            <li className={`text-xs sm:text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {children}
                            </li>
                          ),
                          p: ({ children }) => (
                            <p className="my-1.5 leading-relaxed">{children}</p>
                          ),
                          strong: ({ children }) => (
                            <strong className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {children}
                            </strong>
                          ),
                          code: ({ children }) => (
                            <code className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                              isDark ? 'bg-slate-900 text-cyan-300' : 'bg-slate-100 text-indigo-700'
                            }`}>
                              {children}
                            </code>
                          )
                        }}
                      >
                        {msg.text}
                      </Markdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  )}

                  {/* Nova Action Toolbar */}
                  {isNova && (
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-700/50">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className={`flex items-center space-x-1 text-[11px] px-2 py-1 rounded-md transition-colors ${
                            isDark 
                              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60' 
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Answer</span>
                            </>
                          )}
                        </button>
                      </div>

                      {onNavigateToDashboardWithGoal && (
                        <button
                          onClick={() => onNavigateToDashboardWithGoal(msg.text.slice(0, 120))}
                          className={`flex items-center space-x-1 text-[11px] px-2.5 py-1 rounded-lg font-medium border transition-colors ${
                            isDark 
                              ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60 hover:bg-indigo-900/80' 
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                          }`}
                          title="Search opportunities matching this advice"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-400" />
                          <span>Search Matching Roles</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Follow-up Suggested Question Chips */}
                {isNova && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="pt-1 space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-[11px] font-medium text-slate-400 px-1">
                      <Lightbulb className="w-3 h-3 text-amber-400" />
                      <span>Suggested follow-up questions:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {msg.suggestedQuestions.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => handleSendMessage(q)}
                          className={`text-xs px-3 py-1.5 rounded-full border text-left transition-all duration-150 ${
                            isDark 
                              ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border-slate-700/80 hover:border-cyan-700/60' 
                              : 'bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border-slate-200 hover:border-indigo-300 shadow-2xs'
                          }`}
                        >
                          💬 {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start space-x-3.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isDark ? 'bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white' : 'bg-indigo-600 text-white'
            }`}>
              <Bot className="w-5 h-5" />
            </div>
            <div className={`p-4 rounded-2xl border text-sm max-w-md ${
              isDark ? 'bg-slate-800/80 border-slate-700/80 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              <div className="flex items-center space-x-2 text-xs">
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                <span className="font-medium text-indigo-400">Agent Nova is analyzing your career question...</span>
              </div>
              <div className="flex space-x-1.5 mt-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className={`p-3 rounded-2xl border shadow-lg transition-all duration-200 ${
        isDark 
          ? 'bg-slate-900 border-slate-800 focus-within:border-indigo-500/80 shadow-slate-950/50' 
          : 'bg-white border-slate-200 focus-within:border-indigo-400 shadow-slate-200/50'
      }`}>
        <div className="flex items-center space-x-3">
          <input
            ref={inputRef}
            id="agent-nova-chat-input"
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Ask Agent Nova anything about your career path, interview prep, or project ideas..."
            className={`flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none placeholder:text-xs sm:placeholder:text-sm ${
              isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'
            }`}
          />

          <button
            id="agent-nova-send-btn"
            onClick={() => handleSendMessage()}
            disabled={!inputQuery.trim() || isLoading}
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm flex items-center space-x-1.5 transition-all duration-200 shadow-md ${
              !inputQuery.trim() || isLoading
                ? 'opacity-50 cursor-not-allowed bg-slate-700 text-slate-400'
                : isDark 
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-indigo-900/30' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
            }`}
          >
            <span>Ask Nova</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
