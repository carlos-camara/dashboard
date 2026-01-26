
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { api } from '../services/api';
import { DashboardStats, TimelineData, ExecutionRun, Endpoint } from '../types';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend, ComposedChart, Line
} from 'recharts';
import {
  Zap, Clock, Target, ShieldCheck, Box, Activity,
  RefreshCw, AlertCircle, TrendingUp, Beaker,
  WifiOff, ServerCrash, Cpu, ArrowUpRight, ArrowDownRight,
  ChevronRight, Bug, Microscope, FlaskConical, BarChart3, PieChart as PieIcon,
  Search, Shield, Layers, LayoutGrid, FileDown, Loader2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface DashboardViewProps {
  refreshKey?: number;
  onNavigate?: (tab: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ refreshKey, onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [timeline, setTimeline] = useState<TimelineData[]>([]);
  const [runs, setRuns] = useState<ExecutionRun[]>([]);
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [dateRange, setDateRange] = useState<number>(7);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [chartMode, setChartMode] = useState<'success' | 'volume'>('success');

  const dashboardRef = useRef<HTMLDivElement>(null);

  const fetchData = async (silent = false) => {
    const isAlive = await api.checkHealth();
    // For local storage mock, we assume it's always alive unless we use real backend
    // Since we are currently in an environment with both services/api.ts (localStorage) 
    // and backend_main.py (SQL), we'll try to reach the real health check.
    const hasRealBackend = await fetch("http://localhost:8000/api/health").then(() => true).catch(() => false);

    if (hasRealBackend) {
      setIsOffline(false);
    }

    if (!silent) setStats(null);
    try {
      const [s, t, r, e] = await Promise.all([
        api.getStats(dateRange),
        api.getTimeline(dateRange),
        api.getRecentRuns(),
        api.getEndpoints()
      ]);
      setStats(s);
      setTimeline(t);
      setRuns(r);
      setEndpoints(e);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    }
  };

  const filteredRuns = useMemo(() => {
    const now = new Date();
    return runs.filter(r => {
      const diffDays = (now.getTime() - new Date(r.timestamp).getTime()) / (1000 * 3600 * 24);
      return dateRange === 0 || diffDays <= dateRange;
    });
  }, [runs, dateRange]);

  const filteredEndpoints = useMemo(() => endpoints, [endpoints]);

  const handleSync = async () => {
    setIsSyncing(true);
    const result = await api.syncReports();
    if (result.newRuns > 0) {
      fetchData(true);
    }
    setTimeout(() => setIsSyncing(false), 1500);
  };

  const handleExportPDF = async () => {
    if (!dashboardRef.current || !stats) return;
    setIsExporting(true);

    try {
      await new Promise(r => setTimeout(r, 500));

      const element = dashboardRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#0f172a',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        ignoreElements: (el) => {
          return el.tagName === 'BUTTON' || el.classList.contains('no-print') || el.getAttribute('role') === 'tablist';
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // 1. Add Professional Header
      pdf.setFillColor(15, 23, 42); // slate-900
      pdf.rect(0, 0, pageWidth, 40, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text('QA HUB INTELLIGENCE REPORT', 15, 20);

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(148, 163, 184); // slate-400
      pdf.text(`GENERATED: ${new Date().toLocaleString()}`, 15, 30);
      pdf.text(`DATE RANGE: LAST ${dateRange} DAYS`, 15, 34);

      // Sentinel Branding
      pdf.setTextColor(99, 102, 241); // indigo-500
      pdf.setFont('helvetica', 'bold');
      pdf.text('SENTINEL SYSTEM v2.0', pageWidth - 15, 20, { align: 'right' });

      // 2. Add Content Image
      const imgProps = pdf.getImageProperties(imgData);
      const contentWidth = pageWidth - 20;
      const contentHeight = (imgProps.height * contentWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 10, 45, contentWidth, contentHeight);

      // 3. Footer
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');
      pdf.setTextColor(71, 85, 105); // slate-600
      pdf.setFontSize(7);
      pdf.text('CONFIDENTIAL - QA INTELLIGENCE TERMINAL - PAGE 1/1', pageWidth / 2, pageHeight - 7, { align: 'center' });

      pdf.save(`QA_Hub_Insight_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("PDF Export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange, refreshKey]);

  // Analytics Logic
  const projectHealthData = useMemo(() => {
    const projects: Record<string, { name: string, passed: number, total: number }> = {};
    filteredRuns.forEach(run => {
      if (!projects[run.project]) projects[run.project] = { name: run.project, passed: 0, total: 0 };
      projects[run.project].passed += run.passedCount;
      projects[run.project].total += run.totalCount;
    });
    return Object.values(projects).map(p => ({
      name: p.name,
      rate: p.total > 0 ? Math.round((p.passed / p.total) * 100) : 0,
      total: p.total
    })).sort((a, b) => a.rate - b.rate);
  }, [filteredRuns]);

  const hourlyDistribution = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, count: 0 }));
    filteredRuns.forEach(run => {
      const h = new Date(run.timestamp).getHours();
      hours[h].count += 1;
    });
    return hours;
  }, [filteredRuns]);

  const topErrors = useMemo(() => {
    const errors: Record<string, number> = {};
    filteredRuns.filter(r => r.failedCount > 0).forEach(run => {
      const key = run.project + " Logic Error";
      errors[key] = (errors[key] || 0) + run.failedCount;
    });
    return Object.entries(errors)
      .map(([msg, count]) => ({ msg, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredRuns]);

  const slowestEndpoints = useMemo(() => {
    return [...filteredEndpoints].sort((a, b) => b.avgDuration - a.avgDuration).slice(0, 5);
  }, [filteredEndpoints]);

  const qualityScore = useMemo(() => {
    if (!stats) return 0;
    const coverageFactor = Math.min(1, endpoints.length / (runs.length || 1));
    return Math.round((stats.passRate * 0.8) + (coverageFactor * 20));
  }, [stats, endpoints, runs]);

  if (isOffline) return (
    <div className="flex flex-col items-center justify-center h-[70vh] space-y-8 animate-in zoom-in-95 duration-500">
      <div className="relative">
        <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20">
          <ServerCrash size={48} className="text-rose-500" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-950 rounded-full flex items-center justify-center border border-slate-800">
          <WifiOff size={16} className="text-rose-600" />
        </div>
      </div>
      <div className="text-center max-w-sm">
        <h3 className="text-2xl font-black text-white">Interface Link Severed</h3>
        <p className="text-slate-500 mt-2 text-sm leading-relaxed">
          The dashboard is unable to establish a secure connection with the Python SQLite vault.
        </p>
        <button
          onClick={() => fetchData()}
          className="mt-8 flex items-center justify-center space-x-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-2xl font-black transition-all shadow-xl shadow-indigo-600/30"
        >
          <RefreshCw size={18} />
          <span>Initialize Re-sync</span>
        </button>
      </div>
    </div>
  );

  if (!stats) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-8">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
        <Cpu className="absolute inset-0 m-auto text-indigo-500 animate-pulse" size={28} />
      </div>
      <div className="text-center">
        <p className="text-white font-black tracking-tight text-lg">Querying Execution Shards</p>
        <div className="flex items-center justify-center space-x-2 mt-2">
          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div ref={dashboardRef} className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-24">
      {/* Header with Global Quality Score */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 no-print">
        <div className="flex items-start space-x-6">
          <div className="relative group hidden sm:block">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * qualityScore) / 100}
                className={`${qualityScore > 80 ? 'text-indigo-500' : 'text-amber-500'} transition-all duration-1000 ease-out`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-white">{qualityScore}%</span>
              <span className="text-[8px] font-black uppercase text-slate-500 tracking-tighter">Score</span>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2 text-indigo-500 mb-1">
              <Shield size={14} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em]">Sentinel Intelligence Terminal</span>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter leading-none">Command Center</h2>
            <p className="text-slate-400 text-sm mt-3 flex items-center">
              <Layers size={14} className="mr-2 text-slate-600" />
              Aggregating <span className="text-white font-bold mx-1">{runs.length}</span> executions across <span className="text-white font-bold mx-1">{projectHealthData.length}</span> project clusters
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-slate-900/60 p-2 rounded-[2rem] border border-slate-800/50 backdrop-blur-xl">
          <div className="flex items-center p-1 bg-slate-950/50 rounded-2xl border border-slate-800">
            <button
              onClick={() => setChartMode('success')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center ${chartMode === 'success' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Activity size={12} className="mr-2" /> Stability
            </button>
            <button
              onClick={() => setChartMode('volume')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center ${chartMode === 'volume' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <BarChart3 size={12} className="mr-2" /> Volume
            </button>
          </div>
          <div className="h-8 w-[1px] bg-slate-800 mx-1"></div>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-2xl text-[11px] font-black uppercase text-white transition-all shadow-lg border border-slate-700 active:scale-95 disabled:opacity-50"
          >
            {isExporting ? <Loader2 size={14} className="mr-2 animate-spin text-indigo-500" /> : <FileDown size={14} className="mr-2 text-indigo-500" />}
            {isExporting ? 'Generating...' : 'Download Report'}
          </button>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center bg-indigo-500 hover:bg-indigo-400 px-6 py-3 rounded-2xl text-[11px] font-black uppercase text-white transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <RefreshCw size={14} className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Synchronizing' : 'Trigger Sync'}
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Network Health', value: `${stats.passRate}%`, icon: ShieldCheck, color: 'indigo', sub: 'Success Ratio' },
          { label: 'Mapped Surface', value: endpoints.length, icon: Box, color: 'violet', sub: 'Detected Endpoints' },
          { label: 'Active Projects', value: projectHealthData.length, icon: LayoutGrid, color: 'blue', sub: 'Connected Clusters' },
          { label: 'Open Incidents', value: runs.reduce((a, b) => a + b.failedCount, 0), icon: Bug, color: 'rose', sub: 'Failures Detected' },
        ].map((kpi, i) => (
          <div key={i} className="bg-slate-900/30 border border-slate-800/60 p-6 rounded-[2rem] relative group hover:border-indigo-500/30 transition-all hover:bg-slate-900/50">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-2xl bg-${kpi.color}-500/10 border border-${kpi.color}-500/20 text-${kpi.color}-500 group-hover:scale-110 transition-transform`}>
                <kpi.icon size={22} />
              </div>
              <div className="flex flex-col items-end">
                <div className={`text-[10px] font-black text-${kpi.color}-500 uppercase tracking-widest`}>{kpi.sub}</div>
                <div className="h-1 w-8 bg-slate-800 rounded-full mt-1 overflow-hidden">
                  <div className={`h-full bg-${kpi.color}-500 w-2/3`}></div>
                </div>
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{kpi.label}</p>
            <h3 className="text-4xl font-black text-white mt-1 tracking-tighter">{kpi.value}</h3>
          </div>
        ))}
      </div>

      {/* Main Trends & Project Integrity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Activity size={200} className="text-indigo-500" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
            <div>
              <h4 className="text-xl font-black text-white tracking-tight">Intelligence Stream</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Cross-environment historical stability</p>
            </div>
            <div className="flex bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800 no-print">
              {[7, 14, 30].map(d => (
                <button key={d} onClick={() => setDateRange(d)} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${dateRange === d ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                  {d}D
                </button>
              ))}
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartMode === 'success' ? '#6366f1' : '#10b981'} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={chartMode === 'success' ? '#6366f1' : '#10b981'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.1} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} />
                <Tooltip
                  cursor={{ stroke: '#4f46e5', strokeWidth: 2 }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '20px', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)', fontSize: '11px', color: '#fff' }}
                  itemStyle={{ fontWeight: 800 }}
                />
                <Area
                  type="monotone"
                  dataKey={chartMode === 'success' ? 'pass' : 'pass'}
                  stroke={chartMode === 'success' ? '#6366f1' : '#10b981'}
                  fillOpacity={1}
                  fill="url(#colorArea)"
                  strokeWidth={4}
                  animationDuration={1500}
                />
                <Line type="monotone" dataKey="fail" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4, fill: '#f43f5e' }} strokeDasharray="3 3" />
                {chartMode === 'volume' && <Bar dataKey="pass" fill="#10b981" opacity={0.3} radius={[4, 4, 0, 0]} barSize={20} />}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[3rem] flex flex-col group">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-xl font-black text-white tracking-tight">Project Integrity</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Pass rate per service cluster</p>
            </div>
            <div className="p-2 bg-slate-800/50 rounded-xl text-slate-500 group-hover:text-indigo-400 transition-colors">
              <LayoutGrid size={18} />
            </div>
          </div>

          <div className="flex-1 space-y-6">
            {projectHealthData.map((p, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-white truncate max-w-[140px] tracking-tight">{p.name}</span>
                  <span className={`text-[11px] font-black ${p.rate > 90 ? 'text-indigo-400' : p.rate > 70 ? 'text-amber-400' : 'text-rose-400'}`}>{p.rate}%</span>
                </div>
                <div className="h-3 w-full bg-slate-950 rounded-full border border-slate-800 overflow-hidden relative">
                  <div
                    className={`h-full transition-all duration-1000 ${p.rate > 90 ? 'bg-indigo-500' : p.rate > 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${p.rate}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-shimmer" style={{ width: '20%' }}></div>
                  </div>
                </div>
              </div>
            ))}
            {projectHealthData.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 italic py-20">
                <LayoutGrid size={32} className="mb-4 opacity-20" />
                <p className="text-[10px] font-black uppercase">No projects detected</p>
              </div>
            )}
          </div>
          <button
            onClick={() => onNavigate?.('endpoints')}
            className="mt-8 py-3 rounded-2xl bg-slate-800/50 text-[10px] font-black uppercase text-slate-400 border border-slate-700/50 hover:bg-slate-800 transition-all no-print"
          >
            View Health Details
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[3rem]">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center">
              <Clock size={16} className="text-indigo-500 mr-3" /> Temporal Load
            </h4>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyDistribution}>
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {hourlyDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.count > 0 ? '#6366f1' : '#1e293b'} opacity={0.6 + (entry.count / 10)} />
                  ))}
                </Bar>
                <Tooltip contentStyle={{ display: 'none' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest px-2">
            <span>00:00</span>
            <span>12:00</span>
            <span>23:59</span>
          </div>
          <p className="mt-6 text-[11px] text-slate-500 font-bold leading-relaxed">
            Automation distribution peaks correlate with deployment windows. Ensure high-concurrency coverage.
          </p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[3rem]">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center">
              <Zap size={16} className="text-amber-500 mr-3" /> Latency Risks
            </h4>
            <TrendingUp size={14} className="text-slate-600" />
          </div>
          <div className="space-y-5">
            {slowestEndpoints.map((ep, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-black text-slate-400 group-hover:text-indigo-400 transition-colors truncate max-w-[180px]">
                    {ep.method} {ep.path}
                  </span>
                  <span className="text-[10px] font-black text-white">{ep.avgDuration.toFixed(0)}ms</span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
                  <div
                    className={`h-full transition-all duration-700 ${ep.avgDuration > 500 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                    style={{ width: `${Math.min(100, (ep.avgDuration / 1000) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {slowestEndpoints.length === 0 && <p className="text-[10px] text-slate-600 italic py-10 text-center">No latency profiles captured.</p>}
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[3rem]">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center">
              <AlertCircle size={16} className="text-rose-500 mr-3" /> Incident Analysis
            </h4>
            <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center">
              <Bug size={14} className="text-rose-500" />
            </div>
          </div>
          <div className="space-y-4">
            {topErrors.map((err, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-800/60 rounded-2xl group hover:border-rose-500/20 transition-all">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-[11px] font-black text-white leading-tight truncate group-hover:text-rose-400 transition-colors">{err.msg}</p>
                  <p className="text-[9px] text-slate-600 font-black uppercase mt-1 tracking-tighter">Impact across clusters</p>
                </div>
                <div className="text-xs font-black text-rose-500 bg-rose-500/10 w-8 h-8 rounded-xl flex items-center justify-center border border-rose-500/20">
                  {err.count}
                </div>
              </div>
            ))}
            {topErrors.length === 0 && (
              <div className="py-12 text-center opacity-40 grayscale">
                <ShieldCheck size={48} className="mx-auto text-emerald-500 mb-4" />
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Workspace Stable</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(500%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default DashboardView;
