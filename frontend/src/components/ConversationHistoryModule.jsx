import React, { useState, useEffect } from 'react';
import {
  History,
  MessageSquare,
  Trash2,
  Download,
  Calendar,
  ExternalLink,
  Search,
  Plus
} from 'lucide-react';
import { healthcareApi } from '../api/healthcareApi';

export default function ConversationHistoryModule({ onResumeSession }) {
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await healthcareApi.getChatSessions();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this consultation transcript?')) return;
    try {
      await healthcareApi.deleteChatSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const filtered = sessions.filter((s) =>
    s.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <History className="h-5 w-5 text-cyan-400" />
              <span>Medical Consultation Transcript History</span>
            </h2>
            <p className="text-xs text-slate-400">
              Audit, review, export, or resume previously recorded healthcare AI interactions.
            </p>
          </div>

          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversation transcripts..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center text-xs text-slate-400">
            Loading consultation history...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center text-xs text-slate-400">
            No past consultations found.
          </div>
        ) : (
          filtered.map((s) => (
            <div
              key={s.id}
              onClick={() => onResumeSession(s.id)}
              className="cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3 hover:border-cyan-500/50 hover:bg-slate-900 transition shadow-lg group"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 text-xs text-slate-500 font-mono">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(s.created_at).toLocaleDateString()}</span>
                </span>
                <span className="rounded-full bg-cyan-950 border border-cyan-800/60 px-2.5 py-0.5 text-[10px] font-mono text-cyan-300">
                  {s.message_count} messages
                </span>
              </div>

              <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition line-clamp-2">
                {s.title}
              </h4>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-cyan-400 font-semibold flex items-center space-x-1">
                  <span>Resume Session</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </span>

                <button
                  onClick={(e) => handleDelete(s.id, e)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                  title="Delete Session"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
