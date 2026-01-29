
import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { Endpoint } from '../types';
import { Search, Filter, TrendingUp, Clock, Activity, Zap, ExternalLink, Globe, ChevronDown, CheckCircle2, AlertCircle, Calendar, Layers, Hash, Link as LinkIcon, History, Server, Shield, Trash2, ChevronLeft, ChevronRight, LayoutList, Box } from 'lucide-react';
import EndpointDetailView from './EndpointDetailView';

interface EndpointsViewProps {
  refreshKey?: number;
  initialEndpoint?: Endpoint | null;
}

interface ProjectStats {
  totalEndpoints: number;
  avgLatency: number;
  successRate: number;
  failingCount: number;
}

const EndpointsView: React.FC<EndpointsViewProps> = ({ refreshKey, initialEndpoint }) => {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [healthFilter, setHealthFilter] = useState('ALL');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(initialEndpoint || null);

  useEffect(() => {
    if (initialEndpoint) {
      setSelectedEndpoint(initialEndpoint);
    }
  }, [initialEndpoint]);

  // State for collapsible project groups
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  // State for pagination per project
  const [projectPages, setProjectPages] = useState<Record<string, number>>({});
  const ITEMS_PER_PROJECT_PAGE = 5;

  const fetchEndpoints = () => {
    api.getEndpoints().then(setEndpoints);
  };

  useEffect(() => {
    fetchEndpoints();
  }, [refreshKey]);

  // Reset pagination when filters change
  useEffect(() => {
    setProjectPages({});
  }, [search, methodFilter, healthFilter, serviceFilter]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que deseas eliminar este endpoint?')) {
      await api.deleteEndpoint(id);
      fetchEndpoints();
    }
  };

  const toggleProject = (projectName: string) => {
    const next = new Set(expandedProjects);
    if (next.has(projectName)) next.delete(projectName);
    else next.add(projectName);
    setExpandedProjects(next);
  };

  const changeProjectPage = (projectName: string, newPage: number) => {
    setProjectPages(prev => ({ ...prev, [projectName]: newPage }));
  };

  const services = useMemo(() => {
    const s = new Set(endpoints.map(e => e.service));
    return Array.from(s).sort();
  }, [endpoints]);

  // 1. Filter Endpoints Globally First
  const filteredEndpoints = useMemo(() => {
    return endpoints.filter(e => {
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
  }, [endpoints, search, methodFilter, healthFilter, serviceFilter]);

  // 2. Group by Project
  const groupedEndpoints = useMemo<Record<string, Endpoint[]>>(() => {
    const groups: Record<string, Endpoint[]> = {};
    const uncategorizedKey = "Global / Uncategorized";

    filteredEndpoints.forEach(ep => {
      if (!ep.projects || ep.projects.length === 0) {
        if (!groups[uncategorizedKey]) groups[uncategorizedKey] = [];
        groups[uncategorizedKey].push(ep);
      } else {
        ep.projects.forEach(proj => {
          if (!groups[proj]) groups[proj] = [];
          groups[proj].push(ep);
        });
      }
    });
    return groups;
  }, [filteredEndpoints]);

  // 3. Calculate Stats per Project
  const projectStats = useMemo<Record<string, ProjectStats>>(() => {
    const stats: Record<string, ProjectStats> = {};
    (Object.entries(groupedEndpoints) as [string, Endpoint[]][]).forEach(([proj, eps]) => {
      const totalStart = eps.reduce((acc, e) => acc + (e.avgDuration || 0), 0);
      const totalPass = eps.reduce((acc, e) => acc + e.passCount, 0);
      const totalFail = eps.reduce((acc, e) => acc + e.failCount, 0);
      const totalRuns = totalPass + totalFail;

      stats[proj] = {
        totalEndpoints: eps.length,
        avgLatency: eps.length > 0 ? totalStart / eps.length : 0,
        successRate: totalRuns > 0 ? (totalPass / totalRuns) * 100 : 100, // Default to 100 if no runs
        failingCount: eps.filter(e => e.failCount > 0).length
      };
    });
    return stats;
  }, [groupedEndpoints]);

  const sortedProjects = Object.keys(groupedEndpoints).sort();
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

  if (selectedEndpoint) {
    return <EndpointDetailView endpoint={selectedEndpoint} onBack={() => setSelectedEndpoint(null)} />;
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-1 w-8 bg-indigo-500 rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">API Registry</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter">Endpoint Catalog</h2>
          <p className="text-slate-400 mt-2 text-sm max-w-lg leading-relaxed">
            Discovered API interfaces grouped by project sector.
            Monitor latency trends and integration health.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="px-5 py-3 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center shadow-xl">
            <div className="mr-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Interfaces</p>
              <p className="text-2xl font-black text-white leading-none mt-1">{filteredEndpoints.length}</p>
            </div>
            <div className="h-10 w-10 bg-indigo-600/10 rounded-xl flex items-center justify-center border border-indigo-600/20">
              <Layers size={20} className="text-indigo-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl opacity-70 group-hover:opacity-100 transition duration-500 blur-sm"></div>
          <div className="relative flex flex-col md:flex-row items-center gap-4 bg-slate-950/90 backdrop-blur-xl p-2 rounded-2xl border border-slate-800/80 shadow-2xl">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Search by URL, project, or host..."
                className="w-full bg-transparent border-none rounded-xl pl-12 pr-4 py-3 text-sm font-medium text-slate-200 placeholder-slate-600 focus:ring-0 outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto pr-2">
              <div className="h-8 w-[1px] bg-slate-800 mx-2 hidden md:block"></div>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="bg-slate-900 text-slate-300 text-[10px] font-black uppercase px-4 py-2.5 rounded-lg border border-slate-700 outline-none focus:border-indigo-500 transition-all cursor-pointer appearance-none min-w-[100px]"
              >
                <option value="ALL">ALL METHODS</option>
                {methods.map(m => <option key={m} value={m}>{m}</option>)}
              </select>

              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase border transition-all ${showAdvanced ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-300'}`}
              >
                <Filter size={14} className="mr-1" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/30 p-6 rounded-3xl border border-slate-800/50 animate-in slide-in-from-top-2 duration-300">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                <Server size={12} className="mr-2" /> Service Infrastructure
              </label>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full bg-slate-950 text-slate-300 text-xs font-bold px-4 py-3 rounded-xl border border-slate-800 outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="ALL">All Hosts</option>
                {services.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                <Activity size={12} className="mr-2" /> Interface Health
              </label>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                {['ALL', 'STABLE', 'ISSUES'].map(f => (
                  <button
                    key={f}
                    onClick={() => setHealthFilter(f)}
                    className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${healthFilter === f ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {sortedProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-[3rem] border-2 border-dashed border-slate-800/50 bg-slate-900/20">
          <div className="w-20 h-20 bg-slate-800/30 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
            <Layers size={32} className="text-slate-600 opacity-50" />
          </div>
          <p className="text-slate-500 font-black uppercase tracking-widest text-xs mb-2">Refining Signal</p>
          <p className="text-slate-600 text-sm">No interfaces match current filters</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedProjects.map(projectName => {
            const eps = groupedEndpoints[projectName];
            const stats = projectStats[projectName];
            const isExpanded = expandedProjects.has(projectName);

            // Pagination for this specific project
            const page = projectPages[projectName] || 1;
            const totalPages = Math.ceil(eps.length / ITEMS_PER_PROJECT_PAGE);
            const paginatedEps = eps.slice((page - 1) * ITEMS_PER_PROJECT_PAGE, page * ITEMS_PER_PROJECT_PAGE);

            return (
              <div key={projectName} className={`relative overflow-hidden rounded-[2rem] border transition-all duration-500 ${isExpanded ? 'bg-slate-900/40 border-indigo-500/30 shadow-2xl' : 'bg-slate-900/20 border-slate-800/50 hover:border-slate-700'}`}>

                {/* Project Header */}
                <div onClick={() => toggleProject(projectName)} className="relative p-6 cursor-pointer z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center space-x-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 ${isExpanded ? 'scale-110 bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                      <Box size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tight mb-1">{projectName}</h3>
                      <div className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <span className="flex items-center"><Layers size={12} className="mr-1" /> {stats.totalEndpoints} Interfaces</span>
                        {stats.failingCount > 0 && <span className="flex items-center text-rose-500"><AlertCircle size={12} className="mr-1" /> {stats.failingCount} Issues</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Mini Stats */}
                    <div className="hidden md:flex items-center space-x-8 mr-8">
                      <div className="text-right">
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Success Rate</div>
                        <div className={`text-xl font-mono font-black ${stats.successRate >= 90 ? 'text-emerald-500' : stats.successRate >= 70 ? 'text-amber-500' : 'text-rose-500'}`}>
                          {stats.successRate.toFixed(1)}%
                        </div>
                      </div>
                      <div className="w-[1px] h-8 bg-slate-800"></div>
                      <div className="text-right">
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg Latency</div>
                        <div className="text-xl font-mono font-black text-white">
                          {stats.avgLatency.toFixed(0)}<span className="text-xs text-slate-600 ml-1">ms</span>
                        </div>
                      </div>
                    </div>

                    <div className={`w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center transition-all duration-300 ${isExpanded ? 'rotate-180 bg-indigo-500 border-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </div>

                {/* Detailed List */}
                {isExpanded && (
                  <div className="border-t border-slate-800/50 bg-slate-950/30 px-6 py-6 space-y-4">
                    {paginatedEps.map(ep => {
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
                        <div
                          key={ep.id}
                          onClick={() => setSelectedEndpoint(ep)}
                          className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/30 transition-all hover:bg-slate-900 cursor-pointer"
                        >
                          <div className="flex items-start space-x-4">
                            <div className={`px-3 py-2 rounded-lg font-mono text-xs font-black min-w-[60px] text-center
                                         ${ep.method === 'POST' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                                ep.method === 'GET' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                  ep.method === 'DELETE' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                                    'bg-slate-500/10 text-slate-500 border border-slate-500/20'}
                                     `}>
                              {ep.method}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                <Globe size={10} /> <span>{ep.service}</span>
                              </div>
                              <h4 className="text-sm font-bold text-white font-mono break-all group-hover:text-indigo-300 transition-colors">
                                <span className="text-slate-500 font-normal mr-1">{baseUrl}</span>
                                <span className={ep.method === 'GET' ? 'text-blue-300' : 'text-orange-300'}>{resourcePath}</span>
                              </h4>
                            </div>
                          </div>

                          <div className="flex items-center space-x-6 mt-4 md:mt-0 pl-14 md:pl-0">
                            <div className="flex flex-col items-end">
                              <span className={`text-sm font-black font-mono ${successRate >= 90 ? 'text-emerald-500' : 'text-rose-500'}`}>{successRate.toFixed(0)}%</span>
                              <span className="text-[8px] font-black text-slate-600 uppercase tracking-wider">Success</span>
                            </div>

                            <div className="w-[1px] h-6 bg-slate-800"></div>

                            <div className="flex flex-col items-end min-w-[60px]">
                              <span className="text-sm font-black font-mono text-slate-300">{ep.avgDuration.toFixed(0)}<span className="text-xs text-slate-600">ms</span></span>
                              <span className="text-[8px] font-black text-slate-600 uppercase tracking-wider">Latency</span>
                            </div>

                            <button
                              onClick={(e) => handleDelete(ep.id, e)}
                              className="p-2 text-slate-600 hover:text-rose-500 transition-colors ml-2 z-20 relative"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Nested Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between px-2 pt-2">
                        <button
                          disabled={page === 1}
                          onClick={(e) => { e.stopPropagation(); changeProjectPage(projectName, page - 1); }}
                          className="text-[10px] font-bold uppercase text-slate-500 disabled:opacity-30 hover:text-white transition-colors flex items-center"
                        >
                          <ChevronLeft size={12} className="mr-1" /> Prev
                        </button>
                        <span className="text-[10px] font-mono text-slate-600">Page {page} of {totalPages}</span>
                        <button
                          disabled={page === totalPages}
                          onClick={(e) => { e.stopPropagation(); changeProjectPage(projectName, page + 1); }}
                          className="text-[10px] font-bold uppercase text-slate-500 disabled:opacity-30 hover:text-white transition-colors flex items-center"
                        >
                          Next <ChevronRight size={12} className="ml-1" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EndpointsView;
