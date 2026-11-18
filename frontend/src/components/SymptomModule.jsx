import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Stethoscope,
  Sparkles,
  Search,
  Plus,
  X,
  RefreshCw,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { healthcareApi } from '../api/healthcareApi';

const PRESET_SCENARIOS = [
  {
    label: 'Suspected Respiratory Infection',
    text: 'I have had a high fever, persistent dry cough, sore throat, and shortness of breath for 3 days',
    symptoms: ['high_fever', 'cough', 'throat_irritation', 'breathlessness']
  },
  {
    label: 'Acute Cardiac Warning Signs',
    text: 'Crushing chest pain radiating to left arm, sweating, nausea, and severe breathlessness',
    symptoms: ['chest_pain', 'breathlessness', 'sweating', 'nausea']
  },
  {
    label: 'Neurological Migraine Episode',
    text: 'Severe throbbing headache, blurred vision, dizziness, and extreme nausea with light sensitivity',
    symptoms: ['headache', 'blurred_and_distorted_vision', 'dizziness', 'nausea']
  },
  {
    label: 'Gastroenteritis Symptoms',
    text: 'Continuous stomach pain, vomiting, diarrhea, dehydration, and mild chills',
    symptoms: ['stomach_pain', 'vomiting', 'diarrhoea', 'dehydration', 'chills']
  }
];

