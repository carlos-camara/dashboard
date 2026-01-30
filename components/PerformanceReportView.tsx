
import React from 'react';
import { ChevronLeft, ExternalLink, Activity, Clock, ShieldCheck, Download } from 'lucide-react';

interface PerformanceReportViewProps {
    reportUrl: string;
    onBack: () => void;
    timestamp?: string;
}

const PerformanceReportView: React.FC<PerformanceReportViewProps> = ({ reportUrl, onBack, timestamp }) => {
    // Construct the full URL
    const fullUrl = `http://localhost:3001${reportUrl}`;

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] animate-in fade-in zoom-in-95 duration-500">
            {/* Header Control Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onBack}
                        className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 hover:border-indigo-500/50 transition-all shadow-xl group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center space-x-2 mb-1">
                            <div className="h-1 w-6 bg-indigo-500 rounded-full"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Analysis Engine</span>
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tighter">Performance Analysis</h2>
                    </div>
                </div>

                <div className="flex items-center space-x-3 bg-slate-900/50 p-2 rounded-2xl border border-slate-800/50 backdrop-blur-xl">
                    <div className="px-4 py-2 flex flex-col items-end border-r border-slate-800 pr-6">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Report Date</span>
                        <span className="text-xs font-mono text-indigo-300 font-bold">
                            {timestamp ? new Date(timestamp).toLocaleString() : 'N/A'}
                        </span>
                    </div>
                    <a
                        href={fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 text-slate-400 hover:text-indigo-400 transition-colors"
                        title="Open in new tab"
                    >
                        <ExternalLink size={18} />
                    </a>
                    <button
                        className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                        onClick={() => window.print()}
                    >
                        <Download size={14} />
                        <span>Export PDF</span>
                    </button>
                </div>
            </div>

            {/* The IFrame Container */}
            <div className="flex-1 relative group">
                {/* Visual Frame */}
                <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-blue-500/20 rounded-[2.5rem] p-4 opacity-50 blur-sm group-hover:opacity-100 transition duration-1000"></div>

                <div className="relative h-full w-full bg-slate-950 rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl">
                    {/* Mock Browser Header */}
                    <div className="bg-slate-900 px-6 py-3 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex space-x-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
                        </div>
                        <div className="flex-1 max-w-lg mx-8 px-4 py-1 bg-slate-950 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-500 text-center truncate">
                            {fullUrl}
                        </div>
                        <div className="flex items-center space-x-3 text-slate-500">
                            <Activity size={12} />
                            <ShieldCheck size={12} />
                        </div>
                    </div>

                    <iframe
                        src={fullUrl}
                        className="w-full h-[calc(100%-48px)] border-none"
                        title="Locust Performance Report"
                    />
                </div>
            </div>

            {/* Footer Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800/80 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                        <Activity size={20} className="text-indigo-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real-time Stream</p>
                        <p className="text-sm font-bold text-white">Interactive Charts Enabled</p>
                    </div>
                </div>
                <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800/80 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                        <ShieldCheck size={20} className="text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verification Status</p>
                        <p className="text-sm font-bold text-white">System Limits Validated</p>
                    </div>
                </div>
                <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800/80 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                        <Clock size={20} className="text-amber-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Retention Policy</p>
                        <p className="text-sm font-bold text-white">Report archived in history</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceReportView;
