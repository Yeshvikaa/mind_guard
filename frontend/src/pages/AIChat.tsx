import React, { useEffect, useRef, useState } from 'react';
import { api } from '../context/AuthContext';
import { 
  Send, Sparkles, AlertTriangle, ShieldAlert,
  Loader, History, Plus, Brain, MessageSquare
} from 'lucide-react';
import { EmergencyCountdown } from '../components/EmergencyCountdown';

interface Message {
  sender: 'user' | 'ai';
  content: string;
  sentimentScore?: number;
  timestamp: string;
}

interface ChatSession {
  _id: string;
  stressScore: number;
  category: 'Low' | 'Medium' | 'High' | 'Critical';
  updatedAt: string;
  messages: Message[];
}

// Simple Markdown Formatter Helper
const renderMarkdown = (text: string) => {
  if (!text) return '';
  // Convert double asterisks to bold
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Convert single asterisks to italic
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Convert line breaks to <br />
  formatted = formatted.replace(/\n/g, '<br />');
  return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
};

export const AIChat: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Emergency Alert Overlay triggers
  const [countdownOpen, setCountdownOpen] = useState(false);
  const [countdownScore, setCountdownScore] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadSessions = async (autoSelect = true) => {
    try {
      const res = await api.get('/chats');
      if (res.data.success) {
        setSessions(res.data.chats);
        if (autoSelect && res.data.chats.length > 0) {
          setActiveSession(res.data.chats[0]);
          setMessages(res.data.chats[0].messages);
        }
      }
    } catch (err) {
      console.warn('Failed to load chat sessions', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    loadSessions(true);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startNewSession = async () => {
    try {
      const res = await api.post('/chats');
      if (res.data.success) {
        setSessions(prev => [res.data.chat, ...prev]);
        setActiveSession(res.data.chat);
        setMessages([]);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const handleSelectSession = (session: ChatSession) => {
    setActiveSession(session);
    setMessages(session.messages);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeSession || sending) return;

    const userText = inputValue;
    setInputValue('');
    setSending(true);

    // Push local placeholder
    const userMsg: Message = { sender: 'user', content: userText, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await api.post(`/chats/${activeSession._id}/messages`, { content: userText });
      if (res.data.success) {
        const updatedChat = res.data.chat;
        setMessages(updatedChat.messages);
        
        // Update list stress score immediately
        setSessions(prev => prev.map(s => s._id === updatedChat._id ? updatedChat : s));
        setActiveSession(updatedChat);

        // Check if stress is Critical to launch countdown
        const { score, category } = res.data.analysis;
        if (category === 'Critical') {
          setCountdownScore(score);
          setCountdownOpen(true);
        }
      }
    } catch (error) {
      console.error('Failed to post chat message', error);
    } finally {
      setSending(false);
    }
  };

  const stressColorTextMap = {
    Low: 'text-emerald-500',
    Medium: 'text-amber-500',
    High: 'text-orange-500',
    Critical: 'text-red-500 animate-pulse font-extrabold'
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] border-t border-slate-100 dark:border-dark-800">
      {/* Sessions Sidebar list */}
      <div className="w-80 bg-white dark:bg-dark-900 border-r border-slate-200 dark:border-dark-800 flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-dark-800">
          <button
            onClick={startNewSession}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition shadow-lg shadow-brand-500/10"
          >
            <Plus className="w-4 h-4" /> Start New Counseling
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Therapy History
          </span>

          {loadingSessions ? (
            <div className="p-4 text-center text-slate-400 text-xs">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="p-4 text-center text-slate-400 text-xs">No active sessions. Start one above.</div>
          ) : (
            sessions.map(s => {
              const lastMsg = s.messages[s.messages.length - 1]?.content || 'Empty Session';
              return (
                <button
                  key={s._id}
                  onClick={() => handleSelectSession(s)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                    activeSession?._id === s._id
                      ? 'bg-brand-50/50 dark:bg-brand-950/15 border-brand-500/30'
                      : 'border-slate-150 dark:border-dark-850 hover:bg-slate-50 dark:hover:bg-dark-800/50'
                  }`}
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-semibold text-xs text-slate-400 dark:text-dark-500">
                      {new Date(s.updatedAt).toLocaleDateString()}
                    </span>
                    <span className={`text-xs font-bold ${stressColorTextMap[s.category]}`}>
                      Score: {s.stressScore}%
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-white truncate mt-1.5 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    {lastMsg}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main chat interface */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-dark-950">
        {activeSession ? (
          <>
            {/* Top header stats bar */}
            <div className="p-4 bg-white dark:bg-dark-900 border-b border-slate-200 dark:border-dark-800 flex justify-between items-center px-6">
              <div className="flex items-center gap-3">
                <div className="bg-brand-100 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 p-2.5 rounded-xl">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">MindGuard AI Wellness Coach</h3>
                  <p className="text-xs text-slate-400">Empathy-driven therapeutic counsel</p>
                </div>
              </div>

              {/* Stress indicators gauge */}
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-dark-950 p-2 rounded-2xl border border-slate-150 dark:border-dark-800 px-4">
                <span className="text-xs font-bold text-slate-500">Live Stress Index:</span>
                <span className={`text-sm font-black ${stressColorTextMap[activeSession.category]}`}>
                  {activeSession.stressScore}% ({activeSession.category})
                </span>
              </div>
            </div>

            {/* Messages box */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="max-w-md mx-auto text-center space-y-4 py-16">
                  <div className="w-12 h-12 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6 animate-pulse-slow" />
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white">Start Your Wellness Conversation</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Say whatever is on your mind. You can share workload strain, emotional events, burnout fears, or just chat. Our AI coach is here to listen.
                  </p>
                </div>
              )}

              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xl p-4 rounded-3xl text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-brand-500 text-white rounded-tr-none shadow-md shadow-brand-500/10'
                        : 'bg-white dark:bg-dark-900 border border-slate-150 dark:border-dark-800/80 rounded-tl-none text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      <p>{msg.content}</p>
                    ) : (
                      renderMarkdown(msg.content)
                    )}
                    <span className={`text-[9px] block text-right mt-2 ${msg.sender === 'user' ? 'text-brand-200' : 'text-slate-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="p-4 rounded-3xl rounded-tl-none bg-white dark:bg-dark-900 border border-slate-150 dark:border-dark-800 text-slate-400 flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin text-brand-500" />
                    <span className="text-xs">MindGuard is reflecting...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <form onSubmit={handleSend} className="p-4 bg-white dark:bg-dark-900 border-t border-slate-200 dark:border-dark-800">
              <div className="relative max-w-4xl mx-auto flex items-center gap-2">
                <input
                  type="text"
                  required
                  disabled={sending}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  className="flex-1 pr-12 pl-5 py-4 rounded-2xl border border-slate-200 dark:border-dark-805 bg-slate-50/50 dark:bg-dark-950/50 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  placeholder="Tell me how you are feeling..."
                />
                <button
                  type="submit"
                  disabled={sending || !inputValue.trim()}
                  className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white p-3.5 rounded-xl transition shadow-lg shadow-brand-500/10 flex-shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            Please start a new counseling session or select one from the history panel.
          </div>
        )}
      </div>

      {/* Emergency Countdown overlay */}
      <EmergencyCountdown
        isOpen={countdownOpen}
        score={countdownScore}
        onCancel={() => setCountdownOpen(false)}
        onDispatchComplete={() => setCountdownOpen(false)}
      />
    </div>
  );
};
export default AIChat;
