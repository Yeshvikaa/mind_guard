import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowLeft, Brain, Clock, User2, AlertTriangle } from 'lucide-react';

interface ChatSession {
  _id: string;
  stressScore: number;
  category: string;
  createdAt: string;
  updatedAt: string;
  aiNotes: string;
  messages: Array<{ sender: string; content: string; timestamp: string }>;
  user: {
    fullName: string;
    email: string;
    department: string;
    profilePhoto: string;
  };
}

export const ChatTranscripts: React.FC = () => {
  const [transcripts, setTranscripts] = useState<ChatSession[]>([]);
  const [selected, setSelected] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/admin/transcripts');
        if (res.data.success) setTranscripts(res.data.transcripts);
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const fetchDetail = async (id: string) => {
    try {
      const res = await api.get(`/admin/transcripts/${id}`);
      if (res.data.success) setSelected(res.data.chat);
    } catch (err) {
      console.warn(err);
    }
  };

  const stressColors: Record<string, string> = {
    Low: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20',
    Medium: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20',
    High: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20',
    Critical: 'text-red-500 bg-red-50 dark:bg-red-950/20 animate-pulse'
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] border-t border-slate-100 dark:border-dark-800">
      {/* Sidebar list */}
      <div className="w-80 bg-white dark:bg-dark-900 border-r border-slate-200 dark:border-dark-800 flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-dark-800 flex items-center gap-2">
          <button onClick={() => navigate('/admin')} className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800 text-slate-400">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">Chat Transcripts</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <div className="p-4 text-center text-slate-400 text-xs">Loading...</div>
          ) : transcripts.length === 0 ? (
            <div className="p-4 text-center text-slate-400 text-xs">No transcripts available.</div>
          ) : (
            transcripts.map(t => (
              <button
                key={t._id}
                onClick={() => fetchDetail(t._id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                  selected?._id === t._id
                    ? 'bg-brand-50/50 dark:bg-brand-950/15 border-brand-500/30'
                    : 'border-slate-150 dark:border-dark-850 hover:bg-slate-50 dark:hover:bg-dark-800/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <img
                    src={`http://localhost:5000${t.user?.profilePhoto}`}
                    className="w-7 h-7 rounded-full object-cover border border-slate-100"
                    alt=""
                    onError={e => { (e.target as HTMLImageElement).src = 'http://localhost:5000/uploads/default-avatar.png'; }}
                  />
                  <span className="font-bold text-xs text-slate-800 dark:text-white truncate">{t.user?.fullName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${stressColors[t.category] || ''}`}>
                    {t.category} · {t.stressScore}%
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {new Date(t.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Detail panel */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-dark-950 overflow-hidden">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-4">
            <MessageSquare className="w-10 h-10 text-slate-300 dark:text-dark-700" />
            <p className="text-sm">Select a transcript to view full session</p>
          </div>
        ) : (
          <>
            {/* Session header */}
            <div className="p-4 bg-white dark:bg-dark-900 border-b border-slate-200 dark:border-dark-800 flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <img
                  src={`http://localhost:5000${selected.user?.profilePhoto}`}
                  className="w-10 h-10 rounded-full object-cover border border-slate-100"
                  alt=""
                  onError={e => { (e.target as HTMLImageElement).src = 'http://localhost:5000/uploads/default-avatar.png'; }}
                />
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">{selected.user?.fullName}</h3>
                  <p className="text-xs text-slate-400">{selected.user?.department} · {selected.user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className={`text-sm font-black px-3 py-1 rounded-full ${stressColors[selected.category] || ''}`}>
                    {selected.category} — {selected.stressScore}%
                  </span>
                </div>
              </div>
            </div>

            {/* AI Notes bar */}
            {selected.aiNotes && (
              <div className="mx-6 mt-4 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/30 flex items-start gap-3">
                <Brain className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">AI Counselor Notes</p>
                  <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">{selected.aiNotes}</p>
                </div>
              </div>
            )}

            {/* Messages scroll area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selected.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-lg p-4 rounded-3xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-brand-500 text-white rounded-tr-none'
                      : 'bg-white dark:bg-dark-900 border border-slate-150 dark:border-dark-800 rounded-tl-none text-slate-800 dark:text-slate-200'
                  }`}>
                    <p>{msg.content}</p>
                    <span className={`text-[9px] block text-right mt-2 ${msg.sender === 'user' ? 'text-brand-200' : 'text-slate-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Read-only badge */}
            <div className="p-4 bg-white dark:bg-dark-900 border-t border-slate-200 dark:border-dark-800 text-center">
              <span className="text-xs text-slate-400 font-semibold flex items-center justify-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Transcript is read-only. Admin viewing mode active.
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default ChatTranscripts;
