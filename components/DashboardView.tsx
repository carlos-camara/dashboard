
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { api } from '../services/api';
import { DashboardStats, TimelineData, ExecutionRun, Endpoint } from '../types';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, ComposedChart, Line
} from 'recharts';
import {
  Zap, Clock, Target, ShieldCheck, Box, Activity,
  RefreshCw, AlertCircle, TrendingUp, Cpu,
  Bug, PieChart as PieIcon,
  Search, Shield, Layers, LayoutGrid, FileDown, Loader2,
  Terminal, Radio, Signal, CheckCircle2, XCircle, AlertTriangle
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

      // Update system status based on health
      const failingProjects = Object.values(processProjectHealth(r)).filter(p => p.rate < 80).length;
      if (failingProjects > 2) setSystemStatus("CRITICAL INSTABILITY DETECTED");
      else if (failingProjects > 0) setSystemStatus("PARTIAL SERVICE DEGRADATION");
      else setSystemStatus("ALL SYSTEMS OPERATIONAL");

    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      setSystemStatus("CONNECTION SEVERED - OFFLINE MODE");
    }
  };

  // Helper to process project health
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

  // --- ANALYSIS ENGINE ---
  const generateAnalysis = () => {
    const lines: string[] = [];

    // 1. Overall Assessment
    if (qualityScore >= 90) lines.push(`The overall system health is excellent with a Quality Score of ${qualityScore}%. Automation stability is consistent across most sectors.`);
    else if (qualityScore >= 70) lines.push(`The system is showing signs of degradation (Score: ${qualityScore}%). Focused attention is needed on unstable endpoints.`);
    else lines.push(`CRITICAL: System stability has dropped to ${qualityScore}%. Immediate remediation is required for failing workflows.`);

    // 2. Project Highlights
    const bestProject = projectHealthData[projectHealthData.length - 1];
    const worstProject = projectHealthData[0];

    if (bestProject && worstProject) {
      lines.push(`'${bestProject.name}' is the top performer with ${bestProject.rate}% pass rate.`);
      if (worstProject.rate < 80) lines.push(`However, '${worstProject.name}' is critically unstable (${worstProject.rate}% pass rate) and contributes disproportionately to failure volume.`);
    }

    // 3. Latency Insights
    const avgLat = slowestEndpoints.length > 0 ? slowestEndpoints.reduce((a, b) => a + b.avgDuration, 0) / slowestEndpoints.length : 0;
    if (avgLat > 1000) lines.push(`Performance degradation observed. Top 5 slowest endpoints average ${avgLat.toFixed(0)}ms, suggesting potential bottlenecks in the API gateway or database layer.`);

    // 4. Incident Patterns
    if (topErrors.length > 0) {
      lines.push(`The most frequent incident pattern is "${topErrors[0].msg}" with ${topErrors[0].count} occurrences.`);
    } else {
      lines.push("No significant recurring error patterns were detected in the log analysis.");
    }

    return lines;
  };

  const handleExportPDF = async () => {
    if (!dashboardRef.current || !stats) return;
    setIsExporting(true);

    try {
      await new Promise(r => setTimeout(r, 500));
      const element = dashboardRef.current;

      // Temporarily hide buttons for capture
      element.classList.add('printing-mode');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#0f172a',
        ignoreElements: (el) => el.tagName === 'BUTTON' || el.classList.contains('no-print')
      });

      element.classList.remove('printing-mode');

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // --- PAGE 1: COVER & EXECUTIVE SUMMARY ---

      // Heavy Header
      pdf.setFillColor(15, 23, 42); // slate-900
      pdf.rect(0, 0, pageWidth, 50, 'F');

      // Logo / Title
      pdf.setTextColor(99, 102, 241); // indigo-500
      pdf.setFontSize(30);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SENTINEL', 20, 25);

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('INTELLIGENCE REPORT', 20, 35);

      // Metadata
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184); // slate-400
      pdf.text(`REPORT ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`, pageWidth - 60, 20);
      pdf.text(`DATE: ${new Date().toLocaleString()}`, pageWidth - 60, 25);
      pdf.text(`WINDOW: LAST ${dateRange} DAYS`, pageWidth - 60, 30);

      // Automated Analysis Section
      pdf.setFontSize(14);
      pdf.setTextColor(15, 23, 42); // slate-900
      pdf.text('Executive Signal Analysis', 20, 70);

      pdf.setFontSize(10);
      pdf.setTextColor(71, 85, 105); // slate-600
      let yPos = 80;
      const analysisLines = generateAnalysis();

      analysisLines.forEach(line => {
        const splitLines = pdf.splitTextToSize(line, pageWidth - 40);
        pdf.text(splitLines, 20, yPos);
        yPos += (splitLines.length * 5) + 3;
      });

      // KPI Table Mockup
      yPos += 15;
      pdf.setFillColor(241, 245, 249);
      pdf.rect(20, yPos, pageWidth - 40, 30, 'F');

      pdf.setFontSize(9);
      pdf.setTextColor(100);
      pdf.text("TOTAL EXECUTIONS", 30, yPos + 10);
      pdf.text("PASS RATE", 80, yPos + 10);
      pdf.text("AVG LATENCY", 130, yPos + 10);

      pdf.setFontSize(14);
      pdf.setTextColor(0);
      pdf.text(stats.totalRuns.toString(), 30, yPos + 20);
      pdf.text(`${stats.passRate}%`, 80, yPos + 20);
      pdf.text(stats.avgDuration, 130, yPos + 20);

      // Add Visual Snapshot (Chart)
      const imgProps = pdf.getImageProperties(imgData);
      const contentWidth = pageWidth - 40;
      const contentHeight = (imgProps.height * contentWidth) / imgProps.width;

      // If image is too tall, add new page
      if (yPos + 50 + contentHeight > pageHeight) {
        pdf.addPage();
        yPos = 20;
      } else {
        yPos += 50;
      }

      pdf.setFontSize(14);
      pdf.text('Visual Telemetry', 20, yPos - 5);
      pdf.addImage(imgData, 'PNG', 20, yPos, contentWidth, contentHeight);

      // Footer
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFillColor(15, 23, 42);
        pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`SENTINEL INTELLIGENCE TERMINAL - CONFIDENTIAL - PAGE ${i}/${pageCount}`, pageWidth / 2, pageHeight - 6, { align: 'center' });
      }

      pdf.save(`Sentinel_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("PDF Export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange, refreshKey]);

  if (!stats) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-8">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-t-4 border-indigo-500 rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-t-4 border-violet-500 rounded-full animate-spin [animation-direction:reverse]"></div>
        <Loader2 className="absolute inset-0 m-auto text-indigo-500 animate-pulse" size={32} />
      </div>
      <p className="text-white font-mono uppercase tracking-widest text-xs animate-pulse">Initializing Sentinel Core...</p>
    </div>
  );

  return (
    <div ref={dashboardRef} className="space-y-6 pb-24 relative overflow-hidden min-h-screen">

      {/* Dynamic Background Grid */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none"></div>

      {/* Top Status Ticker */}
      <div className="bg-slate-950/80 border-b border-white/5 py-2 px-6 flex items-center overflow-hidden whitespace-nowrap space-x-8 no-print backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-2 text-indigo-400 min-w-fit">
          <Radio size={14} className="animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{systemStatus}</span>
        </div>
        <div className="flex-1 overflow-hidden relative group">
          <div className="inline-block animate-marquee whitespace-nowrap text-[10px] font-mono text-slate-500">
            {runs.slice(0, 5).map((r, i) => (
              <span key={i} className="mx-6">
                <span className={r.failedCount > 0 ? "text-rose-500" : "text-emerald-500"}>●</span> EXECUTION {r.id.split('-')[0]} COMPLETED [{r.project.toUpperCase()}] : {r.passedCount} PASS / {r.failedCount} FAIL
              </span>
            ))}
          </div>
        </div>
        <div className="text-[10px] font-mono text-slate-600">v2.4.0-STABLE</div>
      </div>

      <div className="px-2 md:px-0 space-y-8 animate-in slide-in-from-bottom-6 duration-700">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 no-print">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-1.5 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                <Terminal size={16} className="text-indigo-400" />
              </div>
              <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Dashboard Cluster</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase transparent-text-stroke">
              Command<br />Center
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => setDateRange(7)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase border transition-all ${dateRange === 7 ? 'bg-white text-black border-white' : 'bg-transparent text-slate-500 border-slate-700 hover:border-slate-500'}`}>7D Window</button>
            <button onClick={() => setDateRange(30)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase border transition-all ${dateRange === 30 ? 'bg-white text-black border-white' : 'bg-transparent text-slate-500 border-slate-700 hover:border-slate-500'}`}>30D Window</button>

            <button onClick={handleExportPDF} disabled={isExporting} className="ml-4 flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-indigo-600/25 transition-all active:scale-95">
              {isExporting ? <Loader2 size={16} className="animate-spin mr-2" /> : <FileDown size={16} className="mr-2" />}
              Export Report
            </button>

            <button onClick={handleSync} disabled={isSyncing} className="w-12 h-12 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded-2xl border border-slate-700 transition-all active:scale-95">
              <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Health</p>
                <h3 className="text-3xl font-black text-white mt-1">{qualityScore}%</h3>
              </div>
              <Activity className={`text-indigo-500 ${qualityScore < 70 ? 'animate-pulse' : ''}`} size={24} />
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${qualityScore}%` }}></div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-all"></div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Executions</p>
                <h3 className="text-3xl font-black text-white mt-1">{stats.totalRuns}</h3>
              </div>
              <Layers className="text-violet-500" size={24} />
            </div>
            <p className="text-[10px] text-slate-400">Across {projectHealthData.length} active sectors</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pass Rate</p>
                <h3 className="text-3xl font-black text-white mt-1">{stats.passRate}%</h3>
              </div>
              <ShieldCheck className="text-emerald-500" size={24} />
            </div>
            <p className="text-[10px] text-emerald-500 font-bold flex items-center">
              <CheckCircle2 size={10} className="mr-1" /> Stable Environment
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Avg Latency</p>
                <h3 className="text-3xl font-black text-white mt-1">{stats.avgDuration}</h3>
              </div>
              <Clock className="text-amber-500" size={24} />
            </div>
            <p className="text-[10px] text-amber-500 font-bold flex items-center">
              <Signal size={10} className="mr-1" /> Network Nominal
            </p>
          </div>
        </div>

        {/* Big Chart Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 p-6 rounded-[2.5rem] relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-lg font-black text-white uppercase tracking-tight">Signal Velocity</h4>
                <p className="text-[10px] text-slate-500 font-mono uppercase">Execution volume vs Failure noise</p>
              </div>
              <div className="flex space-x-2 bg-slate-950 p-1 rounded-xl no-print">
                <button onClick={() => setChartMode('success')} className={`p-2 rounded-lg transition-all ${chartMode === 'success' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}><Activity size={14} /></button>
                <button onClick={() => setChartMode('volume')} className={`p-2 rounded-lg transition-all ${chartMode === 'volume' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}><TrendingUp size={14} /></button>
              </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPass" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="pass" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorPass)" />
                  <Area type="monotone" dataKey="fail" stroke="#f43f5e" strokeWidth={2} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Project Integrity List */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2.5rem] flex flex-col">
            <h4 className="text-lg font-black text-white uppercase tracking-tight mb-6">Sector Integrity</h4>
            <div className="space-y-4 overflow-auto custom-scrollbar flex-1 pr-2">
              {projectHealthData.map(p => (
                <div key={p.name} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${p.rate > 90 ? 'bg-emerald-500' : p.rate > 70 ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                    <span className="text-xs font-bold text-slate-300 uppercase">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-white">{p.rate}%</div>
                    <div className="text-[8px] text-slate-600 font-mono">{p.total} RUNS</div>
                  </div>
                </div>
              ))}
              {projectHealthData.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 text-slate-600 opacity-50">
                  <Box size={32} />
                  <span className="text-[10px] font-black uppercase mt-2">No Data</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Incident Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
            <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center mb-6">
              <AlertTriangle size={16} className="text-rose-500 mr-2" /> Incident Taxonomy
            </h4>
            <div className="space-y-3">
              {topErrors.map((err, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-950/30 border border-slate-800 rounded-2xl">
                  <span className="text-xs font-mono text-rose-300 truncate w-3/4">{err.msg}</span>
                  <span className="px-2 py-1 bg-rose-500/10 text-rose-500 text-[10px] font-black rounded-lg">{err.count}</span>
                </div>
              ))}
              {topErrors.length === 0 && <p className="text-center text-xs text-slate-600 py-4">No active incidents recorded.</p>}
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
            <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center mb-6">
              <Zap size={16} className="text-amber-500 mr-2" /> Latency Anomalies
            </h4>
            <div className="space-y-4">
              {slowestEndpoints.map((ep, i) => (
                <div key={i} className="relative">
                  <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                    <span>{ep.method} {ep.path}</span>
                    <span className="text-white">{ep.avgDuration.toFixed(0)}ms</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${ep.avgDuration > 800 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, (ep.avgDuration / 2000) * 100)}%` }}></div>
                  </div>
                </div>
              ))}
              {slowestEndpoints.length === 0 && <p className="text-center text-xs text-slate-600 py-4">Network latency nominal.</p>}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .animate-marquee {
            animation: marquee 20s linear infinite;
        }
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default DashboardView;
