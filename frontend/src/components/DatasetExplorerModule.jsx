import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw,
  BarChart3,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { healthcareApi } from '../api/healthcareApi';

export default function DatasetExplorerModule() {
  const [datasets, setDatasets] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState('mimic-iv-icu');
  const [datasetData, setDatasetData] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('records'); // 'records' or 'profiler'

  useEffect(() => {
    fetchDatasetsList();
  }, []);

  useEffect(() => {
    if (selectedSlug) {
      fetchDatasetDetails(selectedSlug, page, search);
    }
  }, [selectedSlug, page, search]);

  const fetchDatasetsList = async () => {
    try {
      const data = await healthcareApi.getDatasetsList();
      setDatasets(data);
      if (data.length > 0 && !selectedSlug) {
        setSelectedSlug(data[0].slug);
      }
    } catch (err) {
      console.error('Failed to load datasets:', err);
    }
  };

  const fetchDatasetDetails = async (slug, p, s) => {
    setLoading(true);
    try {
      const data = await healthcareApi.getDatasetDetails(slug, p, pageSize, s);
      setDatasetData(data);
    } catch (err) {
      console.error('Failed to load dataset details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await healthcareApi.uploadCustomDataset(file);
      alert(`Dataset '${file.name}' successfully uploaded and profiled! Quality score: ${res.profile.quality_score}%`);
      fetchDatasetsList();
      setSelectedSlug(res.dataset.slug);
    } catch (err) {
      console.error('Upload failed:', err);
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const currentSummary = datasetData?.summary;
  const currentProfile = datasetData?.profile;

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Stat Cards */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Database className="h-5 w-5 text-cyan-400" />
              <span>Healthcare Dataset Management & Quality Intelligence</span>
            </h2>
            <p className="text-xs text-slate-400">
              Audit, profile, paginate, and explore large-scale medical benchmarks (MIMIC-IV, MedQuAD, CDC, UCI).
            </p>
          </div>

          <label className="cursor-pointer flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition">
            <UploadCloud className="h-4 w-4" />
            <span>{uploading ? 'Processing Dataset...' : 'Upload Custom CSV/JSON'}</span>
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        {/* Dataset Selector Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
          {datasets.map((ds) => (
            <button
              key={ds.slug}
              onClick={() => {
                setSelectedSlug(ds.slug);
                setPage(1);
                setSearch('');
              }}
              className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-medium transition ${
                selectedSlug === ds.slug
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'border border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {ds.name}
            </button>
          ))}
        </div>
      </div>

      {/* Dataset Metadata & Data Quality Telemetry Cards */}
      {currentSummary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">Total Records</span>
            <span className="text-xl font-bold font-mono text-cyan-400 mt-1 block">
              {currentSummary.record_count.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500">Clinical rows</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">Features / Columns</span>
            <span className="text-xl font-bold font-mono text-white mt-1 block">
              {currentSummary.feature_count}
            </span>
            <span className="text-[10px] text-slate-500">Biomarkers</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">Data Quality Score</span>
            <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
              {currentSummary.quality_score}%
            </span>
            <span className="text-[10px] text-emerald-500/80">Benchmark Grade</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">Missing Cells</span>
            <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">
              {currentSummary.missing_values_count}
            </span>
            <span className="text-[10px] text-slate-500">{currentProfile?.missing_percentage || 0}% null</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">Duplicate Rows</span>
            <span className="text-xl font-bold font-mono text-sky-400 mt-1 block">
              {currentProfile?.duplicate_rows || 0}
            </span>
            <span className="text-[10px] text-slate-500">Unique entities</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">Indexing Status</span>
            <span className="text-xs font-bold text-emerald-400 mt-1.5 flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span>{currentSummary.status}</span>
            </span>
            <span className="text-[10px] text-slate-500 truncate block mt-0.5">{currentSummary.source}</span>
          </div>
        </div>
      )}

      {/* Dataset Description & Source Attribution */}
      {currentSummary && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-xs text-slate-300 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <strong className="text-white">{currentSummary.name}:</strong> {currentSummary.description}
          </div>
          <div className="shrink-0 font-mono text-[11px] text-cyan-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
            Source: {currentSummary.source}
          </div>
        </div>
      )}

      {/* Tab Switcher: Interactive Data Grid vs Column Feature Profiler */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-1">
          <button
            onClick={() => setActiveTab('records')}
            className={`px-4 py-2 text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'records'
                ? 'border-b-2 border-cyan-400 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Interactive Data Grid ({datasetData?.total_records || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('profiler')}
            className={`px-4 py-2 text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'profiler'
                ? 'border-b-2 border-cyan-400 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Feature Statistics & Profiler ({datasetData?.columns?.length || 0})</span>
          </button>
        </div>

        {/* In-table Search */}
        {activeTab === 'records' && (
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Filter dataset rows..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* View 1: Paginated Records Table */}
      {activeTab === 'records' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="sticky top-0 bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px] font-mono">
                <tr>
                  <th className="py-3 px-4">#</th>
                  {datasetData?.columns?.slice(0, 10).map((col) => (
                    <th key={col.name} className="py-3 px-4 whitespace-nowrap">
                      {col.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-400">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-cyan-400" />
                      Loading records...
                    </td>
                  </tr>
                ) : datasetData?.sample_records?.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-400">
                      No records match the active search filter.
                    </td>
                  </tr>
                ) : (
                  datasetData?.sample_records?.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-4 text-slate-500">{(page - 1) * pageSize + idx + 1}</td>
                      {datasetData.columns.slice(0, 10).map((col) => (
                        <td key={col.name} className="py-2.5 px-4 whitespace-nowrap text-slate-200">
                          {row[col.name] !== null && row[col.name] !== undefined
                            ? String(row[col.name])
                            : <span className="text-slate-600 italic">null</span>}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/80 px-6 py-3 text-xs text-slate-400">
            <div>
              Showing page <strong className="text-white">{page}</strong> of{' '}
              <strong className="text-white">
                {Math.ceil((datasetData?.total_records || 1) / pageSize)}
              </strong>{' '}
              ({datasetData?.total_records?.toLocaleString() || 0} total records)
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center space-x-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-slate-300 hover:bg-slate-700 disabled:opacity-40 transition"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Prev</span>
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil((datasetData?.total_records || 1) / pageSize)}
                className="flex items-center space-x-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-slate-300 hover:bg-slate-700 disabled:opacity-40 transition"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Column Profiler Table */}
      {activeTab === 'profiler' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px] font-mono">
                <tr>
                  <th className="py-3 px-4">Feature Name</th>
                  <th className="py-3 px-4">Data Type</th>
                  <th className="py-3 px-4">Missing Values</th>
                  <th className="py-3 px-4">Unique Values</th>
                  <th className="py-3 px-4">Min / Max</th>
                  <th className="py-3 px-4">Mean (Std)</th>
                  <th className="py-3 px-4">Median</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {datasetData?.columns?.map((col) => (
                  <tr key={col.name} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold text-cyan-300">{col.name}</td>
                    <td className="py-3 px-4 text-slate-400">{col.dtype}</td>
                    <td className="py-3 px-4">
                      {col.missing_count === 0 ? (
                        <span className="text-emerald-400">0 (0%)</span>
                      ) : (
                        <span className="text-amber-400">{col.missing_count}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-white">{col.unique_values}</td>
                    <td className="py-3 px-4 text-slate-300">
                      {col.min !== undefined ? `${col.min} to ${col.max}` : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {col.mean !== undefined ? `${col.mean} (±${col.std})` : 'Categorical'}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {col.median !== undefined ? col.median : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
