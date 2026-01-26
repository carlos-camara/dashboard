import React, { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { ExecutionRun, Scenario, TestStatus } from '../types';
import { ChevronLeft, CheckCircle2, XCircle, Clock, Globe, Activity, ChevronDown, Terminal, Database, Code, Brackets, Tag, AlertCircle, FileDown, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

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

  const handleExportPDF = async () => {
    if (!detailRef.current) return;
    setIsExporting(true);

    // 1. Force state for full capture
    const previousFilter = filter;
    const previousTag = selectedTag;
    const previousExpanded = new Set(expandedScenarios);

    setFilter('ALL');
    setSelectedTag(null);
    const allIds = new Set(scenarios.map(s => s.id));
    setExpandedScenarios(allIds);

    try {
      // 2. Wait longer for full layout reflow of all expanded cards
      await new Promise(r => setTimeout(r, 1500));

      const element = detailRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Sharper text
        useCORS: true,
        backgroundColor: '#0f172a',
        windowWidth: element.scrollWidth,
        ignoreElements: (el) => el.tagName === 'BUTTON' || el.classList.contains('no-print')
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Header
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pageWidth, 45, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EXECUTION DETAIL REPORT', 15, 18);

      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.text(`PROJECT: ${run.project.toUpperCase()}`, 15, 28);
      pdf.text(`RUN ID: ${run.id}`, 15, 32);

      // Right side branding
      pdf.setTextColor(99, 102, 241);
      pdf.text('QA HUB SENTINEL', pageWidth - 15, 18, { align: 'right' });
      pdf.setTextColor(148, 163, 184);
      pdf.text(new Date().toLocaleString(), pageWidth - 15, 28, { align: 'right' });
      pdf.text(`Run Time: ${new Date(run.timestamp).toLocaleString()}`, pageWidth - 15, 32, { align: 'right' });

      const imgProps = pdf.getImageProperties(imgData);
      const contentWidth = pageWidth - 20;
      const contentHeight = (imgProps.height * contentWidth) / imgProps.width;

      let heightLeft = contentHeight;
      let position = 40;

      pdf.addImage(imgData, 'PNG', 10, position, contentWidth, contentHeight);

      // Footer
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, pageHeight - 10, pageWidth, 10, 'F');
      pdf.setTextColor(71, 85, 105);
      pdf.setFontSize(7);
      pdf.text(`REPORT END - ${run.name}`, pageWidth / 2, pageHeight - 4, { align: 'center' });

      pdf.save(`Execution_Report_${run.name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("Run PDF Export failed", err);
    } finally {
      setExpandedScenarios(previousExpanded);
      setFilter(previousFilter);
      setSelectedTag(previousTag);
      setIsExporting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium font-mono text-xs uppercase tracking-widest">Parsing full execution artifacts...</p>
    </div>
  );

  return (
    <div ref={detailRef} className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between no-print">
        <button onClick={onBack} className="flex items-center text-slate-400 hover:text-white transition-colors group text-xs font-bold uppercase tracking-widest">
          <ChevronLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Project Inventory
        </button>

        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-white transition-all shadow-lg border border-slate-700 active:scale-95 disabled:opacity-50"
        >
          {isExporting ? <Loader2 size={12} className="mr-2 animate-spin text-indigo-500" /> : <FileDown size={12} className="mr-2 text-indigo-500" />}
          {isExporting ? 'Preparing...' : 'Export PDF Report'}
        </button>
      </div>

      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 uppercase tracking-widest">
              Project Context: {run.project}
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight">{run.name}</h2>

            <div className="flex flex-wrap gap-2 my-2">
              {run.tags && run.tags.map(tag => (
                <span key={tag} className="flex items-center text-[9px] font-black bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">
                  <Tag size={10} className="mr-1 opacity-50" /> {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <span className="flex items-center"><Clock size={12} className="mr-1" /> {new Date(run.timestamp).toLocaleString()}</span>
              <span className="flex items-center"><Globe size={12} className="mr-1" /> env: {run.environment}</span>
              <span className="flex items-center text-blue-400"><Database size={12} className="mr-1" /> ID: {run.id}</span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-3xl font-black text-white">{((run.passedCount / run.totalCount) * 100).toFixed(0)}%</div>
              <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Run Health</div>
            </div>
            <div className="h-10 w-[1px] bg-slate-800"></div>
            <div className="flex space-x-3">
              <div className="bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl text-center">
                <div className="text-lg font-black text-green-500">{run.passedCount}</div>
                <div className="text-[8px] text-slate-500 uppercase font-bold">Passed</div>
              </div>
              <div className="bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-xl text-center">
                <div className="text-lg font-black text-rose-500">{run.failedCount}</div>
                <div className="text-[8px] text-slate-500 uppercase font-bold">Failed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between sticky top-20 z-10 py-4 gap-4 no-print bg-slate-950/80 backdrop-blur-md rounded-2xl px-2">
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl w-fit">
          {['ALL', 'FAILED', 'PASSED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${filter === f ? 'bg-slate-800 text-white shadow-lg shadow-black/50' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {f === 'ALL' ? 'Everything' : f === 'FAILED' ? 'Failures' : 'Successful'}
            </button>
          ))}
        </div>

        {allRunTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto max-w-full pb-1 md:pb-0">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mr-2 whitespace-nowrap">Filter Scenario:</span>
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all whitespace-nowrap ${!selectedTag ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-300'}`}
            >
              All Tags
            </button>
            {allRunTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all whitespace-nowrap ${selectedTag === tag ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-300'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Scenarios List Grouped by Feature */}
      <div className="space-y-10">
        {Object.entries(
          filteredScenarios.reduce<Record<string, Scenario[]>>((acc, s) => {
            const feat = s.featureName || "Uncategorized Features";
            if (!acc[feat]) acc[feat] = [];
            acc[feat].push(s);
            return acc;
          }, {})
        ).map(([featureName, featureScenarios]) => (
          <div key={featureName} className="space-y-4">
            <div className="flex items-center space-x-4 px-2">
              <div className="h-[1px] flex-1 bg-slate-800"></div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap bg-slate-950 px-4 py-1 rounded-full border border-slate-800 flex items-center">
                <Brackets size={12} className="mr-2 text-blue-500" />
                Feature: {featureName}
              </h3>
              <div className="h-[1px] flex-1 bg-slate-800"></div>
            </div>

            <div className="space-y-4">
              {(featureScenarios as Scenario[]).map((scenario) => {
                const isExpanded = expandedScenarios.has(scenario.id);
                return (
                  <div key={scenario.id} className={`bg-slate-900/40 border transition-all duration-300 rounded-2xl overflow-hidden ${isExpanded ? 'border-slate-600 ring-1 ring-slate-600/50' : 'border-slate-800 hover:border-slate-700'}`}>
                    {/* Scenario Header */}
                    <div
                      onClick={() => toggleExpand(scenario.id)}
                      className="p-5 cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${scenario.status === TestStatus.PASSED ? 'bg-green-500/10 text-green-500' : 'bg-rose-500/10 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.1)]'}`}>
                          {scenario.status === TestStatus.PASSED ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                        </div>
                        <div>
                          <div className="flex flex-wrap gap-1 mb-1">
                            {scenario.tags && scenario.tags.map(t => (
                              <span key={t} className="text-[8px] font-black text-blue-500 opacity-80 uppercase">{t}</span>
                            ))}
                          </div>
                          <div className="flex items-center space-x-2">
                            <h5 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">Scenario: {scenario.name}</h5>
                          </div>
                          <div className="flex items-center space-x-3 mt-1 font-mono text-[9px] text-slate-500 uppercase font-bold">
                            <span className="flex items-center"><Clock size={10} className="mr-1" /> {scenario.duration.toFixed(3)}s</span>
                            {scenario.sourceFile && (
                              <span className="flex items-center text-blue-500"><Code size={10} className="mr-1" /> {scenario.sourceFile}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown size={18} className="text-slate-600" />
                      </div>
                    </div>

                    {/* Scenario Body */}
                    {isExpanded && (
                      <div className="border-t border-slate-800 bg-slate-950/40 animate-in slide-in-from-top-4">
                        <div className="p-6 space-y-8">
                          {/* Steps Section */}
                          <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center">
                              <Code size={12} className="mr-2" /> Execution Steps
                            </p>
                            <div className="space-y-1 ml-4 border-l-2 border-slate-800 pl-6">
                              {scenario.steps.map((step, idx) => (
                                <div key={idx} className="flex flex-col py-1 group/step">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <span className={`w-1.5 h-1.5 rounded-full ${step.status === TestStatus.PASSED ? 'bg-green-500' : 'bg-rose-500'}`}></span>
                                      <span className="text-[10px] font-black text-blue-500 w-10 uppercase">{step.keyword}</span>
                                      <span className={`text-xs ${step.status === TestStatus.FAILED ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>{step.name}</span>
                                    </div>
                                    {step.duration && <span className="text-[9px] font-mono text-slate-600 font-bold">{step.duration.toFixed(3)}s</span>}
                                  </div>
                                  {step.log && (
                                    <div className="mt-2 ml-14 bg-slate-900/50 border border-slate-800 rounded-lg p-3 overflow-x-auto">
                                      <pre className="text-[10px] text-slate-500 font-mono whitespace-pre leading-tight">
                                        {step.log}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Error Message */}
                          {scenario.errorMessage && (
                            <div className="space-y-3">
                              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center">
                                <AlertCircle size={12} className="mr-2" /> Failure Diagnostic
                              </p>
                              <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-xl">
                                <pre className="text-xs text-rose-400 font-mono whitespace-pre-wrap leading-relaxed">
                                  {scenario.errorMessage}
                                </pre>
                              </div>
                            </div>
                          )}

                          {/* Raw Logs Section */}
                          {scenario.rawLogs && (
                            <div className="space-y-3">
                              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center">
                                <Terminal size={12} className="mr-2" /> Full Session Log
                              </p>
                              <div className="bg-black/40 border border-slate-800 p-4 rounded-xl max-h-[400px] overflow-y-auto custom-scrollbar">
                                <pre className="text-[10px] text-slate-400 font-mono whitespace-pre-wrap leading-relaxed">
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
    </div>
  );
};

export default RunDetailView;