export default function SymptomModule() {
  const [naturalText, setNaturalText] = useState('');
  const [catalog, setCatalog] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      setCatalogLoading(true);
      const data = await healthcareApi.getSymptomCatalog();
      setCatalog(data);
      if (data.length > 0) setActiveCategory(data[0].category);
    } catch (err) {
      console.error('Failed to load symptom catalog:', err);
    } finally {
      setCatalogLoading(false);
    }
  };

  const handleApplyPreset = (preset) => {
    setNaturalText(preset.text);
    setSelectedSymptoms(preset.symptoms);
  };

  const toggleSymptom = (symptomId) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((s) => s !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleRunAnalysis = async () => {
    if (!naturalText.trim() && selectedSymptoms.length === 0) return;

    setLoading(true);
    try {
      const result = await healthcareApi.analyzeSymptoms({
        natural_text: naturalText,
        selected_symptoms: selectedSymptoms
      });
      setAnalysisResult(result);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTriageBadge = (level) => {
    if (!level) return null;
    if (level.includes('Emergency') || level.includes('Red')) {
      return (
        <span className="flex items-center space-x-1.5 rounded-lg border border-rose-500/50 bg-rose-950/60 px-3 py-1 text-xs font-bold text-rose-300">
          <AlertOctagon className="h-4 w-4 text-rose-400" />
          <span>TRIAGE RED: IMMEDIATE EMERGENCY EVALUATION</span>
        </span>
      );
    }
    if (level.includes('Urgent') || level.includes('Yellow')) {
      return (
        <span className="flex items-center space-x-1.5 rounded-lg border border-amber-500/50 bg-amber-950/60 px-3 py-1 text-xs font-bold text-amber-300">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <span>TRIAGE YELLOW: URGENT CLINICAL REVIEW</span>
        </span>
      );
    }
    return (
      <span className="flex items-center space-x-1.5 rounded-lg border border-emerald-500/50 bg-emerald-950/60 px-3 py-1 text-xs font-bold text-emerald-300">
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        <span>TRIAGE GREEN: ROUTINE PRIMARY CARE CONSULTATION</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Preset Scenarios */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Activity className="h-5 w-5 text-cyan-400" />
              <span>Multi-Condition Symptom Analysis & Clinical Triage</span>
            </h2>
            <p className="text-xs text-slate-400">
              Input symptoms in plain language or select from anatomical clusters. Powered by a 42-disease Random Forest Classifier.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-400">Quick Test Scenarios:</span>
            <div className="flex flex-wrap gap-2">
              {PRESET_SCENARIOS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(p)}
                  className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 hover:border-cyan-500/60 hover:text-cyan-300 transition"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Natural Language Narrative Input */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>1. Describe Your Symptoms in Natural Language:</span>
            <span className="text-[11px] font-normal text-slate-500">
              NLP Engine will extract clinical terms automatically
            </span>
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={naturalText}
              onChange={(e) => setNaturalText(e.target.value)}
              placeholder="e.g. 'I woke up with a pounding headache on one side of my head, sensitivity to lights, and mild nausea...'"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Anatomical Body System Symptom Picker */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-3">
          2. Select or Fine-Tune Symptoms by Anatomical System:
        </label>

        {/* Category Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 mb-4 scrollbar-thin scrollbar-thumb-slate-800">
          {catalog.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(cat.category)}
              className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-medium transition ${
                activeCategory === cat.category
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'border border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.category} ({cat.symptoms.length})
            </button>
          ))}
        </div>

        {/* Symptoms Grid */}
        {activeCategory && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {catalog
              .find((c) => c.category === activeCategory)
              ?.symptoms.map((sym) => {
                const isSelected = selectedSymptoms.includes(sym.id);
                return (
                  <button
                    key={sym.id}
                    onClick={() => toggleSymptom(sym.id)}
                    className={`flex items-center justify-between rounded-lg border p-2 text-xs transition ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-950/50 text-cyan-200 font-semibold shadow-sm'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <span className="truncate">{sym.name}</span>
                    {isSelected ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0 ml-1" />
                    ) : (
                      <Plus className="h-3.5 w-3.5 text-slate-600 shrink-0 ml-1" />
                    )}
                  </button>
                );
              })}
          </div>
        )}

        {/* Selected Symptoms Chips Bar */}
        {selectedSymptoms.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
              <span>Active Selected Symptoms ({selectedSymptoms.length}):</span>
              <button
                onClick={() => setSelectedSymptoms([])}
                className="text-xs text-rose-400 hover:underline"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedSymptoms.map((symId) => (
                <span
                  key={symId}
                  className="flex items-center space-x-1 rounded-lg border border-cyan-500/40 bg-cyan-950/60 px-2.5 py-1 text-xs text-cyan-300"
                >
                  <span>{symId.replace(/_/g, ' ').toUpperCase()}</span>
                  <button
                    onClick={() => toggleSymptom(symId)}
                    className="hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Analyze Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleRunAnalysis}
            disabled={loading || (!naturalText.trim() && selectedSymptoms.length === 0)}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 transition"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Running Machine Learning Differential...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Analyze Symptoms & Predict Conditions</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results Section */}
      {analysisResult && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl space-y-6">
          {/* Header & Triage Badge */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Clinical Pattern Matching Results</span>
              </h3>
              <p className="text-xs text-slate-400">
                Identified {analysisResult.extracted_symptoms?.length || 0} symptom signals
              </p>
            </div>
            <div>{getTriageBadge(analysisResult.triage_level)}</div>
          </div>

          {/* Emergency Alert if present */}
          {analysisResult.emergency_warning && (
            <div className="rounded-xl border border-rose-500/50 bg-rose-950/40 p-4 text-xs font-medium text-rose-200 flex items-start space-x-3">
              <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-rose-300 block mb-1">IMMEDIATE ATTENTION REQUIRED:</strong>
                {analysisResult.emergency_warning}
              </div>
            </div>
          )}

          {/* Extracted Symptoms Tagged */}
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Recognized Symptom Features:
            </span>
            <div className="flex flex-wrap gap-2">
              {analysisResult.extracted_symptoms?.map((s, idx) => (
                <span
                  key={idx}
                  className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs text-slate-200"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Differential Diagnoses Cards */}
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
              Statistical Disease Differential (Top Possibilities):
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisResult.conditions?.map((cond, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{cond.condition}</span>
                    <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-mono font-bold text-cyan-300">
                      {cond.confidence}% Match
                    </span>
                  </div>

                  {/* Confidence Bar */}
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                      style={{ width: `${Math.min(100, cond.confidence)}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{cond.description}</p>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <Stethoscope className="h-3.5 w-3.5 text-cyan-400" />
                      <span>{cond.recommended_specialist}</span>
                    </div>
                    <span className="font-medium text-slate-300">{cond.severity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Disclaimer Box */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-300">Disclaimer:</strong> {analysisResult.medical_disclaimer}
          </div>
        </div>
      )}
    </div>
  );
}
