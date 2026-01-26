
import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { Endpoint } from '../types';
import { Search, Filter, TrendingUp, Clock, Activity, Zap, ExternalLink, Globe, ChevronDown, CheckCircle2, AlertCircle, Calendar, Layers, Hash, Link as LinkIcon, History, Server, Shield, Trash2 } from 'lucide-react';

interface EndpointsViewProps {
  refreshKey?: number;
}

const EndpointsView: React.FC<EndpointsViewProps> = ({ refreshKey }) => {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [healthFilter, setHealthFilter] = useState('ALL');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fetchEndpoints = () => {
    api.getEndpoints().then(setEndpoints);
  };

  useEffect(() => {
    fetchEndpoints();
  }, [refreshKey]);

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este endpoint?')) {
      await api.deleteEndpoint(id);
      fetchEndpoints();
    }
  };

  const services = useMemo(() => {
    const s = new Set(endpoints.map(e => e.service));
    return Array.from(s).sort();
  }, [endpoints]);

  const filtered = endpoints.filter(e => {
    const matchesSearch = e.path.toLowerCase().includes(search.toLowerCase()) ||
      e.service.toLowerCase().includes(search.toLowerCase()) ||
      e.projects.some(p => p.toLowerCase().includes(search.toLowerCase()));

    const matchesMethod = methodFilter === 'ALL' || e.method === methodFilter;

    const matchesHealth = healthFilter === 'ALL' ||
      (healthFilter === 'STABLE' && e.failCount === 0) ||
      (healthFilter === 'ISSUES' && e.failCount > 0);

    const matchesService = serviceFilter === 'ALL' || e.service === serviceFilter;

    return matchesSearch && matchesMethod && matchesHealth && matchesService;
  });

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Endpoint Catalog</h2>
          <p className="text-slate-400 mt-1">Discovered API interfaces and cross-project stability analysis</p>
        </div>
        <div className="bg-blue-600/10 border border-blue-500/20 px-4 py-2 rounded-xl flex items-center space-x-3">
          <Layers size={18} className="text-blue-500" />
          <div className="text-xs">
            <span className="font-bold text-blue-400">{filtered.length}</span>
            <span className="text-slate-500 ml-1">Interfaces Mapped</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search by URL, project, or host..."
              className="w-full bg-slate-800/40 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder-slate-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-slate-800 text-slate-300 text-xs font-bold px-4 py-3 rounded-xl border border-slate-700 outline-none focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer appearance-none min-w-[120px]"
            >
              <option value="ALL">METHODS</option>
              {methods.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-semibold border transition-all ${showAdvanced ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
            >
              <Filter size={16} />
              <span>Advanced</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/30 p-4 rounded-2xl border border-slate-800/50 animate-in slide-in-from-top-2 duration-300">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Service Infrastructure</label>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full bg-slate-800/50 text-slate-300 text-xs px-4 py-2.5 rounded-lg border border-slate-700 outline-none"
              >
                <option value="ALL">All Hosts</option>
                {services.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Interface Health</label>
              <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700">
                {['ALL', 'STABLE', 'ISSUES'].map(f => (
                  <button
                    key={f}
                    onClick={() => setHealthFilter(f)}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${healthFilter === f ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filtered.length > 0 ? (
          filtered.map((ep) => {
            let baseUrl = "";
            let resourcePath = ep.path;

            if (ep.path.startsWith('http')) {
              try {
                const url = new URL(ep.path);
                baseUrl = `${url.protocol}//${url.host}`;
                resourcePath = url.pathname + url.search;
              } catch (e) {
                const parts = ep.path.split('/');
                if (parts.length > 3) {
                  baseUrl = parts.slice(0, 3).join('/');
                  resourcePath = '/' + parts.slice(3).join('/');
                }
              }
            }

            const successRate = (ep.passCount / (Math.max(1, ep.passCount + ep.failCount))) * 100;

            return (
              <div key={ep.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all group shadow-sm hover:shadow-xl hover:shadow-blue-900/5">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                    <div className="flex items-start space-x-4 overflow-hidden">
                      <div className={`px-4 py-3 rounded-xl font-mono text-sm font-black min-w-[80px] text-center shadow-inner ${ep.method === 'POST' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                        ep.method === 'GET' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                          ep.method === 'DELETE' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                            'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                        }`}>
                        {ep.method}
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center space-x-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">
                          <span className="flex items-center text-blue-500"><Globe size={12} className="mr-1" /> {ep.service}</span>
                          <span className="text-slate-800">•</span>
                          <span className="flex items-center"><Calendar size={12} className="mr-1 text-slate-600" /> Cataloged: {ep.lastSeen ? new Date(ep.lastSeen).toLocaleDateString() : 'Initial Import'}</span>
                        </div>
                        <h4 className="text-xl font-bold text-white tracking-tight font-mono break-all leading-snug">
                          {baseUrl && <span className="text-slate-500 font-normal">{baseUrl}</span>}
                          <span className="text-blue-400">{resourcePath}</span>
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 bg-slate-950/50 px-6 py-4 rounded-2xl border border-slate-800 self-start group-hover:border-slate-600 transition-colors">
                      <div className="text-right">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Integrity</div>
                        <div className={`text-2xl font-black tracking-tighter ${successRate < 80 ? 'text-rose-500' : 'text-emerald-500'}`}>{successRate.toFixed(1)}%</div>
                      </div>
                      <div className="w-[1px] h-10 bg-slate-800"></div>
                      <div className={`p-2.5 rounded-xl ${ep.failCount > 0 ? 'bg-rose-500/10 text-rose-500 animate-pulse' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {ep.failCount > 0 ? <AlertCircle size={24} /> : <CheckCircle2 size={24} />}
                      </div>
                      <button
                        onClick={() => handleDelete(ep.id)}
                        className="p-2.5 text-slate-600 hover:text-rose-500 transition-colors bg-slate-950/50 rounded-xl border border-slate-800 hover:border-rose-500/30 ml-2"
                        title="Eliminar Endpoint"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t border-slate-800/60">
                    {/* Metric 1: Average Duration */}
                    <div>
                      <div className="flex items-center text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3">
                        <Zap size={14} className="mr-2 text-amber-500" /> Avg Latency
                      </div>
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-2xl font-black text-white font-mono leading-none">{ep.avgDuration.toFixed(0)}</span>
                        <span className="text-[10px] text-slate-600 font-black uppercase tracking-tighter">ms</span>
                      </div>
                      <p className="text-[9px] text-slate-500 mt-2 font-bold leading-tight uppercase tracking-widest opacity-60">Execution Profiling</p>
                    </div>

                    {/* Metric 2: Last Failure Time */}
                    <div>
                      <div className="flex items-center text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3">
                        <History size={14} className="mr-2 text-rose-500" /> Last Failure
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-xl font-black font-mono leading-none ${ep.lastFailureAt ? 'text-rose-400' : 'text-emerald-500/40'}`}>
                          {ep.lastFailureAt ? new Date(ep.lastFailureAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Nominal'}
                        </span>
                        {ep.lastFailureAt && (
                          <span className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">
                            {new Date(ep.lastFailureAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      {!ep.lastFailureAt && <p className="text-[9px] text-slate-500 mt-2 font-bold uppercase tracking-widest opacity-60">Stable Interface</p>}
                    </div>

                    {/* Metric 3: Ecosystem Project Count */}
                    <div>
                      <div className="flex items-center text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3">
                        <Server size={14} className="mr-2 text-blue-500" /> Ecosystem
                      </div>
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-2xl font-black text-white font-mono leading-none">{ep.projects?.length || 1}</span>
                        <span className="text-[10px] text-slate-600 font-black uppercase tracking-tighter">Projects</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {ep.projects?.slice(0, 2).map(p => (
                          <span key={p} className="text-[8px] font-black bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded border border-slate-700/50 uppercase">{p}</span>
                        ))}
                      </div>
                    </div>

                    {/* Metric 4: Normalized Signature */}
                    <div className="lg:col-span-1">
                      <div className="flex items-center text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3">
                        <Shield size={14} className="mr-2 text-indigo-500" /> Discovery Pattern
                      </div>
                      <div className="bg-slate-950/50 px-3 py-3 rounded-xl border border-slate-800 flex items-center justify-between group/code hover:bg-slate-900 transition-colors">
                        <code className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                          {ep.normalizedPath}
                        </code>
                        <div className="text-[8px] text-slate-600 font-black bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 uppercase tracking-tighter">ID Normalized</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[2.5rem] p-24 text-center space-y-6">
            <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto text-slate-700">
              <Layers size={32} />
            </div>
            <div className="max-w-xs mx-auto">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Catalog Exhausted</p>
              <p className="text-slate-600 text-sm mt-2">No API interfaces found matching your search parameters.</p>
            </div>
            <button
              onClick={() => { setSearch(''); setMethodFilter('ALL'); setHealthFilter('ALL'); setServiceFilter('ALL'); }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase transition-all shadow-lg shadow-indigo-600/20"
            >
              Reset Intelligence Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EndpointsView;
