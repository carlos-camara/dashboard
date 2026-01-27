
import React, { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { Endpoint, TestStatus } from '../types';
import { ChevronLeft, Globe, Activity, Clock, Server, FileJson, CheckCircle2, AlertCircle, Upload, Code, Brackets, FileText, Database } from 'lucide-react';

interface EndpointDetailViewProps {
    endpoint: Endpoint;
    onBack: () => void;
}

const EndpointDetailView: React.FC<EndpointDetailViewProps> = ({ endpoint, onBack }) => {
    const [spec, setSpec] = useState<any>(null);
    const [loadingSpec, setLoadingSpec] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch linked swagger spec
    useEffect(() => {
        api.getSpec(endpoint.method, endpoint.path).then(res => {
            if (res.found) {
                setSpec(res.content);
            }
            setLoadingSpec(false);
        });
    }, [endpoint]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setIsUploading(true);
        const file = e.target.files[0];
        const success = await api.uploadSpec(endpoint.method, endpoint.path, file);

        if (success) {
            // Reload spec
            const res = await api.getSpec(endpoint.method, endpoint.path);
            if (res.found) setSpec(res.content);
        } else {
            alert("Failed to upload spec file.");
        }

        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const successRate = (endpoint.passCount / (Math.max(1, endpoint.passCount + endpoint.failCount))) * 100;

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-24">
            {/* Navigation */}
            <button
                onClick={onBack}
                className="flex items-center text-slate-400 hover:text-white transition-all group px-4 py-2 hover:bg-slate-800 rounded-full w-fit"
            >
                <ChevronLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-black uppercase tracking-widest">Back to Catalog</span>
            </button>

            {/* Hero Card */}
            <div className={`relative overflow-hidden rounded-[2.5rem] p-8 border shadow-2xl backdrop-blur-xl ${endpoint.method === 'POST' ? 'bg-orange-500/5 border-orange-500/20' :
                    endpoint.method === 'GET' ? 'bg-blue-500/5 border-blue-500/20' :
                        'bg-slate-900/60 border-slate-800/60'
                }`}>
                {/* Ambient Glow */}
                <div className={`absolute top-0 right-0 w-96 h-96 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none opacity-20 ${endpoint.method === 'POST' ? 'bg-orange-500' :
                        endpoint.method === 'GET' ? 'bg-blue-500' : 'bg-slate-500'
                    }`}></div>

                <div className="relative flex flex-col md:flex-row justify-between gap-8">
                    <div className="space-y-6 max-w-2xl">
                        <div className="flex items-center space-x-4">
                            <div className={`px-4 py-3 rounded-2xl font-black text-xl shadow-lg ${endpoint.method === 'POST' ? 'bg-orange-500 text-white shadow-orange-500/20' :
                                    endpoint.method === 'GET' ? 'bg-blue-500 text-white shadow-blue-500/20' :
                                        endpoint.method === 'DELETE' ? 'bg-rose-500 text-white shadow-rose-500/20' :
                                            'bg-slate-700 text-slate-300'
                                }`}>
                                {endpoint.method}
                            </div>
                            <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span className="flex items-center px-3 py-1 bg-slate-950/50 rounded-lg border border-slate-800"><Globe size={12} className="mr-1.5" /> {endpoint.service}</span>
                                <span className="flex items-center px-3 py-1 bg-slate-950/50 rounded-lg border border-slate-800"><Server size={12} className="mr-1.5" /> {endpoint.projects.length} Projects</span>
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black text-white font-mono break-all leading-tight tracking-tight">
                            {endpoint.path}
                        </h1>

                        <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
                            <span className="opacity-50">ID:</span>
                            <code className="bg-slate-950 py-1 px-2 rounded border border-slate-800/50">{endpoint.id}</code>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 min-w-[300px]">
                        <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800">
                            <div className="flex items-center justify-between mb-3">
                                <Activity size={18} className="text-emerald-500" />
                                <span className={`text-2xl font-black ${successRate >= 90 ? 'text-emerald-500' : 'text-rose-500'}`}>{successRate.toFixed(0)}%</span>
                            </div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Success Rate</p>
                            <div className="w-full bg-slate-900 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div className={`h-full rounded-full ${successRate >= 90 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${successRate}%` }}></div>
                            </div>
                        </div>

                        <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800">
                            <div className="flex items-center justify-between mb-3">
                                <Clock size={18} className="text-amber-500" />
                                <span className="text-2xl font-black text-white">{endpoint.avgDuration.toFixed(0)}<span className="text-sm text-slate-500 ml-1">ms</span></span>
                            </div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Avg Latency</p>
                            <div className="flex space-x-1 mt-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                                <div className="h-1.5 w-1.5 rounded-full bg-amber-500/50"></div>
                                <div className="h-1.5 w-1.5 rounded-full bg-amber-500/20"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Spec/Documentation */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center">
                            <FileText size={20} className="mr-2 text-indigo-500" /> Specification
                        </h3>

                        <div className="relative">
                            <input
                                type="file"
                                accept=".json"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="hidden"
                                id="spec-upload"
                            />
                            <label
                                htmlFor="spec-upload"
                                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase cursor-pointer border transition-all ${isUploading ? 'bg-indigo-600 border-indigo-500 text-white opacity-50' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-indigo-500'}`}
                            >
                                <Upload size={14} className={isUploading ? 'animate-bounce' : ''} />
                                <span>{spec ? 'Update Definition' : 'Upload Definition'}</span>
                            </label>
                        </div>
                    </div>

                    {loadingSpec ? (
                        <div className="h-64 rounded-3xl bg-slate-900/30 border border-slate-800 flex items-center justify-center animate-pulse">
                            <div className="text-center">
                                <Database size={32} className="mx-auto mb-4 text-slate-700" />
                                <p className="text-slate-600 font-bold uppercase text-xs tracking-widest">Scanning Registry...</p>
                            </div>
                        </div>
                    ) : spec ? (
                        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 space-y-8">
                            {/* Spec Header */}
                            {spec.info && (
                                <div className="pb-6 border-b border-slate-800/50">
                                    <h4 className="text-xl font-bold text-white mb-2">{spec.info.title} <span className="text-xs text-slate-500 font-normal ml-2">v{spec.info.version}</span></h4>
                                    <p className="text-slate-400 text-sm leading-relaxed">{spec.info.description}</p>
                                </div>
                            )}

                            {/* Request Parameters if any */}
                            {spec.parameters && (
                                <div>
                                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center"><Brackets size={14} className="mr-2" /> Parameters</h5>
                                    <div className="space-y-2">
                                        {spec.parameters.map((param: any, idx: number) => (
                                            <div key={idx} className="flex items-center bg-slate-950/50 border border-slate-800/50 p-3 rounded-xl font-mono text-sm">
                                                <span className="text-indigo-400 font-bold mr-3">{param.name}</span>
                                                <span className="text-slate-500 text-xs px-2 py-0.5 bg-slate-900 rounded border border-slate-800 uppercase mr-3">{param.in}</span>
                                                <span className="text-slate-600 text-xs">{param.description}</span>
                                                {param.required && <span className="ml-auto text-[9px] font-bold text-rose-500 uppercase">Required</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Responses */}
                            {spec.responses && (
                                <div>
                                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center"><Code size={14} className="mr-2" /> Response Schemas</h5>
                                    <div className="space-y-4">
                                        {Object.entries(spec.responses).map(([code, response]: [string, any]) => (
                                            <div key={code} className="bg-slate-950/30 border border-slate-800/80 rounded-2xl overflow-hidden">
                                                <div className={`px-4 py-2 border-b border-slate-800/50 flex items-center justify-between ${code.startsWith('2') ? 'bg-emerald-500/5' : code.startsWith('4') || code.startsWith('5') ? 'bg-rose-500/5' : 'bg-slate-800/20'}`}>
                                                    <span className={`font-mono font-black ${code.startsWith('2') ? 'text-emerald-500' : 'text-rose-500'}`}>{code}</span>
                                                    <span className="text-xs text-slate-400 font-medium">{response.description}</span>
                                                </div>
                                                {response.content && response.content['application/json'] && (
                                                    <div className="p-4 bg-slate-950/80 overflow-x-auto">
                                                        <pre className="text-xs font-mono text-slate-400 leading-relaxed">
                                                            {JSON.stringify(response.content['application/json'].schema, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Raw Fallback */}
                            <div className="pt-6 border-t border-slate-800/50">
                                <details>
                                    <summary className="text-[10px] font-bold text-slate-600 uppercase cursor-pointer hover:text-slate-400 transition-colors">View Raw JSON Definition</summary>
                                    <pre className="mt-4 p-4 bg-black/50 rounded-2xl text-[10px] font-mono text-slate-500 overflow-auto max-h-96 custom-scrollbar">
                                        {JSON.stringify(spec, null, 2)}
                                    </pre>
                                </details>
                            </div>
                        </div>
                    ) : (
                        <div className="h-64 rounded-3xl border-2 border-dashed border-slate-800 bg-slate-900/20 flex flex-col items-center justify-center text-slate-600 space-y-4">
                            <FileJson size={48} className="opacity-50" />
                            <p className="text-sm font-bold uppercase tracking-wide">No Definition Found</p>
                            <p className="text-xs text-slate-500 max-w-xs text-center">Upload a JSON Swagger/OpenAPI snippet to enrich this view.</p>
                        </div>
                    )}
                </div>

                {/* Right: Operational Metrics */}
                <div className="space-y-6">
                    <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center">
                        <Activity size={20} className="mr-2 text-indigo-500" /> Live Telemetry
                    </h3>

                    <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl space-y-6 backdrop-blur-sm">

                        <div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Stability Check</div>
                            <div className="flex items-center space-x-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                                {endpoint.failCount === 0 ? (
                                    <>
                                        <CheckCircle2 size={20} className="text-emerald-500" />
                                        <span className="text-emerald-500 font-bold text-sm">Operational</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle size={20} className="text-rose-500 animate-pulse" />
                                        <span className="text-rose-500 font-bold text-sm">Unstable</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Execution Volume</div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 text-center">
                                    <div className="text-lg font-black text-white">{endpoint.passCount}</div>
                                    <div className="text-[9px] text-emerald-500 uppercase font-bold">Pass</div>
                                </div>
                                <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 text-center">
                                    <div className={`text-lg font-black ${endpoint.failCount > 0 ? 'text-rose-500' : 'text-slate-500'}`}>{endpoint.failCount}</div>
                                    <div className="text-[9px] text-rose-500 uppercase font-bold">Fail</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Discovery Info</div>
                            <div className="bg-slate-950/50 rounded-xl border border-slate-800 p-4 space-y-3 font-mono text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">First Seen</span>
                                    <span className="text-slate-300">{endpoint.lastSeen ? new Date(endpoint.lastSeen).toLocaleDateString() : 'Unknown'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Last Failure</span>
                                    <span className={endpoint.lastFailureAt ? 'text-rose-400' : 'text-emerald-500/50'}>
                                        {endpoint.lastFailureAt ? new Date(endpoint.lastFailureAt).toLocaleDateString() : 'None'}
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(51, 65, 85, 0.5); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(71, 85, 105, 0.8); }
      `}</style>
        </div>
    );
};

export default EndpointDetailView;
