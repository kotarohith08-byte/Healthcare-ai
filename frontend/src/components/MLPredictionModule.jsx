import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Activity,
  Heart,
  Droplet,
  Zap,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  BarChart3,
  Layers,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { healthcareApi } from '../api/healthcareApi';

export default function MLPredictionModule() {
  const [activeModel, setActiveModel] = useState('heart'); // 'heart', 'diabetes', 'stroke'
  const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' or 'evaluation'
  const [metrics, setMetrics] = useState({});
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form states for Heart Disease
  const [heartInputs, setHeartInputs] = useState({
    age: 58,
    sex: 1,
    cp: 2,
    trestbps: 140,
    chol: 245,
    fbs: 0,
    restecg: 1,
    thalach: 140,
    exang: 1,
    oldpeak: 1.8,
    slope: 2,
    ca: 1,
    thal: 2
  });

  // Form states for Diabetes
  const [diabetesInputs, setDiabetesInputs] = useState({
    HighBP: 1,
    HighChol: 1,
    BMI: 31.0,
    Smoker: 0,
    Stroke: 0,
    HeartDiseaseorAttack: 0,
    PhysActivity: 0,
    Fruits: 1,
    Veggies: 1,
    GenHlth: 3,
    MentHlth: 2,
    PhysHlth: 4,
    DiffWalk: 0,
    Sex: 1,
    Age: 8
  });

  // Form states for Stroke
  const [strokeInputs, setStrokeInputs] = useState({
    gender: 'Male',
    age: 62.0,
    hypertension: 1,
    heart_disease: 1,
    ever_married: 1,
    work_type: 'Private',
    Residence_type: 'Urban',
    avg_glucose_level: 145.0,
    bmi: 29.5,
    smoking_status: 'smokes'
  });

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const data = await healthcareApi.getModelMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    }
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      let res;
      if (activeModel === 'heart') {
        res = await healthcareApi.predictHeartRisk(heartInputs);
      } else if (activeModel === 'diabetes') {
        res = await healthcareApi.predictDiabetesRisk(diabetesInputs);
      } else {
        res = await healthcareApi.predictStrokeRisk(strokeInputs);
      }
      setPredictionResult(res);
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentMetricKey =
    activeModel === 'heart'
      ? 'heart_disease'
      : activeModel === 'diabetes'
      ? 'diabetes'
      : 'stroke';

  const currentModelMetrics = metrics[currentMetricKey];

  return (
    <div className="space-y-6">
      {/* Module Header & Model Switcher */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Cpu className="h-5 w-5 text-cyan-400" />
              <span>AI/ML Predictive Risk Analytics & Evaluation Suite</span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive clinical prediction models trained on UCI Cleveland, CDC BRFSS, and Stroke cohorts.
            </p>
          </div>

          {/* Model Switcher Pills */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setActiveModel('heart');
                setPredictionResult(null);
              }}
              className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeModel === 'heart'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'border border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Heart className="h-3.5 w-3.5 text-rose-400" />
              <span>Cardiovascular Risk</span>
            </button>

            <button
              onClick={() => {
                setActiveModel('diabetes');
                setPredictionResult(null);
              }}
              className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeModel === 'diabetes'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'border border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Droplet className="h-3.5 w-3.5 text-cyan-400" />
              <span>Type-2 Diabetes</span>
            </button>

            <button
              onClick={() => {
                setActiveModel('stroke');
                setPredictionResult(null);
              }}
              className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeModel === 'stroke'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'border border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Cerebrovascular Stroke</span>
            </button>
          </div>
        </div>

        {/* Tab Selector: Calculator vs Model Evaluation Metrics */}
        <div className="flex items-center space-x-4 border-t border-slate-800 pt-3">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`text-xs font-bold transition flex items-center space-x-1.5 pb-1 ${
              activeTab === 'calculator'
                ? 'border-b-2 border-cyan-400 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Interactive Risk Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab('evaluation')}
            className={`text-xs font-bold transition flex items-center space-x-1.5 pb-1 ${
              activeTab === 'evaluation'
                ? 'border-b-2 border-cyan-400 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Model Evaluation Suite & Confusion Matrix</span>
          </button>
        </div>
      </div>

      {/* View 1: Interactive Risk Calculator */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Inputs (Left) */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
              <span>Patient Clinical Biomarkers & Features</span>
            </h3>

            {/* Heart Disease Inputs */}
            {activeModel === 'heart' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                <div>
                  <label className="text-slate-300 block mb-1">Age: {heartInputs.age} years</label>
                  <input
                    type="range"
                    min="25"
                    max="80"
                    value={heartInputs.age}
                    onChange={(e) => setHeartInputs({ ...heartInputs, age: parseInt(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Biological Sex</label>
                  <select
                    value={heartInputs.sex}
                    onChange={(e) => setHeartInputs({ ...heartInputs, sex: parseInt(e.target.value) })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-200"
                  >
                    <option value={1}>Male</option>
                    <option value={0}>Female</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Resting Blood Pressure: {heartInputs.trestbps} mmHg</label>
                  <input
                    type="range"
                    min="90"
                    max="200"
                    value={heartInputs.trestbps}
                    onChange={(e) => setHeartInputs({ ...heartInputs, trestbps: parseInt(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Serum Cholesterol: {heartInputs.chol} mg/dL</label>
                  <input
                    type="range"
                    min="120"
                    max="450"
                    value={heartInputs.chol}
                    onChange={(e) => setHeartInputs({ ...heartInputs, chol: parseInt(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Max Heart Rate Achieved: {heartInputs.thalach} bpm</label>
                  <input
                    type="range"
                    min="75"
                    max="200"
                    value={heartInputs.thalach}
                    onChange={(e) => setHeartInputs({ ...heartInputs, thalach: parseInt(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Chest Pain Presentation</label>
                  <select
                    value={heartInputs.cp}
                    onChange={(e) => setHeartInputs({ ...heartInputs, cp: parseInt(e.target.value) })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-200"
                  >
                    <option value={0}>Typical Angina</option>
                    <option value={1}>Atypical Angina</option>
                    <option value={2}>Non-Anginal Pain</option>
                    <option value={3}>Asymptomatic</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Exercise Induced Angina</label>
                  <select
                    value={heartInputs.exang}
                    onChange={(e) => setHeartInputs({ ...heartInputs, exang: parseInt(e.target.value) })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-200"
                  >
                    <option value={0}>No</option>
                    <option value={1}>Yes (Myocardial Ischemia)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">ST Depression (Oldpeak): {heartInputs.oldpeak} mm</label>
                  <input
                    type="range"
                    min="0.0"
                    max="5.0"
                    step="0.1"
                    value={heartInputs.oldpeak}
                    onChange={(e) => setHeartInputs({ ...heartInputs, oldpeak: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>
            )}

            {/* Diabetes Inputs */}
            {activeModel === 'diabetes' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                <div>
                  <label className="text-slate-300 block mb-1">Body Mass Index (BMI): {diabetesInputs.BMI} kg/m²</label>
                  <input
                    type="range"
                    min="16"
                    max="50"
                    step="0.5"
                    value={diabetesInputs.BMI}
                    onChange={(e) => setDiabetesInputs({ ...diabetesInputs, BMI: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">High Blood Pressure History</label>
                  <select
                    value={diabetesInputs.HighBP}
                    onChange={(e) => setDiabetesInputs({ ...diabetesInputs, HighBP: parseInt(e.target.value) })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-200"
                  >
                    <option value={0}>Normal BP</option>
                    <option value={1}>Diagnosed High BP</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">High Cholesterol</label>
                  <select
                    value={diabetesInputs.HighChol}
                    onChange={(e) => setDiabetesInputs({ ...diabetesInputs, HighChol: parseInt(e.target.value) })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-200"
                  >
                    <option value={0}>Normal Cholesterol</option>
                    <option value={1}>High Cholesterol</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Regular Physical Activity (Past 30 Days)</label>
                  <select
                    value={diabetesInputs.PhysActivity}
                    onChange={(e) => setDiabetesInputs({ ...diabetesInputs, PhysActivity: parseInt(e.target.value) })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-200"
                  >
                    <option value={1}>Yes (Active)</option>
                    <option value={0}>No (Sedentary)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Self-Rated General Health</label>
                  <select
                    value={diabetesInputs.GenHlth}
                    onChange={(e) => setDiabetesInputs({ ...diabetesInputs, GenHlth: parseInt(e.target.value) })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-200"
                  >
                    <option value={1}>1 - Excellent</option>
                    <option value={2}>2 - Very Good</option>
                    <option value={3}>3 - Good</option>
                    <option value={4}>4 - Fair</option>
                    <option value={5}>5 - Poor</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Difficulty Walking / Climbing Stairs</label>
                  <select
                    value={diabetesInputs.DiffWalk}
                    onChange={(e) => setDiabetesInputs({ ...diabetesInputs, DiffWalk: parseInt(e.target.value) })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-200"
                  >
                    <option value={0}>No difficulty</option>
                    <option value={1}>Yes, significant difficulty</option>
                  </select>
                </div>
              </div>
            )}

            {/* Stroke Inputs */}
            {activeModel === 'stroke' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                <div>
                  <label className="text-slate-300 block mb-1">Age: {strokeInputs.age} years</label>
                  <input
                    type="range"
                    min="20"
                    max="85"
                    value={strokeInputs.age}
                    onChange={(e) => setStrokeInputs({ ...strokeInputs, age: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Average Glucose Level: {strokeInputs.avg_glucose_level} mg/dL</label>
                  <input
                    type="range"
                    min="60"
                    max="280"
                    value={strokeInputs.avg_glucose_level}
                    onChange={(e) => setStrokeInputs({ ...strokeInputs, avg_glucose_level: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">BMI: {strokeInputs.bmi} kg/m²</label>
                  <input
                    type="range"
                    min="16"
                    max="50"
                    value={strokeInputs.bmi}
                    onChange={(e) => setStrokeInputs({ ...strokeInputs, bmi: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Diagnosed Chronic Hypertension</label>
                  <select
                    value={strokeInputs.hypertension}
                    onChange={(e) => setStrokeInputs({ ...strokeInputs, hypertension: parseInt(e.target.value) })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-200"
                  >
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Pre-existing Heart Disease</label>
                  <select
                    value={strokeInputs.heart_disease}
                    onChange={(e) => setStrokeInputs({ ...strokeInputs, heart_disease: parseInt(e.target.value) })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-200"
                  >
                    <option value={0}>No</option>
                    <option value={1}>Yes (Atrial Fib / CAD)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Smoking Status</label>
                  <select
                    value={strokeInputs.smoking_status}
                    onChange={(e) => setStrokeInputs({ ...strokeInputs, smoking_status: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-200"
                  >
                    <option value="never smoked">Never Smoked</option>
                    <option value="formerly smoked">Formerly Smoked</option>
                    <option value="smokes">Currently Smokes</option>
                  </select>
                </div>
              </div>
            )}

            {/* Inference Submit Button */}
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={handlePredict}
                disabled={loading}
                className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 transition"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Executing Model Inference...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Calculate Statistical Risk Score</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Inference Output Card (Right) */}
          <div className="lg:col-span-5">
            {predictionResult ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-xl space-y-5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-sm font-bold text-white">Statistical Model Output</h4>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      predictionResult.risk_level === 'High Risk'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                        : predictionResult.risk_level === 'Moderate Risk'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                    }`}
                  >
                    {predictionResult.risk_level}
                  </span>
                </div>

                {/* Score Gauge */}
                <div className="text-center py-4 bg-slate-950/70 rounded-xl border border-slate-800/80">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Calculated Probability Index
                  </span>
                  <div className="text-5xl font-black font-mono text-cyan-400">
                    {predictionResult.probability}%
                  </div>
                  <div className="mt-3 mx-8 h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        predictionResult.probability > 60
                          ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                          : predictionResult.probability > 30
                          ? 'bg-gradient-to-r from-cyan-500 to-amber-500'
                          : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                      }`}
                      style={{ width: `${predictionResult.probability}%` }}
                    />
                  </div>
                </div>

                {/* Key Contributing Biomarkers */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Key Contributing Biomarkers:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {predictionResult.primary_risk_factors?.map((f, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-cyan-400 mt-0.5">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actionable Recommendations */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Actionable Preventative Steps:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {predictionResult.recommendations?.map((r, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Disclaimer */}
                <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-3 leading-relaxed">
                  <strong>Notice:</strong> {predictionResult.disclaimer}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center text-xs text-slate-400 space-y-3">
                <Cpu className="h-8 w-8 text-cyan-400 mx-auto" />
                <p>Adjust biomarkers on the left and click <strong>Calculate Statistical Risk Score</strong>.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View 2: Model Evaluation Suite & Confusion Matrix */}
      {activeTab === 'evaluation' && currentModelMetrics && (
        <div className="space-y-6">
          {/* Key Metrics KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Accuracy</span>
              <span className="text-2xl font-bold font-mono text-cyan-400 mt-1 block">
                {(currentModelMetrics.accuracy * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-500">Holdout test split</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Precision</span>
              <span className="text-2xl font-bold font-mono text-white mt-1 block">
                {(currentModelMetrics.precision * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-500">Positive predictive val</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Recall (Sensitivity)</span>
              <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
                {(currentModelMetrics.recall * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-500">True positive rate</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">F1-Score</span>
              <span className="text-2xl font-bold font-mono text-sky-400 mt-1 block">
                {(currentModelMetrics.f1_score * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-500">Harmonic mean</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">ROC-AUC</span>
              <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">
                {currentModelMetrics.roc_auc?.toFixed(3) || 'N/A'}
              </span>
              <span className="text-[10px] text-slate-500">Area under curve</span>
            </div>
          </div>

          {/* Confusion Matrix & Feature Importance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Confusion Matrix (Left) */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Interactive Confusion Matrix (2x2)</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Evaluated on {currentModelMetrics.test_samples} independent test observations
                </p>
              </div>

              {currentModelMetrics.confusion_matrix && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-center font-mono">
                    {/* True Negative */}
                    <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4">
                      <span className="text-[10px] uppercase text-emerald-300 block">True Negative (TN)</span>
                      <span className="text-3xl font-black text-emerald-400 mt-1 block">
                        {currentModelMetrics.confusion_matrix.true_negative}
                      </span>
                      <span className="text-[10px] text-slate-400">Correctly classified negative</span>
                    </div>

                    {/* False Positive */}
                    <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-4">
                      <span className="text-[10px] uppercase text-rose-300 block">False Positive (FP)</span>
                      <span className="text-3xl font-black text-rose-400 mt-1 block">
                        {currentModelMetrics.confusion_matrix.false_positive}
                      </span>
                      <span className="text-[10px] text-slate-400">Type I error (False alarm)</span>
                    </div>

                    {/* False Negative */}
                    <div className="rounded-xl border border-amber-500/40 bg-amber-950/40 p-4">
                      <span className="text-[10px] uppercase text-amber-300 block">False Negative (FN)</span>
                      <span className="text-3xl font-black text-amber-400 mt-1 block">
                        {currentModelMetrics.confusion_matrix.false_negative}
                      </span>
                      <span className="text-[10px] text-slate-400">Type II error (Missed risk)</span>
                    </div>

                    {/* True Positive */}
                    <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/40 p-4">
                      <span className="text-[10px] uppercase text-cyan-300 block">True Positive (TP)</span>
                      <span className="text-3xl font-black text-cyan-400 mt-1 block">
                        {currentModelMetrics.confusion_matrix.true_positive}
                      </span>
                      <span className="text-[10px] text-slate-400">Correctly classified positive</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Feature Importance Bar Chart (Right) */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Random Forest Mean Decrease Impurity (MDI) Feature Importance</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Relative weight of clinical biomarkers in the ensemble's decision trees
                </p>
              </div>

              {currentModelMetrics.feature_importance && (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={currentModelMetrics.feature_importance.slice(0, 8)}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                    >
                      <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
                      <YAxis
                        dataKey="feature"
                        type="category"
                        stroke="#94a3b8"
                        tick={{ fontSize: 11 }}
                        width={90}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '0.75rem',
                          fontSize: '11px'
                        }}
                      />
                      <Bar dataKey="importance" fill="#06b6d4" radius={[0, 4, 4, 0]}>
                        {currentModelMetrics.feature_importance.slice(0, 8).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index === 0 ? '#38bdf8' : index === 1 ? '#06b6d4' : '#0284c7'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
