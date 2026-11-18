import React from 'react';
import {
  MessageSquare,
  Activity,
  BookOpen,
  Search,
  Database,
  Cpu,
  GraduationCap,
  UserCheck,
  History,
  ShieldAlert,
  HeartPulse,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) {
  const navItems = [
    { id: 'chatbot', label: 'AI Health Assistant', icon: MessageSquare, badge: 'RAG AI' },
    { id: 'symptoms', label: 'Symptom Analysis', icon: Activity, badge: 'ML NLP' },
    { id: 'predictions', label: 'AI/ML Risk Models', icon: Cpu, badge: '4 Models' },
    { id: 'diseases', label: 'Disease Explorer', icon: BookOpen, count: '42 Conditions' },
    { id: 'knowledge', label: 'Medical Search', icon: Search, badge: 'MedQuAD' },
    { id: 'datasets', label: 'Dataset Explorer', icon: Database, count: '6 Benchmarks' },
    { id: 'education', label: 'Clinical Guides', icon: GraduationCap },
    { id: 'profile', label: 'Vitals & Profile', icon: UserCheck },
    { id: 'history', label: 'Consultation History', icon: History },
    { id: 'admin', label: 'System Health', icon: ShieldAlert, badge: 'Audit' },
  ];

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-30 flex flex-col border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-xl transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-20 items-center justify-between border-b border-slate-800/60 px-4">
        {!isCollapsed && (
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-blue-600 shadow-lg shadow-cyan-500/20">
              <HeartPulse className="h-6 w-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold tracking-tight text-white text-base">MedPulse AI</span>
                <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-400">
                  v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">Clinical Intelligence Platform</p>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-blue-600 shadow-lg shadow-cyan-500/20">
            <HeartPulse className="h-6 w-6 text-white" />
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition ${
            isCollapsed ? 'hidden' : ''
          }`}
          title="Toggle Sidebar"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group flex w-full items-center rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 via-sky-500/10 to-transparent text-cyan-300 border-l-4 border-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
              } ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!isCollapsed && (
                <div className="flex items-center space-x-1.5">
                  {item.badge && (
                    <span className="rounded-full bg-cyan-950 border border-cyan-800/60 px-2 py-0.5 text-[10px] font-mono text-cyan-400">
                      {item.badge}
                    </span>
                  )}
                  {item.count && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {item.count}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Medical System Status */}
      <div className="border-t border-slate-800/60 p-4">
        {!isCollapsed ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs">
            <div className="flex items-center justify-between text-slate-300 mb-2 font-medium">
              <span className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Inference Engine</span>
              </span>
              <span className="text-emerald-400 font-mono text-[10px]">Active</span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>RAG Corpus:</span>
                <span className="text-slate-200 font-mono">MedQuAD + NIH</span>
              </div>
              <div className="flex justify-between">
                <span>ML Pipeline:</span>
                <span className="text-slate-200 font-mono">Scikit-Learn RF</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" title="System Operational"></span>
          </div>
        )}
      </div>
    </aside>
  );
}
