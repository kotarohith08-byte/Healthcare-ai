import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Heart,
  Activity,
  Plus,
  Scale,
  Calendar,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { healthcareApi } from '../api/healthcareApi';

export default function UserProfileModule() {
  const [profileData, setProfileData] = useState(null);
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loggingVital, setLoggingVital] = useState(false);

  // New Vital Form State
  const [vitalForm, setVitalForm] = useState({
    metric_type: 'systolic_bp',
    value: 120,
    unit: 'mmHg',
    notes: 'Morning resting reading'
  });

  useEffect(() => {
    loadProfile();
    loadMetrics();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await healthcareApi.getUserProfile();
      setProfileData(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const loadMetrics = async () => {
    try {
      const data = await healthcareApi.getHealthMetrics();
      setMetricsHistory(data);
    } catch (err) {
      console.error('Failed to load vitals history:', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileData?.profile) return;
    setSaving(true);
    try {
      await healthcareApi.updateUserProfile(profileData.profile);
      alert('Health profile saved successfully!');
    } catch (err) {
      console.error('Profile update failed:', err);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogVital = async (e) => {
    e.preventDefault();
    setLoggingVital(true);
    try {
      await healthcareApi.logHealthMetric(vitalForm);
      loadMetrics();
      alert('Vital measurement logged successfully!');
    } catch (err) {
      console.error('Failed to log vital:', err);
      alert('Error logging vital measurement.');
    } finally {
      setLoggingVital(false);
    }
  };

  // Prepare chart data from metricsHistory
  const chartData = [...metricsHistory]
    .reverse()
    .slice(-10)
    .map((m, idx) => ({
      time: `Log #${idx + 1}`,
      value: m.value,
      type: m.metric_type
    }));

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <UserCheck className="h-5 w-5 text-cyan-400" />
          <span>Patient Health Profile & Longitudinal Biomarker Tracking</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Record longitudinal physiological vitals, manage chronic condition flags, and evaluate cardiovascular health metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile Form (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
            Demographic & Baseline Clinical Profile
          </h3>

          {profileData?.profile && (
            <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileData.full_name || ''}
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Age (Years)</label>
                  <input
                    type="number"
                    value={profileData.profile.age || 38}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        profile: { ...profileData.profile, age: parseInt(e.target.value) }
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Gender</label>
                  <select
                    value={profileData.profile.gender || 'Female'}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        profile: { ...profileData.profile, gender: e.target.value }
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-200"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={profileData.profile.height_cm || 168}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        profile: { ...profileData.profile, height_cm: parseFloat(e.target.value) }
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={profileData.profile.weight_kg || 64}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        profile: { ...profileData.profile, weight_kg: parseFloat(e.target.value) }
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-200"
                  />
                </div>
              </div>

              {/* Calculated BMI Badge */}
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/40 p-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-cyan-300 block font-semibold">Calculated BMI</span>
                  <span className="text-lg font-bold font-mono text-white">
                    {profileData.profile.bmi} kg/m²
                  </span>
                </div>
                <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-300">
                  {profileData.profile.bmi_category}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Blood Group</label>
                  <input
                    type="text"
                    value={profileData.profile.blood_group || 'O+'}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        profile: { ...profileData.profile, blood_group: e.target.value }
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Attending Physician</label>
                  <input
                    type="text"
                    value={profileData.profile.primary_physician || ''}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        profile: { ...profileData.profile, primary_physician: e.target.value }
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-200"
                  />
                </div>
              </div>

              {/* Disclaimer Consent Status */}
              <div className="pt-2 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="consent"
                  checked={profileData.profile.disclaimer_accepted || false}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      profile: { ...profileData.profile, disclaimer_accepted: e.target.checked }
                    })
                  }
                  className="rounded accent-cyan-500"
                />
                <label htmlFor="consent" className="text-[11px] text-slate-400">
                  I accept the medical educational disclaimer terms
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full mt-2 flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving Profile...' : 'Save Health Profile'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Vitals Logger & Chart (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Vitals Logger Form */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2 flex items-center space-x-2">
              <Plus className="h-4 w-4 text-cyan-400" />
              <span>Log New Physiological Biomarker</span>
            </h3>

            <form onSubmit={handleLogVital} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Metric Type</label>
                <select
                  value={vitalForm.metric_type}
                  onChange={(e) => {
                    const val = e.target.value;
                    let u = 'mmHg';
                    if (val === 'heart_rate') u = 'bpm';
                    else if (val === 'blood_glucose') u = 'mg/dL';
                    else if (val === 'bmi') u = 'kg/m2';
                    setVitalForm({ ...vitalForm, metric_type: val, unit: u });
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-200"
                >
                  <option value="systolic_bp">Systolic BP</option>
                  <option value="diastolic_bp">Diastolic BP</option>
                  <option value="heart_rate">Heart Rate</option>
                  <option value="blood_glucose">Blood Glucose</option>
                  <option value="bmi">BMI</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Value ({vitalForm.unit})</label>
                <input
                  type="number"
                  step="0.1"
                  value={vitalForm.value}
                  onChange={(e) => setVitalForm({ ...vitalForm, value: parseFloat(e.target.value) })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-200 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Clinical Notes</label>
                <input
                  type="text"
                  value={vitalForm.notes}
                  onChange={(e) => setVitalForm({ ...vitalForm, notes: e.target.value })}
                  placeholder="Resting / Post-prandial"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-200"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loggingVital}
                  className="w-full rounded-lg bg-cyan-600 hover:bg-cyan-500 py-2 text-xs font-bold text-white transition"
                >
                  {loggingVital ? 'Logging...' : 'Log Vital'}
                </button>
              </div>
            </form>
          </div>

          {/* Vitals Longitudinal Chart */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Longitudinal Biomarker History (Recent 10 Recordings)
            </h4>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '11px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ fill: '#38bdf8', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Vitals History Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
            <div className="max-h-48 overflow-y-auto font-mono text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800 text-[10px] uppercase">
                  <tr>
                    <th className="p-2.5">Metric</th>
                    <th className="p-2.5">Value</th>
                    <th className="p-2.5">Status Evaluation</th>
                    <th className="p-2.5">Recorded At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {metricsHistory.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-cyan-300">{m.metric_type}</td>
                      <td className="p-2.5 text-white">
                        {m.value} {m.unit}
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] ${
                            m.status.includes('Stage') || m.status.includes('Alert')
                              ? 'bg-rose-950 text-rose-300'
                              : m.status.includes('Elevated')
                              ? 'bg-amber-950 text-amber-300'
                              : 'bg-emerald-950 text-emerald-300'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-500 text-[11px]">
                        {new Date(m.recorded_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
