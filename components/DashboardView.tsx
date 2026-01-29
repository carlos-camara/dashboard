
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { api } from '../services/api';
import { DashboardStats, TimelineData, ExecutionRun, Endpoint } from '../types';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Zap, Clock, Target, ShieldCheck, Box, Activity,
  RefreshCw, TrendingUp, Layers, FileDown, Loader2,
  Terminal, Radio, Signal, CheckCircle2, AlertTriangle, Monitor,
  LayoutDashboard
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { generateExecutiveReport } from '../services/reportGenerator';

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
  const [isExporting, setIsExporting] = useState(false);
  const [chartMode, setChartMode] = useState<'success' | 'volume'>('success');
  const [systemStatus, setSystemStatus] = useState<string>("SYSTEM OPTIMAL");

  const dashboardRef = useRef<HTMLDivElement>(null);

  const fetchData = async (silent = false) => {
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

      const failingProjects = Object.values(processProjectHealth(r)).filter(p => p.rate < 80).length;
      if (failingProjects > 2) setSystemStatus("CRITICAL INSTABILITY DETECTED");
      else if (failingProjects > 0) setSystemStatus("PARTIAL SERVICE DEGRADATION");
      else setSystemStatus("SYSTEM OPTIMAL");

    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      setSystemStatus("CONNECTION SEVERED - OFFLINE MODE");
    }
  };

  const processProjectHealth = (runData: ExecutionRun[]) => {
    const projects: Record<string, { name: string, passed: number, total: number }> = {};
    runData.forEach(run => {
      if (!projects[run.project]) projects[run.project] = { name: run.project, passed: 0, total: 0 };
      projects[run.project].passed += run.passedCount;
      projects[run.project].total += run.totalCount;
    });
    return Object.values(projects).map(p => ({
      name: p.name,
      rate: p.total > 0 ? Math.round((p.passed / p.total) * 100) : 0,
      total: p.total
    })).sort((a, b) => a.rate - b.rate);
  };

  const filteredRuns = useMemo(() => {
    const now = new Date();
    return runs.filter(r => {
      const diffDays = (now.getTime() - new Date(r.timestamp).getTime()) / (1000 * 3600 * 24);
      return dateRange === 0 || diffDays <= dateRange;
    });
  }, [runs, dateRange]);

  const projectHealthData = useMemo(() => processProjectHealth(filteredRuns), [filteredRuns]);

  const topErrors = useMemo(() => {
    const errors: Record<string, number> = {};
    filteredRuns.filter(r => r.failedCount > 0).forEach(run => {
      const key = `${run.project}: Logic Verification Failed`;
      errors[key] = (errors[key] || 0) + run.failedCount;
    });
    return Object.entries(errors)
      .map(([msg, count]) => ({ msg, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredRuns]);

  const slowestEndpoints = useMemo(() => {
    return [...endpoints].sort((a, b) => b.avgDuration - a.avgDuration).slice(0, 5);
  }, [endpoints]);

  const qualityScore = useMemo(() => {
    if (!stats) return 0;
    const coverageFactor = Math.min(1, endpoints.length / (runs.length || 1));
    return Math.round((stats.passRate * 0.8) + (coverageFactor * 20));
  }, [stats, endpoints, runs]);

  const handleSync = async () => {
    setIsSyncing(true);
    const result = await api.syncReports();
    if (result.newRuns > 0) fetchData(true);
    setTimeout(() => setIsSyncing(false), 1500);
  };

  const handleExportPDF = async () => {
    if (!stats) return;
    setIsExporting(true);
    try {
      // Use the professional report generator
      generateExecutiveReport(
        stats,
        filteredRuns,
        endpoints,
        projectHealthData,
        topErrors,
        slowestEndpoints
      );
    } catch (err) {
      console.error("Professional report generation failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => { fetchData(); }, [dateRange, refreshKey]);

  // Fallback defaults if stats are null (e.g. error case) to verify UI
  const safeStats = stats || { totalRuns: 0, passRate: 0, avgDuration: 0 };

  return (
    <div ref={dashboardRef} className="w-full text-white font-sans selection:bg-indigo-500/30 selection:text-indigo-200">

      {/* Status Bar */}
      <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 h-10 flex items-center px-4 md:px-6 shadow-2xl">
        <div className="flex items-center space-x-3 text-cyan-400 border-r border-white/10 pr-6 mr-6 h-full">
          <Monitor size={14} className="animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.2em]">{systemStatus}</span>
        </div>
        <div className="flex-1 overflow-hidden relative group">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-950 to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-950 to-transparent z-10"></div>
          <div className="inline-block animate-marquee whitespace-nowrap text-[10px] font-mono text-slate-400/80">
            {runs.slice(0, 5).map((r, i) => (
              <span key={i} className="mx-8 flex items-center inline-flex">
                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${r.failedCount > 0 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></span>
                RUN {r.id.split('-')[0]} :: {r.project} :: <span className={r.failedCount > 0 ? "text-rose-400 ml-1" : "text-emerald-400 ml-1"}>{r.passedCount}/{r.totalCount} PASS</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">

        {/* Header Section */}
        <header className="flex flex-col lg:flex-row justify-between items-end gap-6 pb-6 border-b border-white/5">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-indigo-400">
              <LayoutDashboard size={18} />
              <span className="text-xs font-bold tracking-[0.2em] uppercase">Dashboard Cluster</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-100 to-indigo-500/50 leading-[0.9] animate-float">
              COMMAND<br />CENTER
            </h1>
          </div>

          <div className="flex items-center gap-4 glass-panel p-2 rounded-2xl">
            <div className="flex p-1 bg-slate-950/50 rounded-xl">
              <button onClick={() => setDateRange(7)} aria-label="7D Window" className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${dateRange === 7 ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>7D</button>
              <button onClick={() => setDateRange(30)} aria-label="30D Window" className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${dateRange === 30 ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>30D</button>
            </div>
            <div className="h-8 w-px bg-white/10 mx-2"></div>
            <button onClick={handleExportPDF} disabled={isExporting} aria-label="Export Report" className="p-3 hover:bg-slate-800 rounded-xl text-indigo-400 transition-colors">
              {isExporting ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
            </button>
            <button onClick={handleSync} disabled={isSyncing} aria-label="Sync Data" className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 group">
              <RefreshCw size={18} className={`group-hover:rotate-180 transition-transform duration-700 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {(!stats && !systemStatus.includes("OFFLINE")) ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 size={48} className="animate-spin mb-4 text-indigo-500" />
            <p className="font-mono text-xs tracking-[0.2em] animate-pulse">ESTABLISHING DATA UPLINK...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'System Health', value: `${qualityScore}%`, icon: Activity, color: qualityScore > 90 ? 'emerald' : qualityScore > 70 ? 'amber' : 'rose' },
                { label: 'Total Executions', value: safeStats.totalRuns, icon: Layers, color: 'violet' },
                { label: 'Pass Rate', value: `${safeStats.passRate}%`, icon: ShieldCheck, color: 'cyan' },
                { label: 'Avg Latency', value: `${safeStats.avgDuration}ms`, icon: Clock, color: 'indigo' }
              ].map((stat, i) => (
                <div key={i} className="group relative glass-panel p-6 rounded-3xl overflow-hidden hover:bg-slate-900/60 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/30">
                  <div className={`absolute -right-4 -top-4 w-32 h-32 bg-${stat.color}-500/10 rounded-full blur-3xl group-hover:bg-${stat.color}-500/20 transition-all`}></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                      <stat.icon size={20} className={`text-${stat.color}-500 drop-shadow-[0_0_8px_rgba(var(--${stat.color}-500-rgb),0.5)]`} />
                    </div>
                    <h3 className="text-4xl font-black text-white tracking-tight">{stat.value}</h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Chart Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass-panel p-8 rounded-[2.5rem] relative overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-white flex items-center gap-3">
                      <Signal size={24} className="text-indigo-500" />
                      Signal Velocity
                    </h3>
                  </div>
                  <div className="bg-slate-950/80 p-1.5 rounded-xl border border-white/5 flex gap-1">
                    <button
                      onClick={() => setChartMode('success')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 ${chartMode === 'success' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                      <Activity size={14} /> Stability
                    </button>
                    <button
                      onClick={() => setChartMode('volume')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 ${chartMode === 'volume' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                      <TrendingUp size={14} /> Volume
                    </button>
                  </div>
                </div>

                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '16px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                        cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                      />
                      <Area
                        type="monotone"
                        dataKey={chartMode === 'success' ? 'pass' : 'total'}
                        stroke="#6366f1"
                        strokeWidth={4}
                        fill="url(#colorGradient)"
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sector Integrity */}
              <div className="glass-panel p-8 rounded-[2.5rem] flex flex-col h-full">
                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                  <Box size={22} className="text-violet-500" /> Sector Integrity
                </h3>
                <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2 max-h-[300px]">
                  {projectHealthData.map(p => (
                    <div key={p.name} className="flex items-center justify-between p-4 bg-slate-950/40 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-8 rounded-full ${p.rate > 90 ? 'bg-emerald-500' : p.rate > 70 ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                        <div>
                          <p className="text-xs font-bold text-slate-300 uppercase">{p.name}</p>
                          <div className="h-1 w-16 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                            <div className={`h-full ${p.rate > 90 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${p.rate}%` }}></div>
                          </div>
                        </div>
                      </div>
                      <span className="text-lg font-black text-white">{p.rate}%</span>
                    </div>
                  ))}
                  {projectHealthData.length === 0 && <div className="text-center text-slate-600 text-xs py-10 font-mono">NO ACTIVE SECTORS</div>}
                </div>
              </div>
            </div>

            {/* Incidents & Endpoints */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
              {/* Incidents */}
              <div className="glass-panel p-8 rounded-[2.5rem]">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-rose-500" /> Incident Taxonomy
                </h3>
                <div className="space-y-3">
                  {topErrors.map((err, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-slate-950/30 rounded-2xl border border-white/5 border-l-4 border-l-rose-500/50 hover:bg-slate-950/50 transition-colors">
                      <span className="text-xs font-mono text-rose-300/80 w-3/4 truncate">{err.msg}</span>
                      <span className="px-3 py-1 bg-rose-500/10 text-rose-400 text-[10px] font-black rounded-full border border-rose-500/20">{err.count}</span>
                    </div>
                  ))}
                  {topErrors.length === 0 && <p className="text-center text-slate-600 text-xs py-8">No anomalies detected.</p>}
                </div>
              </div>

              {/* Endpoints */}
              <div className="glass-panel p-8 rounded-[2.5rem]">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Zap size={16} className="text-amber-500" /> Latency Anomalies
                </h3>
                <div className="space-y-4">
                  {slowestEndpoints.map((ep, i) => (
                    <div key={i} className="group">
                      <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 group-hover:text-amber-400 transition-colors">
                        <span className="font-mono">{ep.method} {ep.path}</span>
                        <span>{ep.avgDuration.toFixed(0)}ms</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${ep.avgDuration > 800 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, (ep.avgDuration / 2000) * 100)}%` }}></div>
                      </div>
                    </div>
                  ))}
                  {slowestEndpoints.length === 0 && <p className="text-center text-slate-600 text-xs py-8">Latency nominal.</p>}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        .animate-marquee { animation: marquee 30s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default DashboardView;
