
import React, { useEffect, useState, useMemo } from 'react';
import { ExecutionRun } from '../types';
import { api } from '../services/api';
import {
    Activity, Clock, CheckCircle2, XCircle, Calendar,
    TrendingUp, PieChart, ChevronLeft,
    Download, Share2, Layers, History, Trash2, ChevronRight, Package
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Legend,
    BarChart, Bar
} from 'recharts';
import html2canvas from 'html2canvas';
import { generateProjectDossier } from '../services/reportGenerator';
import RunDetailView from './RunDetailView';
import Pagination from './Pagination';

interface ProjectDetailViewProps {
    projectName: string;
    initialRuns?: ExecutionRun[];
    onBack: () => void;
}

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ projectName, initialRuns, onBack }) => {
    const [runs, setRuns] = useState<ExecutionRun[]>(initialRuns || []);
    const [loading, setLoading] = useState(!initialRuns);
    const [page, setPage] = useState(1);
    const [selectedRun, setSelectedRun] = useState<ExecutionRun | null>(null);
    const RUNS_PER_PAGE = 8;

    // Print Refs
    const printTrendRef = React.useRef<HTMLDivElement>(null);
    const printDistRef = React.useRef<HTMLDivElement>(null);

    // ... (useEffect and everything else stays same)



    // ... (rest of the render)

    useEffect(() => {
        if (initialRuns && initialRuns.length > 0) {
            setLoading(false);
            return;
        }

        const loadData = async () => {
            if (!projectName) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const allRuns = await api.getRecentRuns();
                const projectRuns = allRuns.filter(r => r.project === projectName)
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                setRuns(projectRuns);
            } catch (error) {
                console.error("Failed to load project data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [projectName, initialRuns]);

    // Stats
    const stats = useMemo(() => {
        const total = runs.length;
        if (total === 0) return { passRate: 0, stabilityScore: 0, avgDuration: 0, totalExecutions: 0 };
        const passed = runs.reduce((acc, r) => acc + (r.passedCount / r.totalCount >= 0.95 ? 1 : 0), 0);
        const totalTests = runs.reduce((acc, r) => acc + r.totalCount, 0);
        const totalPassed = runs.reduce((acc, r) => acc + r.passedCount, 0);
        const avgDuration = runs.reduce((acc, r) => acc + r.duration, 0) / total;
        return {
            passRate: totalTests > 0 ? (totalPassed / totalTests) * 100 : 0,
            stabilityScore: (passed / total) * 100,
            avgDuration,
            totalExecutions: total
        };
    }, [runs]);

    // Trend Data
    const trendData = useMemo(() => {
        const grouped = runs.reduce((acc, r) => {
            const date = new Date(r.timestamp);
            const key = date.toISOString().split('T')[0];

            if (!acc[key]) {
                acc[key] = {
                    date: date,
                    pass: 0,
                    fail: 0,
                    total: 0,
                    durationSum: 0,
                    count: 0
                };
            }

            acc[key].pass += (r.passedCount || 0);
            acc[key].fail += (r.failedCount || 0);
            acc[key].total += (r.totalCount || 0);
            acc[key].durationSum += (r.duration || 0);
            acc[key].count += 1;

            return acc;
        }, {} as Record<string, any>);

        const sorted = Object.values(grouped).sort((a: any, b: any) => a.date.getTime() - b.date.getTime());

        // Take last 14 days to keep chart clean
        return sorted.slice(-14).map((g: any) => ({
            name: g.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            pass: g.pass,
            fail: g.fail,
            total: g.total,
            duration: g.durationSum / g.count
        }));
    }, [runs]);

    // Type Data (GUI vs API)
    const typeData = useMemo(() => {
        const types = { GUI: 0, API: 0, Other: 0 };
        runs.forEach(r => {
            const name = r.name.toLowerCase();
            const tags = r.tags || [];
            if (name.includes('gui') || tags.some(t => t.toLowerCase().includes('gui'))) types.GUI++;
            else if (name.includes('api') || tags.some(t => t.toLowerCase().includes('api'))) types.API++;
            else types.Other++;
        });
        return [
            { name: 'GUI Tests', value: types.GUI, color: '#8b5cf6' }, // Violet
            { name: 'API Tests', value: types.API, color: '#10b981' }, // Emerald
            { name: 'Other', value: types.Other, color: '#64748b' }    // Slate
        ].filter(d => d.value > 0);

    }, [runs]);

    // Comparison Data (New)
    const layerComparisonData = useMemo(() => {
        const getMetrics = (filterFn: (r: ExecutionRun) => boolean) => {
            const subset = runs.filter(filterFn);
            const total = subset.length;
            if (!total) return { passRate: 0, avgDuration: 0 };

            const totalTests = subset.reduce((acc, r) => acc + (r.totalCount || 0), 0);
            const totalPassed = subset.reduce((acc, r) => acc + (r.passedCount || 0), 0);

            return {
                passRate: totalTests > 0 ? (totalPassed / totalTests) * 100 : 0,
                // Ensure duration is handled gracefully if missing
                avgDuration: subset.reduce((acc, r) => acc + (r.duration || 0), 0) / (total || 1)
            };
        };

        // Helper for safe robust access
        const safeIncludes = (str: string | undefined, term: string) => (str || '').toLowerCase().includes(term);
        const safeTags = (tags: any) => Array.isArray(tags) ? tags : [];

        const apiMetrics = getMetrics(r => safeIncludes(r.name, 'api') || safeTags(r.tags).some((t: string) => safeIncludes(t, 'api')));
        const guiMetrics = getMetrics(r => safeIncludes(r.name, 'gui') || safeTags(r.tags).some((t: string) => safeIncludes(t, 'gui')));

        return [
            { name: 'API Layer', passRate: apiMetrics.passRate, duration: apiMetrics.avgDuration, fill: 'url(#gradientApi)', stroke: '#10b981' },
            { name: 'GUI Layer', passRate: guiMetrics.passRate, duration: guiMetrics.avgDuration, fill: 'url(#gradientGui)', stroke: '#8b5cf6' }
        ];
    }, [runs]);

    // Custom Tooltip for Charts
    const CustomChartTooltip = ({ active, payload, label, unit }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-xl shadow-2xl backdrop-blur-md">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">{label}</p>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-white">
                            {typeof payload[0].value === 'number' ? payload[0].value.toFixed(1) : payload[0].value}
                        </span>
                        <span className="text-xs font-bold text-slate-500 mb-1">{unit}</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    const totalPages = Math.ceil(runs.length / RUNS_PER_PAGE);
    const displayedRuns = runs.slice((page - 1) * RUNS_PER_PAGE, page * RUNS_PER_PAGE);

    const handleDeleteProject = async () => {
        try {
            setLoading(true);
            await api.deleteProject(projectName);
            onBack();
        } catch (err) {
            console.error('Failed to delete project:', err);
            // Ideally show error toast
        } finally {
            setLoading(false);
        }
    };

    const handleExportReport = async () => {
        if (!runs.length) return;

        let trendImage = '';
        let distributionImage = '';

        const captureOptions = {
            backgroundColor: '#020617', // Match slate-950
            scale: 2,
            logging: false
        };

        try {
            if (printTrendRef.current) {
                const canvas = await html2canvas(printTrendRef.current, captureOptions);
                trendImage = canvas.toDataURL('image/png');
            }
            if (printDistRef.current) {
                const canvas = await html2canvas(printDistRef.current, captureOptions);
                distributionImage = canvas.toDataURL('image/png');
            }
        } catch (e) {
            console.error("Chart capture failed", e);
        }

        generateProjectDossier(
            projectName,
            stats,
            runs,
            { trend: trendImage, distribution: distributionImage },
            trendData // Pass the raw data for deep analysis
        );
    };

    const fetchProjectData = async () => {
        setLoading(true);
        try {
            const allRuns = await api.getRecentRuns();
            const projectRuns = allRuns.filter(r => r.project === projectName)
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setRuns(projectRuns);
        } catch (error) {
            console.error("Failed to reload project data", error);
        } finally {
            setLoading(false);
        }
    };

    if (selectedRun) {
        return <RunDetailView run={selectedRun} onBack={() => setSelectedRun(null)} />;
    }


    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-mono text-xs animate-pulse">Analyzing Architecture...</p>
        </div>
    );

    if (runs.length === 0) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
                <button onClick={onBack} className="group flex items-center text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-1">
                    <ChevronLeft size={14} className="mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Registry
                </button>
                <div className="flex flex-col items-center justify-center h-96 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                    <Activity size={48} className="text-slate-600 mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-white mb-2">No Data Available</h3>
                    <p className="text-slate-500 text-sm max-w-md text-center">No execution history found for <span className="text-indigo-400 font-mono">{projectName}</span>.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-24 w-full">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-br from-slate-900 via-slate-900/50 to-indigo-900/10 p-8 rounded-[2.5rem] border border-slate-800/60 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-1000"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-[10px] font-black uppercase text-indigo-400 tracking-widest flex items-center">
                            <Package size={12} className="mr-2" /> Project
                        </span>
                        <span className="px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                            {runs.length} Runs Detected
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tighter">
                        {projectName}
                    </h1>
                </div>

                <div className="flex gap-4 relative z-10">
                    <button
                        onClick={onBack}
                        className="p-3 rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={handleExportReport}
                        className="p-3 rounded-full bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white border border-indigo-500/20 hover:border-indigo-500 transition-all shadow-lg shadow-indigo-500/10"
                        title="Download Dossier"
                    >
                        <Download size={20} />
                    </button>
                    <button
                        onClick={handleDeleteProject}
                        className="p-3 rounded-full bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 hover:border-rose-500 transition-all shadow-lg shadow-rose-500/10"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group hover:border-slate-700 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Activity size={64} /></div>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Stability Score</p>
                    <div className="flex items-baseline space-x-2">
                        <h3 className={`text-4xl font-black ${stats.stabilityScore >= 80 ? 'text-emerald-400' : 'text-rose-400'}`}>{stats.stabilityScore.toFixed(0)}%</h3>
                    </div>
                </div>
                <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group hover:border-slate-700 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><CheckCircle2 size={64} /></div>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Avg Pass Rate</p>
                    <h3 className="text-4xl font-black text-white">{stats.passRate.toFixed(1)}%</h3>
                </div>
                <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group hover:border-slate-700 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Clock size={64} /></div>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Avg Duration</p>
                    <h3 className="text-4xl font-black text-white">{stats.avgDuration.toFixed(1)}s</h3>
                </div>
                <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group hover:border-slate-700 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Layers size={64} /></div>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Total Flights</p>
                    <h3 className="text-4xl font-black text-white">{stats.totalExecutions}</h3>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Trend Chart */}
                <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                        <TrendingUp size={20} className="mr-2 text-indigo-400" /> Execution Velocity
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPass" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorFail" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '8px' }}
                                />
                                <Area type="monotone" dataKey="pass" stroke="#10b981" fillOpacity={1} fill="url(#colorPass)" strokeWidth={2} />
                                <Area type="monotone" dataKey="fail" stroke="#f43f5e" fillOpacity={1} fill="url(#colorFail)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Distribution Chart */}
                <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                        <PieChart size={20} className="mr-2 text-indigo-400" /> Test Composition
                    </h3>
                    <div className="h-[300px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={typeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {typeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </RePieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <p className="text-xs font-bold text-slate-500 uppercase">Total</p>
                                <p className="text-3xl font-black text-white">{runs.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Architecture Analysis (New) */}
            <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-slate-800"></div>
                <h2 id="architecture-analysis-heading" className="text-sm font-black uppercase tracking-[0.3em] text-slate-500 whitespace-nowrap bg-slate-950 px-6 py-2 rounded-full border border-slate-800 shadow-xl shadow-slate-900/50">
                    Architecture Analysis
                </h2>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-800 to-slate-800"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stability Comparison */}
                <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                        <Activity size={20} className="mr-2 text-indigo-400" /> Layer Stability (Pass Rate)
                    </h3>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={layerComparisonData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradientApi" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#059669" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity={1} />
                                    </linearGradient>
                                    <linearGradient id="gradientGui" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                <RechartsTooltip content={<CustomChartTooltip />} cursor={{ fill: '#1e293b', opacity: 0.2 }} />
                                <Bar dataKey="passRate" radius={[0, 4, 4, 0]} barSize={24} animationDuration={1500}>
                                    {layerComparisonData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Latency Comparison */}
                <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                        <Clock size={20} className="mr-2 text-indigo-400" /> Layer Latency (Duration)
                    </h3>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={layerComparisonData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradientApi" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#059669" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity={1} />
                                    </linearGradient>
                                    <linearGradient id="gradientGui" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                <RechartsTooltip content={<CustomChartTooltip />} cursor={{ fill: '#1e293b', opacity: 0.2 }} />
                                <Bar dataKey="duration" radius={[0, 4, 4, 0]} barSize={24} animationDuration={1500}>
                                    {layerComparisonData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Run List */}
            <div className="bg-slate-900/20 border border-slate-800/50 rounded-[2.5rem] p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <History size={20} className="mr-2 text-slate-400" /> Execution History
                </h3>

                <div className="space-y-3">
                    <div className="space-y-4">
                        {displayedRuns.map(run => {
                            const passRate = run.totalCount > 0 ? (run.passedCount / run.totalCount) * 100 : 0;
                            const isSuccess = passRate >= 95;
                            const statusColor = isSuccess ? 'emerald' : 'rose';

                            return (
                                <div key={run.id}
                                    id={`run-item-${run.id}`}
                                    onClick={() => setSelectedRun(run)}
                                    className="group relative overflow-hidden bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4 hover:bg-slate-900/60 hover:border-slate-700/80 transition-all duration-300 cursor-pointer"
                                >
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${statusColor}-500 transition-all group-hover:w-1.5`}></div>

                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-3">
                                        {/* Left: Identity */}
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-xl bg-${statusColor}-500/10 border border-${statusColor}-500/20 shadow-[0_0_15px_-3px_rgba(0,0,0,0.2)]`}>
                                                {isSuccess ?
                                                    <CheckCircle2 className={`text-${statusColor}-500`} size={20} /> :
                                                    <XCircle className={`text-${statusColor}-500`} size={20} />
                                                }
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold text-sm flex items-center gap-2">
                                                    {run.name}
                                                    {/* Auto-detected Type Badge */}
                                                    {run.name.toLowerCase().includes('api') && (
                                                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider font-bold">API</span>
                                                    )}
                                                    {run.name.toLowerCase().includes('gui') && (
                                                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-violet-500/10 text-violet-500 border border-violet-500/20 uppercase tracking-wider font-bold">GUI</span>
                                                    )}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 font-medium">
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar size={12} className="text-slate-600" />
                                                        {new Date(run.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock size={12} className="text-slate-600" />
                                                        {new Date(run.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Middle: Mini Stats and Visual Bar */}
                                        <div className="flex items-center gap-8 md:border-l md:border-white/5 md:pl-8 flex-1">
                                            <div className="hidden md:block">
                                                <p className="text-[10px] uppercase tracking-widest text-slate-600 font-bold mb-0.5">Duration</p>
                                                <p className="text-slate-300 font-mono text-sm">{run.duration.toFixed(2)}s</p>
                                            </div>

                                            {/* Visual Health Bar */}
                                            <div className="flex-1 max-w-[200px] hidden sm:block">
                                                <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                                                    <span>Progress</span>
                                                    <span className={isSuccess ? 'text-emerald-400' : 'text-rose-400'}>{run.passedCount}/{run.totalCount}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                                                    <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${passRate}%` }}></div>
                                                    <div className="h-full bg-rose-500" style={{ width: `${100 - passRate}%` }}></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Pass Rate Badge */}
                                        <div className="text-right pl-4">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-slate-950/50 ${isSuccess
                                                ? 'border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]'
                                                : 'border-rose-500/30 text-rose-400 shadow-[0_0_15px_-5px_rgba(244,63,94,0.3)]'
                                                }`}>
                                                <Activity size={14} />
                                                <span className="font-black font-mono text-lg">{passRate.toFixed(0)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-6 flex justify-center">
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </div>
            </div>


            <div className="fixed -left-[9999px] top-0 w-[1000px] h-[500px] pointer-events-none">
                {/* Trend Print Chart */}
                <div ref={printTrendRef} className="w-full h-full bg-slate-950 p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-6 relative z-10 text-white">
                        <TrendingUp size={32} className="text-emerald-500" />
                        <h2 className="text-3xl font-black">EXECUTION VELOCITY & SUCCESS</h2>
                    </div>
                    <div className="w-full h-[350px]">
                        <AreaChart width={900} height={350} data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="printColorPass" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="printColorFail" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.6} />
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 14, fontWeight: 700 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 14, fontWeight: 700 }} />
                            <Area type="monotone" dataKey="pass" stroke="#10b981" fillOpacity={1} fill="url(#printColorPass)" strokeWidth={4} isAnimationActive={false} dot={{ r: 5, fill: '#059669', stroke: '#fff', strokeWidth: 2 }} />
                            <Area type="monotone" dataKey="fail" stroke="#f43f5e" fillOpacity={1} fill="url(#printColorFail)" strokeWidth={4} isAnimationActive={false} dot={{ r: 5, fill: '#e11d48', stroke: '#fff', strokeWidth: 2 }} />
                        </AreaChart>
                    </div>
                </div>

                {/* Distribution Print Chart */}
                <div ref={printDistRef} className="w-full h-full bg-slate-950 p-8 flex flex-col items-center justify-center mt-20">
                    <div className="flex items-center gap-3 mb-6 text-white self-start w-full">
                        <PieChart size={32} className="text-indigo-500" />
                        <h2 className="text-3xl font-black">TEST SUITE COMPOSITION</h2>
                    </div>
                    <div className="w-[800px] h-[400px] flex items-center justify-center relative">
                        <RePieChart width={800} height={400}>
                            <Pie
                                data={typeData}
                                cx="50%"
                                cy="50%"
                                innerRadius={100}
                                outerRadius={160}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                                isAnimationActive={false}
                            >
                                {typeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '18px', fontWeight: 'bold', color: '#cbd5e1' }} />
                        </RePieChart>
                        {/* Center Text Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                            <div className="text-center">
                                <p className="text-xl font-bold text-slate-500 uppercase tracking-widest">Total</p>
                                <p className="text-7xl font-black text-white">{runs.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div >
    );
};

export default ProjectDetailView;
