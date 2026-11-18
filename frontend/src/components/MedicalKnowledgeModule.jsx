import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Award,
  Layers
} from 'lucide-react';
import { healthcareApi } from '../api/healthcareApi';

const DEFAULT_QUERIES = [
  'warning signs myocardial infarction',
  'fast protocol stroke acute tpa',
  'diabetes diagnosis hba1c criteria',
  'hypertension dash diet guidelines',
  'anaphylaxis epipen emergency protocol'
];

export default function MedicalKnowledgeModule() {
  const [query, setQuery] = useState('warning signs myocardial infarction');
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    handleSearch();
  }, [selectedCategory]);

  const handleSearch = async (overrideQuery = null) => {
    const q = overrideQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    try {
      const data = await healthcareApi.searchKnowledge(q, selectedCategory);
      setResults(data.results || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Knowledge search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Search className="h-5 w-5 text-cyan-400" />
            <span>Semantic Medical Knowledge & Clinical Literature Search</span>
          </h2>
          <p className="text-xs text-slate-400">
            Vectorized retrieval across the MedQuAD QA corpus, NIH Institutes, CDC, and WHO peer-reviewed medical guidance.
          </p>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex items-center space-x-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search medical Q&A, clinical guidelines, lab values (e.g. 'HbA1c thresholds for diabetes')..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 transition"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span>Search</span>
          </button>
        </form>

        {/* Quick Sample Queries */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-slate-400 whitespace-nowrap">Suggested Queries:</span>
          {DEFAULT_QUERIES.map((dq, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(dq);
                handleSearch(dq);
              }}
              className="shrink-0 rounded-lg border border-slate-800 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 transition"
            >
              {dq}
            </button>
          ))}
        </div>
      </div>

      {/* Results Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Found {total} matched clinical knowledge passages</span>
          <span className="flex items-center space-x-1 font-mono text-[11px] text-cyan-400">
            <Layers className="h-3.5 w-3.5" />
            <span>TF-IDF & Dense Cosine Similarity</span>
          </span>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center text-xs text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin text-cyan-400 mx-auto mb-2" />
            <span>Retrieving high-affinity medical passages...</span>
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center text-xs text-slate-400">
            No matching medical documents found for your search terms.
          </div>
        ) : (
          results.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="rounded bg-cyan-950 border border-cyan-800/60 px-2 py-0.5 text-xs font-mono font-bold text-cyan-300">
                    {item.category || 'Clinical Guidance'}
                  </span>
                  <span className="text-sm font-bold text-white">{item.title}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-mono text-cyan-400 border border-slate-700">
                    Relevance: {item.relevance_score}%
                  </span>
                  {item.urgency === 'Emergency' && (
                    <span className="rounded-full bg-rose-950/70 border border-rose-500/50 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                      Emergency
                    </span>
                  )}
                </div>
              </div>

              <div className="text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                {item.content}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <Award className="h-3.5 w-3.5 text-cyan-400" />
                  <span>
                    <strong>Authoritative Source:</strong> {item.source}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">ID: {item.id}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
