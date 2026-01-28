
import React, { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { ExecutionRun, Scenario, TestStatus } from '../types';
import { ChevronLeft, CheckCircle2, XCircle, Clock, Globe, Activity, ChevronDown, Terminal, Database, Code, Brackets, Tag, AlertCircle, FileDown, Loader2, PlayCircle, Cpu, Zap, Filter, Calendar } from 'lucide-react';
// import { jsPDF } from 'jspdf';
// import html2canvas from 'html2canvas';

interface RunDetailViewProps {
  run: ExecutionRun;
  onBack: () => void;
}

const RunDetailView: React.FC<RunDetailViewProps> = ({ run, onBack }) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'FAILED' | 'PASSED'>('ALL');
  const [expandedScenarios, setExpandedScenarios] = useState<Set<string>>(new Set());
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getScenariosByRun(run.id).then((data) => {
      setScenarios(data);
      setLoading(false);
    });
  }, [run.id]);

  const toggleExpand = (id: string) => {
    const next = new Set(expandedScenarios);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedScenarios(next);
  };

  const allRunTags = Array.from(new Set(scenarios.flatMap(s => s.tags || []))).sort();

  const filteredScenarios = scenarios.filter(s => {
    const matchesStatus = filter === 'ALL' ||
      (filter === 'FAILED' && s.status === TestStatus.FAILED) ||
      (filter === 'PASSED' && s.status === TestStatus.PASSED);

    const matchesTag = !selectedTag || (s.tags && s.tags.includes(selectedTag));

    return matchesStatus && matchesTag;
  });

  // Analytics
  const totalDuration = scenarios.reduce((acc, s) => acc + s.duration, 0);
  const avgDuration = scenarios.length > 0 ? totalDuration / scenarios.length : 0;

  const failureGroups = scenarios
    .filter(s => s.status === TestStatus.FAILED && s.errorMessage)
    .reduce((acc, s) => {
      const key = s.errorMessage?.split('\n')[0] || 'Unknown Error';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const handleExportPDF = async () => {
    alert("PDF Export is currently disabled for maintenance.");
    /*
    if (!detailRef.current) return;
    setIsExporting(true);

    try {
      // ... pdf logic ...
    } catch (err) {
      console.error("Run PDF Export failed", err);
    } finally {
      setIsExporting(false);
    }
    */
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-600/30 border-t-blue-500 rounded-full animate-spin"></div>
        <Cpu size={24} className="absolute inset-0 m-auto text-blue-500 animate-pulse" />
      </div>
      <p className="text-slate-500 font-bold font-mono text-sm uppercase tracking-widest animate-pulse">Decrypting Flight Data...</p>
    </div>
  );

  return (
    <div ref={detailRef} className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20">
      {/* Navigation & Actions */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={onBack}
          className="flex items-center text-slate-400 hover:text-white transition-all group px-4 py-2 hover:bg-slate-800 rounded-full"
        >
          <ChevronLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Return to Base</span>
        </button>

        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase text-white transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50 border border-indigo-400/20"
        >
          {isExporting ? <Loader2 size={14} className="mr-2 animate-spin" /> : <FileDown size={14} className="mr-2" />}
          {isExporting ? 'Generating Report...' : 'Export PDF Dossier'}
        </button>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-slate-900/60 border border-slate-800/60 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-600/10 to-violet-600/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none group-hover:bg-blue-600/20 transition-all duration-1000"></div>

        <div className="relative flex flex-col lg:flex-row justify-between lg:items-center gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 rounded-full bg-slate-950/50 border border-slate-800 text-[10px] font-black pointer-events-none uppercase text-slate-400 tracking-widest flex items-center">
                <Database size={12} className="mr-2 text-indigo-500" />
                {run.project}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-950/50 border border-slate-800 text-[10px] font-black pointer-events-none uppercase text-slate-400 tracking-widest flex items-center">
                <Globe size={12} className="mr-2 text-emerald-500" />
                {run.environment}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400 tracking-tighter leading-tight drop-shadow-2xl">
              {run.name}
            </h1>

            <div className="flex flex-wrap gap-3 pt-4">
              {run.tags && run.tags.map(tag => (
                <span key={tag} className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-slate-300 uppercase tracking-wider shadow-sm backdrop-blur-md">
                  <Tag size={12} className="mr-2 text-indigo-400" />
                  {tag.replace(/^@/, '')}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Score Ring */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                <circle
                  cx="64" cy="64" r="54"
                  stroke="currentColor" strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={339.29}
                  strokeDashoffset={339.29 - (339.29 * (run.passedCount / (run.totalCount || 1)))}
                  className={`${run.failedCount > 0 ? 'text-amber-500' : 'text-emerald-500'} transition-all duration-1000 ease-out`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">
                  {Math.round((run.passedCount / (run.totalCount || 1)) * 100)}%
                </span>
                <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Success</span>
              </div>
            </div>

            <div className="h-16 w-[1px] bg-slate-800 mx-2 hidden lg:block"></div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 min-w-[120px]">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                  <span className="text-xl font-black text-white">{run.passedCount}</span>
                </div>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Passed Scenarios</p>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 min-w-[120px]">
                <div className="flex items-center justify-between mb-2">
                  <XCircle size={18} className="text-rose-500" />
                  <span className={`text-xl font-black ${run.failedCount > 0 ? 'text-rose-500' : 'text-slate-500'}`}>{run.failedCount}</span>
                </div>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Failed Scenarios</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Duration', value: `${totalDuration.toFixed(2)}s`, icon: Clock, color: 'blue' },
          { label: 'Avg / Scenario', value: `${avgDuration.toFixed(3)}s`, icon: Zap, color: 'amber' },
          { label: 'Executed Steps', value: scenarios.reduce((a, b) => a + b.steps.length, 0), icon: PlayCircle, color: 'violet' },
          { label: 'Timestamp', value: new Date(run.timestamp).toLocaleTimeString(), icon: Calendar, color: 'slate' },
        ].map((metric, i) => (
          <div key={i} className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-2xl flex items-center space-x-4 hover:bg-slate-800/40 transition-colors">
            <div className={`p-3 bg-${metric.color}-500/10 rounded-xl text-${metric.color}-500 border border-${metric.color}-500/20`}>
              <metric.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{metric.label}</p>
              <p className="text-lg font-black text-white">{metric.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Failure Analysis (Conditional) */}
      {Object.keys(failureGroups).length > 0 && (
        <div className="bg-rose-950/10 border border-rose-900/30 rounded-[2rem] p-8 relative overflow-hidden">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-rose-500/20 rounded-lg text-rose-500 mr-3 animate-pulse">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Failure Analysis</h3>
              <p className="text-xs text-rose-400 font-bold uppercase tracking-wide">Automatic diagnostic groups</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {Object.entries(failureGroups).map(([error, count], idx) => (
              <div key={idx} className="flex items-center justify-between bg-slate-950/50 p-4 rounded-xl border border-rose-500/10 hover:border-rose-500/30 transition-colors">
                <code className="text-[11px] font-mono text-rose-300 truncate mr-4">{error}</code>
                <span className="px-3 py-1 bg-rose-500 rounded-lg text-white text-xs font-black">{count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Logs Navigation */}
      <div className="sticky top-4 z-20 bg-slate-950/90 backdrop-blur-xl border border-slate-800/50 p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-4 justify-between items-center no-print">
        <div className="flex bg-slate-900/80 p-1 rounded-xl w-full md:w-auto">
          {['ALL', 'FAILED', 'PASSED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${filter === f ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter size={14} className="text-slate-600 ml-2" />
          <div className="h-6 w-[1px] bg-slate-800 mx-2"></div>
          {allRunTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`
                group relative px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300
                ${selectedTag === tag
                  ? 'bg-indigo-600 shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)] text-white scale-105'
                  : 'bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 border border-slate-800 hover:border-indigo-500/30'}
              `}
            >
              <span className="relative z-10 flex items-center">
                <Tag size={12} className={`mr-2 transition-transform duration-300 ${selectedTag === tag ? 'rotate-12' : 'group-hover:rotate-12'}`} />
                {tag}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Scenarios List */}
      <div className="space-y-12">
        {Object.entries(
          filteredScenarios.reduce<Record<string, Scenario[]>>((acc, s) => {
            const feat = s.featureName || "Uncategorized Features";
            if (!acc[feat]) acc[feat] = [];
            acc[feat].push(s);
            return acc;
          }, {})
        ).map(([featureName, featureScenarios]: [string, Scenario[]]) => (
          <div key={featureName} className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-2 w-2 rounded-full bg-slate-700"></div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{featureName}</h3>
              <div className="h-[1px] flex-1 bg-slate-800"></div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {featureScenarios.map((scenario) => {
                const isExpanded = expandedScenarios.has(scenario.id);
                return (
                  <div key={scenario.id} className={`group bg-slate-900/40 border transition-all duration-500 rounded-3xl overflow-hidden ${isExpanded ? 'border-indigo-500/50 shadow-[0_0_50px_-10px_rgba(99,102,241,0.2)] bg-slate-900/60' : 'border-slate-800/60 hover:border-indigo-500/30 hover:shadow-[0_0_30px_-10px_rgba(99,102,241,0.1)] hover:bg-slate-900/60'}`}>
                    {/* Scenario Header Card */}
                    <div
                      onClick={() => toggleExpand(scenario.id)}
                      className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start space-x-5">
                        <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${scenario.status === TestStatus.PASSED ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20 group-hover:bg-rose-500 group-hover:text-white'}`}>
                          {scenario.status === TestStatus.PASSED ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                        </div>

                        <div>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {scenario.tags?.map(t => (
                              <span key={t} className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-500/5 border border-indigo-500/10 text-[9px] font-black text-indigo-400/80 uppercase tracking-widest hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-colors cursor-default">
                                {t.replace(/^@/, '')}
                              </span>
                            ))}
                          </div>
                          <h4 className="text-base font-bold text-slate-200 group-hover:text-white transition-colors leading-tight">
                            {scenario.name}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 pl-16 md:pl-0">
                        <div className="flex items-center space-x-2 text-slate-500">
                          <Clock size={16} />
                          <span className="text-xs font-mono font-bold">{scenario.duration.toFixed(3)}s</span>
                        </div>
                        <div className={`w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800'}`}>
                          <ChevronDown size={16} />
                        </div>
                      </div>
                    </div>

                    {/* Detailed Body */}
                    {isExpanded && (
                      <div className="border-t border-slate-800/60 bg-slate-950/40">
                        <div className="p-6 md:p-8 space-y-8">

                          {/* Mission Steps */}
                          <div>
                            <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-6 flex items-center">
                              <Terminal size={14} className="mr-2" /> Execution Log
                            </h5>
                            <div className="relative border-l-2 border-slate-800 ml-3 space-y-8 pb-4">
                              {scenario.steps.map((step, idx) => (
                                <div key={idx} className="relative pl-8 group/step">
                                  <span className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-slate-950 ${step.status === TestStatus.PASSED ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>

                                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                                    <div>
                                      <div className="flex items-center space-x-3 mb-1">
                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">{step.keyword}</span>
                                        <span className={`text-sm font-medium ${step.status === TestStatus.FAILED ? 'text-rose-400' : 'text-slate-300'}`}>{step.name}</span>
                                      </div>
                                    </div>
                                    {step.duration && <span className="text-[10px] font-mono text-slate-600 bg-slate-900 px-2 py-0.5 rounded">{step.duration.toFixed(3)}s</span>}
                                  </div>

                                  {step.log && (
                                    <div className="mt-3 bg-[#0d1117] rounded-xl border border-slate-800/80 p-5 font-mono text-[10px] text-slate-400 overflow-x-auto shadow-inner relative group/logs">
                                      <div className="absolute top-0 right-0 p-2 opacity-0 group-hover/logs:opacity-100 transition-opacity">
                                        <div className="bg-slate-800/50 p-1 rounded text-slate-500 text-[9px] font-bold uppercase tracking-wider">Terminal</div>
                                      </div>
                                      <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-slate-800/50 text-slate-600">
                                        <div className="flex space-x-1.5">
                                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50 hover:bg-rose-500 transition-colors"></div>
                                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50 hover:bg-amber-500 transition-colors"></div>
                                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50 hover:bg-emerald-500 transition-colors"></div>
                                        </div>
                                        <span className="text-[9px] font-bold uppercase tracking-widest pl-2 opacity-50">Console Output</span>
                                      </div>
                                      <div className="space-y-1">
                                        {step.log.split('\n').map((line, logIdx) => {
                                          // Specific parser for our screenshot format: [SCREENSHOT] Filename
                                          // or [FAILURE] Screenshot captured... Location: ...

                                          // Check for manual screenshot marker
                                          // Format from step_gui_interactions.py: print(f"\n[SCREENSHOT] {screenshot_name}")
                                          // ... print(f"   Location: ...")
                                          // ... print(f"   <img ... />")

                                          // We look for valid image paths in the log or the markers
                                          // Since getting the exact filename from the complex log structure might be tricky,
                                          // let's look for the <img src='file:///...'> pattern which contains the full path,
                                          // extracting the filename from it.

                                          const imgMatch = line.match(/<img src='file:\/\/\/.*[\\\/]([^'"]+\.png)'/);
                                          if (imgMatch) {
                                            const filename = imgMatch[1];
                                            const imageUrl = `http://localhost:3001/screenshots/${filename}`;
                                            return (
                                              <div key={logIdx} className="mt-2 mb-2">
                                                <div className="text-[10px] font-bold text-indigo-400 mb-1">📸 Screenshot Captured:</div>
                                                <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="block relative group cursor-zoom-in max-w-lg">
                                                  <img
                                                    src={imageUrl}
                                                    alt="Step Screenshot"
                                                    className="rounded-lg border border-slate-700 shadow-xl transition-all group-hover:scale-[1.02]"
                                                    onError={(e) => {
                                                      (e.target as HTMLImageElement).style.display = 'none';
                                                      // Fallback text if needed, or just hide
                                                    }}
                                                  />
                                                  <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none"></div>
                                                </a>
                                              </div>
                                            );
                                          }

                                          // Filter out the raw HTML img tag line if we just rendered it, nicely
                                          if (line.trim().startsWith("<img src='file:///")) return null;

                                          return <div key={logIdx}>{line}</div>;
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Diagnostics */}
                          {scenario.errorMessage && (
                            <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6">
                              <h5 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-4 flex items-center">
                                <AlertCircle size={14} className="mr-2" /> Exception Stack
                              </h5>
                              <pre className="text-xs font-mono text-rose-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                                {scenario.errorMessage}
                              </pre>
                            </div>
                          )}

                          {/* Raw Logs */}
                          {scenario.rawLogs && (
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center">
                                  <Activity size={14} className="mr-2" /> Raw Telemetry
                                </h5>
                              </div>
                              <div className="bg-black/30 rounded-2xl border border-slate-800 p-4 max-h-64 overflow-y-auto custom-scrollbar">
                                <pre className="text-[10px] font-mono text-slate-500/80 whitespace-pre-wrap">
                                  {scenario.rawLogs}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(71, 85, 105, 0.4); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.5); }
      `}</style>
    </div>
  );
};

export default RunDetailView;
