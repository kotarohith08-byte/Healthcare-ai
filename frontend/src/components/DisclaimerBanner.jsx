import React from 'react';
import { AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function DisclaimerBanner({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="border-b border-amber-500/30 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/60 px-6 py-3 text-amber-200 backdrop-blur-md">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 max-w-7xl mx-auto">
        <div className="flex items-start space-x-3">
          <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold text-amber-300 uppercase tracking-wide">
              Mandatory Clinical Safety Notice:
            </span>{' '}
            This AI-powered healthcare assistant provides general medical knowledge and machine learning predictions for
            educational and informational purposes only. It does <strong>NOT</strong> provide medical diagnoses, prescribe drugs,
            or recommend emergency interventions. Always consult a licensed physician or specialist for personal clinical care.
          </div>
        </div>

        <button
          onClick={onClose}
          className="self-end md:self-auto shrink-0 flex items-center space-x-1.5 rounded-lg border border-amber-500/40 bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-500/30 transition"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-amber-300" />
          <span>I Understand & Acknowledge</span>
        </button>
      </div>
    </div>
  );
}
