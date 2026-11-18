import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Tag,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Pill,
  Heart,
  Activity,
  ChevronRight,
  Filter
} from 'lucide-react';
import { healthcareApi } from '../api/healthcareApi';

export default function DiseaseExplorerModule() {
  const [diseases, setDiseases] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiseases();
    fetchCategories();
  }, [selectedCategory, searchQuery]);

  const fetchDiseases = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      const data = await healthcareApi.getDiseases(params);
      setDiseases(data.diseases || []);
      if (!selectedDisease && data.diseases && data.diseases.length > 0) {
        setSelectedDisease(data.diseases[0]);
      }
    } catch (err) {
      console.error('Failed to load diseases:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await healthcareApi.getDiseaseCategories();
      setCategories(['All', ...(data.categories || [])]);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Category Filter Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-cyan-400" />
              <span>Comprehensive Clinical Pathology & Disease Explorer</span>
            </h2>
            <p className="text-xs text-slate-400">
              Evidence-based condition monographs, ICD-10 classifications, diagnostics, and therapeutics.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by disease, symptom, or ICD-10..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
          <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1 shrink-0">
            <Filter className="h-3.5 w-3.5 text-cyan-400" />
            <span>Specialty:</span>
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-lg px-3 py-1 text-xs font-medium transition ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'border border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Disease List */}
        <div className="lg:col-span-5 space-y-3 max-h-[700px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
          {loading ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center text-xs text-slate-400">
              Loading clinical pathology records...
            </div>
          ) : diseases.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center text-xs text-slate-400">
              No medical conditions matched your query.
            </div>
          ) : (
            diseases.map((d) => {
              const isSelected = selectedDisease?.icd10 === d.icd10;
              return (
                <div
                  key={d.icd10}
                  onClick={() => setSelectedDisease(d)}
                  className={`cursor-pointer rounded-xl border p-4 transition ${
                    isSelected
                      ? 'border-cyan-500 bg-slate-900 shadow-lg shadow-cyan-500/10'
                      : 'border-slate-800/80 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-white">{d.name}</span>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-cyan-400 border border-slate-700">
                      ICD-10: {d.icd10}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-2">{d.description}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-300">
                      {d.category}
                    </span>
                    <span
                      className={`font-medium ${
                        d.severity === 'Emergency' ? 'text-rose-400 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {d.severity}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Detailed Monograph View */}
        <div className="lg:col-span-7">
          {selectedDisease ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl space-y-6">
              {/* Header */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h3 className="text-xl font-bold text-white">{selectedDisease.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="rounded-lg bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs font-mono font-bold text-cyan-300">
                      ICD-10: {selectedDisease.icd10}
                    </span>
                    <span
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                        selectedDisease.severity === 'Emergency'
                          ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {selectedDisease.severity}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-cyan-400 font-medium">Specialty: {selectedDisease.category}</p>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  {selectedDisease.description}
                </p>
              </div>

              {/* Symptoms */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  <span>Cardinal Symptoms & Clinical Presentation:</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDisease.symptoms?.map((s, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Risk Factors */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  <span>Etiology & Predisposing Risk Factors:</span>
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                  {selectedDisease.risk_factors?.map((rf, idx) => (
                    <li key={idx}>{rf}</li>
                  ))}
                </ul>
              </div>

              {/* Prevention & Lifestyle */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Evidence-Based Prevention & Lifestyle Interventions:</span>
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                  {selectedDisease.prevention?.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>

              {/* General Treatment Approaches */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                  <Pill className="h-4 w-4 text-blue-400" />
                  <span>General Pharmacological & Clinical Management Approaches:</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDisease.treatments?.map((t, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg border border-blue-500/30 bg-blue-950/40 px-2.5 py-1 text-xs text-blue-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Reference */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>
                  <strong>Clinical Authority:</strong> {selectedDisease.reference}
                </span>
                <span className="flex items-center space-x-1 text-cyan-400">
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Peer-Reviewed</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center text-xs text-slate-400">
              Select a medical condition to explore its clinical monograph.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
