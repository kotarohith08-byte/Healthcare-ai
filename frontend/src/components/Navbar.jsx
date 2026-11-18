import React from 'react';
import {
  AlertTriangle,
  Moon,
  Sun,
  ShieldCheck,
  PhoneCall,
  Bell,
  Stethoscope
} from 'lucide-react';

export default function Navbar({
  activeTab,
  theme,
  setTheme,
  isCollapsed,
  showDisclaimer,
  setShowDisclaimer
}) {
  const titles = {
    chatbot: 'AI Healthcare Conversational Assistant (RAG Grounded)',
    symptoms: 'Intelligent Symptom Analysis & Triage Engine',
    predictions: 'Predictive Healthcare Analytics & Machine Learning',
    diseases: 'Comprehensive Disease & Clinical Pathology Explorer',
    knowledge: 'Medical Knowledge Semantic Vector Search (MedQuAD)',
    datasets: 'Large-Scale Healthcare Dataset Management & Profiling',
    education: 'Evidence-Based Clinical Guidelines & Emergency Protocols',
    profile: 'Patient Health Profile & Longitudinal Biomarker Logs',
    history: 'Medical Consultation Transcript History',
    admin: 'System Health, ML Model Telemetry & Audit Logs'
  };

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-6 backdrop-blur-xl">
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white flex items-center space-x-2">
            <span>{titles[activeTab] || 'Healthcare Assistant'}</span>
          </h1>
          <p className="text-xs text-slate-400">
            Powered by Large-Scale Medical Datasets & Machine Learning Models
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Emergency Hotline Button */}
        <a
          href="tel:911"
          className="hidden sm:flex items-center space-x-1.5 rounded-lg border border-rose-500/30 bg-rose-950/30 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-900/40 transition shadow-sm"
        >
          <PhoneCall className="h-3.5 w-3.5" />
          <span>Emergency: Call 911</span>
        </a>

        {/* Disclaimer Safety Toggle */}
        <button
          onClick={() => setShowDisclaimer(!showDisclaimer)}
          className={`flex items-center space-x-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
            showDisclaimer
              ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
              : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Medical Safety Disclaimer"
        >
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          <span className="hidden md:inline">Safety Disclaimer</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-cyan-400" />}
        </button>

        {/* User / Doctor Profile Chip */}
        <div className="flex items-center space-x-2.5 rounded-xl border border-slate-800 bg-slate-900/80 py-1.5 px-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-600/20 text-cyan-400">
            <Stethoscope className="h-4 w-4" />
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-slate-200">Dr. Alex Morgan</div>
            <div className="text-[10px] text-slate-400">Clinician / Researcher</div>
          </div>
        </div>
      </div>
    </header>
  );
}
