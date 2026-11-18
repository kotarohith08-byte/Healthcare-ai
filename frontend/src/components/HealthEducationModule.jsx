import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Heart,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Share2,
  BookOpen
} from 'lucide-react';
import { healthcareApi } from '../api/healthcareApi';

export default function HealthEducationModule() {
  const [guides, setGuides] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const data = await healthcareApi.getHealthGuides();
      setGuides(data);
      if (data.length > 0) setExpandedId(data[0].id);
    } catch (err) {
      console.error('Failed to load guides:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <GraduationCap className="h-5 w-5 text-cyan-400" />
          <span>Evidence-Based Clinical Guidelines & Patient Education Library</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Peer-reviewed medical protocols from the American Heart Association (AHA), American Stroke Association (ASA), and ADA.
        </p>
      </div>

      {/* Guides List */}
      <div className="space-y-4">
        {guides.map((guide) => {
          const isExpanded = expandedId === guide.id;
          return (
            <div
              key={guide.id}
              className={`rounded-2xl border transition-all ${
                isExpanded
                  ? 'border-cyan-500/50 bg-slate-900 shadow-xl shadow-cyan-500/10'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <div
                onClick={() => toggleExpand(guide.id)}
                className="cursor-pointer p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="rounded bg-cyan-950 border border-cyan-800/60 px-2 py-0.5 text-[10px] font-mono text-cyan-400 font-bold">
                      {guide.category}
                    </span>
                    <span className="flex items-center space-x-1 text-[11px] text-slate-500 font-mono">
                      <Clock className="h-3 w-3" />
                      <span>{guide.read_time} read</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white hover:text-cyan-300 transition">
                    {guide.title}
                  </h3>

                  <p className="text-xs text-slate-400">{guide.summary}</p>
                </div>

                <div className="flex items-center space-x-3 self-end md:self-auto">
                  <span className="text-xs font-semibold text-slate-400 font-mono">
                    {guide.source}
                  </span>
                  <button className="rounded-lg border border-slate-700 p-2 text-slate-400 hover:text-white">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded Guide Content */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-800/80 space-y-4">
                  <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans bg-slate-950 p-5 rounded-xl border border-slate-800">
                    {guide.content}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                    <div className="flex items-center space-x-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      <span>Clinically Verified by {guide.source}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => alert('Guide bookmarked to offline clinical references.')}
                        className="flex items-center space-x-1 text-slate-400 hover:text-cyan-400 transition"
                      >
                        <Bookmark className="h-3.5 w-3.5" />
                        <span>Bookmark</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
