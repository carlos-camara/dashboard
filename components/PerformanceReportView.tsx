import React, { useState, useEffect } from 'react';
import {
    AreaChart,
    Area,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ReferenceArea
} from 'recharts';
import {
    ChevronLeft,
    Download,
    Activity,
    Clock,
    ShieldCheck,
    TrendingUp,
    Target,
    AlertCircle,
    FileText,
    ExternalLink,
    Zap,
    Layers,
    History,
    Users,
    Cpu,
    Gauge
} from 'lucide-react';

interface PerformanceReportViewProps {
    reportUrl: string;
    onBack: () => void;
    timestamp?: string;
    selectedEndpoint?: any;
}

const CustomTooltip = ({ active, payload, label, unit = "ms" }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/95 backdrop-blur-3xl border border-indigo-500/30 p-5 rounded-3xl shadow-[0_0_50px_-12px_rgba(99,102,241,0.5)] ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-200">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3 border-b border-indigo-500/20 pb-2 flex items-center">
                    <Clock size={10} className="mr-2 text-indigo-400" />
                    {typeof label === 'number' ? new Date(label * 1000).toLocaleTimeString() : label}
                </p>
                <div className="space-y-3">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between space-x-8 text-xs">
                            <div className="flex items-center space-x-2.5">
                                <div className="w-2 h-2 rounded-full ring-2 ring-white/10 shadow-[0_0_10px_currentColor]" style={{ backgroundColor: entry.color, color: entry.color }}></div>
                                <span className="font-bold text-slate-300 tracking-wide">{entry.name}</span>
                            </div>
                            <span className="font-mono font-black text-white bg-slate-800/50 px-2 py-0.5 rounded-lg border border-slate-700/50 shadow-inner">
                                {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
                                <span className="text-[9px] ml-1 opacity-50 font-medium text-indigo-300">{entry.name.includes('Users') ? '' : unit}</span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

const StatCard = ({ icon: Icon, label, value, sublabel, color, delay }: any) => {
    const colorStyles: any = {
        indigo: "text-indigo-400 border-indigo-500/20 from-indigo-500/10 to-transparent shadow-indigo-500/10",
        emerald: "text-emerald-400 border-emerald-500/20 from-emerald-500/10 to-transparent shadow-emerald-500/10",
        amber: "text-amber-400 border-amber-500/20 from-amber-500/10 to-transparent shadow-amber-500/10",
        rose: "text-rose-400 border-rose-500/20 from-rose-500/10 to-transparent shadow-rose-500/10",
        violet: "text-violet-400 border-violet-500/20 from-violet-500/10 to-transparent shadow-violet-500/10",
        cyan: "text-cyan-400 border-cyan-500/20 from-cyan-500/10 to-transparent shadow-cyan-500/10"
    };

    const style = colorStyles[color] || colorStyles.indigo;

    return (
        <div
            className={`bg-gradient-to-br ${style} bg-slate-900/40 border p-6 rounded-[2.5rem] backdrop-blur-xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 animate-in fade-in slide-in-from-bottom-8 fill-mode-backwards`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className={`absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500`}>
                <Icon size={120} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2.5 rounded-xl bg-slate-950/50 border border-white/5 shadow-2xl`}>
                        <Icon size={18} className={style.split(' ')[0]} />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</span>
                </div>

                <div className="text-4xl md:text-5xl font-black text-white italic tracking-tighter drop-shadow-2xl">
                    {value}
                </div>

                {sublabel && (
                    <div className="flex items-center mt-3 space-x-2">
                        <div className={`h-1 w-1 rounded-full ${style.split(' ')[0].replace('text-', 'bg-')}`}></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sublabel}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const PerformanceReportView: React.FC<PerformanceReportViewProps> = ({ reportUrl, onBack, timestamp, selectedEndpoint }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const fetchData = () => {
            // If a specific report was clicked, we ideally want THAT report's data.
            // However, our API currently only supports 'latest' efficiently via JSON parsing of CSV.
            // For now, we fetch 'latest' but in a real scenario we'd pass an ID to the API.
            // We'll stick to 'latest' to uphold the current architecture but ensure consistent UI.
            fetch('http://localhost:3001/api/performance/latest')
                .then(res => res.json())
                .then(res => {
                    if (res.found) setData(res);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        };

        // Artificial delay for smooth entrance animation
        setTimeout(fetchData, 800);
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] space-y-8">
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
                    <div className="w-32 h-32 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin shadow-2xl"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Cpu className="text-indigo-500 animate-pulse" size={40} />
                    </div>
                </div>
                <div className="flex flex-col items-center space-y-2">
                    <span className="text-2xl font-black text-white italic uppercase tracking-[0.2em] animate-pulse">Initializing Core</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Decryption in progress...</span>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="relative group">
                    <div className="absolute inset-0 bg-rose-500 blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
                    <div className="p-12 bg-slate-900/50 backdrop-blur-xl rounded-[3rem] border border-rose-500/30 shadow-[0_0_50px_-10px_rgba(244,63,94,0.3)] relative">
                        <AlertCircle size={64} className="text-rose-500 mx-auto mb-6 shadow-rose-500/50" />
                        <h3 className="text-3xl font-black text-white italic uppercase tracking-tight mb-2">Signal Not Found</h3>
                        <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                            The performance subsystem has not detected any valid audit signatures.
                            <br /><span className="text-slate-600 text-xs mt-2 block">Ensure the Locust swarm has completed its cycle.</span>
                        </p>
                    </div>
                </div>
                <button
                    onClick={onBack}
                    className="group flex items-center space-x-3 px-8 py-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all duration-300"
                >
                    <ChevronLeft size={16} className="text-indigo-500 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-indigo-400 font-black uppercase text-[10px] tracking-[0.2em] group-hover:text-white transition-colors">Return to Console</span>
                </button>
            </div>
        );
    }

    const history = data.history || [];
    const aggregated = data.stats.find((s: any) => s.name === "Aggregated");
    const successRate = aggregated ? ((1 - (aggregated.failures / aggregated.requests)) * 100) : 0;

    return (
        <div className="space-y-12 pb-32 no-print relative">
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; color: black !important; padding: 0 !important; }
                    .print-card { break-inside: avoid; border: 1px solid #ddd !important; box-shadow: none !important; }
                    h2 { color: black !important; }
                }
                .recharts-cartesian-grid-horizontal line,
                .recharts-cartesian-grid-vertical line {
                    stroke: rgba(255,255,255,0.02);
                }
            `}</style>

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-0 left-0 w-[1000px] h-[1000px] bg-indigo-600/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 mix-blend-screen"></div>
                <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-emerald-600/5 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 mix-blend-screen"></div>
            </div>

            {/* HEADER */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pt-6 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex items-center self-start lg:self-auto space-x-8 w-full lg:w-auto">
                    <button
                        onClick={onBack}
                        className="p-5 bg-slate-900/80 border border-slate-800/80 rounded-[1.5rem] text-slate-400 hover:text-white hover:border-indigo-500/50 hover:bg-slate-900 transition-all shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] group backdrop-blur-md"
                    >
                        <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform duration-300" />
                    </button>
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 shadow-emerald-500/50 drop-shadow-sm">System Audit Active</span>
                        </div>
                        <h2 data-testid="performance-audit-title" className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500 tracking-tighter italic uppercase drop-shadow-2xl">
                            Performance<br /><span className="text-indigo-500">Dossier</span>
                        </h2>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto bg-slate-950/40 p-2 rounded-[2rem] border border-white/5 backdrop-blur-2xl">
                    <div className="hidden md:flex flex-col items-end px-8 border-r border-white/5">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Timestamp Reference</span>
                        <div className="flex items-center text-xs font-mono font-black text-indigo-300">
                            <Clock size={12} className="mr-2" />
                            {new Date(data.timestamp).toLocaleString()}
                        </div>
                    </div>
                    <button
                        onClick={() => window.print()}
                        className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white px-8 py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center space-x-3 group"
                    >
                        <Download size={18} className="group-hover:animate-bounce" />
                        <span>Export Encrypted PDF</span>
                    </button>
                </div>
            </div>

            {/* KEY METRIC GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Zap}
                    label="Throughput"
                    value={`${aggregated?.rps.toFixed(1) || 0}/s`}
                    sublabel="Requests per Second"
                    color="cyan"
                    delay={100}
                />

                <StatCard
                    icon={Gauge}
                    label="Latency Mean"
                    value={`${aggregated?.avg.toFixed(0) || 0}ms`}
                    sublabel="Average Response Time"
                    color="violet"
                    delay={200}
                />

                <StatCard
                    icon={ShieldCheck}
                    label="Integrity"
                    value={`${successRate.toFixed(1)}%`}
                    sublabel="Successful Transactions"
                    color={successRate > 99 ? "emerald" : successRate > 95 ? "amber" : "rose"}
                    delay={300}
                />

                <StatCard
                    icon={Users}
                    label="Concurrency"
                    value={history.length > 0 ? history[history.length - 1].users : "0"}
                    sublabel="Simulated User Load"
                    color="indigo"
                    delay={400}
                />
            </div>

            {/* CHARTS SECTION */}
            <div className="grid grid-cols-1 gap-12">

                {/* Throughput Chart */}
                <div className="bg-slate-900/40 border border-slate-800/60 p-1.5 rounded-[3.5rem] backdrop-blur-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-12 duration-1000 fill-mode-backwards delay-500">
                    <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-8 md:p-12 rounded-[3.2rem] overflow-hidden relative group">

                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-700">
                            <Activity size={300} className="text-white" />
                        </div>

                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-8 relative z-10">
                            <div>
                                <div className="flex items-center space-x-4 mb-2">
                                    <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                                        <TrendingUp size={24} className="text-indigo-400" />
                                    </div>
                                    <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                                        Traffic<span className="text-indigo-500">Velocity</span>
                                    </h3>
                                </div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] ml-16">Request volume relative to user density</p>
                            </div>

                            <div className="flex items-center space-x-6 bg-slate-900/80 p-2 rounded-full border border-white/5 backdrop-blur-sm">
                                <div className="flex items-center space-x-2 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                                    <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_currentColor]"></div>
                                    <span className="text-[9px] font-black text-indigo-200 uppercase tracking-widest">RPS Stream</span>
                                </div>
                                <div className="flex items-center space-x-2 px-4 py-2 border border-transparent">
                                    <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">User Load</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[450px] w-full relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="rpsColor" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                        <filter id="glow" height="130%">
                                            <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
                                            <feOffset dx="0" dy="0" result="offsetblur" />
                                            <feFlood floodColor="rgb(99, 102, 241)" floodOpacity="0.5" />
                                            <feComposite in2="offsetblur" operator="in" />
                                            <feMerge>
                                                <feMergeNode />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>
                                    <XAxis
                                        dataKey="timestamp"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#475569', fontSize: 10, fontWeight: 700, fontFamily: 'JetBrains Mono' }}
                                        tickFormatter={(val) => new Date(val * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        minTickGap={60}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#475569', fontSize: 10, fontWeight: 700, fontFamily: 'JetBrains Mono' }}
                                        tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                                    />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                    <Tooltip content={<CustomTooltip unit="req/s" />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                                    <Area
                                        type="monotone"
                                        dataKey="rps"
                                        stroke="#6366f1"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#rpsColor)"
                                        filter="url(#glow)"
                                        name="Requests/s"
                                        animationDuration={2000}
                                        animationEasing="ease-out"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="users"
                                        stroke="#475569"
                                        strokeWidth={2}
                                        strokeDasharray="8 8"
                                        fill="transparent"
                                        name="Active Users"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Latency Chart */}
                <div className="bg-slate-900/40 border border-slate-800/60 p-1.5 rounded-[3.5rem] backdrop-blur-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-12 duration-1000 fill-mode-backwards delay-700">
                    <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-8 md:p-12 rounded-[3.2rem] overflow-hidden relative group">

                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-700">
                            <Clock size={300} className="text-white" />
                        </div>

                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-8 relative z-10">
                            <div>
                                <div className="flex items-center space-x-4 mb-2">
                                    <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                        <Layers size={24} className="text-emerald-400" />
                                    </div>
                                    <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                                        Spectral<span className="text-emerald-500">Latency</span>
                                    </h3>
                                </div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] ml-16">Response time distribution percentiles</p>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                {['P50', 'P90', 'P95', 'P99'].map((p, i) => (
                                    <div key={p} className="flex items-center space-x-2 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-white/5">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ['#10b981', '#f59e0b', '#8b5cf6', '#ef4444'][i] }}></div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{p}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="h-[450px] w-full relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <XAxis
                                        dataKey="timestamp"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#475569', fontSize: 10, fontWeight: 700, fontFamily: 'JetBrains Mono' }}
                                        tickFormatter={(val) => new Date(val * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        minTickGap={60}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#475569', fontSize: 10, fontWeight: 700, fontFamily: 'JetBrains Mono' }}
                                        tickFormatter={(val) => `${val}ms`}
                                    />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                    <Tooltip content={<CustomTooltip unit="ms" />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                                    <Line type="monotone" dataKey="p50" stroke="#10b981" strokeWidth={3} dot={false} strokeOpacity={0.8} />
                                    <Line type="monotone" dataKey="p90" stroke="#f59e0b" strokeWidth={3} dot={false} strokeOpacity={0.8} />
                                    <Line type="monotone" dataKey="p95" stroke="#8b5cf6" strokeWidth={3} dot={false} strokeOpacity={0.8} />
                                    <Line type="monotone" dataKey="p99" stroke="#ef4444" strokeWidth={3} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* DETAILED DOSSIER TABLE */}
                <div className="bg-slate-900/40 border border-slate-800/60 p-1.5 rounded-[3.5rem] backdrop-blur-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-12 duration-1000 fill-mode-backwards delay-1000">
                    <div className="bg-slate-950/80 p-8 md:p-12 rounded-[3.2rem] overflow-hidden">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-slate-800/50 rounded-2xl border border-white/5">
                                    <FileText size={24} className="text-slate-200" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                                        Endpoint<span className="text-slate-500">Matrix</span>
                                    </h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Granular per-endpoint breakdown</p>
                                </div>
                            </div>
                            <a href={reportUrl} target="_blank" rel="noreferrer" className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600/10 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all duration-300 group">
                                <span>Raw Locust Report</span>
                                <ExternalLink size={12} className="group-hover:translate-x-1 transition-transform" />
                            </a>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="pb-6 text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 first:pl-0">Target Endpoint</th>
                                        <th className="pb-6 text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 text-center">Volume</th>
                                        <th className="pb-6 text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 text-center">Integrity</th>
                                        <th className="pb-6 text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 text-center">Mean Latency</th>
                                        <th className="pb-6 text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 text-right last:pr-0">Critical Path (95%)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {data.stats.filter((r: any) => r.name !== 'Aggregated').map((row: any, i: number) => (
                                        <tr key={i} className="group hover:bg-white/[0.02] transition-colors duration-200">
                                            <td className="py-6 px-4 first:pl-0">
                                                <div className="flex items-center space-x-4">
                                                    <span className={`text-[9px] font-black px-2.5 py-1.5 rounded-lg border shadow-lg ${row.method === 'GET' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-blue-500/10' :
                                                            row.method === 'POST' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-500/10' :
                                                                'bg-slate-500/10 border-slate-500/20 text-slate-400'
                                                        }`}>{row.method}</span>
                                                    <span className="text-xs font-mono font-bold text-slate-300 group-hover:text-white transition-colors tracking-tight">{row.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-6 px-4 text-center">
                                                <div className="text-sm font-black text-white">{row.requests.toLocaleString()}</div>
                                                <div className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Reqs</div>
                                            </td>
                                            <td className="py-6 px-4 text-center">
                                                <div className={`text-sm font-black ${row.failures > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                    {row.failures > 0 ? row.failures : '100%'}
                                                </div>
                                                <div className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">{row.failures > 0 ? 'Failures' : 'Pass Rate'}</div>
                                            </td>
                                            <td className="py-6 px-4 text-center">
                                                <div className="text-sm font-mono font-bold text-indigo-300">{row.avg.toFixed(0)}ms</div>
                                            </td>
                                            <td className="py-6 px-4 text-right last:pr-0">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${row.p95 > 500 ? 'bg-rose-500' : row.p95 > 200 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                            style={{ width: `${Math.min(100, (row.p95 / 1000) * 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className={`text-sm font-black italic ${row.p95 > 500 ? 'text-rose-400' : 'text-emerald-400'}`}>{row.p95.toFixed(0)}ms</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>

            <div className="text-center pt-12 pb-6 opacity-30 hover:opacity-100 transition-opacity duration-500">
                <div className="flex items-center justify-center space-x-2 text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">
                    <History size={12} />
                    <span>Generated by QA Hub Core v2.4.0</span>
                </div>
            </div>
        </div>
    );
};

export default PerformanceReportView;
