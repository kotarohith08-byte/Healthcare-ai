import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Server,
  Cpu,
  Database,
  Activity,
  CheckCircle2,
  RefreshCw,
  Lock,
  Clock,
  Terminal
} from 'lucide-react';
import { healthcareApi } from '../api/healthcareApi';

export default function AdminModule() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const data = await healthcareApi.getSystemHealth();
      setHealthData(data);
    } catch (err) {
      console.error('Failed to load system health:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="h-5 w-5 text-cyan-400" />
            <span>Admin Console, System Health & Audit Telemetry</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time backend metrics, active machine learning model memory status, and inference audit trails.
          </p>
        </div>

        <button
          onClick={fetchHealth}
          disabled={loading}
          className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {healthData && (
        <div className="space-y-6">
          {/* Top Telemetry KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">System Status</span>
              <span className="text-base font-bold text-emerald-400 mt-1 flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{healthData.system_status}</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">FastAPI {healthData.api_version}</span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Process Memory</span>
              <span className="text-xl font-bold font-mono text-cyan-400 mt-1 block">
                {healthData.process_memory_mb} MB
              </span>
              <span className="text-[10px] text-slate-500">Resident Set Size (RSS)</span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">System Uptime</span>
              <span className="text-xl font-bold font-mono text-white mt-1 block">
                {Math.floor(healthData.uptime_seconds / 60)}m {healthData.uptime_seconds % 60}s
              </span>
              <span className="text-[10px] text-slate-500">Python {healthData.python_version}</span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Indexed Benchmarks</span>
              <span className="text-xl font-bold font-mono text-sky-400 mt-1 block">
                {healthData.datasets_count} Sources
              </span>
              <span className="text-[10px] text-slate-500">MIMIC-IV, MedQuAD, CDC</span>
            </div>
          </div>

          {/* Active ML Models in RAM */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2 flex items-center space-x-2">
              <Cpu className="h-4 w-4 text-cyan-400" />
              <span>Loaded Machine Learning Pipelines & Memory Status</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {healthData.active_models?.map((m, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{m.name}</span>
                    <span className="rounded-full bg-emerald-950 border border-emerald-500/50 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                      {m.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">Type: {m.type}</div>
                  {m.passages_indexed && (
                    <div className="text-[11px] text-cyan-400 font-mono">
                      Passages Indexed: {m.passages_indexed}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Database Entities Count & Security Guardrails */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Database Stats (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <Database className="h-4 w-4 text-cyan-400" />
                <span>Database Entity Record Counts</span>
              </h4>

              <div className="space-y-2 text-xs font-mono">
                {Object.entries(healthData.database_metrics || {}).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-slate-950">
                    <span className="text-slate-400 uppercase text-[11px]">{key.replace('_', ' ')}:</span>
                    <span className="font-bold text-white">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security & HIPAA Checklist (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <Lock className="h-4 w-4 text-emerald-400" />
                <span>Healthcare Privacy, Safety & Compliance Guardrails</span>
              </h4>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start space-x-2 rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">De-Identified Synthetic Cohorts Only</strong>
                    Zero Protected Health Information (PHI) or real patient records exposed. Full HIPAA Safe Harbor alignment.
                  </div>
                </div>

                <div className="flex items-start space-x-2 rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Mandatory Clinical Safety Disclaimer Enforced</strong>
                    Every inference, chat response, and symptom analysis includes automated medical disclaimer guardrails.
                  </div>
                </div>

                <div className="flex items-start space-x-2 rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Automated Red-Flag Emergency Triage Interceptor</strong>
                    Instant emergency escalation when life-threatening symptoms (stroke, heart attack, anaphylaxis) are detected.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Prediction Audit Trail */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recent ML Prediction Audit Log (Last 10 Executions)
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono text-slate-300">
                <thead className="bg-slate-950 text-slate-500 border-b border-slate-800 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Audit ID</th>
                    <th className="p-3">Model Name</th>
                    <th className="p-3">Risk Level</th>
                    <th className="p-3">Calculated Probability</th>
                    <th className="p-3">Execution Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {healthData.recent_prediction_audits?.map((audit) => (
                    <tr key={audit.id} className="hover:bg-slate-800/40">
                      <td className="p-3 text-slate-500">#{audit.id}</td>
                      <td className="p-3 font-bold text-cyan-300">{audit.model_name}</td>
                      <td className="p-3">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] ${
                            audit.risk_level === 'High Risk'
                              ? 'bg-rose-950 text-rose-300'
                              : audit.risk_level === 'Moderate Risk'
                              ? 'bg-amber-950 text-amber-300'
                              : 'bg-emerald-950 text-emerald-300'
                          }`}
                        >
                          {audit.risk_level}
                        </span>
                      </td>
                      <td className="p-3 text-white">{audit.confidence}%</td>
                      <td className="p-3 text-slate-400">{new Date(audit.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
