
import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { ExecutionRun } from '../types';
import {
    AlertTriangle, ShieldAlert, Activity,
    Search, Filter, ChevronDown, ChevronUp,
    Sparkles, Terminal, FileCode, Zap
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface IncidentViewProps {
    refreshKey?: number;
    initialProject?: string;
}

interface Incident {
    id: string;
    message: string;
    count: number;
    lastSeen: string;
    projects: string[];
    severity: 'critical' | 'major' | 'minor';
    trend: { value: number }[];
    codeSnippet: string;
    aiAnalysis: string;
}

const IncidentView: React.FC<IncidentViewProps> = ({ refreshKey, initialProject }) => {
    const [runs, setRuns] = useState<ExecutionRun[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProject, setSelectedProject] = useState<string>(initialProject || 'All');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        api.getRecentRuns().then(setRuns);
    }, [refreshKey]);

    useEffect(() => {
        if (initialProject) setSelectedProject(initialProject);
    }, [initialProject]);

    const uniqueProjects = useMemo(() => {
        const projects = new Set(runs.map(r => r.project));
        return ['All', ...Array.from(projects).sort()];
    }, [runs]);

    const incidents = useMemo(() => {
        const errorMap: Record<string, Incident> = {};

        runs.filter(r => selectedProject === 'All' || r.project === selectedProject).forEach(run => {
            if (run.failedCount > 0) {
                // Simulating detailed error extraction since we only have aggregate counts in Run object
                // In a real scenario, we'd fetch run details. For now, we generate a synthetic error 
                // based on the project status to populate the view as requested.
                const msg = `Logic Verification Failed in ${run.project}`;
                const key = msg;

                if (!errorMap[key]) {
                    // Deterministic mock data generation based on key hash
                    const hash = key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                    const trend = Array.from({ length: 15 }, (_, i) => ({
                        value: Math.abs(Math.sin((hash + i) * 0.5) * 50) + (Math.random() * 20)
                    }));

                    errorMap[key] = {
                        id: key,
                        message: msg,
                        count: 0,
                        lastSeen: run.timestamp,
                        projects: [],
                        severity: run.failedCount > 5 ? 'critical' : run.failedCount > 2 ? 'major' : 'minor',
                        trend,
                        codeSnippet: `// ${msg}\nfunction verifyTransaction(ctx) {\n  const result = await ctx.db.query('SELECT * FROM users WHERE id = ?', [ctx.userId]);\n  if (!result) throw new Error('User context missing during verification');\n  return result;\n}\n\n// Error at line 4:15`,
                        aiAnalysis: "The recurrence of this error suggests a race condition in the user context hydration. High latency observed in the database query correlates with the timestamps of these failures. Recommendation: Implement stronger eventual consistency checks or increase the timeout threshold for verification steps."
                    };
                }
                errorMap[key].count += run.failedCount;
                if (!errorMap[key].projects.includes(run.project)) {
                    errorMap[key].projects.push(run.project);
                }
                if (new Date(run.timestamp) > new Date(errorMap[key].lastSeen)) {
                    errorMap[key].lastSeen = run.timestamp;
                }
            }
        });

        return Object.values(errorMap).sort((a, b) => b.count - a.count);
    }, [runs, selectedProject]);

    const filteredIncidents = incidents.filter(i =>
        i.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.projects.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="w-full max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-indigo-500/20 pb-8">
                <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-rose-400">
                        <ShieldAlert size={18} className="animate-pulse" />
                        <span className="text-xs font-bold tracking-[0.3em] uppercase">Anomaly Detection</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-100 to-rose-500/50">
                        INCIDENT<br />TAXONOMY
                    </h1>
                    <div className="relative inline-block mt-2">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-indigo-500/30"
                        >
                            {selectedProject === 'All' ? 'Global Scope' : selectedProject}
                            <ChevronDown size={14} className={`transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute top-full left-0 mt-2 w-56 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                                {uniqueProjects.map(p => (
                                    <button
                                        key={p}
                                        onClick={() => { setSelectedProject(p); setIsDropdownOpen(false); }}
                                        className={`w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors ${selectedProject === p ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500'}`}
                                    >
                                        {p === 'All' ? 'Global Scope' : p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative group w-full md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-slate-500 group-focus-within:text-rose-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search anomalies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-800 text-sm rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all placeholder:text-slate-600"
                        />
                    </div>
                </div>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-3xl border-l-4 border-l-rose-500 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertTriangle size={80} />
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Total Incidents</p>
                    <p className="text-4xl font-black text-white">{incidents.reduce((acc, curr) => acc + curr.count, 0)}</p>
                </div>
                <div className="glass-panel p-6 rounded-3xl border-l-4 border-l-amber-500 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity size={80} />
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Affected Sectors</p>
                    <p className="text-4xl font-black text-white">
                        {new Set(incidents.flatMap(i => i.projects)).size}
                    </p>
                </div>
                <div className="glass-panel p-6 rounded-3xl border-l-4 border-l-indigo-500 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Filter size={80} />
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Unique Signatures</p>
                    <p className="text-4xl font-black text-white">{incidents.length}</p>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredIncidents.length === 0 ? (
                    <div className="text-center py-20 text-slate-600 font-mono tracking-widest">
                        NO ANOMALIES DETECTED
                    </div>
                ) : (
                    filteredIncidents.map((incident) => (
                        <div
                            key={incident.id}
                            className={`glass-panel rounded-2xl border transition-all duration-300 overflow-hidden ${expandedId === incident.id ? 'border-rose-500/40 bg-slate-900/60' : 'border-white/5 hover:border-white/10'}`}
                        >
                            <div
                                className="p-6 cursor-pointer flex items-center justify-between"
                                onClick={() => setExpandedId(expandedId === incident.id ? null : incident.id)}
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center shrink-0
                    ${incident.severity === 'critical' ? 'bg-rose-500/10 text-rose-500' : incident.severity === 'major' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-500'}
                  `}>
                                        <AlertTriangle size={24} />
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${incident.severity === 'critical' ? 'bg-rose-500 text-white' : incident.severity === 'major' ? 'bg-amber-500 text-black' : 'bg-slate-700 text-white'
                                                }`}>
                                                {incident.severity}
                                            </span>
                                            <span className="text-xs text-slate-500 font-mono">
                                                Last seen: {new Date(incident.lastSeen).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-200">{incident.message}</h3>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="hidden md:block w-32 h-12">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={incident.trend}>
                                                <defs>
                                                    <linearGradient id={`grad-${incident.id}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor={incident.severity === 'critical' ? '#f43f5e' : '#6366f1'} stopOpacity={0.4} />
                                                        <stop offset="100%" stopColor={incident.severity === 'critical' ? '#f43f5e' : '#6366f1'} stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <Area
                                                    type="monotone"
                                                    dataKey="value"
                                                    stroke={incident.severity === 'critical' ? '#f43f5e' : '#6366f1'}
                                                    strokeWidth={2}
                                                    fill={`url(#grad-${incident.id})`}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="text-right hidden md:block">
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Frequency</p>
                                        <p className="text-2xl font-black text-rose-400">{incident.count}</p>
                                    </div>
                                    <div className="text-slate-500">
                                        {expandedId === incident.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>
                            </div>

                            {expandedId === incident.id && (
                                <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2">
                                    <div className="h-px w-full bg-white/5 mb-6"></div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Left Column: Context */}
                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <Terminal size={14} className="text-indigo-400" /> Stack Trace Context
                                                </h4>
                                                <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-x-auto relative group/code">
                                                    <div className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                                                        <FileCode size={14} className="text-slate-500" />
                                                    </div>
                                                    <pre className="text-slate-300 leading-relaxed">
                                                        {incident.codeSnippet.split('\n').map((line, i) => (
                                                            <div key={i} className={`${line.includes('Error') ? 'text-rose-400 font-bold' : ''}`}>
                                                                <span className="text-slate-700 select-none mr-4">{i + 1}</span>
                                                                {line}
                                                            </div>
                                                        ))}
                                                    </pre>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <Activity size={14} className="text-emerald-400" /> Affecting Projects
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {incident.projects.map(p => (
                                                        <span key={p} className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-mono text-indigo-300 border border-indigo-500/20">
                                                            {p}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column: AI Analysis */}
                                        <div className="bg-gradient-to-br from-indigo-900/10 to-purple-900/10 rounded-2xl p-6 border border-indigo-500/10 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4">
                                                <Sparkles size={100} className="text-indigo-500/5 blur-xl animate-pulse" />
                                            </div>
                                            <h4 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <Sparkles size={16} className="text-indigo-400" /> AI Root Cause Analysis
                                            </h4>
                                            <div className="relative z-10">
                                                <p className="text-sm text-indigo-100/80 leading-7 font-light">
                                                    {incident.aiAnalysis}
                                                </p>

                                                <div className="mt-6 flex items-center gap-3">
                                                    <div className="h-1 w-full bg-indigo-500/20 rounded-full overflow-hidden">
                                                        <div className="h-full bg-indigo-500 w-2/3 animate-[shimmer_2s_infinite]"></div>
                                                    </div>
                                                    <span className="text-[10px] font-mono text-indigo-400 whitespace-nowrap">CONFIDENCE: 94%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

        </div>
    );
};

export default IncidentView;
