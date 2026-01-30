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
    Users
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
            <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl shadow-2xl ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-200">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-3 border-b border-white/5 pb-2">
                    {typeof label === 'number' ? new Date(label * 1000).toLocaleTimeString() : label}
                </p>
                <div className="space-y-2.5">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between space-x-8">
                            <div className="flex items-center space-x-2.5">
                                <div className="w-2.5 h-2.5 rounded-full border border-white/10" style={{ backgroundColor: entry.color }}></div>
                                <span className="text-[11px] font-bold text-slate-300 tracking-wide">{entry.name}</span>
                            </div>
                            <span className="text-[11px] font-mono font-black text-white bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                                {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
                                <span className="text-[9px] ml-1 opacity-40 font-medium">{entry.name.includes('Users') ? '' : unit}</span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

const PerformanceReportView: React.FC<PerformanceReportViewProps> = ({ reportUrl, onBack, timestamp, selectedEndpoint }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
                <div className="relative">
                    <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                    <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500 animate-pulse" size={32} />
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-xl font-black text-white italic uppercase tracking-[0.2em]">Synchronizing</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase mt-2 tracking-widest">Accessing Performance Core...</span>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
                <div className="p-8 bg-rose-500/10 rounded-[3rem] border border-rose-500/20">
                    <AlertCircle size={48} className="text-rose-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-black text-white italic uppercase">No Data Stream</h3>
                    <p className="text-slate-500 text-sm max-w-xs mt-2">Initialize a performance test to generate the audit dossier.</p>
                </div>
                <button onClick={onBack} className="text-indigo-400 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors">Return to Base</button>
            </div>
        );
    }

    const history = data.history || [];

    return (
        <div className="space-y-10 pb-24 overflow-y-auto no-print pt-4">
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; color: black !important; padding: 20px !important; }
                    .print-card { border: 1px solid #e2e8f0 !important; background: white !important; break-inside: avoid; }
                }
                .recharts-cartesian-grid-horizontal line,
                .recharts-cartesian-grid-vertical line {
                    stroke: rgba(255,255,255,0.03);
                }
                .recharts-curve.recharts-area-curve {
                    filter: drop-shadow(0 0 15px rgba(99, 102, 241, 0.3));
                }
            `}</style>

            {/* HEADER SLEEK */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 no-print pt-4">
                <div className="flex items-center space-x-6">
                    <button onClick={onBack} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all shadow-2xl group">
                        <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <span className="h-1 w-10 bg-indigo-500 rounded-full"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Tactical Audit</span>
                        </div>
                        <h2 data-testid="performance-audit-title" className="text-5xl font-black text-white tracking-tighter italic uppercase">Deep Core Performance</h2>
                    </div>
                </div>

                <div className="flex items-center space-x-4 bg-slate-900/40 p-3 rounded-3xl border border-slate-800/50 backdrop-blur-2xl">
                    <div className="hidden md:flex flex-col items-end px-6 border-r border-slate-800 pr-8">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Observation Origin</span>
                        <span className="text-xs font-mono font-black text-indigo-300">{new Date(data.timestamp).toLocaleTimeString()} · {new Date(data.timestamp).toLocaleDateString()}</span>
                    </div>
                    <button onClick={() => window.print()} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-3">
                        <Download size={16} />
                        <span>Generate Dossier</span>
                    </button>
                </div>
            </div>

            {/* SUMMARY SCALPEL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div data-testid="summary-efficiency" className="bg-slate-900/60 border border-slate-800/50 p-6 rounded-3xl backdrop-blur-xl group hover:border-indigo-500/50 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <Activity size={18} className="text-indigo-400" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Efficiency</span>
                    </div>
                    <div className="text-3xl font-black text-white italic">{data.stats.find((s: any) => s.name === "Aggregated")?.rps.toFixed(2) || "0.00"}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase mt-1 tracking-tighter">Throughput (Req/s)</div>
                </div>

                <div data-testid="summary-velocity" className="bg-slate-900/60 border border-slate-800/50 p-6 rounded-3xl backdrop-blur-xl group hover:border-emerald-500/50 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <Clock size={18} className="text-emerald-400" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Velocity</span>
                    </div>
                    <div className="text-3xl font-black text-white italic">{data.stats.find((s: any) => s.name === "Aggregated")?.avg.toFixed(1) || "0"} ms</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase mt-1 tracking-tighter">Avg Response Time</div>
                </div>

                <div data-testid="summary-integrity" className="bg-slate-900/60 border border-slate-800/50 p-6 rounded-3xl backdrop-blur-xl group hover:border-amber-500/50 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <ShieldCheck size={18} className="text-amber-400" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Integrity</span>
                    </div>
                    <div className="text-3xl font-black text-white italic">{((1 - (data.stats.find((s: any) => s.name === "Aggregated")?.failures / data.stats.find((s: any) => s.name === "Aggregated")?.requests || 0)) * 100).toFixed(2)}%</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase mt-1 tracking-tighter">Success Quotient</div>
                </div>

                <div data-testid="summary-saturation" className="bg-slate-900/60 border border-slate-800/50 p-6 rounded-3xl backdrop-blur-xl group hover:border-purple-500/50 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <Target size={18} className="text-purple-400" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Saturation</span>
                    </div>
                    <div className="text-3xl font-black text-white italic">{history.length > 0 ? history[history.length - 1].users : "0"}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase mt-1 tracking-tighter">Peak Vector Load</div>
                </div>
            </div>

            {/* INTERACTIVE ANALYTIC SUITE */}
            <div className="grid grid-cols-1 gap-10">
                {/* Total Requests per Second INTERACTIVE */}
                <div className="bg-slate-900/40 border border-slate-800/60 p-1 rounded-[3rem] backdrop-blur-xl overflow-hidden shadow-2xl">
                    <div className="bg-white/5 p-8 rounded-[2.5rem] overflow-hidden group transition-all hover:bg-white/[0.07]">
                        <div className="flex items-center justify-between mb-10 px-4">
                            <div>
                                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center space-x-3">
                                    <Zap size={24} className="text-indigo-500" />
                                    <span>Throughput Chronology</span>
                                </h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2 italic">Real-time load and requests per second</p>
                            </div>
                            <div className="flex items-center space-x-6">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">RPS</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Users</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[400px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="rpsColor" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="timestamp"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#475569', fontSize: 10, fontWeight: 700, fontFamily: 'JetBrains Mono' }}
                                        tickFormatter={(val) => new Date(val * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        minTickGap={50}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#475569', fontSize: 10, fontWeight: 700, fontFamily: 'JetBrains Mono' }}
                                    />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <Tooltip content={<CustomTooltip unit="req/s" />} />
                                    <Area
                                        type="monotone"
                                        dataKey="rps"
                                        stroke="#6366f1"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#rpsColor)"
                                        name="Requests/s"
                                        animationDuration={2000}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="users"
                                        stroke="#475569"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        fill="transparent"
                                        name="Active Users"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Spectral Latency Audit INTERACTIVE */}
                <div className="bg-slate-900/40 border border-slate-800/60 p-1 rounded-[3rem] backdrop-blur-xl overflow-hidden shadow-2xl">
                    <div className="bg-white/5 p-8 rounded-[2.5rem] overflow-hidden group transition-all hover:bg-white/[0.07]">
                        <div className="flex items-center justify-between mb-10 px-4">
                            <div>
                                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center space-x-3">
                                    <Clock size={24} className="text-emerald-500" />
                                    <span>Spectral Latency Audit</span>
                                </h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2 italic">Multivariate percentile distribution</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                {['P50', 'P90', 'P95', 'P99'].map((p, i) => (
                                    <div key={p} className="flex items-center space-x-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#10b981', '#f59e0b', '#8b5cf6', '#ef4444'][i] }}></div>
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{p}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="h-[400px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <XAxis
                                        dataKey="timestamp"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#475569', fontSize: 10, fontWeight: 700, fontFamily: 'JetBrains Mono' }}
                                        tickFormatter={(val) => new Date(val * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        minTickGap={50}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#475569', fontSize: 10, fontWeight: 700, fontFamily: 'JetBrains Mono' }}
                                    />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <Tooltip content={<CustomTooltip unit="ms" />} />
                                    <Line type="monotone" dataKey="p50" stroke="#10b981" strokeWidth={3} dot={false} name="P50 Median" animationDuration={1000} />
                                    <Line type="monotone" dataKey="p90" stroke="#f59e0b" strokeWidth={2} dot={false} name="P90 Pulse" animationDuration={1500} />
                                    <Line type="monotone" dataKey="p95" stroke="#8b5cf6" strokeWidth={2} dot={false} name="P95 Vector" animationDuration={2000} />
                                    <Line type="monotone" dataKey="p99" stroke="#ef4444" strokeWidth={3} dot={false} name="P99 Critical" animationDuration={2500} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* DETAILED DOSSIER TABLE */}
            <div className="bg-slate-900/40 border border-slate-800/60 p-10 rounded-[3rem] backdrop-blur-xl">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center space-x-3">
                            <Layers size={24} className="text-indigo-500" />
                            <span>Transactional Audit</span>
                        </h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Full endpoint performance matrix</p>
                    </div>
                    <a href={reportUrl} target="_blank" rel="noreferrer" className="flex items-center space-x-2 text-[10px] font-black uppercase text-indigo-400 hover:text-white transition-colors group">
                        <ExternalLink size={14} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                        <span>Locust Raw View</span>
                    </a>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-800">
                                <th className="pb-6 text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Endpoint</th>
                                <th className="pb-6 text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Reqs</th>
                                <th className="pb-6 text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Fails</th>
                                <th className="pb-6 text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Avg</th>
                                <th className="pb-6 text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 text-right">95th %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {data.stats.map((row: any, i: number) => (
                                <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="py-6 px-4">
                                        <div className="flex items-center space-x-3">
                                            <span className={`text-[8px] font-black px-2 py-1 rounded-md ${row.method === 'GET' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-purple-500/20 text-purple-400'}`}>{row.method}</span>
                                            <span className="text-xs font-mono font-bold text-slate-300 group-hover:text-white transition-colors">{row.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-4 text-xs font-mono text-slate-400 italic">{(row.requests / 1000).toFixed(1)}k</td>
                                    <td className="py-6 px-4 text-xs font-mono text-rose-500/70 font-bold">{row.failures}</td>
                                    <td className="py-6 px-4 text-xs font-mono text-slate-300 italic">{row.avg.toFixed(1)}ms</td>
                                    <td className="py-6 px-4 text-right">
                                        <span className="text-xs font-black text-indigo-300 italic">{row.p95.toFixed(1)}ms</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* AUDIT SIGNATURE FOOTER */}
            <div className="flex flex-col md:flex-row items-center justify-between pt-10 border-t border-slate-800 px-8">
                <div className="flex items-center space-x-6 mb-6 md:mb-0">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest text-left">Audit Protocol</span>
                        <span className="text-[10px] font-bold text-slate-400">LOCUST-CORE-v2.15</span>
                    </div>
                </div>
                <div className="text-[8px] font-black text-slate-600 uppercase tracking-[0.5em] italic">Declassified Performance Dossier // Confidential</div>
            </div>
        </div>
    );
};

export default PerformanceReportView;
